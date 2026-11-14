import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {authorizedDraftRequest,privateDraftStore,loadDraft,draftPath,mediaPath,slots,validId,responseHeaders,type Slot,type MediaFile} from "@/lib/editorial-meta-drafts";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:responseHeaders});
function imageSize(buf:Buffer):{width:number;height:number}|null{
 if(buf.length>24&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
  if(buf.subarray(12,16).toString("ascii")!=="IHDR")return null;
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
 }
 if(buf.length>12&&buf[0]===255&&buf[1]===216){
  let off=2;
  while(off+9<buf.length){
   if(buf[off]!==255){off++;continue}
   while(buf[off]===255)off++;
   const marker=buf[off++];
   if(marker===217||marker===218)break;
   if(marker===0||marker===216||marker===1||(marker>=208&&marker<=215))continue;
   if(off+2>buf.length)break;
   const len=buf.readUInt16BE(off);
   if(len<2||off+len>buf.length)break;
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&len>=7){
    return {height:buf.readUInt16BE(off+3),width:buf.readUInt16BE(off+5)};
   }
   off+=len;
  }
 }
 return null;
}
function mediaMime(bytes:Buffer):MediaFile["mime"]|null{
 if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return "image/jpeg";
 return null;
}
function target(req:NextRequest){
 const id=req.nextUrl.searchParams.get("id")||"";
 const slot=req.nextUrl.searchParams.get("slot")||"";
 return validId(id)&&slots.includes(slot as Slot)?{id,slot:slot as Slot}:null;
}
export async function GET(req:NextRequest){
 try{
  if(!await authorizedDraftRequest(req))return reply({error:"Acceso denegado"},403);
  const t=target(req);
  if(!t)return reply({error:"Referencia no válida"},400);
  const draft=await loadDraft(t.id);
  const media=draft?.media[t.slot];
  if(!draft||!media)return reply({error:"Imagen privada no encontrada"},404);
  const {data,error}=await privateDraftStore().download(mediaPath(t.id,t.slot));
  if(error||!data)return reply({error:"Imagen no disponible"},404);
  const bytes=new Uint8Array(await data.arrayBuffer());
  return new NextResponse(bytes,{headers:{...responseHeaders,"Content-Type":media.mime,"Content-Disposition":"inline","Content-Security-Policy":"default-src 'none'"}});
 }catch{return reply({error:"Error al consultar imagen privada"},503);}
}
export async function PUT(req:NextRequest){
 try{
  if(!await authorizedDraftRequest(req))return reply({error:"Acceso denegado"},403);
  const t=target(req);
  if(!t)return reply({error:"Destino de imagen inválido"},400);
  const revision=req.headers.get("x-pqd-expected-revision")||"";
  const draft=await loadDraft(t.id);
  if(!draft)return reply({error:"Debes guardar primero el borrador"},404);
  if(draft.updatedAt!==revision)return reply({error:"Este borrador cambió; vuelve a cargarlo antes de subir la imagen"},409);
  const length=Number(req.headers.get("content-length")||0);
  if(length>3_500_000)return reply({error:"La imagen supera 3,5 MB"},413);
  if(!["image/jpeg","image/png"].includes(req.headers.get("content-type")||""))return reply({error:"Solo se admiten PNG y JPEG"},415);
  const bytes=Buffer.from(await req.arrayBuffer());
  if(bytes.length<256||bytes.length>3_500_000)return reply({error:"Tamaño de imagen no admitido"},413);
  const mime=mediaMime(bytes),size=imageSize(bytes);
  if(!mime||!size)return reply({error:"Imagen dañada o formato no admitido"},415);
  const {width,height}=size;
  if(width<320||height<320||width>4096||height>4096||width*height>16_000_000)return reply({error:"Dimensiones de imagen no admitidas"},400);
  const ratio=width/height;
  if(t.slot==="story"&&(width<720||height<1280||Math.abs(ratio-9/16)>0.025))
   return reply({error:"La historia requiere imagen vertical 9:16 (ideal 1080 × 1920)"},400);
  if(t.slot==="feed"&&(ratio<0.8||ratio>1.91))return reply({error:"Imagen de feed fuera de relación 4:5 a 1,91:1"},400);
  const sha256=createHash("sha256").update(bytes).digest("hex");
  const {error}=await privateDraftStore().upload(mediaPath(t.id,t.slot),bytes,{upsert:true,contentType:mime,cacheControl:"0"});
  if(error)throw Error("Upload failed");
  const media:MediaFile={slot:t.slot,mime,width,height,size:bytes.length,sha256,uploadedAt:new Date().toISOString()};
  const changedImage=draft.media[t.slot]?.sha256!==sha256;
  // Las aprobaciones de feed e historias son independientes. Un cambio
  // de imagen nunca invalida una publicación ya aprobada en el otro formato.
  const updated={...draft,media:{...draft.media,[t.slot]:media},
   contentApproved:t.slot==="feed"&&changedImage?false:draft.contentApproved,
   approvalAt:t.slot==="feed"&&changedImage?null:draft.approvalAt,
   storyApproved:t.slot==="story"&&changedImage?false:(draft.storyApproved||false),
   storyApprovalAt:t.slot==="story"&&changedImage?null:(draft.storyApprovalAt||null),
   updatedAt:new Date().toISOString()};
  const {error:saveError}=await privateDraftStore().upload(draftPath(t.id),new Blob([JSON.stringify(updated)],{type:"application/json"}),{upsert:true,contentType:"application/json",cacheControl:"0"});
  if(saveError)throw Error("Save media metadata failed");
  return reply({ok:true,draft:updated});
 }catch{return reply({error:"No se pudo guardar la imagen de forma privada"},503);}
}

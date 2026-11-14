import {NextRequest,NextResponse} from "next/server";
import {authorizedDraftRequest,privateDraftStore,loadDraft,draftPath,draftsRoot,validatedFields,validId,responseHeaders,type Draft} from "@/lib/editorial-meta-drafts";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:responseHeaders});
export async function GET(req:NextRequest){
 try{
  if(!await authorizedDraftRequest(req))return reply({error:"Acceso denegado"},403);
  const id=req.nextUrl.searchParams.get("id");
  if(id!==null){
   if(!validId(id))return reply({error:"Identificador inválido"},400);
   const one=await loadDraft(id);
   return one?reply({draft:one}):reply({error:"No existe el borrador"},404);
  }
  const {data,error}=await privateDraftStore().list(draftsRoot+"/records",{limit:60,sortBy:{column:"updated_at",order:"desc"}});
  if(error)throw Error("List failed");
  const files=(data||[]).filter(f=>/^[0-9a-f-]{36}\.json$/i.test(f.name)).slice(0,60);
  const all=await Promise.all(files.map(f=>loadDraft(f.name.slice(0,-5)).catch(()=>null)));
  const drafts=all.filter((x):x is Draft=>x!==null).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return reply({drafts,limited:files.length===60});
 }catch{return reply({error:"No se pudieron leer los borradores privados"},503);}
}
export async function POST(req:NextRequest){
 try{
  if(!await authorizedDraftRequest(req))return reply({error:"Acceso denegado"},403);
  if(req.headers.get("content-type")?.split(";")[0]!=="application/json")return reply({error:"Se requiere JSON"},415);
  if(Number(req.headers.get("content-length")||0)>40_000)return reply({error:"Solicitud demasiado extensa"},413);
  const raw=await req.text();
  if(raw.length>40_000)return reply({error:"Solicitud demasiado extensa"},413);
  const body=JSON.parse(raw) as {draft?:unknown;expectedUpdatedAt?:unknown};
  const id=(body.draft as {id?:unknown}|undefined)?.id;
  if(typeof id!=="string"||!validId(id))return reply({error:"ID inválido"},400);
  const old=await loadDraft(id);
  const expect=body.expectedUpdatedAt===null?null:body.expectedUpdatedAt;
  if((old?.updatedAt||null)!==expect)return reply({error:"El borrador cambió en otra sesión; actualiza antes de guardar"},409);
  const candidate=validatedFields(body.draft,old);
  const {error}=await privateDraftStore().upload(draftPath(id),new Blob([JSON.stringify(candidate)],{type:"application/json"}),{
   upsert:true,contentType:"application/json",cacheControl:"0"});
  if(error)throw Error("Save failed");
  return reply({ok:true,draft:candidate});
 }catch(e){
  const msg=e instanceof Error?e.message:"Datos inválidos";
  if(/inválid|fecha|título|texto|modo|canales|destinos|referencia|estado|solicitud|adjunta|imágenes/i.test(msg))return reply({error:msg},400);
  return reply({error:"No se pudo guardar el borrador"},503);
 }
}

import {NextRequest,NextResponse} from "next/server";
import {authorizedDraftRequest,responseHeaders,validId} from "@/lib/editorial-meta-drafts";
import {DeliveryError,publishTestOnce,readReceipts,publicationReadiness} from "@/lib/editorial-meta-delivery";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
const send=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:responseHeaders});
export async function GET(request:NextRequest){
 if(!await authorizedDraftRequest(request))return send({error:"Acceso denegado"},403);
 const id=request.nextUrl.searchParams.get("id")||"";
 if(!validId(id))return send({error:"ID inválido"},400);
 try{
  const deliveries=await readReceipts(id);
  if(request.nextUrl.searchParams.get("preflight")==="1")
   return send({deliveries,readiness:await publicationReadiness(id)});
  return send({deliveries});
 }
 catch{return send({error:"Estado de publicación no disponible"},503)}
}
export async function POST(request:NextRequest){
 if(!await authorizedDraftRequest(request))return send({error:"Acceso denegado"},403);
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return send({error:"JSON requerido"},415);
 if(Number(request.headers.get("content-length")||0)>1024)return send({error:"Solicitud demasiado grande"},413);
 try{
  const raw=await request.text();if(raw.length>1024)return send({error:"Solicitud demasiado grande"},413);
  const body=JSON.parse(raw) as {id?:unknown;channel?:unknown;revision?:unknown;confirm?:unknown};
  if(typeof body.id!=="string"||!validId(body.id)||typeof body.channel!=="string"||!["facebook_feed","instagram_feed","facebook_story","instagram_story"].includes(body.channel)||
   typeof body.revision!=="string"||body.revision.length>64||body.confirm!=="PUBLICAR_TEST001_UNA_VEZ")
   return send({error:"Se requiere confirmación expresa de una publicación de prueba"},400);
  const result=await publishTestOnce(body.id,body.channel as "facebook_feed"|"instagram_feed"|"facebook_story"|"instagram_story",body.revision);
  return send(result,result.receipt.status==="published"?200:result.duplicatePrevented?409:202);
 }catch(error){
  return send({error:error instanceof DeliveryError?error.code:"PUBLICATION_NOT_EXECUTED"},
   error instanceof DeliveryError?error.status:503);
 }
}

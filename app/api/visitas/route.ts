import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {resolveVisit,statistics,storeView} from "@/lib/visit-analytics";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const noCache={"Cache-Control":"private, no-store, max-age=0"};
function json(body:object,status=200){return NextResponse.json(body,{status,headers:noCache});}
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");
 if(process.env.NODE_ENV==="production"&&origin!=="https://www.palabrasquedespiertan.online")
  return json({error:"Origen no permitido"},403);
 if(request.headers.get("sec-fetch-site")&&!["same-origin","none"].includes(request.headers.get("sec-fetch-site")!))
  return json({error:"Origen no permitido"},403);
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")
  return json({error:"Formato inválido"},415);
 if(Number(request.headers.get("content-length")||"0")>250)return json({error:"Solicitud demasiado grande"},413);
 const ua=request.headers.get("user-agent")||"";
 if(!ua||/bot|spider|crawl|headless|lighthouse|prerender|preview|monitor|curl|python|wget/i.test(ua))
  return new NextResponse(null,{status:204,headers:noCache});
 try{
  const input=await request.json();
  if(!input||typeof input.path!=="string"||Object.keys(input).length!==1)return json({error:"Ruta inválida"},400);
  const hit=await resolveVisit(input.path);
  if(!hit)return new NextResponse(null,{status:204,headers:noCache});
  await storeView(hit);
  return new NextResponse(null,{status:204,headers:noCache});
 }catch{
  return json({error:"No se pudo registrar esta visita"},503);
 }
}
export async function GET(request:NextRequest){
 const bearer=/^Bearer ([A-Za-z0-9_.-]+)$/.exec(request.headers.get("authorization")||"");
 if(!bearer)return json({error:"Acceso no autorizado"},401);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(url!=="https://lwuzkjvolxwkxdyafcjv.supabase.co"||!key?.startsWith("sb_publishable_"))
  return json({error:"Configuración no disponible"},503);
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:"Bearer "+bearer[1]}}});
 const {data:{user},error}=await client.auth.getUser(bearer[1]);
 if(error||!user||user.is_anonymous||!user.email_confirmed_at||user.email?.toLowerCase()!=="pquedespiertan@gmail.com")
  return json({error:"Acceso no autorizado"},403);
 const {data:allowed,error:permissionError}=await client.rpc("editorial_is_authorized");
 if(permissionError||allowed!==true)return json({error:"Acceso no autorizado"},403);
 const raw=request.nextUrl.searchParams.get("dias")||"30";
 if(!["7","30","90"].includes(raw))return json({error:"Periodo inválido"},400);
 try{return json(await statistics(Number(raw) as 7|30|90));}
 catch{return json({error:"Estadísticas temporalmente no disponibles"},503);}
}

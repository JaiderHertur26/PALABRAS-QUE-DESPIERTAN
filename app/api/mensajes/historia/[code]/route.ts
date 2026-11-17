import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const bucketName="pqd-article-covers-private-v1";
const headers={"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"};
const denied=()=>new Response("Imagen no disponible",{status:404,headers});
const unavailable=()=>new Response("Imagen temporalmente no disponible",{status:503,headers});

/** Preserve original vertical artwork, only revealing it after publication. */
export async function GET(_request:Request,{params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 if(!/^pd-\d{3}$/.test(code))return denied();
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!accesoPublicoConfigurado()||!secret?.startsWith("sb_secret_"))return denied();
 const db=createClient(supabaseProjectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:row,error}=await db.from("editorial_items")
  .select("state,approved_by_author,scheduled_at").eq("kind","mensaje").eq("code",code.toUpperCase()).maybeSingle();
 if(error)return unavailable();
 const visible=row?.approved_by_author===true&&(
   row.state==="published"||
   (row.state==="scheduled"&&!!row.scheduled_at&&Date.parse(row.scheduled_at)<=Date.now())
 );
 if(!visible)return denied();
 const {data:file,error:assetError}=await db.storage.from(bucketName).download("mensajes/historias/"+code+".png");
 if(assetError||!file)return unavailable();
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.length<5000||bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")return unavailable();
 return new Response(new Uint8Array(bytes),{status:200,
  headers:{...headers,"Content-Type":"image/png","X-PQD-Asset":"original-story-storage"}});
}

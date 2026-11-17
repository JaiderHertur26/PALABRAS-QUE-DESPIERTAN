import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const bucketName="pqd-article-covers-private-v1";
const headers={
 "Cache-Control":"private, no-store, max-age=0",
 "X-Content-Type-Options":"nosniff"
};
function denied(){return new Response("Imagen no disponible",{status:404,headers});}
function unavailable(){return new Response("Imagen temporalmente no disponible",{status:503,headers});}
function visible(row:{state:string;approved_by_author:boolean;scheduled_at:string|null}|null){
 return Boolean(row?.approved_by_author===true&&(
  row.state==="published"||
  (row.state==="scheduled"&&row.scheduled_at&&Date.parse(row.scheduled_at)<=Date.now())
 ));
}

/** Serve original authored PNG only after editorial authorization and publication time. */
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 const m=/^pd-(\d{3})-[a-z0-9-]+$/.exec(filename);
 if(!m)return denied();
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!accesoPublicoConfigurado()||!secret?.startsWith("sb_secret_"))return denied();
 const db=createClient(supabaseProjectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const canonical="/mensajes/"+filename+".png";
 const {data:row,error}=await db.from("editorial_items")
  .select("state,approved_by_author,scheduled_at,cover_url")
  .eq("kind","mensaje").eq("code","PD-"+m[1]).eq("cover_url",canonical).maybeSingle();
 if(error)return unavailable();
 if(!visible(row))return denied();
 const {data:file,error:assetError}=await db.storage.from(bucketName).download("mensajes/"+filename+".png");
 if(assetError||!file)return unavailable();
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.length<5000||bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")return unavailable();
 return new Response(new Uint8Array(bytes),{
  status:200,headers:{...headers,"Content-Type":"image/png","X-PQD-Asset":"original-storage"}
 });
}

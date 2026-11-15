import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

/** Historia editorial vertical desde Storage PRIVADO; bloqueada antes de la fecha oficial. */
export const runtime="nodejs";
export const dynamic="force-dynamic";
const denied=()=>new Response("Historia no disponible",{status:404,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
const unavailable=()=>new Response("Historia temporalmente no disponible",{status:503,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 if(!/^art-\d{3}$/.test(filename))return denied();
 const secret=process.env.SUPABASE_SECRET_KEY||"";
 if(!accesoPublicoConfigurado()||!secret.startsWith("sb_secret_"))return denied();
 const db=createClient(supabaseProjectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:article,error}=await db.from("editorial_items").select("state,scheduled_at,approved_by_author")
  .eq("kind","articulo").eq("code",filename.toUpperCase()).maybeSingle();
 if(error)return unavailable();
 const visible=article?.approved_by_author===true&&(
  article.state==="published"||(article.state==="scheduled"&&!!article.scheduled_at&&Date.parse(article.scheduled_at)<=Date.now()));
 if(!visible)return denied();
 const {data:file,error:storageError}=await db.storage.from("pqd-article-covers-private-v1").download("historias/"+filename+".png");
 if(storageError||!file)return unavailable();
 return new Response(await file.arrayBuffer(),{
  status:200,headers:{"Content-Type":"image/png","Cache-Control":"private,no-store,max-age=0","X-Content-Type-Options":"nosniff"}
 });
}
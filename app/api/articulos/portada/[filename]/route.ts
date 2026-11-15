import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

/** Entrega los PNG desde Storage PRIVADO cuando el artículo es publicable. */
export const runtime="nodejs";
export const dynamic="force-dynamic";

const bucket="pqd-article-covers-private-v1";
const denied=()=>new Response("Imagen no disponible",{status:404,headers:{"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
const unavailable=()=>new Response("Imagen temporalmente no disponible",{status:503,headers:{"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});

export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 if(!/^art-\d{3}$/.test(filename))return denied();
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!accesoPublicoConfigurado()||!secret?.startsWith("sb_secret_"))return denied();

 const db=createClient(supabaseProjectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const coverUrl="/articulos/"+filename+".png";
 const {data:article,error}=await db.from("editorial_items")
  .select("state,scheduled_at,cover_url")
  .eq("kind","articulo")
  .eq("code",filename.toUpperCase())
  .eq("cover_url",coverUrl)
  .maybeSingle();

 if(error)return unavailable();
 const visible=article?.state==="published"
  ||(article?.state==="scheduled"&&!!article.scheduled_at
     &&new Date(article.scheduled_at).getTime()<=Date.now());
 if(!article||!visible)return denied();

 const {data:file,error:storageError}=await db.storage.from(bucket).download(filename+".png");
 if(storageError||!file)return unavailable();
 return new Response(await file.arrayBuffer(),{
  status:200,
  headers:{"Content-Type":"image/png","Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}
 });
}

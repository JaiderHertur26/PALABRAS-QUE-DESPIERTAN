import {NextResponse,type NextRequest} from "next/server";
import {createServerClient} from "@supabase/ssr";
import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

/** Actualiza las sesiones de las rutas que usan autenticación SSR. */
export async function proxy(request:NextRequest){
 // El acceso editorial utiliza siempre el dominio canónico: las cookies
 // de *.vercel.app no se comparten con *.palabrasquedespiertan.online.
 if(request.nextUrl.hostname==="palabrasquedespiertan.vercel.app"){
  const target=new URL(request.nextUrl.pathname+request.nextUrl.search,"https://www.palabrasquedespiertan.online");
  return NextResponse.redirect(target,{status:307});
 }
 // Las tarjetas futuras no se entregan ni por su URL directa ni por la optimización de Next.
 // Una obra programada solo se vuelve accesible cuando la política RLS de Supabase
 // confirma que su fecha y hora de publicación ya han llegado.
 const assetPath=request.nextUrl.pathname==="/_next/image"
   ?request.nextUrl.searchParams.get("url")||""
   :request.nextUrl.pathname;
 const planned=/^\/mensajes\/(pd-\d{3}-[a-z0-9-]+)\.png$/.exec(assetPath);
 const articleCover=/^\/articulos\/art-(\d{3})\.png$/.exec(assetPath);
 if(planned||articleCover){
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!accesoPublicoConfigurado()||!key)
   return NextResponse.json({error:"Imagen no disponible"},{status:404,headers:{"Cache-Control":"no-store"}});
  const publicClient=createClient(supabaseProjectUrl,key,{auth:{persistSession:false,autoRefreshToken:false}});
  let eligible=publicClient.from("editorial_items").select("cover_url")
   .eq("cover_url",assetPath).eq("kind",articleCover?"articulo":"mensaje");
  eligible=articleCover?eligible.eq("code","ART-"+articleCover[1]):eligible.eq("slug",planned![1]);
  const {data,error}=await eligible.maybeSingle();
  if(error||!data)return NextResponse.json({error:"Imagen no disponible"},{status:404,headers:{"Cache-Control":"no-store"}});
  const ready=NextResponse.next();
  ready.headers.set("Cache-Control","private, no-store");
  return ready;
 }
 if(request.nextUrl.pathname.startsWith("/mensajes/")||request.nextUrl.pathname.startsWith("/articulos/")||request.nextUrl.pathname==="/_next/image")
  return NextResponse.next();
 let response=NextResponse.next({request});
 if(!accesoPublicoConfigurado()||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  return response;

 const client=createServerClient(
  supabaseProjectUrl,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {cookies:{
   getAll(){return request.cookies.getAll();},
   setAll(values){
    values.forEach(({name,value})=>request.cookies.set(name,value));
    response=NextResponse.next({request});
    values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   }
  }}
 );
 // El servidor verifica la sesión; no autoriza funciones editoriales.
 await client.auth.getUser();
 response.headers.set("Cache-Control","private, no-store, max-age=0");
 return response;
}

export const config={
 matcher:[
  "/participar",
  "/moderacion/:path*",
  "/api/moderacion/:path*",
  "/api/comunidad/:path*",
  "/mensajes/:path*",
  "/articulos/:path*",
  "/_next/image"
 ]
};

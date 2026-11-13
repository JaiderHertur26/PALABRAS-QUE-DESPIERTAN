import {NextResponse,type NextRequest} from "next/server";
import {createServerClient} from "@supabase/ssr";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

/** Actualiza las sesiones de las rutas que usan autenticación SSR. */
export async function proxy(request:NextRequest){
 // El acceso editorial utiliza siempre el dominio canónico: las cookies
 // de *.vercel.app no se comparten con *.palabrasquedespiertan.online.
 if(request.nextUrl.hostname==="palabrasquedespiertan.vercel.app"){
  const target=new URL(request.nextUrl.pathname+request.nextUrl.search,"https://www.palabrasquedespiertan.online");
  return NextResponse.redirect(target,{status:307});
 }
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
  "/api/comunidad/:path*"
 ]
};

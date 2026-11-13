import {NextRequest,NextResponse} from "next/server";
import {createServerClient} from "@supabase/ssr";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";
import {esModerador} from "@/lib/supabase/server";

export const dynamic="force-dynamic";

/**
 * Intercambia el código PKCE por una sesión y COPIA las cookies a la respuesta
 * HTTP enviada al navegador. No basta con modificar cookies() de la petición.
 * Los tokens no aparecen en URLs, logs ni redirecciones.
 */
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get("code");
 const fallback=new URL("/participar?acceso=invalido",request.url);
 const response=NextResponse.redirect(fallback,{status:303});
 response.headers.set("Cache-Control","private, no-store, max-age=0");
 response.headers.set("Referrer-Policy","no-referrer");

 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!code||!accesoPublicoConfigurado()||!key)return response;

 const client=createServerClient(supabaseProjectUrl,key,{
  cookies:{
   getAll(){return request.cookies.getAll();},
   setAll(values){
    // Actualizar también la petición por si la librería lee las cookies de nuevo.
    values.forEach(({name,value})=>request.cookies.set(name,value));
    // IMPORTANTE: devolverlas efectivamente al navegador en esta respuesta.
    values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   }
  }
 });

 const {error}=await client.auth.exchangeCodeForSession(code);
 if(error)return response;

 const {data:{user},error:identityError}=await client.auth.getUser();
 if(identityError||!user)return response;

 const isEditorial=Boolean(user.email_confirmed_at)&&await esModerador(user.id);
 const destination=isEditorial?"/moderacion":"/participar?acceso=verificado";
 response.headers.set("Location",new URL(destination,request.url).toString());
 return response;
}

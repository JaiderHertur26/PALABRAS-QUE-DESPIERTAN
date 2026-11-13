import "server-only";
import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {createClient} from "@supabase/supabase-js";
import {accesoPublicoConfigurado,comunidadDisponible,supabaseProjectUrl} from "./config";

function accesoEditorialConfigurado(){
 const key=process.env.SUPABASE_SECRET_KEY??"";
 return accesoPublicoConfigurado()&&key.startsWith("sb_secret_")&&key.length>=25;
}

const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const comunidadConfiguradaServidor=comunidadDisponible;

export async function clienteSesion(){
 if(!accesoPublicoConfigurado()||!publishable)return null;
 const cookieStore=await cookies();
 return createServerClient(supabaseProjectUrl,publishable,{
  cookies:{
   getAll(){return cookieStore.getAll();},
   setAll(values){
    try{values.forEach(({name,value,options})=>cookieStore.set(name,value,options));}
    catch{/* Las páginas de servidor de solo lectura no modifican cookies. */}
   }
  }
 });
}

export function clienteLectura(){
 if(!accesoPublicoConfigurado()||!publishable)return null;
 return createClient(supabaseProjectUrl,publishable,{
  auth:{persistSession:false,autoRefreshToken:false}
 });
}

export function clienteModeracion(){
 if(!accesoEditorialConfigurado())return null;
 return createClient(supabaseProjectUrl,process.env.SUPABASE_SECRET_KEY!,{
  auth:{persistSession:false,autoRefreshToken:false}
 });
}

export async function usuarioVerificado(){
 const client=await clienteSesion();
 if(!client)return {client:null,user:null};
 const {data:{user},error}=await client.auth.getUser();
 return {client,user:error?null:user};
}

export async function esModerador(userId:string){
 const admin=clienteModeracion();
 if(!admin)return false;
 const {data,error}=await admin.from("discussion_moderators")
  .select("user_id").eq("user_id",userId).maybeSingle();
 return !error&&Boolean(data?.user_id);
}

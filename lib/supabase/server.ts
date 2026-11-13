import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {createClient} from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function comunidadConfiguradaServidor(){return Boolean(url&&publishable);}

export async function clienteSesion(){
 if(!url||!publishable)return null;
 const cookieStore=await cookies();
 return createServerClient(url,publishable,{
  cookies:{
   getAll(){return cookieStore.getAll();},
   setAll(values){
    try{values.forEach(({name,value,options})=>cookieStore.set(name,value,options));}
    catch{/* En componentes de servidor de solo lectura, no se modifican cookies. */}
   }
  }
 });
}
export function clienteLectura(){
 if(!url||!publishable)return null;
 return createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function clienteModeracion(){
 const key=process.env.SUPABASE_SECRET_KEY;
 if(!url||!key)return null;
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
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
 const {data,error}=await admin.from("discussion_moderators").select("user_id").eq("user_id",userId).maybeSingle();
 return !error&&Boolean(data?.user_id);
}

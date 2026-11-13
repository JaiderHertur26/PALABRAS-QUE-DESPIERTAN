/**
 * Restringe la comunidad a SU proyecto de Supabase.
 * Cambiar la referencia requiere una decisión editorial y auditoría.
 * La URL es pública; ninguna credencial privada se escribe aquí.
 */
export const supabaseProjectRef="lwuzkjvolxwkxdyafcjv";
export const supabaseProjectUrl=`https://${supabaseProjectRef}.supabase.co`;

function urlCorrecta(url?:string){
 if(!url)return false;
 try{
  const parsed=new URL(url);
  return parsed.protocol==="https:"&&parsed.origin===supabaseProjectUrl
    &&(parsed.pathname==="/"||parsed.pathname==="");
 }catch{return false;}
}
export function accesoPublicoConfigurado(){
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??"";
 return urlCorrecta(process.env.NEXT_PUBLIC_SUPABASE_URL)
   &&key.startsWith("sb_publishable_")&&key.length>=30;
}
export function comunidadDisponible(){
 return accesoPublicoConfigurado()&&process.env.NEXT_PUBLIC_COMUNIDAD_ACTIVA==="true";
}

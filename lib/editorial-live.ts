import "server-only";
import {createClient} from "@supabase/supabase-js";
import {articulos as snapshotArticles,temas as snapshotTopics} from "@/lib/community/publications";
import {mensajes as snapshotMessages} from "@/lib/editorial";
import type {ArticuloPublico,TestimonioTema} from "@/lib/community/publications";
import type {Mensaje} from "@/lib/editorial";

type Kind="articulo"|"mensaje"|"tema";
type Row={
 kind:Kind;slug:string;code:string;title:string;subtitle:string;summary:string;body:string;
 state:"pending"|"scheduled"|"published";scheduled_at:string|null;published_at:string|null;
 cover_url:string|null;bible_reference:string;season:string|null;series:string|null;
 featured:boolean;position:number;source_url:string|null;
};
const projectUrl="https://lwuzkjvolxwkxdyafcjv.supabase.co";
function admin(){
 const secret=process.env.SUPABASE_SECRET_KEY??"";
 if(process.env.NEXT_PUBLIC_SUPABASE_URL!==projectUrl||!secret.startsWith("sb_secret_"))throw Error("El contrato editorial no tiene conexión segura a Supabase");
 return createClient(projectUrl,secret,{
  auth:{persistSession:false,autoRefreshToken:false},
  global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store"})}
 });
}
function effective(row:Row){
 return row.state==="published"||(row.state==="scheduled"&&!!row.scheduled_at&&new Date(row.scheduled_at).getTime()<=Date.now());
}
async function rows(kind:Kind):Promise<Row[]>{
 const {data,error}=await admin().from("editorial_items")
  .select("kind,slug,code,title,subtitle,summary,body,state,scheduled_at,published_at,cover_url,bible_reference,season,series,featured,position,source_url")
  .eq("kind",kind).order("position",{ascending:true});
 if(error)throw Error("No se pudo verificar la visibilidad editorial: "+error.code);
 return (data as Row[]).filter(effective);
}
export const dynamicEditorial=true;
export async function publicArticulos():Promise<ArticuloPublico[]>{
 const list=await rows("articulo");
 const originals=new Map(snapshotArticles.map(a=>[a.slug,a]));
 return list.map(row=>{
  const original=originals.get(row.slug);
  const body=row.body.trim()||original?.contenido||"";
  const fecha=row.published_at?.slice(0,10)||"2026-11-13";
  return {
   id:row.code,slug:row.slug,titulo:row.title,subtitulo:row.subtitle,
   resumen:row.summary||original?.resumen||"",abstract:original?.abstract||"",
   contenido:body,referencias:original?.referencias||[],fecha:original?.fecha||fecha,
   fechaEdicion:original?.fechaEdicion||fecha,autor:original?.autor||"P. Jaider Herrera Turizo",
   integridad:original?.integridad||"",palabras:body.trim().split(/\s+/).length,
   estado:"PUBLICADO EN REVISTA PROPIA",imagen:row.cover_url||original?.imagen||undefined
  };
 });
}
export async function publicMensajes():Promise<Mensaje[]>{
 const list=await rows("mensaje");
 const originals=new Map(snapshotMessages.map(m=>[m.slug,m]));
 return list.map(row=>{
  const original=originals.get(row.slug);
  return {
   id:row.code,slug:row.slug,titulo:row.title,texto:row.body||original?.texto||"",
   referencia:row.bible_reference||original?.referencia||"",temporada:row.season||original?.temporada||"T07",
   serie:row.series||original?.serie||"T07-S01",
   fecha:row.published_at?.slice(0,10)||original?.fecha||new Date().toISOString().slice(0,10),
   autor:original?.autor||"P. Jaider Herrera Turizo",imagen:row.cover_url||original?.imagen||"/identidad/cruz-fondo.png",
   instagram:row.source_url?.startsWith("https://www.instagram.com/")?row.source_url:original?.instagram||null
  };
 }).sort((a,b)=>b.fecha.localeCompare(a.fecha));
}
export async function publicTemas():Promise<TestimonioTema[]>{
 const list=await rows("tema");
 const originals=new Map(snapshotTopics.map(t=>[t.slug,t]));
 return list.map((row,i)=>{
  const original=originals.get(row.slug);
  return {
   slug:row.slug,titulo:row.title,subtitulo:row.subtitle||original?.subtitulo||"",
   pregunta:row.body||original?.pregunta||"",introduccion:row.summary||original?.introduccion||"",
   referencia:row.bible_reference||original?.referencia||"",categoria:original?.categoria||"Fe y vida",
   numero:original?.numero||String(i+1).padStart(2,"0"),destacado:row.featured||Boolean(original?.destacado)
  };
 });
}
export async function destinoLive(kind:string,slug:string):Promise<{tipo:"articulo"|"mensaje"|"tema";id:string;titulo:string}|null>{
 if(!["articulo","mensaje","tema"].includes(kind)||!/^[a-z0-9-]+$/.test(slug))return null;
 const {data,error}=await admin().from("editorial_items").select("title,state,scheduled_at").eq("kind",kind).eq("slug",slug).maybeSingle();
 if(error||!data||!effective({...data,kind} as Row))return null;
 return {tipo:kind as "articulo"|"mensaje"|"tema",id:slug,titulo:data.title};
}
export async function isPublic(kind:string,slug:string):Promise<boolean>{
 if(!["articulo","mensaje","tema"].includes(kind))return false;
 const client=admin();
 const {data,error}=await client.from("editorial_items").select("state,scheduled_at")
  .eq("kind",kind).eq("slug",slug).maybeSingle();
 if(error||!data)return false;
 return effective({...data,kind} as Row);
}

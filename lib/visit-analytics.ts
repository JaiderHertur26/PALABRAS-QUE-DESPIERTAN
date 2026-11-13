import "server-only";
import {randomUUID} from "node:crypto";
import {createClient} from "@supabase/supabase-js";

const project="https://lwuzkjvolxwkxdyafcjv.supabase.co";
const bucket="pqd-analytics-v1";
const sections:Record<string,string>={
 "/":"Inicio",
 "/revista":"Revista",
 "/articulos":"Biblioteca de artículos",
 "/mensajes":"Biblioteca de mensajes",
 "/testimonios":"Testimonios",
 "/temporadas":"Temporadas",
 "/series":"Series",
 "/teologia":"Enfoque teológico",
 "/autor":"El autor",
 "/contacto":"Contacto",
 "/redes":"Redes sociales",
 "/participar":"Participación",
 "/buscar":"Buscador",
 "/privacidad":"Privacidad",
 "/aviso-legal":"Aviso legal"
};
type Kind="inicio"|"articulo"|"mensaje"|"testimonio"|"seccion";
type Visit={kind:Kind;code:string;title:string;href:string};
type Stored={name:string;id:string|null};
export type AnalyticsSummary={
 periodDays:number;views:number;allTime:number;today:number;last7:number;
 from:string;to:string;firstDate:string|null;daily:{date:string;views:number}[];
 categories:{kind:Kind;label:string;views:number}[];
 top:{kind:Kind;code:string;title:string;href:string;views:number}[];
 sections:{title:string;href:string;views:number}[];
};
const kinds=["inicio","articulo","mensaje","testimonio","seccion"] as const;
const catNames:Record<Kind,string>={inicio:"Portada",articulo:"Artículos",mensaje:"Mensajes",testimonio:"Testimonios",seccion:"Otras secciones"};
const fmt=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Bogota",year:"numeric",month:"2-digit",day:"2-digit"});
export function bogotaDay(d=new Date()){return fmt.format(d);}
export function shiftDay(day:string,delta:number){const t=Date.parse(day+"T12:00:00Z");return new Date(t+delta*86400000).toISOString().slice(0,10);}
function server(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(url!==project||!secret?.startsWith("sb_secret_"))throw Error("Almacén editorial no configurado");
 return createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
const content:Record<string,"articulo"|"mensaje"|"tema">={articulos:"articulo",mensajes:"mensaje",testimonios:"tema"};
const slugOk=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export async function resolveVisit(path:string):Promise<Visit|null>{
 if(path.length>180||!path.startsWith("/")||path.includes("?")||path.includes("#"))return null;
 if(Object.prototype.hasOwnProperty.call(sections,path)){
  return {kind:path==="/"?"inicio":"seccion",code:path==="/"?"INICIO":"SECCION-"+path.slice(1).toUpperCase().replace(/-/g,"_"),title:sections[path],href:path};
 }
 const parts=path.split("/").filter(Boolean);
 if(parts.length!==2)return null;
 const [part,slug]=parts;
 if((part==="series"||part==="temporadas")&&/^[A-Z0-9-]{3,16}$/.test(slug)){
  return {kind:"seccion",code:"SECCION-"+part.toUpperCase()+"-"+slug,title:(part==="series"?"Serie ":"Temporada ")+slug,href:path};
 }
 const kind=content[part];
 if(!kind||!slugOk.test(slug))return null;
 const {data,error}=await server().from("editorial_items").select("code,title,state,scheduled_at")
  .eq("kind",kind).eq("slug",slug).maybeSingle();
 if(error||!data)return null;
 if(data.state!=="published"&&!(data.state==="scheduled"&&data.scheduled_at&&Date.parse(data.scheduled_at)<=Date.now()))return null;
 return {kind:kind==="tema"?"testimonio":kind,code:data.code,title:data.title,href:path};
}
export async function storeView(hit:Visit){
 if(!/^[A-Z0-9_-]{1,65}$/.test(hit.code))throw Error("Código no válido");
 const day=bogotaDay();
 const filename=hit.kind+"__"+hit.code+"__"+randomUUID()+".evt";
 // Solo se registra tipo y contenido: nunca IP, cookies, agentes, correo ni identificador del lector.
 const {error}=await server().storage.from(bucket).upload("v1/"+day+"/"+filename,
   new Blob(["1"],{type:"text/plain"}),{contentType:"text/plain",upsert:false,cacheControl:"0"});
 if(error)throw Error("Registro de vista: "+error.message);
}
const nameRe=/^(inicio|articulo|mensaje|testimonio|seccion)__([A-Z0-9_-]{1,65})__[a-f0-9-]{36}\.evt$/;
async function listAll(prefix:string,limit=1000):Promise<Stored[]>{
 const result:Stored[]=[];const storage=server().storage.from(bucket);
 for(let offset=0;;offset+=limit){
  const {data,error}=await storage.list(prefix,{limit,offset,sortBy:{column:"name",order:"asc"}});
  if(error)throw Error("Error de lectura de visitas");
  if(!data?.length)break;
  result.push(...data.map(x=>({name:x.name,id:x.id??null})));
  if(data.length<limit)break;
  if(result.length>250000)throw Error("El volumen de estadísticas requiere consolidación");
 }
 return result;
}
export async function statistics(days:7|30|90):Promise<AnalyticsSummary>{
 const today=bogotaDay(),from=shiftDay(today,-days+1);
 const folders=(await listAll("v1")).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.name)).map(x=>x.name).filter(x=>x<=today);
 const dateViews=new Map<string,number>();const counts=new Map<string,number>();
 let allTime=0;
 // Una consulta por día con registros; la colección es pequeña durante el lanzamiento editorial.
 for(let i=0;i<folders.length;i+=6){
  const batch=await Promise.all(folders.slice(i,i+6).map(async day=>({day,files:await listAll("v1/"+day)})));
  for(const {day,files} of batch){
   for(const f of files){
    if(f.id===null)continue;
    const match=nameRe.exec(f.name);
    if(!match)continue;
    allTime++;
    if(day<from)continue;
    dateViews.set(day,(dateViews.get(day)||0)+1);
    const k=match[1]+"|"+match[2];counts.set(k,(counts.get(k)||0)+1);
   }
  }
 }
 const items=[...counts].map(([key,views])=>{const [kind,code]=key.split("|");return {kind:kind as Kind,code,views};});
 const codes=items.filter(x=>["articulo","mensaje","testimonio"].includes(x.kind)).map(x=>x.code);
 const titles=new Map<string,{title:string;href:string}>();
 if(codes.length){
  const {data,error}=await server().from("editorial_items").select("code,title,slug,kind").in("code",[...new Set(codes)]);
  if(error)throw Error("No se pudieron obtener los títulos");
  for(const x of data??[])titles.set(x.code,{title:x.title,href:({articulo:"/articulos/",mensaje:"/mensajes/",tema:"/testimonios/"} as Record<string,string>)[x.kind]+x.slug});
 }
 const top=items.map(x=>{
  const content=titles.get(x.code);
  const section=x.code==="INICIO"?"/":x.code.startsWith("SECCION-")?Object.keys(sections).find(k=>"SECCION-"+k.slice(1).toUpperCase().replace(/-/g,"_")===x.code):undefined;
  const nested=/^SECCION-(TEMPORADAS|SERIES)-([A-Z0-9-]+)$/.exec(x.code);
  const nestedPath=nested?"/"+(nested[1]==="SERIES"?"series":"temporadas")+"/"+nested[2]:undefined;
  const nestedTitle=nested?(nested[1]==="SERIES"?"Serie ":"Temporada ")+nested[2]:undefined;
  return {...x,title:content?.title||nestedTitle||(section?sections[section]:x.code),href:content?.href||nestedPath||section||"/"};
 }).sort((a,b)=>b.views-a.views||a.code.localeCompare(b.code));
 const categories=kinds.map(kind=>({kind,label:catNames[kind],views:items.filter(x=>x.kind===kind).reduce((a,x)=>a+x.views,0)}));
 const daily=Array.from({length:days},(_,i)=>{const date=shiftDay(from,i);return {date,views:dateViews.get(date)||0}});
 const weekFrom=shiftDay(today,-6);
 return {periodDays:days,views:daily.reduce((n,x)=>n+x.views,0),allTime,today:dateViews.get(today)||0,
  last7:daily.filter(x=>x.date>=weekFrom).reduce((n,x)=>n+x.views,0),from,to:today,
  firstDate:folders.sort()[0]??null,daily,categories,top:top.filter(x=>x.kind==="articulo"||x.kind==="mensaje"||x.kind==="testimonio").slice(0,40),
  sections:top.filter(x=>x.kind==="seccion"||x.kind==="inicio").map(x=>({title:x.title,href:x.href,views:x.views}))};
}

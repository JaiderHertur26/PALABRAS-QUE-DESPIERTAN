import "server-only";
import {NextRequest} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {timingSafeEqual} from "node:crypto";

const projectUrl="https://lwuzkjvolxwkxdyafcjv.supabase.co";
// Bóveda separada de las credenciales de Meta, no pública.
export const vaultBucket="pqd-meta-drafts-v1";
export const draftsRoot="drafts/v1";
export const responseHeaders={"Cache-Control":"private,no-store,max-age=0","X-Robots-Tag":"noindex,nofollow","X-Content-Type-Options":"nosniff"};
export type Slot="feed"|"story";
export const slots:Slot[]=["feed","story"];
export const channelNames=["facebook_feed","instagram_feed","facebook_story","instagram_story"] as const;
export type ChannelName=typeof channelNames[number];
export type Channel={enabled:boolean;copy:string;mode:"manual"|"target";scheduledAt:string|null};
export type MediaFile={slot:Slot;mime:"image/jpeg"|"image/png";width:number;height:number;size:number;sha256:string;uploadedAt:string};
export type Draft={
 version:1;id:string;title:string;reference:string;
 contentApproved:boolean;approvalAt:string|null;
 createdAt:string;updatedAt:string;channels:Record<ChannelName,Channel>;
 media:{feed:MediaFile|null;story:MediaFile|null}
};
export const validId=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const validIso=(s:string)=>/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(s)&&Number.isFinite(Date.parse(s));

function equal(a:string,b:string){
 const x=Buffer.from(a),y=Buffer.from(b);
 return x.length===y.length&&x.length>=32&&timingSafeEqual(x,y);
}
export async function authorizedDraftRequest(request:NextRequest){
 const secret=process.env.META_BRIDGE_KEY||"";
 if(!/^[a-f0-9]{64}$/i.test(secret)||!equal(request.headers.get("x-pqd-meta-bridge")||"",secret))return false;
 const bearer=/^Bearer ([A-Za-z0-9_.-]+)$/.exec(request.headers.get("authorization")||"");
 const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";
 if(!bearer||!publishable.startsWith("sb_publishable_"))return false;
 const auth=createClient(projectUrl,publishable,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:"Bearer "+bearer[1]}}});
 const {data:{user},error}=await auth.auth.getUser(bearer[1]);
 if(error||!user||user.is_anonymous||!user.email_confirmed_at||user.email?.toLowerCase()!=="pquedespiertan@gmail.com")return false;
 const {data:allowed,error:accessError}=await auth.rpc("editorial_is_authorized");
 return !accessError&&allowed===true;
}
export function privateDraftStore(){
 const secret=process.env.SUPABASE_SECRET_KEY||"";
 if(process.env.NEXT_PUBLIC_SUPABASE_URL!==projectUrl||!secret.startsWith("sb_secret_"))throw Error("Storage config invalid");
 return createClient(projectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from(vaultBucket);
}
export const draftPath=(id:string)=>draftsRoot+"/records/"+id+".json";
export const mediaPath=(id:string,slot:Slot)=>draftsRoot+"/media/"+id+"/"+slot;
export async function loadDraft(id:string):Promise<Draft|null>{
 if(!validId(id))return null;
 const {data,error}=await privateDraftStore().download(draftPath(id));
 if(error||!data)return null;
 const raw=JSON.parse(await data.text()) as Draft;
 return raw.version===1&&raw.id===id?raw:null;
}
export function validatedFields(raw:unknown,old:Draft|null):Draft{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Formato de borrador inválido");
 const body=raw as Record<string,unknown>;
 const id=body.id;
 if(typeof id!=="string"||!validId(id))throw Error("ID de borrador inválido");
 const title=body.title,reference=body.reference;
 if(typeof title!=="string"||title.trim().length<3||title.length>120)throw Error("El título debe tener entre 3 y 120 caracteres");
 if(typeof reference!=="string"||reference.length>60||!/^[a-zA-Z0-9À-ÿ\-\s_.]*$/.test(reference))throw Error("Referencia inválida");
 const inputs=body.channels;
 if(!inputs||typeof inputs!=="object"||Array.isArray(inputs))throw Error("Faltan los canales");
 const source=inputs as Record<string,unknown>;
 if(Object.keys(source).sort().join("|")!==[...channelNames].sort().join("|"))throw Error("Destinos inválidos");
 const channels={} as Draft["channels"];
 for(const name of channelNames){
  const c=source[name];
  if(!c||typeof c!=="object"||Array.isArray(c))throw Error("Canal inválido "+name);
  const item=c as Record<string,unknown>;
  if(typeof item.enabled!=="boolean"||typeof item.copy!=="string"||item.copy.length>2200||!["manual","target"].includes(String(item.mode)))throw Error("Texto o modo inválido "+name);
  if(item.mode==="target"){
   if(typeof item.scheduledAt!=="string"||!validIso(item.scheduledAt))throw Error("La fecha debe incluir la hora de Colombia");
   const d=Date.parse(item.scheduledAt);
   if(d<Date.now()-60000||d>Date.now()+366*86400000)throw Error("La fecha objetivo debe estar dentro del próximo año");
  }else if(item.scheduledAt!==null)throw Error("Fecha inesperada");
  channels[name]={enabled:item.enabled,copy:item.copy,mode:item.mode as Channel["mode"],scheduledAt:item.scheduledAt as string|null};
 }
 if(typeof body.contentApproved!=="boolean")throw Error("Falta el estado de aprobación");
 const contentChanged=!!old&&(old.title!==title.trim()||old.reference!==reference.trim()||
  channelNames.some(name=>old.channels[name].copy!==channels[name].copy||
   old.channels[name].enabled!==channels[name].enabled));
 const approved=body.contentApproved===true&&!contentChanged;
 const needed=new Set(channelNames.filter(name=>channels[name].enabled).map(name=>name.endsWith("_story")?"story":"feed"));
 if(approved&&([...needed].some(slot=>!old?.media[slot as Slot])))throw Error("Adjunta las imágenes y guárdalas antes de aprobar el contenido");
 const now=new Date().toISOString();
 return {version:1,id,title:title.trim(),reference:reference.trim(),contentApproved:approved,
  approvalAt:approved?(old?.contentApproved?old.approvalAt:now):null,
  createdAt:old?.createdAt||now,updatedAt:now,channels,
  media:old?.media||{feed:null,story:null}};
}

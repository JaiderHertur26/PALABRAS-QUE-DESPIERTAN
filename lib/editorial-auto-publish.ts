import "server-only";
import {createClient} from "@supabase/supabase-js";
import {createHash} from "node:crypto";
import sharp from "sharp";
import {
 credential,getGraph,postGraph,pageToken,instagramIdentity,DeliveryError,
} from "@/lib/editorial-meta-delivery";

const SUPABASE="https://lwuzkjvolxwkxdyafcjv.supabase.co";
const SITE="https://www.palabrasquedespiertan.online";
const BUCKET="pqd-meta-drafts-v1";
const PREFIX="automation/v1";
const CHANNELS=["facebook_feed","instagram_feed","facebook_story","instagram_story"] as const;
type Channel=typeof CHANNELS[number];
type Item={
 code:string;kind:"mensaje"|"articulo"|"tema";title:string;body:string;summary:string;
 state:string;approved_by_author:boolean;scheduled_at:string|null;social_scheduled_at:string|null;
 social_state:string|null;cover_url:string|null;canonical_url:string|null;bible_reference:string|null;
 updated_at:string;
};
type AutoReceipt={
 version:1;code:string;channel:Channel;status:"reserved"|"preparing"|"publishing"|"published"|"needs_review";
 scheduledAt:string;createdAt:string;updatedAt:string;sourceSha256:string;mediaSha256:string;
 metaMediaId:string|null;metaPostId:string|null;permalink:string|null;reason:string|null;
};
export type AutoResult={code:string;channel:Channel;status:string;metaPostId?:string|null;reason?:string|null};

function client(){
 const secret=process.env.SUPABASE_SECRET_KEY||"";
 if(process.env.NEXT_PUBLIC_SUPABASE_URL!==SUPABASE||!secret.startsWith("sb_secret_"))throw Error("AUTO_BACKEND_UNAVAILABLE");
 return createClient(SUPABASE,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
const clock=(item:Item)=>item.scheduled_at?Date.parse(item.scheduled_at)+5*60_000:NaN;
const sha=(x:Buffer)=>createHash("sha256").update(x).digest("hex");
const receiptPath=(i:Item,ch:Channel)=>PREFIX+"/receipts/"+i.code+"/"+ch+".json";
const assetPath=(i:Item,ch:Channel,hash:string)=>PREFIX+"/images/"+i.code+"/"+hash+"-"+(ch.endsWith("story")?"story":"feed")+".jpg";
function textClean(s:string){
 return s.replace(/<[^>]+>/g," ").replace(/\*\*/g,"").replace(/\[(.*?)\]\([^)]*\)/g,"$1")
  .replace(/[\t ]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
function caption(i:Item){
 const intro=i.kind==="mensaje"?textClean(i.body||i.summary):textClean(i.summary);
 const max=Math.max(100,1400-i.title.length-i.code.length);
 return [
  i.code+" · "+i.title,"",intro.slice(0,max),
  i.bible_reference?"\nFundamento bíblico: "+textClean(i.bible_reference):"",
  "\nP. Jaider Herrera Turizo",
  "\nLEE Y COMENTA LA PUBLICACIÓN EN LA REVISTA:",
  String(i.canonical_url),"\n#PalabrasQueDespiertan #FeCatólica #Oración",
 ].filter(Boolean).join("\n").trim().slice(0,2100);
}
export function isAutoEligible(i:Item,now:number){
 if(!/^(PD|ART)-\d{3}$/.test(i.code))return false;
 if(i.kind!=="mensaje"&&i.kind!=="articulo")return false;
 if(i.state!=="scheduled"||i.approved_by_author!==true)return false;
 if(i.social_scheduled_at!==null)return false; // La reserva existente en Meta Business Suite prevalece.
 if(!i.social_state||!/^(no-programado|pendiente-meta|META PENDIENTE)/i.test(i.social_state))return false;
 if(!i.cover_url||!/^\/(mensajes|articulos)\/[a-z0-9-]+\.(png|jpg|jpeg|webp)$/.test(i.cover_url))return false;
 if(!i.canonical_url||!i.canonical_url.startsWith(SITE+"/"))return false;
 if(!i.body||!i.summary||!i.title||!i.scheduled_at)return false;
 const t=clock(i);
 // Nunca anticipar ni publicar contenido atrasado durante días.
 return Number.isFinite(t)&&t>now-75*60_000&&t<now+45*60_000;
}
export function dueChannels(i:Item,now:number):Channel[]{
 if(!isAutoEligible(i,now))return [];
 const t=clock(i);
 return CHANNELS.filter(ch=>{
  const due=t+(ch.endsWith("story")?15*60_000:0);
  return now>=due&&now-due<=40*60_000;
 });
}
async function readyWebsite(i:Item){
 if(!i.canonical_url||!i.canonical_url.startsWith(SITE+"/"))throw Error("CANONICAL_NOT_OFFICIAL");
 const r=await fetch(i.canonical_url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
 if(!r.ok||r.status!==200)throw Error("WEB_NOT_PUBLIC_YET");
 // La página pública usa la autorización temporal de Supabase; un 200 es imprescindible.
 await r.body?.cancel();
}
async function imageBytes(i:Item,ch:Channel){
 const officialT01Story=ch.endsWith("story")&&/^PD-0(?:4[1-9]|50)$/.test(i.code);
 // Conservar el arte vertical original aprobado, no estirar la portada cuadrada.
 const source=officialT01Story
  ?SITE+"/mensajes/historias/"+i.code.toLowerCase()+".png"
  :SITE+i.cover_url!;
 const res=await fetch(source,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000)});
 if(!res.ok||res.status!==200)throw Error(officialT01Story?"OFFICIAL_STORY_IMAGE_UNAVAILABLE":"COVER_UNAVAILABLE");
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length<5_000||bytes.length>9_000_000)throw Error("COVER_SIZE_INVALID");
 const info=await sharp(bytes).metadata();
 if(!info.width||!info.height||info.width<250||info.height<250)throw Error("COVER_DIMENSIONS_INVALID");
 const isStory=ch.endsWith("story");
 const w=1080,h=isStory?1920:1080;
 const output=await sharp(bytes).rotate().resize(w,h,{
  fit:"contain",position:"centre",background:"#100e0c",
 }).jpeg({quality:88,mozjpeg:true}).toBuffer();
 if(output.length>3_500_000)throw Error("JPEG_SIZE_INVALID");
 return {output,sourceSha256:sha(bytes),mediaSha256:sha(output)};
}
function store(){return client().storage.from(BUCKET)}
async function readReceipt(i:Item,ch:Channel):Promise<AutoReceipt|null>{
 const {data,error}=await store().download(receiptPath(i,ch));
 if(error||!data)return null;
 const receipt=JSON.parse(await data.text()) as AutoReceipt;
 if(receipt.version!==1||receipt.code!==i.code||receipt.channel!==ch)throw Error("RECEIPT_INVALID");
 return receipt;
}
async function saveReceipt(receipt:AutoReceipt,patch:Partial<AutoReceipt>){
 const next={...receipt,...patch,updatedAt:new Date().toISOString()};
 const {error}=await store().upload(PREFIX+"/receipts/"+receipt.code+"/"+receipt.channel+".json",
  new Blob([JSON.stringify(next)],{type:"application/json"}),{upsert:true,contentType:"application/json"});
 if(error)throw Error("RECEIPT_UPDATE_FAILED");
 return next;
}
async function signedMedia(i:Item,ch:Channel,bytes:Buffer,hash:string){
 const path=assetPath(i,ch,hash);
 const existing=await store().download(path);
 if(existing.error){
  const {error}=await store().upload(path,new Blob([new Uint8Array(bytes)],{type:"image/jpeg"}),
   {upsert:false,contentType:"image/jpeg",cacheControl:"0"});
  if(error){
   const retry=await store().download(path);
   if(retry.error)throw Error("MEDIA_STORE_FAILED");
  }
 }
 const signed=await store().createSignedUrl(path,3600);
 if(signed.error||!signed.data?.signedUrl)throw Error("SIGNED_MEDIA_FAILED");
 return signed.data.signedUrl;
}
function idOK(x:unknown){return typeof x==="string"&&/^\d{8,25}(?:_\d{8,25})?$/.test(x)}
async function sendToMeta(i:Item,ch:Channel,jpeg:Buffer,mediaHash:string){
 const {record,token}=await credential();
 if(ch.startsWith("facebook")){
  for(const scope of ["pages_show_list","pages_read_engagement","pages_manage_posts"])
   if(!record.scopes.includes(scope))throw Error("FACEBOOK_SCOPE_MISSING");
  const pageAccess=await pageToken(record,token);
  const form=new FormData();
  form.set("source",new Blob([new Uint8Array(jpeg)],{type:"image/jpeg"}),i.code.toLowerCase()+".jpg");
  if(ch==="facebook_feed")form.set("caption",caption(i));
  form.set("published",ch==="facebook_story"?"false":"true");
  const create=await postGraph(record.facebookPageId!+"/photos",pageAccess,form);
  const mediaId=String(create.id||"");
  if(!idOK(mediaId))throw Error("FACEBOOK_MEDIA_ID_MISSING");
  if(ch==="facebook_story"){
   const story=await postGraph(record.facebookPageId!+"/photo_stories",pageAccess,new URLSearchParams({photo_id:mediaId}));
   if(story.success!==true||!idOK(story.post_id))throw Error("FACEBOOK_STORY_UNVERIFIED");
   return {mediaId,postId:String(story.post_id),permalink:null};
  }
  const info=await getGraph(mediaId,pageAccess,"id,link").catch(()=>null);
  return {mediaId,postId:String(create.post_id||mediaId),permalink:typeof info?.link==="string"?info.link:null};
 }
 for(const scope of ["instagram_basic","instagram_content_publish"])
  if(!record.scopes.includes(scope))throw Error("INSTAGRAM_SCOPE_MISSING");
 // TEST-001 confirmó una cuenta Business. Se verifica cada vez la identidad.
 const id=await instagramIdentity(record,token,ch==="instagram_story",ch==="instagram_story");
 const url=await signedMedia(i,ch,jpeg,mediaHash);
 const body=new URLSearchParams({image_url:url});
 if(ch==="instagram_story")body.set("media_type","STORIES");
 else body.set("caption",caption(i));
 const create=await postGraph(id+"/media",token,body);
 const container=String(create.id||"");
 if(!idOK(container))throw Error("IG_CONTAINER_INVALID");
 let finished=false;
 for(let j=0;j<8;j++){
  const state=await getGraph(container,token,"status_code").catch(()=>null);
  if(state?.status_code==="FINISHED"){finished=true;break;}
  if(state?.status_code==="ERROR"||state?.status_code==="EXPIRED")break;
  if(j<7)await new Promise(resolve=>setTimeout(resolve,1400));
 }
 if(!finished)throw Error("IG_CONTAINER_NOT_READY");
 const out=await postGraph(id+"/media_publish",token,new URLSearchParams({creation_id:container}));
 if(!idOK(out.id))throw Error("IG_PUBLISH_UNVERIFIED");
 const info=await getGraph(String(out.id),token,"id,permalink,media_type").catch(()=>null);
 return {mediaId:container,postId:String(out.id),permalink:typeof info?.permalink==="string"?info.permalink:null};
}
type StoryPlan={
 version:1;code:string;source:"external_feed"|"automatic_feed";status:"scheduled";
 webAt:string;feedAt:string;storyAt:string;coverUrl:string;createdAt:string;
 channels:{facebook_story:true;instagram_story:true};
};
const storyPlanPath=(code:string)=>PREFIX+"/story-plans/"+code+".json";
function feedTimestamp(i:Item){
 return i.social_scheduled_at?Date.parse(i.social_scheduled_at):clock(i);
}
export function externalStoryDue(i:Item,now:number){
 const fed=feedTimestamp(i),web=i.scheduled_at?Date.parse(i.scheduled_at):NaN;
 if(!/^PD-\d{3}$/.test(i.code)||i.kind!=="mensaje"||i.state!=="scheduled"||!i.approved_by_author)return false;
 if(!i.social_scheduled_at||!/PROGRAMADO EN META/i.test(i.social_state||""))return false;
 if(!i.cover_url||!/^\/mensajes\/[a-z0-9-]+\.(?:png|jpg|jpeg|webp)$/.test(i.cover_url))return false;
 if(!i.canonical_url?.startsWith(SITE+"/mensajes/"))return false;
 if(!Number.isFinite(fed)||!Number.isFinite(web)||Math.abs(fed-web-300_000)>60_000)return false;
 const due=fed+15*60_000;
 return now>=due&&now-due<=90*60_000;
}
export function validStoryPlan(i:Item,plan:StoryPlan|null){
 if(!plan||plan.version!==1||plan.code!==i.code||plan.status!=="scheduled")return false;
 if(plan.channels.facebook_story!==true||plan.channels.instagram_story!==true)return false;
 if(plan.webAt!==i.scheduled_at||plan.coverUrl!==i.cover_url)return false;
 const feed=feedTimestamp(i);
 return Number.isFinite(feed)&&plan.feedAt===new Date(feed).toISOString()
  &&plan.storyAt===new Date(feed+900_000).toISOString()
  &&plan.source===(i.social_scheduled_at?"external_feed":"automatic_feed");
}
async function readStoryPlan(i:Item):Promise<StoryPlan|null>{
 const {data,error}=await store().download(storyPlanPath(i.code));
 if(error||!data)return null;
 try{return JSON.parse(await data.text()) as StoryPlan}catch{return null}
}
export function feedContentMatches(description:string,i:Item){
 const text=description.toLowerCase();
 const code=i.code.toLowerCase(),url=String(i.canonical_url||"").toLowerCase();
 // Nunca confirmar un feed solo porque coincide una hora o un nombre genérico.
 return new RegExp("(?:^|[^a-z0-9])"+code+"(?:$|[^a-z0-9])","i").test(description)
  ||url.startsWith(SITE+"/")&&text.includes(url);
}
export async function externalFeedConfirmed(i:Item,ch:Channel){
 const target=feedTimestamp(i);
 if(!Number.isFinite(target))return false;
 const {record,token}=await credential();
 let rows:Record<string,unknown>[]=[];
 if(ch==="facebook_story"){
  const pageAccess=await pageToken(record,token);
  // Primero comprobar publicaciones activas de la página, incluidas las
  // que pasaron de "programado" a "publicado" desde Business Suite.
  const primary=await getGraph(record.facebookPageId!+"/published_posts?limit=60",pageAccess,
   "id,message,created_time,permalink_url").catch(()=>null);
  const resp=Array.isArray(primary?.data)&&primary.data.length?primary:
   await getGraph(record.facebookPageId!+"/posts?limit=60",pageAccess,
    "id,message,created_time,permalink_url");
  if(!Array.isArray(resp.data))return false;
  rows=resp.data as Record<string,unknown>[];
 }else if(ch==="instagram_story"){
  const id=await instagramIdentity(record,token,false);
  const resp=await getGraph(id+"/media?limit=60",token,
   "id,caption,timestamp,media_type,permalink");
  if(!Array.isArray(resp.data))return false;
  rows=(resp.data as Record<string,unknown>[])
   .filter(x=>x.media_type!=="STORY");
 }else return false;
 return rows.some(x=>{
  const message=String(x.message||x.caption||"");
  const timestamp=Date.parse(String(x.created_time||x.timestamp||""));
  return feedContentMatches(message,i)&&Number.isFinite(timestamp)
   &&timestamp>=target-10*60_000&&timestamp<=target+90*60_000;
 });
}
async function one(i:Item,ch:Channel):Promise<AutoResult>{
 const existing=await readReceipt(i,ch);
 if(existing)return {code:i.code,channel:ch,status:"already_reserved",metaPostId:existing.metaPostId};
 // Las historias requieren un feed confirmado. Si el feed fue programado
 // directamente en Business Suite, exigir comprobación positiva en Graph.
 if(ch.endsWith("story")){
  const feed=await readReceipt(i,ch.startsWith("facebook")?"facebook_feed":"instagram_feed");
  if(!feed||feed.status!=="published"){
   if(!i.social_scheduled_at)return {code:i.code,channel:ch,status:"feed_not_confirmed"};
   const plan=await readStoryPlan(i);
   if(!validStoryPlan(i,plan))return {code:i.code,channel:ch,status:"story_plan_missing"};
   try{
    if(!await externalFeedConfirmed(i,ch))
     return {code:i.code,channel:ch,status:"external_feed_unconfirmed"};
   }catch{
    return {code:i.code,channel:ch,status:"external_feed_check_unavailable"};
   }
  }
 }
 try{
  await readyWebsite(i);
  const {output,sourceSha256,mediaSha256}=await imageBytes(i,ch);
  const createdAt=new Date().toISOString();
  const rec:AutoReceipt={version:1,code:i.code,channel:ch,status:"reserved",
   scheduledAt:new Date(feedTimestamp(i)+(ch.endsWith("story")?900000:0)).toISOString(),
   createdAt,updatedAt:createdAt,sourceSha256,mediaSha256,
   metaMediaId:null,metaPostId:null,permalink:null,reason:null};
  const reserve=await store().upload(receiptPath(i,ch),new Blob([JSON.stringify(rec)],{type:"application/json"}),
   {upsert:false,contentType:"application/json",cacheControl:"0"});
  if(reserve.error){
   const prior=await readReceipt(i,ch);
   return {code:i.code,channel:ch,status:prior?"already_reserved":"reserve_error"};
  }
  let current=rec;
  try{
   current=await saveReceipt(current,{status:"publishing"});
   const result=await sendToMeta(i,ch,output,mediaSha256);
   current=await saveReceipt(current,{status:"published",metaMediaId:result.mediaId,
    metaPostId:result.postId,permalink:result.permalink,reason:null});
   return {code:i.code,channel:ch,status:"published",metaPostId:current.metaPostId};
  }catch(e){
   const reason=e instanceof Error?e.message:"META_DELIVERY_UNCERTAIN";
   await saveReceipt(current,{status:"needs_review",reason:reason.slice(0,100)}).catch(()=>null);
   return {code:i.code,channel:ch,status:"needs_review",reason:reason.slice(0,100)};
  }
 }catch(e){
  return {code:i.code,channel:ch,status:"preflight_blocked",reason:e instanceof Error?e.message:"UNKNOWN"};
 }
}
export async function autoDispatch(now=Date.now()){
 if(process.env.META_AUTO_PUBLISH_ENABLED!=="true")return {enabled:false,checkedAt:new Date(now).toISOString(),results:[]};
 const q=client();
 const {data,error}=await q.from("editorial_items").select(
  "code,kind,title,body,summary,state,approved_by_author,scheduled_at,social_scheduled_at,social_state,cover_url,canonical_url,bible_reference,updated_at"
 ).eq("state","scheduled").eq("approved_by_author",true).order("scheduled_at",{ascending:true}).limit(120);
 if(error||!Array.isArray(data))throw Error("EDITORIAL_READ_FAILED");
 const eligible=data as Item[];
 const normal=eligible.filter(i=>isAutoEligible(i,now));
 const external=eligible.filter(i=>externalStoryDue(i,now));
 const queue=[...normal,...external].sort((a,b)=>feedTimestamp(a)-feedTimestamp(b)).slice(0,1);
 const results:AutoResult[]=[];
 for(const i of queue){
  const channels=i.social_scheduled_at
   ?(["facebook_story","instagram_story"] as Channel[])
   :dueChannels(i,now);
  const feeds=channels.filter(c=>c.endsWith("_feed"));
  const stories=channels.filter(c=>c.endsWith("_story"));
  results.push(...await Promise.all(feeds.map(ch=>one(i,ch))));
  results.push(...await Promise.all(stories.map(ch=>one(i,ch))));
 }
 return {enabled:true,checkedAt:new Date(now).toISOString(),checkedItems:data.length,
  candidates:queue.length,externalStoryCandidates:external.length,results};
}

export async function autoDashboard(now=Date.now()){
 const q=client();
 const {data,error}=await q.from("editorial_items").select(
  "code,kind,title,body,summary,state,approved_by_author,scheduled_at,social_scheduled_at,social_state,cover_url,canonical_url,bible_reference,updated_at"
 ).in("kind",["mensaje","articulo"]).eq("approved_by_author",true).order("scheduled_at",{ascending:true}).limit(120);
 if(error||!data)throw Error("AUTO_DASHBOARD_UNAVAILABLE");
 const items=data as Item[];
 const future=items.filter(x=>x.state==="scheduled"&&x.scheduled_at&&Date.parse(x.scheduled_at)>=now-24*3600_000);
 const externallyDeclared=future.filter(x=>!!x.social_scheduled_at);
 const candidates=future.filter(x=>x.state==="scheduled"&&x.approved_by_author&&!x.social_scheduled_at
  &&/^(no-programado|pendiente-meta|META PENDIENTE)/i.test(x.social_state||""))
  .sort((a,b)=>feedTimestamp(a)-feedTimestamp(b));
 const futureSorted=[...future].sort((a,b)=>feedTimestamp(a)-feedTimestamp(b));
 const list=await store().list(PREFIX+"/story-plans",{limit:100});
 const scheduledNames=new Set((list.data||[]).map(x=>x.name));
 const storyPlans=future.filter(i=>scheduledNames.has(i.code+".json")).length;
 const externalStoryPlans=externallyDeclared.filter(i=>scheduledNames.has(i.code+".json")).length;
 const first=futureSorted.slice(0,8);
 const next=await Promise.all(first.map(async item=>{
  const plan=await readStoryPlan(item).catch(()=>null);
  const planned=validStoryPlan(item,plan);
  const result=await Promise.all(CHANNELS.map(async ch=>{
   const receipt=await readReceipt(item,ch).catch(()=>null);
   const automaticStory=ch.endsWith("_story")&&planned;
   const externalFeed=ch.endsWith("_feed")&&!!item.social_scheduled_at;
   const state=receipt?.status||(
    externalFeed?"external_schedule_recorded":automaticStory?"scheduled":ch.endsWith("_feed")?"pending":"not_scheduled"
   );
   return [ch,{state,metaPostId:receipt?.metaPostId||null,
    scheduledAt:automaticStory?plan!.storyAt:null}] as const;
  }));
  return {code:item.code,title:item.title,socialAt:new Date(feedTimestamp(item)).toISOString(),
   channels:Object.fromEntries(result)};
 }));
 return {enabled:process.env.META_AUTO_PUBLISH_ENABLED==="true",
  schedule:"Cada 15 minutos, hora Colombia; ejecución con margen de hasta 15 minutos",
  externallyDeclared:externallyDeclared.length,automaticCandidates:candidates.length,
  storyPlans,externalStoryPlans,
  excludedCodes:externallyDeclared.map(x=>x.code).slice(0,25),next,
  lastReadAt:new Date(now).toISOString()};
}

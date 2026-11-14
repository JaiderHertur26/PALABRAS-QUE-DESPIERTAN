import "server-only";
import {createClient} from "@supabase/supabase-js";
import {createHash} from "node:crypto";
import {decryptMetaAccessToken,type MetaVaultRecord} from "@/lib/meta-account-verification";
import {channelNames,loadDraft,mediaPath,privateDraftStore,validId,type ChannelName,type Draft,type Slot} from "@/lib/editorial-meta-drafts";

const graphRoot="https://graph.facebook.com/v26.0";
const project="https://lwuzkjvolxwkxdyafcjv.supabase.co";
const vault="pqd-meta-credentials-v1";
const eventRoot="deliveries/v1";
const approvedTestId="8077d038-98eb-4729-abe5-425a26267460";
const approvedFeedHash="8bbecb856e6b5816896b3d58a7457bbe2be7d4fea2c28cad21c3ffb8530cc0c5";
const preparedStoryHash="3512a4733e0d24dcf1b1e01056f015a77259312337d44869dd85c497c9544036";
const approvedCaptionHashes={
 facebook_feed:"fbc1c73983c52c280fbe6f11ea959b54755d6b2d64c3ad98d2911e7635d7d21f",
 instagram_feed:"96d75c6c6e78b18154a8a97baccd0e9ee1ffd0536313459715cac936cc115495"
} as const;
export type DeliveryStatus="reserved"|"media_prepared"|"publishing"|"published"|"rejected"|"needs_review";
export type Delivery={
 version:1;id:string;channel:ChannelName;status:DeliveryStatus;
 preparedAt:string;updatedAt:string;
 contentSha256:string;mediaSha256:string;
 metaMediaId:string|null;metaPostId:string|null;permalink:string|null;
 reason:string|null;
};
export class DeliveryError extends Error{constructor(public code:string,public status=400){super(code)}}
const path=(id:string,channel:ChannelName)=>eventRoot+"/"+id+"/"+channel+".json";
function isChannel(x:string):x is ChannelName{return channelNames.includes(x as ChannelName)}
function safeId(id:unknown){return typeof id==="string"&&validId(id)}
async function credential(){
 const key=process.env.SUPABASE_SECRET_KEY||"";
 if(process.env.NEXT_PUBLIC_SUPABASE_URL!==project||!key.startsWith("sb_secret_"))throw new DeliveryError("CONFIGURATION_UNAVAILABLE",503);
 const s=createClient(project,key,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from(vault);
 const {data,error}=await s.download("v1/instagram-unified.json");
 if(error||!data)throw new DeliveryError("META_AUTHORIZATION_MISSING",424);
 const record=JSON.parse(await data.text()) as MetaVaultRecord;
 if(record.version!==1||record.appId!=="2572239026621118"||record.expiresAt!==null&&record.expiresAt<=Math.floor(Date.now()/1000)+600)
  throw new DeliveryError("META_AUTHORIZATION_INVALID",424);
 return {record,token:decryptMetaAccessToken(record)};
}
async function getGraph(endpoint:string,accessToken:string,fields?:string){
 const url=new URL(graphRoot+"/"+endpoint.replace(/^\//,""));
 if(fields)url.searchParams.set("fields",fields);
 const r=await fetch(url,{headers:{Authorization:"Bearer "+accessToken},cache:"no-store",signal:AbortSignal.timeout(15000)});
 const json=await r.json().catch(()=>null) as Record<string,unknown>|null;
 if(!r.ok||!json||json.error)throw new DeliveryError("META_READ_ERROR_"+r.status,424);
 return json;
}
async function postGraph(endpoint:string,accessToken:string,body:FormData|URLSearchParams){
 const r=await fetch(graphRoot+"/"+endpoint.replace(/^\//,""),{
  method:"POST",headers:{Authorization:"Bearer "+accessToken},body,cache:"no-store",signal:AbortSignal.timeout(25000)});
 const json=await r.json().catch(()=>null) as Record<string,unknown>|null;
 if(!r.ok||!json||json.error)throw new DeliveryError("META_WRITE_ERROR_"+r.status,424);
 return json;
}
async function pageToken(record:MetaVaultRecord,token:string){
 if(!record.facebookPageVerified||!record.facebookCanCreateContent||!/^\d{8,25}$/.test(record.facebookPageId||""))
  throw new DeliveryError("FACEBOOK_PAGE_NOT_VERIFIED",424);
 const list=await getGraph("me/accounts",token,"id,name,username,access_token,tasks").catch(()=>null);
 const items=Array.isArray(list?.data)?list.data as Record<string,unknown>[]:[];
 let page=items.find(x=>String(x.id)===record.facebookPageId);
 // Los usuarios del sistema pueden recibir los activos por identificador
 // y no por /me/accounts. Comprobación alternativa de solo lectura.
 if(!page){
  const direct=await getGraph(String(record.facebookPageId),token,"id,name,username,access_token,tasks").catch(()=>null);
  if(direct&&String(direct.id)===record.facebookPageId)page=direct;
 }
 if(!page||typeof page.access_token!=="string"||page.access_token.length<20)
  throw new DeliveryError("FACEBOOK_PAGE_TOKEN_NOT_FOUND",424);
 const tasks=Array.isArray(page.tasks)?page.tasks:[];
 if(!tasks.some(x=>["CREATE_CONTENT","MANAGE","PROFILE_PLUS_CREATE_CONTENT","PROFILE_PLUS_FULL_CONTROL","PROFILE_PLUS_MANAGE"].includes(String(x))))
  throw new DeliveryError("FACEBOOK_PUBLISH_PERMISSION_MISSING",424);
 if(String(page.name||"").trim().toLowerCase()!=="palabras que despiertan")
  throw new DeliveryError("FACEBOOK_PAGE_IDENTITY_MISMATCH",424);
 return page.access_token;
}
async function instagramIdentity(record:MetaVaultRecord,token:string,story:boolean){
 if(!record.verifiedAccount||record.username!=="palabrasquedespiertan"||!/^\d{8,25}$/.test(record.accountId||""))
  throw new DeliveryError("INSTAGRAM_NOT_VERIFIED",424);
 // La identidad puede comprobarse aun si Meta no concede el campo opcional
 // account_type. Un error en ese campo nunca debe bloquear el feed.
 const ig=await getGraph(String(record.accountId),token,"id,username");
 if(String(ig.id)!==record.accountId||String(ig.username).toLowerCase()!=="palabrasquedespiertan")
  throw new DeliveryError("INSTAGRAM_IDENTITY_MISMATCH",424);
 if(story){
  const type=await getGraph(String(record.accountId),token,"id,account_type").catch(()=>null);
  if(type?.account_type!=="BUSINESS")throw new DeliveryError("INSTAGRAM_STORIES_BUSINESS_REQUIRED",424);
 }
 return String(record.accountId);
}
async function loadPicture(draft:Draft,slot:Slot){
 const expected=draft.media[slot];
 if(!expected||expected.mime!=="image/jpeg"||expected.size>3_500_000)throw new DeliveryError("APPROVED_JPEG_REQUIRED",400);
 const {data,error}=await privateDraftStore().download(mediaPath(draft.id,slot));
 if(error||!data)throw new DeliveryError("IMAGE_MISSING",424);
 const bytes=Buffer.from(await data.arrayBuffer());
 if(bytes.length!==expected.size||createHash("sha256").update(bytes).digest("hex")!==expected.sha256)
  throw new DeliveryError("IMAGE_INTEGRITY_FAILED",424);
 return bytes;
}
async function signedImage(draft:Draft,slot:Slot){
 const signed=await privateDraftStore().createSignedUrl(mediaPath(draft.id,slot),3600);
 if(signed.error||!signed.data?.signedUrl)throw new DeliveryError("IMAGE_SIGNING_FAILED",424);
 // No external publication before this ephemeral URL can be read.
 const response=await fetch(signed.data.signedUrl,{cache:"no-store",signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new DeliveryError("IMAGE_NOT_REACHABLE",424);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(createHash("sha256").update(bytes).digest("hex")!==draft.media[slot]?.sha256)
  throw new DeliveryError("IMAGE_URL_INTEGRITY_FAILED",424);
 return signed.data.signedUrl;
}
function initDelivery(draft:Draft,channel:ChannelName):Delivery{
 const slot=channel.endsWith("_story")?"story":"feed";
 const sha=createHash("sha256").update(draft.channels[channel].copy).digest("hex");
 return {version:1,id:draft.id,channel,status:"reserved",preparedAt:new Date().toISOString(),
  updatedAt:new Date().toISOString(),contentSha256:sha,mediaSha256:draft.media[slot]!.sha256,
  metaMediaId:null,metaPostId:null,permalink:null,reason:null};
}
async function updateReceipt(item:Delivery,patch:Partial<Delivery>){
 const next={...item,...patch,updatedAt:new Date().toISOString()};
 const {error}=await privateDraftStore().upload(path(next.id,next.channel),
  new Blob([JSON.stringify(next)],{type:"application/json"}),
  {upsert:true,contentType:"application/json",cacheControl:"0"});
 if(error)throw new DeliveryError("RECEIPT_SAVE_FAILED",503);
 return next;
}
export async function readReceipt(id:string,channel:ChannelName):Promise<Delivery|null>{
 if(!safeId(id)||!isChannel(channel))return null;
 const {data,error}=await privateDraftStore().download(path(id,channel));
 if(error||!data)return null;
 const x=JSON.parse(await data.text()) as Delivery;
 return x.version===1&&x.id===id&&x.channel===channel?x:null;
}
export async function readReceipts(id:string){
 if(!safeId(id))throw new DeliveryError("INVALID_DRAFT");
 const result=await Promise.all(channelNames.map(c=>readReceipt(id,c)));
 return Object.fromEntries(channelNames.map((c,i)=>[c,result[i]]));
}
function isTest(draft:Draft,channel:ChannelName){
 // Fase inicial: no se abre el envío automático a contenidos PD ni ART.
 if(draft.id!==approvedTestId||draft.reference!=="TEST-001"||
  draft.media.feed?.sha256!==approvedFeedHash)return false;
 if(channel.endsWith("_story"))
  return draft.media.story?.sha256===preparedStoryHash;
 if(!(channel in approvedCaptionHashes))return false;
 const copy=draft.channels[channel].copy;
 return createHash("sha256").update(copy).digest("hex")===
  approvedCaptionHashes[channel as keyof typeof approvedCaptionHashes];
}
export type Readiness={ready:boolean;reason:string;instagramAccountType?:string|null};
export async function checkChannelEligibility(draft:Draft,channel:ChannelName):Promise<Readiness>{
 if(!isTest(draft,channel))return {ready:false,reason:"NOT_APPROVED_TEST"};
 const isStory=channel.endsWith("_story");
 if(isStory?(!draft.storyApproved||!draft.storyApprovalAt):(!draft.contentApproved||!draft.approvalAt))
  return {ready:false,reason:isStory?"STORY_NOT_APPROVED":"CONTENT_NOT_APPROVED"};
 if(!draft.channels[channel].enabled)return {ready:false,reason:"CHANNEL_NOT_SELECTED"};
 if(draft.channels[channel].mode!=="manual"||draft.channels[channel].scheduledAt!==null)
  return {ready:false,reason:"SCHEDULED_ITEM_NOT_ELIGIBLE"};
 if(channel.endsWith("_feed")&&(draft.channels[channel].copy.trim().length<30||draft.channels[channel].copy.length>2200))
  return {ready:false,reason:"INVALID_CAPTION"};
 if(await readReceipt(draft.id,channel))return {ready:false,reason:"DELIVERY_ALREADY_RESERVED"};
 try{
  const slot:Slot=channel.endsWith("_story")?"story":"feed";
  await loadPicture(draft,slot);
  const {record,token}=await credential();
  if(channel.startsWith("facebook_")){
   if(["pages_show_list","pages_read_engagement","pages_manage_posts"].some(x=>!record.scopes.includes(x)))
    throw new DeliveryError("FACEBOOK_SCOPES_MISSING",424);
   await pageToken(record,token);
   // Para historias de Facebook, Meta exige token de página, CREATE_CONTENT
   // y permisos de Page; business_management puede depender del acceso
   // al negocio, pero no es un requisito universal del endpoint de historia.
   // El estado real se determina por la respuesta de Meta a la prueba.
  }else{
   if(["instagram_basic","instagram_content_publish"].some(x=>!record.scopes.includes(x)))
    throw new DeliveryError("INSTAGRAM_SCOPES_MISSING",424);
   await instagramIdentity(record,token,channel==="instagram_story");
   // Garantizar que Meta pueda recuperar la imagen antes de reservar un intento.
   await signedImage(draft,slot);
  }
  return {ready:true,reason:"READY",instagramAccountType:record.instagramAccountType||null};
 }catch(e){
  return {ready:false,reason:e instanceof DeliveryError?e.code:"META_PREFLIGHT_UNAVAILABLE"};
 }
}
export async function storyAccountDiagnostic(){
 // Comprobación de solo lectura: no crea multimedia, publicaciones ni recibos.
 try{
  const {record,token}=await credential();
  let igType:string|null=null;
  let igStatus:"confirmed"|"unavailable"|"identity_mismatch"="unavailable";
  if(record.accountId&&/^\\d{8,25}$/.test(record.accountId)){
   const profile=await getGraph(record.accountId,token,"id,username,account_type").catch(()=>null);
   if(profile?.id===record.accountId&&String(profile.username).toLowerCase()==="palabrasquedespiertan"){
    igStatus="confirmed";
    igType=typeof profile.account_type==="string"?profile.account_type:null;
   }else if(profile)igStatus="identity_mismatch";
  }
  const pageReady=await pageToken(record,token).then(()=>true).catch(()=>false);
  return {instagram:{type:igType,status:igStatus,canPublishStories:igType==="BUSINESS"},
   facebook:{pageReady,hasBusinessManagementScope:record.scopes.includes("business_management"),
    canAttemptStories:pageReady&&["pages_show_list","pages_read_engagement","pages_manage_posts"]
     .every(s=>record.scopes.includes(s))}};
 }catch{
  return {instagram:{type:null,status:"unavailable",canPublishStories:false},
   facebook:{pageReady:false,hasBusinessManagementScope:false,canAttemptStories:false}};
 }
}
export async function publicationReadiness(id:string){
 const draft=await loadDraft(id);
 if(!draft||draft.id!==approvedTestId)return null;
 const channels=await Promise.all(
  channelNames.map(async c=>[c,await checkChannelEligibility(draft,c)] as const)
 );
 return {revision:draft.updatedAt,channels:Object.fromEntries(channels),
  storyAccounts:await storyAccountDiagnostic()};
}
export async function publishTestOnce(id:string,channel:ChannelName,revision:string){
 if(!safeId(id)||!isChannel(channel))throw new DeliveryError("INVALID_TARGET");
 const draft=await loadDraft(id);
 if(!draft||!isTest(draft,channel))throw new DeliveryError("ONLY_APPROVED_TEST001_FEED_ALLOWED",403);
 if(draft.updatedAt!==revision)throw new DeliveryError("DRAFT_CHANGED_RELOAD",409);
 if(channel.endsWith("_story")
  ?(!draft.storyApproved||!draft.storyApprovalAt)
  :(!draft.contentApproved||!draft.approvalAt))
  throw new DeliveryError("CONTENT_NOT_APPROVED",409);
 if(!draft.channels[channel].enabled)throw new DeliveryError("CHANNEL_NOT_SELECTED",409);
 const setting=draft.channels[channel];
 if(setting.mode!=="manual"||setting.scheduledAt!==null)throw new DeliveryError("SCHEDULED_CONTENT_NOT_ALLOWED",409);
 if(channel.endsWith("_feed")&&(setting.copy.trim().length<30||setting.copy.length>2200))
  throw new DeliveryError("INVALID_COPY");
 const slot:Slot=channel.endsWith("_story")?"story":"feed";
 await loadPicture(draft,slot);
 const present=await readReceipt(id,channel);
 if(present)return {receipt:present,duplicatePrevented:true};
 const preflight=await checkChannelEligibility(draft,channel);
 if(!preflight.ready)throw new DeliveryError(preflight.reason,424);
 const latest=await loadDraft(id);
 if(!latest||latest.updatedAt!==revision||
   (channel.endsWith("_story")?!latest.storyApproved:!latest.contentApproved))
  throw new DeliveryError("DRAFT_CHANGED_DURING_PREFLIGHT",409);
 const created=initDelivery(draft,channel);
 const reservation=await privateDraftStore().upload(path(id,channel),
  new Blob([JSON.stringify(created)],{type:"application/json"}),
  {upsert:false,contentType:"application/json",cacheControl:"0"});
 if(reservation.error){
  const exists=await readReceipt(id,channel);
  if(exists)return {receipt:exists,duplicatePrevented:true};
  throw new DeliveryError("RECEIPT_RESERVATION_FAILED",503);
 }
 let state=created;
 // All retries now encounter the receipt, even if the Meta request times out.
 try{
  const {record,token}=await credential();
  if(channel.startsWith("instagram_")&&
   (!record.scopes.includes("instagram_content_publish")||!record.scopes.includes("instagram_basic")))
   throw new DeliveryError("INSTAGRAM_SCOPE_MISSING",424);
  let mediaId:string,postId:string,permalink:string|null=null;
  if(channel.startsWith("facebook_")){
   for(const scope of ["pages_show_list","pages_read_engagement","pages_manage_posts"]){
    if(!record.scopes.includes(scope))throw new DeliveryError("FACEBOOK_SCOPE_MISSING",424);
   }
   const pageAccess=await pageToken(record,token);
   const image=await loadPicture(draft,slot);
   const form=new FormData();
   form.set("source",new Blob([new Uint8Array(image)],{type:"image/jpeg"}),"test001-"+slot+".jpg");
   if(channel==="facebook_feed")form.set("caption",setting.copy);
   form.set("published",channel==="facebook_story"?"false":"true");
   state=await updateReceipt(state,{status:"publishing"});
   const output=await postGraph(record.facebookPageId!+"/photos",pageAccess,form);
   mediaId=String(output.id||"");postId=String(output.post_id||"");
   if(!/^\d{8,25}$/.test(mediaId))throw new DeliveryError("FACEBOOK_RESULT_UNVERIFIED",424);
   if(channel==="facebook_story"){
    // Primero se guarda una foto NO publicada; solo la segunda llamada
    // crea la historia. Nunca se usa una foto ya publicada en el feed.
    state=await updateReceipt(state,{status:"media_prepared",metaMediaId:mediaId});
    state=await updateReceipt(state,{status:"publishing"});
    const result=await postGraph(record.facebookPageId!+"/photo_stories",pageAccess,
     new URLSearchParams({photo_id:mediaId}));
    if(result.success!==true||typeof result.post_id!=="string"||!/^\d+(?:_\d+)?$/.test(result.post_id))
     throw new DeliveryError("FACEBOOK_STORY_RESULT_UNVERIFIED",424);
    postId=result.post_id;
   }else{
    const details=await getGraph(mediaId,pageAccess,"id,link").catch(()=>null);
    permalink=typeof details?.link==="string"?details.link:null;
    if(!postId&&typeof output.id==="string")postId=output.id;
   }
  }else{
   const igId=await instagramIdentity(record,token,channel==="instagram_story");
   const url=await signedImage(draft,slot);
   const form=new URLSearchParams({image_url:url});
   if(channel==="instagram_story")form.set("media_type","STORIES");
   else form.set("caption",setting.copy);
   state=await updateReceipt(state,{status:"publishing"});
   const creation=await postGraph(igId+"/media",token,form);
   const container=String(creation.id||"");
   if(!/^\d{8,25}$/.test(container))throw new DeliveryError("INSTAGRAM_CONTAINER_UNVERIFIED",424);
   state=await updateReceipt(state,{status:"media_prepared",metaMediaId:container});
   let finished=false;
   for(let attempt=0;attempt<7;attempt++){
    const status=await getGraph(container,token,"status_code").catch(()=>null);
    if(status?.status_code==="FINISHED"){finished=true;break}
    if(status?.status_code==="ERROR"||status?.status_code==="EXPIRED")break;
    if(attempt<6)await new Promise(resolve=>setTimeout(resolve,1700));
   }
   if(!finished)throw new DeliveryError("INSTAGRAM_CONTAINER_NOT_READY",424);
   state=await updateReceipt(state,{status:"publishing"});
   const output=await postGraph(igId+"/media_publish",token,new URLSearchParams({creation_id:container}));
   mediaId=String(output.id||"");postId=mediaId;
   if(!/^\d{8,25}$/.test(mediaId))throw new DeliveryError("INSTAGRAM_RESULT_UNVERIFIED",424);
   const details=await getGraph(mediaId,token,"id,permalink,media_type").catch(()=>null);
   permalink=typeof details?.permalink==="string"?details.permalink:null;
  }
  state=await updateReceipt(state,{status:"published",metaMediaId:mediaId,metaPostId:postId,permalink,reason:null});
  return {receipt:state,duplicatePrevented:false};
 }catch(error){
  const reason=error instanceof DeliveryError?error.code:"NETWORK_OR_UNKNOWN_ERROR";
  // A failed/uncertain API call cannot be safely retried automatically.
  state=await updateReceipt(state,{status:"needs_review",reason});
  return {receipt:state,duplicatePrevented:false};
 }
}

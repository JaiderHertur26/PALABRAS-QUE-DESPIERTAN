import "server-only";
import {createClient} from "@supabase/supabase-js";
import {createHash} from "node:crypto";
import {decryptMetaAccessToken,type MetaVaultRecord} from "@/lib/meta-account-verification";
import {channelNames,loadDraft,mediaPath,privateDraftStore,validId,type ChannelName,type Draft,type Slot} from "@/lib/editorial-meta-drafts";

const graphRoot="https://graph.facebook.com/v26.0";
const project="https://lwuzkjvolxwkxdyafcjv.supabase.co";
const vault="pqd-meta-credentials-v1";
const eventRoot="deliveries/v1";
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
 const list=await getGraph("me/accounts",token,"id,name,username,access_token,tasks");
 const items=Array.isArray(list.data)?list.data as Record<string,unknown>[]:[];
 const page=items.find(x=>String(x.id)===record.facebookPageId);
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
 const ig=await getGraph(String(record.accountId),token,"id,username,account_type");
 if(String(ig.id)!==record.accountId||String(ig.username).toLowerCase()!=="palabrasquedespiertan")
  throw new DeliveryError("INSTAGRAM_IDENTITY_MISMATCH",424);
 if(story&&ig.account_type!=="BUSINESS")throw new DeliveryError("INSTAGRAM_STORIES_BUSINESS_REQUIRED",424);
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
 return draft.reference==="TEST-001"&&["facebook_feed","instagram_feed"].includes(channel);
}
export async function publishTestOnce(id:string,channel:ChannelName,revision:string){
 if(!safeId(id)||!isChannel(channel))throw new DeliveryError("INVALID_TARGET");
 const draft=await loadDraft(id);
 if(!draft||!isTest(draft,channel))throw new DeliveryError("ONLY_APPROVED_TEST001_FEED_ALLOWED",403);
 if(draft.updatedAt!==revision)throw new DeliveryError("DRAFT_CHANGED_RELOAD",409);
 if(!draft.contentApproved||!draft.approvalAt||!draft.channels[channel].enabled)
  throw new DeliveryError("CONTENT_NOT_APPROVED",409);
 const setting=draft.channels[channel];
 if(setting.mode!=="manual"||setting.scheduledAt!==null)throw new DeliveryError("SCHEDULED_CONTENT_NOT_ALLOWED",409);
 if(setting.copy.trim().length<30||setting.copy.length>2200)throw new DeliveryError("INVALID_COPY");
 const slot:Slot="feed";
 await loadPicture(draft,slot);
 const present=await readReceipt(id,channel);
 if(present)return {receipt:present,duplicatePrevented:true};
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
  if(!record.scopes.includes("instagram_content_publish")||!record.scopes.includes("instagram_basic"))
   throw new DeliveryError("INSTAGRAM_SCOPE_MISSING",424);
  let mediaId:string,postId:string,permalink:string|null=null;
  if(channel==="facebook_feed"){
   for(const scope of ["pages_show_list","pages_read_engagement","pages_manage_posts"]){
    if(!record.scopes.includes(scope))throw new DeliveryError("FACEBOOK_SCOPE_MISSING",424);
   }
   const pageAccess=await pageToken(record,token);
   const image=await loadPicture(draft,"feed");
   const form=new FormData();
   form.set("source",new Blob([new Uint8Array(image)],{type:"image/jpeg"}),"test001.jpg");
   form.set("caption",setting.copy);
   form.set("published","true");
   state=await updateReceipt(state,{status:"publishing"});
   const output=await postGraph(record.facebookPageId!+"/photos",pageAccess,form);
   mediaId=String(output.id||"");postId=String(output.post_id||"");
   if(!/^\d{8,25}$/.test(mediaId))throw new DeliveryError("FACEBOOK_RESULT_UNVERIFIED",424);
   const details=await getGraph(mediaId,pageAccess,"id,link").catch(()=>null);
   permalink=typeof details?.link==="string"?details.link:null;
   if(!postId&&typeof output.id==="string")postId=output.id;
  }else{
   const igId=await instagramIdentity(record,token,false);
   const url=await signedImage(draft,"feed");
   const form=new URLSearchParams({image_url:url,caption:setting.copy});
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

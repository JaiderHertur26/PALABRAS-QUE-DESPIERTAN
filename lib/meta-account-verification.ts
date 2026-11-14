import "server-only";
import {createDecipheriv} from "node:crypto";

const API="https://graph.facebook.com/v26.0";
export type MetaVaultRecord={
 version:1; at:string; appId:string;scopes:string[];
 expiresAt:number|null;verifiedAccount:boolean;iv:string;tag:string;encrypted:string;
 username?:string|null;accountId?:string|null;instagramAccountType?:string|null;
 verificationState?:"confirmed"|"awaiting_account_permission"|"expired"|"meta_unavailable"|"unverified";
 lastVerificationAttemptAt?:string;lastVerifiedAt?:string|null;
 facebookPageVerified?:boolean;facebookPageId?:string|null;facebookPageName?:string|null;facebookPageUsername?:string|null;
 facebookCanCreateContent?:boolean;facebookVerificationState?:FacebookVerificationState;
 lastFacebookVerificationAttemptAt?:string;lastFacebookVerifiedAt?:string|null;
};
export type AccountVerification={verified:boolean;username:string|null;accountId:string|null;
 state:NonNullable<MetaVaultRecord["verificationState"]>; expiresAt:number|null;tokenValid:boolean|null;accountType?:string|null};

export function decryptMetaAccessToken(record:MetaVaultRecord){
 const key=process.env.META_TOKEN_ENCRYPTION_KEY||"";
 if(!/^[a-f0-9]{64}$/i.test(key))throw Error("Meta encryption unavailable");
 const decipher=createDecipheriv("aes-256-gcm",Buffer.from(key,"hex"),Buffer.from(record.iv,"base64"));
 decipher.setAAD(Buffer.from("pqd:meta:instagram:v1"));
 decipher.setAuthTag(Buffer.from(record.tag,"base64"));
 return Buffer.concat([decipher.update(Buffer.from(record.encrypted,"base64")),decipher.final()]).toString("utf8");
}
async function graph(path:string,token:string,query?:Record<string,string>){
 const url=new URL(API+path);
 for(const [k,v] of Object.entries(query||{}))url.searchParams.set(k,v);
 const r=await fetch(url,{headers:{Authorization:"Bearer "+token},cache:"no-store",signal:AbortSignal.timeout(5000)});
 if(!r.ok)return null;
 return r.json() as Promise<Record<string,unknown>>;
}
function scopedTargets(debug:Record<string,unknown>){
 const scopes=Array.isArray(debug.granular_scopes)?debug.granular_scopes:[];
 const ids=new Set<string>();
 for(const item of scopes){
  if(!item||typeof item!=="object")continue;
  const grant=item as {scope?:unknown;target_ids?:unknown};
  if(grant.scope!=="instagram_basic"&&grant.scope!=="instagram_content_publish")continue;
  if(!Array.isArray(grant.target_ids))continue;
  for(const id of grant.target_ids){
   const s=String(id);
   if(/^\d{8,25}$/.test(s))ids.add(s);
  }
 }
 return [...ids].slice(0,5);
}
function normalizedCandidate(candidate:unknown){
 if(!candidate||typeof candidate!=="object")return null;
 const obj=candidate as {id?:unknown;username?:unknown};
 if(typeof obj.username!=="string"||typeof obj.id!=="string"||!/^\d{8,25}$/.test(obj.id))return null;
 return {id:obj.id,username:obj.username.toLowerCase().replace(/^@/,"")};
}
export async function verifySavedInstagram(record:MetaVaultRecord,appAuth:string):Promise<AccountVerification>{
 const token=decryptMetaAccessToken(record);
 // Only a Meta app token (appId|appSecret) received from our authenticated editorial server.
 if(!/^2572239026621118\|[a-fA-F0-9]{32}$/.test(appAuth))
  return {verified:false,username:null,accountId:null,state:"unverified",expiresAt:record.expiresAt,tokenValid:null};
 const response=await graph("/debug_token",appAuth,{input_token:token});
 if(!response||!response.data||typeof response.data!=="object")
  return {verified:false,username:null,accountId:null,state:"meta_unavailable",expiresAt:record.expiresAt,tokenValid:null};
 const debug=response.data as Record<string,unknown>;
 if(debug.is_valid!==true||String(debug.app_id)!==record.appId)
  return {verified:false,username:null,accountId:null,state:"expired",expiresAt:record.expiresAt,tokenValid:false};
 const permissions=Array.isArray(debug.scopes)?debug.scopes:[];
 if(!permissions.includes("instagram_basic")||!permissions.includes("instagram_content_publish"))
  return {verified:false,username:null,accountId:null,state:"unverified",expiresAt:record.expiresAt,tokenValid:false};
 const expiresAt=typeof debug.expires_at==="number"&&debug.expires_at>0?debug.expires_at:record.expiresAt;
 if(expiresAt!==null&&expiresAt<=Math.floor(Date.now()/1000))
  return {verified:false,username:null,accountId:null,state:"expired",expiresAt,tokenValid:false};
 const candidates: {id:string;username:string}[]=[];
 // The granular-scopes target IDs supplied by Meta are preferable to guessing a Facebook Page.
 const scoped=await Promise.all(scopedTargets(debug).map(id=>graph("/"+id,token,{fields:"id,username"})));
 for(const result of scoped){
  const cand=normalizedCandidate(result);
  if(cand)candidates.push(cand);
 }
 if(candidates.length===0){
  // This route may require additional Page permissions; never call that a verification success.
  const [profile,pages]=await Promise.all([
   graph("/me",token,{fields:"id,username"}),
   graph("/me/accounts",token,{fields:"id,name,instagram_business_account{id,username}",limit:"25"})
  ]);
  const profileCand=normalizedCandidate(profile);
  if(profileCand)candidates.push(profileCand);
  if(Array.isArray(pages?.data)){
   for(const page of pages.data){
    if(!page||typeof page!=="object")continue;
    const item=page as {instagram_business_account?:unknown};
    const cand=normalizedCandidate(item.instagram_business_account);
    if(cand)candidates.push(cand);
   }
  }
 }
 const match=candidates.find(x=>x.username==="palabrasquedespiertan");
 if(match){
  const detail=await graph("/"+match.id,token,{fields:"id,account_type"});
  const accountType=detail&&String(detail.id)===match.id&&typeof detail.account_type==="string"?detail.account_type:null;
  return {verified:true,username:match.username,accountId:match.id,state:"confirmed",expiresAt,tokenValid:true,accountType};
 }
 return {verified:false,username:null,accountId:null,state:"awaiting_account_permission",expiresAt,tokenValid:true};
}

export type FacebookVerificationState="confirmed"|"no_page"|"insufficient_tasks"|"meta_unavailable"|"missing_scopes";
export type FacebookVerification={
 verified:boolean;
 pageId:string|null;
 pageName:string|null;
 pageUsername:string|null;
 canCreateContent:boolean;
 state:FacebookVerificationState;
};
function isKnownPage(page:Record<string,unknown>,igId:string|null){
 const username=typeof page.username==="string"?page.username.trim().toLowerCase():"";
 const link=typeof page.link==="string"?page.link.trim():"";
 let linked=false;
 const ig=page.instagram_business_account;
 if(ig&&typeof ig==="object"){
  const linkedIg=ig as {id?:unknown;username?:unknown};
  linked=(igId!==null&&String(linkedIg.id)===igId)||
   (typeof linkedIg.username==="string"&&linkedIg.username.toLowerCase()==="palabrasquedespiertan");
 }
 const matchHandle=username==="palabrasquedespiertan01";
 let matchLink=false;
 if(link){
  try{
   const url=new URL(link);
   matchLink=(url.hostname==="facebook.com"||url.hostname==="www.facebook.com"||
    url.hostname==="m.facebook.com")&&/^\/palabrasquedespiertan01\/?$/i.test(url.pathname);
  }catch{}
 }
 const exactName=typeof page.name==="string"&&page.name.trim().toLowerCase()==="palabras que despiertan";
 return matchHandle||matchLink||(exactName&&linked);
}
function safePage(raw:unknown){
 if(!raw||typeof raw!=="object")return null;
 const p=raw as Record<string,unknown>;
 if(!/^\d{8,25}$/.test(String(p.id||"")))return null;
 return p;
}
/** Read-only authorization probe. No Facebook post is created. */
export async function verifySavedFacebook(record:MetaVaultRecord,appAuth:string):Promise<FacebookVerification>{
 const missing:FacebookVerification={verified:false,pageId:null,pageName:null,pageUsername:null,canCreateContent:false,state:"no_page"};
 const scopes=["pages_show_list","pages_read_engagement","pages_manage_posts"];
 if(scopes.some(x=>!record.scopes.includes(x)))return {...missing,state:"missing_scopes"};
 const token=decryptMetaAccessToken(record);
 // Meta documents /me/accounts for system-user access to managed Page tokens.
 let list=await graph("/me/accounts",token,{
  fields:"id,name,username,link,access_token,tasks,instagram_business_account{id,username}",limit:"25"
 });
 if(!Array.isArray(list?.data)){
  list=await graph("/me/accounts",token,{fields:"id,name,access_token,tasks",limit:"25"});
 }
 const rows=Array.isArray(list?.data)?list.data.map(safePage).filter((x):x is Record<string,unknown>=>x!==null):[];
 // Meta sometimes returns only target_ids for system-user permissions.
 // Fall back to those explicit target ids; never search for Pages by name.
 if(rows.length===0 && /^2572239026621118\|[a-fA-F0-9]{32}$/.test(appAuth)){
  const tokenMeta=await graph("/debug_token",appAuth,{input_token:token});
  const info=tokenMeta?.data;
  if(info&&typeof info==="object"){
   const data=info as Record<string,unknown>;
   if(data.is_valid===true&&String(data.app_id)===record.appId){
    const grants=Array.isArray(data.granular_scopes)?data.granular_scopes:[];
    const pageIds=new Set<string>();
    for(const grant of grants){
     if(!grant||typeof grant!=="object")continue;
     const g=grant as {scope?:unknown;target_ids?:unknown};
     if(!["pages_manage_posts","pages_read_engagement","pages_show_list"].includes(String(g.scope)))continue;
     if(!Array.isArray(g.target_ids))continue;
     for(const target of g.target_ids){const id=String(target);if(/^\d{8,25}$/.test(id))pageIds.add(id)}
    }
    rows.push(...[...pageIds].slice(0,8).map(id=>({id})));
   }
  }
 }
 if(rows.length===0)return {...missing,state:Array.isArray(list?.data)?"no_page":"meta_unavailable"};
 const requested=rows.slice(0,25);
 // Query only Page details; do not query posts, upload files, or publish anything.
 const detailed=await Promise.all(requested.map(async page=>{
  const pageToken=typeof page.access_token==="string"&&page.access_token.length>20
   ?page.access_token:token;
  const detail=await graph("/"+page.id,pageToken,{
   fields:"id,name,username,link,instagram_business_account{id,username}"
  });
  return {...page,...(detail&&String(detail.id)===String(page.id)?detail:{})};
 }));
 const igId=record.verifiedAccount&&record.accountId?record.accountId:null;
 const match=detailed.find(x=>isKnownPage(x,igId));
 if(!match)return missing;
 const tasks=Array.isArray(match.tasks)?match.tasks.filter((x):x is string=>typeof x==="string"):[];
 const canCreate=tasks.some(x=>[
  "CREATE_CONTENT","MANAGE","PROFILE_PLUS_CREATE_CONTENT",
  "PROFILE_PLUS_FULL_CONTROL","PROFILE_PLUS_MANAGE","PROFILE_PLUS_FACEBOOK_ACCESS"
 ].includes(x));
 const hasPageToken=typeof match.access_token==="string"&&match.access_token.length>20;
 return {
  verified:true,pageId:String(match.id),
  pageName:typeof match.name==="string"?match.name:null,
  pageUsername:typeof match.username==="string"?match.username:null,
  canCreateContent:canCreate&&hasPageToken,
  state:canCreate&&hasPageToken?"confirmed":"insufficient_tasks"
 };
}

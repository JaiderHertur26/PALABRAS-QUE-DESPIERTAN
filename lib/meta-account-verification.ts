import "server-only";
import {createDecipheriv} from "node:crypto";

const API="https://graph.facebook.com/v26.0";
export type MetaVaultRecord={
 version:1; at:string; appId:string;scopes:string[];
 expiresAt:number|null;verifiedAccount:boolean;iv:string;tag:string;encrypted:string;
 username?:string|null;accountId?:string|null;
 verificationState?:"confirmed"|"awaiting_account_permission"|"expired"|"meta_unavailable"|"unverified";
 lastVerificationAttemptAt?:string;lastVerifiedAt?:string|null;
};
export type AccountVerification={verified:boolean;username:string|null;accountId:string|null;
 state:NonNullable<MetaVaultRecord["verificationState"]>; expiresAt:number|null;tokenValid:boolean|null};

function decryptToken(record:MetaVaultRecord){
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
 const token=decryptToken(record);
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
 if(match)return {verified:true,username:match.username,accountId:match.id,state:"confirmed",expiresAt,tokenValid:true};
 return {verified:false,username:null,accountId:null,state:"awaiting_account_permission",expiresAt,tokenValid:true};
}

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const src=fs.readFileSync(path.resolve(import.meta.dirname,"../lib/editorial-meta-delivery.ts"),"utf8");
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const instagramId="17812345678901234";
const record={version:1,appId:"2572239026621118",expiresAt:null,
 verifiedAccount:true,accountId:instagramId,username:"palabrasquedespiertan",
 instagramAccountType:null,facebookPageVerified:false,
 scopes:["instagram_basic","instagram_content_publish"]};

async function statusFor(type){
 const module={exports:{}};
 const requireStub=id=>{
  if(id==="server-only")return {};
  if(id==="@supabase/supabase-js")return {createClient:()=>({
   storage:{from:()=>({download:async()=>({data:new Blob([JSON.stringify(record)]),error:null})})}
  })};
  if(id==="node:crypto")return {createHash:()=>{throw Error("No hash in read-only test")}};
  if(id==="@/lib/meta-account-verification")return {decryptMetaAccessToken:()=>"mock-token"};
  if(id==="@/lib/editorial-meta-drafts")return {channelNames:[],loadDraft:()=>null,mediaPath:()=>"",privateDraftStore:()=>null,validId:()=>true};
  throw Error("Unexpected import: "+id);
 };
 const calls=[];
 const fetchStub=async url=>{
  calls.push(String(url));
  if(String(url).includes(instagramId))
   return {ok:true,status:200,json:async()=>({id:instagramId,username:"palabrasquedespiertan",account_type:type})};
  throw Error("Unexpected Graph endpoint");
 };
 const env={...process.env,NEXT_PUBLIC_SUPABASE_URL:"https://lwuzkjvolxwkxdyafcjv.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_mock_not_real"};
 vm.runInNewContext(compiled,{module,exports:module.exports,require:requireStub,Buffer,process:{env},Date,
  Blob,URL,URLSearchParams,AbortSignal,fetch:fetchStub,setTimeout,clearTimeout});
 const output=await module.exports.storyAccountDiagnostic();
 return {output,calls};
}
test("Instagram Business con ID numérico se reconoce en lectura sin publicar",async()=>{
 const {output,calls}=await statusFor("BUSINESS");
 assert.equal(output.instagram.status,"confirmed");
 assert.equal(output.instagram.type,"BUSINESS");
 assert.equal(output.instagram.canPublishStories,true);
 assert.equal(calls.length,1);
});
test("Creator no habilita Stories mediante Facebook Login",async()=>{
 const {output}=await statusFor("CREATOR");
 assert.equal(output.instagram.type,"CREATOR");
 assert.equal(output.instagram.canPublishStories,false);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root=path.resolve(import.meta.dirname,"..");
const src=fs.readFileSync(path.join(root,"lib/editorial-meta-delivery.ts"),"utf8");
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const pageId="943474758856762";
const vault={version:1,appId:"2572239026621118",expiresAt:null,facebookPageVerified:true,facebookPageId:pageId,
 facebookPageName:"Palabras que despiertan",facebookCanCreateContent:true,scopes:["pages_show_list","pages_read_engagement","pages_manage_posts"]};
async function scenario(pageVerified){
 const module={exports:{}},calls=[];
 const record={...vault,facebookPageVerified:pageVerified};
 const requireStub=name=>{
  if(name==="server-only")return {};
  if(name==="@supabase/supabase-js")return {createClient:()=>({storage:{from:()=>({download:async()=>({data:new Blob([JSON.stringify(record)]),error:null})})}})};
  if(name==="node:crypto")return {createHash:()=>{throw Error("No hash expected")}};
  if(name==="@/lib/meta-account-verification")return {decryptMetaAccessToken:()=> "test-token-not-real"};
  if(name==="@/lib/editorial-meta-drafts")return {channelNames:[],loadDraft:()=>null,mediaPath:()=>"",privateDraftStore:()=>null,validId:()=>true};
  throw Error("Unknown dependency: "+name);
 };
 const fetchStub=async (url,opts)=>{
  calls.push({url:String(url),method:opts?.method||"GET"});
  const path=new URL(url).pathname;
  let body;
  if(path==="/v26.0/me/accounts")body={data:[{id:pageId,name:"Palabras que despiertan",access_token:"page-access-token-of-sufficient-length",tasks:["CREATE_CONTENT"]}]};
  else if(path==="/v26.0/"+pageId+"/scheduled_posts")body={data:[{id:"9434_123",message:"PD-002 · Confianza verdadera",scheduled_publish_time:1794960000}],paging:{}};
  else throw Error("Unrecognized endpoint "+path);
  return {ok:true,status:200,json:async()=>body};
 };
 vm.runInNewContext(compiled,{module,exports:module.exports,require:requireStub,Buffer,process:{env:{NEXT_PUBLIC_SUPABASE_URL:"https://lwuzkjvolxwkxdyafcjv.supabase.co",SUPABASE_SECRET_KEY:"sb_secret_mock_fake"}},Date,
  Blob,URL,URLSearchParams,AbortSignal,fetch:fetchStub,setTimeout,clearTimeout});
 return {snapshot:await module.exports.readFacebookScheduledSnapshot(),calls};
}
test("La consulta oficial recupera sólo el calendario, sin crear publicaciones",async()=>{
 const {snapshot,calls}=await scenario(true);
 assert.equal(snapshot.status,"ok");
 assert.equal(snapshot.posts.length,1);
 assert.equal(snapshot.posts[0].code,"PD-002");
 assert.equal(snapshot.posts[0].id,"9434_123");
 assert.ok(snapshot.posts[0].scheduledAt?.endsWith("Z"));
 assert.ok(calls.every(x=>x.method==="GET"));
 assert.ok(calls.some(x=>x.url.includes("/scheduled_posts")));
});
test("Si Meta no confirma la página se informa indisponibilidad, nunca lista vacía verificada",async()=>{
 const {snapshot,calls}=await scenario(false);
 assert.equal(snapshot.status,"unavailable");
 assert.equal(snapshot.reason,"FACEBOOK_PAGE_NOT_VERIFIED");
 assert.equal(snapshot.posts.length,0);
 assert.equal(calls.length,0);
});
test("Ruta de conciliación exige autenticación editorial y no publica",()=>{
 const route=fs.readFileSync(path.join(root,"app/api/editorial/meta/publish/route.ts"),"utf8");
 assert.match(route,/authorizedDraftRequest\(request\)/);
 assert.match(route,/searchParams.get\("scheduled"\)==="1"/);
 assert.match(route,/readFacebookScheduledSnapshot\(\)/);
 assert.match(route,/id!=="8077d038-98eb-4729-abe5-425a26267460"/);
 assert.doesNotMatch(src,/scheduled_posts.*postGraph/);
});

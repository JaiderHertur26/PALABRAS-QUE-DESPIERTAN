import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import {createHash} from "node:crypto";

const root=path.resolve(import.meta.dirname,"..");
const source=fs.readFileSync(path.join(root,"lib/editorial-auto-publish.ts"),"utf8");
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
function mocked(name){
 if(name==="server-only")return {};
 if(name==="@supabase/supabase-js")return {createClient:()=>{throw Error("No DB access during tests")}};
 if(name==="node:crypto")return {createHash};
 if(name==="sharp")return {default:()=>{throw Error("No image generation during eligibility tests")}};
 if(name==="@/lib/editorial-meta-delivery")return {credential:()=>{},getGraph:()=>{},postGraph:()=>{},pageToken:()=>{},instagramIdentity:()=>{},DeliveryError:class extends Error{}};
 throw Error("Unexpected import "+name);
}
vm.runInNewContext(output,{module,exports:module.exports,require:mocked,Date,Buffer,URL,Blob,fetch:()=>{throw Error("No network")},
 process:{env:{}},setTimeout,clearTimeout,FormData,console});
const {isAutoEligible,dueChannels,autoDispatch,externalStoryDue,validStoryPlan,feedContentMatches}=module.exports;
const T=Date.parse("2026-11-17T00:00:00.000Z");
function item(){
 return {code:"PD-014",kind:"mensaje",title:"Palabra aprobada",body:"Texto original autorizado",summary:"Texto aprobado",approved_by_author:true,
  state:"scheduled",scheduled_at:new Date(T-300000).toISOString(),social_scheduled_at:null,
  social_state:"META PENDIENTE; NO PROGRAMADO EN REDES",cover_url:"/mensajes/pd-014.png",
  canonical_url:"https://www.palabrasquedespiertan.online/mensajes/pd-014",bible_reference:"Mateo 14,28",updated_at:"2026-11-14"};
}
test("Respeta la aprobación, URL y estado de fuente y conserva los cinco minutos",()=>{
 const x=item();
 assert.equal(isAutoEligible(x,T),true);
 assert.deepEqual(Array.from(dueChannels(x,T)),["facebook_feed","instagram_feed"]);
 assert.deepEqual(Array.from(dueChannels(x,T+900000)),["facebook_feed","instagram_feed","facebook_story","instagram_story"]);
 assert.equal(dueChannels(x,T-1000).length,0);
});
test("No duplica publicaciones que ya figuran programadas en Meta Business Suite",()=>{
 const x=item();x.social_scheduled_at=new Date(T).toISOString();
 x.social_state="PROGRAMADO EN META (FACEBOOK + INSTAGRAM); AUN NO PUBLICADO";
 assert.equal(isAutoEligible(x,T),false);
 assert.equal(dueChannels(x,T+900000).length,0);
});
test("Bloquea textos sin aprobación, ya publicados, rutas no oficiales y fuera de horario",()=>{
 for(const patch of [
  {approved_by_author:false},{state:"pending"},{state:"published"},
  {cover_url:"https://attacker.example/image.png"},{cover_url:"/mensajes/../private.png"},
  {canonical_url:"https://attacker.example/mensajes/falso"},
  {social_state:"PROGRAMADO EN META"},{social_state:"published"},
 ])assert.equal(isAutoEligible({...item(),...patch},T),false,JSON.stringify(patch));
 assert.equal(dueChannels(item(),T+3600_000).length,0);
});
test("Desactivación global impide consultar datos o enviar a Meta",async()=>{
 const result=await autoDispatch(T);
 assert.equal(result.enabled,false);
 assert.equal(result.results.length,0);
});
test("Ruta cron solo acepta la clave privada y la programación tiene destino único",()=>{
 const route=fs.readFileSync(path.join(root,"app/api/cron/pqd-auto/route.ts"),"utf8");
 const config=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
 assert.match(route,/secret\.length<32/);
 assert.match(route,/authorization/);
 assert.match(route,/autoDispatch\(\)/);
 assert.match(source,/upsert:false/);
 assert.match(source,/already_reserved/);
 assert.match(source,/needs_review/);
 assert.match(source,/readyWebsite\(i\)/);
 assert.match(source,/scheduled_at/);
 assert.equal(config.schedules["pqd-meta-editorial-15m"].schedule,"*/15 * * * *");
 assert.equal(config.schedules["pqd-meta-editorial-15m"].timezone,"America/Bogota");
 assert.equal(config.schedules["pqd-meta-editorial-15m"].path,"/api/cron/pqd-auto");
 assert.equal(config.schedules["pqd-meta-editorial-15m"].requestMethod,"GET");
});

test("Las historias de feeds ya programados se activan independientemente quince minutos después",()=>{
 const x=item();x.code="PD-002";x.social_scheduled_at=new Date(T).toISOString();
 x.social_state="PROGRAMADO EN META (FACEBOOK + INSTAGRAM); AUN NO PUBLICADO";
 assert.equal(isAutoEligible(x,T+900000),false);
 assert.equal(externalStoryDue(x,T+899999),false);
 assert.equal(externalStoryDue(x,T+900000),true);
 assert.equal(externalStoryDue(x,T+91*60000+900000),false);
 const plan={version:1,code:x.code,source:"external_feed",status:"scheduled",
  webAt:x.scheduled_at,feedAt:new Date(T).toISOString(),storyAt:new Date(T+900000).toISOString(),
  coverUrl:x.cover_url,createdAt:"2026-11-14T12:00:00.000Z",
  channels:{facebook_story:true,instagram_story:true}};
 assert.equal(validStoryPlan(x,plan),true);
 assert.equal(validStoryPlan({...x,cover_url:"/mensajes/otra.png"},plan),false);
 assert.equal(validStoryPlan(x,{...plan,storyAt:new Date(T+360000).toISOString()}),false);
});
test("El feed externo solo se confirma por código o enlace exacto, nunca por hora o título genérico",()=>{
 const x=item();x.code="PD-002";
 assert.equal(feedContentMatches("PD-002 · La puerta que se abre",x),true);
 assert.equal(feedContentMatches("Visita "+x.canonical_url,x),true);
 assert.equal(feedContentMatches("PD-003 · La puerta que se abre",x),false);
 assert.equal(feedContentMatches("Mensaje de las siete de la noche",x),false);
});
test("Historias preprogramadas no modifican feeds externos ni crean publicaciones duplicadas",()=>{
 assert.match(source,/externalStoryDue\(i,now\)/);
 assert.match(source,/validStoryPlan\(i,plan\)/);
 assert.match(source,/externalFeedConfirmed\(i,ch\)/);
 assert.match(source,/external_feed_unconfirmed/);
 assert.match(source,/story_plan_missing/);
 assert.match(source,/\?\(\["facebook_story","instagram_story"\] as Channel\[\]\)/);
 assert.match(source,/upsert:false/);
});

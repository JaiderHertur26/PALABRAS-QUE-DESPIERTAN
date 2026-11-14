import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
import vm from "node:vm";
import ts from "typescript";

const here=dirname(fileURLToPath(import.meta.url));
const src=readFileSync(resolve(here,"../lib/editorial-meta-drafts.ts"),"utf8");
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
const requireStub=id=>{
 if(id==="server-only"||id==="next/server")return {};
 if(id==="@supabase/supabase-js")return {createClient:()=>{throw Error("No se debe acceder a la red")}};
 if(id==="node:crypto")return {timingSafeEqual:(a,b)=>a.equals(b)};
 throw Error("Importación inesperada: "+id);
};
vm.runInNewContext(compiled,{module,exports:module.exports,require:requireStub,Buffer,process,Date,Error,Set,Number,String,Array,Object,RegExp});
const {validatedFields}=module.exports;
const id="8077d038-98eb-4729-abe5-425a26267460";
const now="2026-11-14T17:00:00.000Z";
const feed={slot:"feed",mime:"image/jpeg",width:1254,height:1254,size:140000,sha256:"a".repeat(64),uploadedAt:now};
const story={slot:"story",mime:"image/jpeg",width:1080,height:1920,size:180000,sha256:"b".repeat(64),uploadedAt:now};
function make(){
 const c=(enabled,copy="")=>({enabled,copy,mode:"manual",scheduledAt:null});
 return {version:1,id,title:"Presentación institucional — TEST-001",reference:"TEST-001",
  contentApproved:true,approvalAt:now,storyApproved:false,storyApprovalAt:null,
  createdAt:now,updatedAt:now,
  media:{feed,story},
  channels:{facebook_feed:c(true,"Texto aprobado Facebook"),instagram_feed:c(true,"Texto aprobado Instagram"),
   facebook_story:c(false),instagram_story:c(false)}};
}
test("Activar la historia no revoca los feeds aprobados",()=>{
 const old=make();const next=structuredClone(old);
 next.channels.facebook_story.enabled=true;
 next.channels.instagram_story.enabled=true;
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,true);
 assert.equal(result.approvalAt,now);
 assert.equal(result.storyApproved,false);
 assert.equal(result.storyApprovalAt,null);
});
test("Aprobación específica de historias con material vertical guardado",()=>{
 const old=make();old.channels.facebook_story.enabled=true;
 const next=structuredClone(old);next.storyApproved=true;
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,true);
 assert.equal(result.storyApproved,true);
 assert.ok(result.storyApprovalAt);
});
test("Cambiar la historia revoca solo su aprobación",()=>{
 const old=make();old.channels.facebook_story.enabled=true;
 old.storyApproved=true;old.storyApprovalAt=now;
 const next=structuredClone(old);next.channels.facebook_story.copy="Otra leyenda editorial";
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,true);
 assert.equal(result.approvalAt,now);
 assert.equal(result.storyApproved,false);
 assert.equal(result.storyApprovalAt,null);
});
test("Cambiar el feed revoca solo su aprobación",()=>{
 const old=make();old.channels.facebook_story.enabled=true;old.storyApproved=true;old.storyApprovalAt=now;
 const next=structuredClone(old);next.channels.facebook_feed.copy="Otro mensaje no aprobado";
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,false);
 assert.equal(result.approvalAt,null);
 assert.equal(result.storyApproved,true);
 assert.equal(result.storyApprovalAt,now);
});
test("El cambio de identidad revoca ambas aprobaciones",()=>{
 const old=make();old.channels.facebook_story.enabled=true;old.storyApproved=true;old.storyApprovalAt=now;
 const next=structuredClone(old);next.title="Nueva presentación";
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,false);
 assert.equal(result.storyApproved,false);
});
test("No se autoriza una historia sin imagen guardada",()=>{
 const old=make();old.media.story=null;old.channels.instagram_story.enabled=true;
 const next=structuredClone(old);next.storyApproved=true;
 assert.throws(()=>validatedFields(next,old),/imagen vertical/);
});
test("Los borradores antiguos siguen legibles sin aprobación de historia",()=>{
 const old=make();delete old.storyApproved;delete old.storyApprovalAt;
 const result=validatedFields(structuredClone(old),old);
 assert.equal(result.contentApproved,true);
 assert.equal(result.storyApproved,false);
});

test("La dirección puede confirmar que Instagram es Business sin modificar feeds ni historias aprobadas",()=>{
 const old=make();old.channels.instagram_story.enabled=true;old.storyApproved=true;old.storyApprovalAt=now;
 const next=structuredClone(old);next.instagramBusinessConfirmed=true;
 const result=validatedFields(next,old);
 assert.equal(result.contentApproved,true);
 assert.equal(result.approvalAt,now);
 assert.equal(result.storyApproved,true);
 assert.equal(result.storyApprovalAt,now);
 assert.equal(result.instagramBusinessConfirmed,true);
 assert.ok(result.instagramBusinessConfirmedAt);
});
test("La declaración Business no se acepta sin una historia de Instagram aprobada",()=>{
 const old=make();const next=structuredClone(old);next.instagramBusinessConfirmed=true;
 assert.throws(()=>validatedFields(next,old),/confirmación Business/);
});
test("Al cambiar identidad o historia se rechaza una declaración Business desactualizada",()=>{
 const old=make();old.channels.instagram_story.enabled=true;old.storyApproved=true;old.storyApprovalAt=now;
 old.instagramBusinessConfirmed=true;old.instagramBusinessConfirmedAt=now;
 const next=structuredClone(old);next.channels.instagram_story.copy="Otro contenido";
 assert.throws(()=>validatedFields(next,old),/confirmación Business/);
});

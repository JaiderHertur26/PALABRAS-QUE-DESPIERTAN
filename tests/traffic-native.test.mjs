import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script=fs.readFileSync(new URL("../public/visit-analytics.js",import.meta.url),"utf8");
test("Analítica ligera contabiliza páginas sin duplicar vistas ni guardar identidad",()=>{
 const timers=new Map();
 const listeners=new Map();
 const calls=[];
 let nextTimer=0;
 let observerCallback=()=>{};
 const location={pathname:"/"};
 const document={
  head:{},visibilityState:"visible",
  addEventListener:(name,fn)=>listeners.set("document:"+name,fn)
 };
 class MutationObserver{
  constructor(callback){observerCallback=callback}
  observe(){}
 }
 const window={
  location,MutationObserver,navigation:{addEventListener:(name,fn)=>listeners.set("nav:"+name,fn)},
  addEventListener:(name,fn)=>listeners.set("window:"+name,fn),
  setTimeout:(fn)=>{const id=++nextTimer;timers.set(id,fn);return id},
  clearTimeout:(id)=>timers.delete(id)
 };
 vm.runInNewContext(script,{
  window,document,MutationObserver,
  fetch:(url,options)=>{calls.push({url,options});return Promise.resolve({ok:true})},
  JSON
 });
 function runTimers(){
  const current=[...timers.values()];timers.clear();
  for(const callback of current)callback();
 }
 assert.equal(timers.size,1);
 runTimers();
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,"/api/visitas");
 assert.deepEqual(JSON.parse(calls[0].options.body),{path:"/"});
 assert.equal(calls[0].options.credentials,"omit");
 assert.equal(calls[0].options.keepalive,true);
 observerCallback();runTimers();
 assert.equal(calls.length,1,"no se duplica la vista al actualizar el título");
 location.pathname="/articulos";
 listeners.get("nav:navigatesuccess")();
 observerCallback();
 runTimers();
 assert.equal(calls.length,2);
 assert.deepEqual(JSON.parse(calls[1].options.body),{path:"/articulos"});
 document.visibilityState="hidden";
 location.pathname="/mensajes";
 listeners.get("window:popstate")();
 runTimers();
 assert.equal(calls.length,2,"no registra visitas de pestañas ocultas");
 document.visibilityState="visible";
 listeners.get("document:visibilitychange")();
 runTimers();
 assert.equal(calls.length,3);
 assert.deepEqual(JSON.parse(calls[2].options.body),{path:"/mensajes"});
 assert.equal(timers.size,0);
});

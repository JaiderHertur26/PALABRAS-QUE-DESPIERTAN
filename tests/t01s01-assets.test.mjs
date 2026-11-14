import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const titles=["no-le-faltaba-nada","antes-del-primer-merito","la-gloria-no-pide-aplausos",
 "la-dependencia-que-libera","dios-no-solto-su-obra","la-dignidad-no-se-compra",
 "el-jardin-no-era-un-botin","el-regalo-que-no-ves","el-don-no-anula-el-deber",
 "la-pregunta-que-cambia-todo"];
function dimensions(filename){
 const b=fs.readFileSync(filename);
 assert.equal(b.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),size:b.length};
}
test("T01-S01 tiene sus 10 portadas y 10 historias oficiales en rutas web públicas",()=>{
 for(let i=0;i<10;i++){
  const code="pd-"+String(i+41).padStart(3,"0");
  const card=dimensions(path.join(root,"public","mensajes",code+"-"+titles[i]+".png"));
  const story=dimensions(path.join(root,"public","mensajes","historias",code+".png"));
  assert.deepEqual([card.width,card.height],[1254,1254]);
  assert.deepEqual([story.width,story.height],[1080,1920]);
  assert.ok(card.size>100_000&&story.size>100_000);
 }
});
test("La Temporada 01 y la serie Creados por amor existen en el catálogo del sitio",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
 const season=data.temporadas.find(x=>x.id==="T01");
 assert.ok(season);
 assert.ok(season.series.some(x=>x.id==="T01-S01"&&x.titulo==="Creados por amor"));
});

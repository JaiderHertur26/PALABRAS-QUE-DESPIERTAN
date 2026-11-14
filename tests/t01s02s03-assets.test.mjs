import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const titles=[
 "no-inventaste-tu-imagen","la-herida-no-borro-el-rostro","parecerse-a-quien","no-eres-el-original",
 "la-imagen-en-quien-no-te-gusta","ninguna-imagen-de-segunda","un-parecido-que-crece","libres-para-decir-que-no",
 "el-modelo-no-esta-en-el-espejo","el-parecido-de-cada-dia",
 "el-mundo-no-empezo-sin-el","el-destino-escondido-en-el-origen","el-centro-no-eres-tu","dar-sin-empobrecerse",
 "el-creador-en-un-pesebre","el-mundo-no-lo-reconocio","el-no-esta-en-la-lista","el-amor-no-empezo-en-la-cruz",
 "la-salvacion-no-es-solo-volver","tu-origen-tiene-destino"
];
function png(fp){
 const b=fs.readFileSync(fp);
 assert.equal(b.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 return [b.readUInt32BE(16),b.readUInt32BE(20),b.length];
}
test("T01-S02 y T01-S03 incluyen 20 portadas y 20 historias originales con dimensiones correctas",()=>{
 for(let i=0;i<20;i++){
  const code="pd-"+String(51+i).padStart(3,"0");
  const card=png(path.join(root,"public","mensajes",code+"-"+titles[i]+".png"));
  const story=png(path.join(root,"public","mensajes","historias",code+".png"));
  assert.deepEqual(card.slice(0,2),[1254,1254]);assert.deepEqual(story.slice(0,2),[1080,1920]);
  assert.ok(card[2]>100000&&story[2]>100000);
 }
});
test("Los nombres T01-S02/T01-S03 están reconocidos en la estructura maestra de la revista",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
 const season=data.temporadas.find(x=>x.id==="T01");
 assert.ok(season);
 for(const code of ["T01-S02","T01-S03"])assert.ok(season.series.some(x=>x.id===code));
});
test("El publicador de historias reconoce hasta PD-070 y utiliza la imagen vertical oficial",()=>{
 const src=fs.readFileSync(path.join(root,"lib","editorial-auto-publish.ts"),"utf8");
 assert.ok(src.includes("|70)$"));
 assert.ok(src.includes("SITE+\"/mensajes/historias/\"+i.code.toLowerCase()"));
});

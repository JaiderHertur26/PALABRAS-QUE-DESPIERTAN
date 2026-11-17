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
test("T01-S02 y T01-S03: veinte portadas e historias futuras quedan en Storage privado",()=>{
 const cover=fs.readFileSync(path.join(root,"app/api/mensajes/portada/[filename]/route.ts"),"utf8");
 const story=fs.readFileSync(path.join(root,"app/api/mensajes/historia/[code]/route.ts"),"utf8");
 assert.match(cover,/pqd-article-covers-private-v1/);
 assert.match(story,/pqd-article-covers-private-v1/);
 for(let i=0;i<20;i++){
  const code="pd-"+String(51+i).padStart(3,"0");
  assert.equal(fs.existsSync(path.join(root,"public","mensajes",code+"-"+titles[i]+".png")),false);
  assert.equal(fs.existsSync(path.join(root,"public","mensajes","historias",code+".png")),false);
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
 assert.ok(src.includes("[5-9]") && src.includes("|100)$"));
 assert.ok(src.includes('SITE+"/mensajes/historias/"+i.code.toLowerCase()'));
});
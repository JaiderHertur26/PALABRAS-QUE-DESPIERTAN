import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const titles=["no-le-faltaba-nada","antes-del-primer-merito","la-gloria-no-pide-aplausos","la-dependencia-que-libera","dios-no-solto-su-obra","la-dignidad-no-se-compra","el-jardin-no-era-un-botin","el-regalo-que-no-ves","el-don-no-anula-el-deber","la-pregunta-que-cambia-todo"];

test("T01-S01: diez portadas y diez historias quedan fuera de public hasta su publicación",()=>{
 const handler=fs.readFileSync(path.join(root,"app/api/mensajes/portada/[filename]/route.ts"),"utf8");
 const storyHandler=fs.readFileSync(path.join(root,"app/api/mensajes/historia/[code]/route.ts"),"utf8");
 assert.match(handler,/approved_by_author/);assert.match(storyHandler,/scheduled_at/);
 for(let i=0;i<10;i++){
  const code="pd-"+String(i+41).padStart(3,"0");
  assert.equal(fs.existsSync(path.join(root,"public","mensajes",code+"-"+titles[i]+".png")),false);
  assert.equal(fs.existsSync(path.join(root,"public","mensajes","historias",code+".png")),false);
 }
});
test("La Temporada 01 y la serie Creados por amor existen en el catálogo del sitio",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,"data/site-content.json"),"utf8"));
 const season=data.temporadas.find(x=>x.id==="T01");
 assert.ok(season);
 assert.ok(season.series.some(x=>x.id==="T01-S01"&&x.titulo==="Creados por amor"));
});
test("Los mensajes nuevos muestran su fecha editorial programada, nunca la fecha actual del servidor",()=>{
 const content=fs.readFileSync(path.join(root,"lib/editorial-live.ts"),"utf8");
 assert.match(content,/fecha:row\.published_at\?\.slice\(0,10\)\|\|row\.scheduled_at\?\.slice\(0,10\)/);
});
test("Las imágenes de historias futuras están protegidas igual que las tarjetas cuadradas",()=>{
 const proxy=fs.readFileSync(path.join(root,"proxy.ts"),"utf8");
 assert.match(proxy,/const plannedStory=/);
 assert.match(proxy,/if\(planned\|\|plannedStory\|\|articleCover\)/);
 assert.match(proxy,/eligible=eligible\.eq\("code",plannedStory\[1\]\.toUpperCase\(\)\)/);
 assert.match(proxy,/request\.nextUrl\.pathname==="\/_next\/image"/);
 assert.match(proxy,/return NextResponse\.json\(\{error:"Imagen no disponible"\},\{status:404/);
});
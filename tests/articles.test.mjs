import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"data","public-articles.json"),"utf8"));
const allow=JSON.parse(fs.readFileSync(path.join(root,"data","article-publication-allowlist.json"),"utf8"));
const ids=new Set(allow.articulos.filter(x=>x.autorizaWeb===true).map(x=>x.id));

test("revista contiene las 12 investigaciones aprobadas",()=>{
 assert.equal(data.version,2);
 assert.equal(data.articulos.length,12);
 assert.deepEqual(data.articulos.map(x=>x.id),Array.from({length:12},(_,i)=>"ART-"+String(i+1).padStart(3,"0")));
 assert.equal(new Set(data.articulos.map(x=>x.slug)).size,12);
 for(const a of data.articulos){
  assert.ok(ids.has(a.id));
  assert.equal(a.autor,"P. Jaider Herrera Turizo");
  assert.equal(a.estado,"PUBLICADO EN REVISTA PROPIA");
  assert.match(a.integridad,/^[a-f0-9]{64}$/);
 }
});
test("contenido completo y referencias por artículo; ninguna ficha privada",()=>{
 for(const a of data.articulos){
  assert.ok(a.contenido.length>3500,a.id);
  assert.ok(a.resumen.length>120,a.id);
  assert.match(a.contenido,/^#{2,4} (?:Referencias|Bibliograf)/m,a.id);
  assert.doesNotMatch(a.contenido,/[A-Z]:\\|CONTROL DE FUENTES|RESPALDOS EDITORIALES/i,a.id);
  assert.ok(a.palabras>=500,a.id);
 }
});
test("el estudio de oración y su base bíblica quedan visibles",()=>{
 const prayer=data.articulos.find(a=>a.id==="ART-010");
 assert.ok(prayer);
 assert.match(prayer.titulo,/Orar no para informar/);
 assert.match(prayer.contenido,/Mateo 6,8/);
 assert.match(prayer.contenido,/Santo Tomás|santo Tomás/);
 assert.match(prayer.contenido,/## Conclusión/);
});
test("documentos del sitio incluyen rutas públicas y exclusión de rutas privadas en indexación",()=>{
 const robots=fs.readFileSync(path.join(root,"app","robots.ts"),"utf8");
 assert.match(robots,/\/api\//);
 assert.match(robots,/\/moderacion\//);
 const layout=fs.readFileSync(path.join(root,"app","layout.tsx"),"utf8");
 assert.match(layout,/index:true/);
});

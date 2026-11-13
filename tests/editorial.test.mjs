import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const datos=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
const permisos=JSON.parse(fs.readFileSync(path.join(root,"data","publication-allowlist.json"),"utf8"));

test("12 temporadas y 36 series reales, sin duplicados",()=>{
 assert.equal(datos.temporadas.length,12);
 const ids=datos.temporadas.flatMap(t=>t.series.map(s=>s.id));
 assert.equal(ids.length,36);
 assert.equal(new Set(ids).size,36);
 assert.equal(datos.temporadas.find(t=>t.id==="T07")?.titulo,"APRENDER A CONFIAR");
});
test("solo mensajes autorizados aparecen en el catálogo público",()=>{
 const ids=new Set(permisos.publicaciones.filter(x=>x.autorizaWeb).map(x=>x.id));
 assert.ok(datos.mensajes.length>0);
 for(const m of datos.mensajes){
  assert.ok(ids.has(m.id));
  assert.match(m.id,/^PD-\d{3}$/);
  assert.ok(m.texto.length>15);
  assert.match(m.imagen,/^\/mensajes\/pd-\d{3}\.png$/);
 }
});
test("ningún artículo manuscrito está publicado",()=>{
 assert.deepEqual(datos.articulos,[]);
});
test("el primer mensaje auténtico y su fundamento siguen públicos",()=>{
 const uno=datos.mensajes.find(x=>x.id==="PD-001");
 assert.ok(uno);
 assert.equal(uno.titulo,"Dios ya lo sabe");
 assert.equal(uno.referencia,"Mateo 6,8");
 assert.equal(uno.serie,"T07-S01");
});
test("cantidades publicadas concuerdan con los mensajes",()=>{
 for(const t of datos.temporadas){
  assert.equal(t.publicaciones,datos.mensajes.filter(m=>m.temporada===t.id).length);
  for(const s of t.series)assert.equal(s.publicaciones,datos.mensajes.filter(m=>m.serie===s.id).length);
 }
});
test("el repositorio no contiene las rutas privadas ni secretos de Vercel",()=>{
 const tracked=fs.readFileSync(path.join(root,".gitignore"),"utf8");
 for(const patron of [".env",".vercel","/Maqueta Técnica/","/00_DOCUMENTO_MAESTRO"]) assert.ok(tracked.includes(patron),patron);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Todas las listas públicas usan visibilidad dinámica de Supabase",()=>{
 for(const p of ["app/page.tsx","app/revista/page.tsx","app/articulos/page.tsx","app/testimonios/page.tsx","app/mensajes/page.tsx","app/sitemap.ts"]){
  assert.match(read(p),/public(Articulos|Mensajes|Temas)|buscarPublicos/,p);
  assert.match(read(p),/force-dynamic/,p);
 }
});
test("Las rutas individuales dan 404 a una obra oculta",()=>{
 for(const p of ["app/articulos/[slug]/page.tsx","app/testimonios/[slug]/page.tsx","app/mensajes/[slug]/page.tsx"]){
  assert.match(read(p),/notFound\(\)/,p);
  assert.match(read(p),/force-dynamic/,p);
  assert.match(read(p),/public(Articulos|Temas|Mensajes)/,p);
 }
});
test("Los comentarios no aceptan hilos invisibles",()=>{
 const api=read("app/api/comunidad/comentarios/route.ts");
 assert.match(api,/await destinoLive\(/);
 assert.match(read("lib/editorial-live.ts"),/state==="published"/);
 assert.match(read("lib/editorial-live.ts"),/scheduled_at/);
 assert.match(read("lib/editorial-live.ts"),/server-only/);
});

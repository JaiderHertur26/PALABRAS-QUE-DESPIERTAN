import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Inicio nunca promociona temporadas ni series sin mensajes publicados",()=>{
 const home=read("app/page.tsx");
 assert.match(home,/temporadas\.filter\(t=>mensajes\.some\(m=>m\.temporada===t\.id\)\)/);
 assert.match(home,/\.filter\(s=>mensajes\.some\(m=>m\.serie===s\.id\)\)/);
 assert.doesNotMatch(home,/Sin publicaciones aún|Planificada/);
});
test("Bibliotecas de temporadas y series filtran el plan privado",()=>{
 const seasons=read("app/temporadas/page.tsx");
 const series=read("app/series/page.tsx");
 assert.match(seasons,/visibles=temporadas\.filter/);
 assert.match(series,/visibles=temporadas\.filter/);
 assert.match(seasons,/t\.series\.filter/);
 assert.match(series,/t\.series\.filter/);
});
test("Una temporada o serie sin publicaciones responde 404",()=>{
 assert.match(read("app/temporadas/[id]/page.tsx"),/if\(publicados\.length===0\)notFound\(\)/);
 assert.match(read("app/series/[id]/page.tsx"),/if\(disponibles\.length===0\)notFound\(\)/);
});
test("Imágenes originales futuras requieren elegibilidad pública, incluso optimizadas",()=>{
 const guard=read("proxy.ts");
 assert.match(guard,/editorial_items/);
 assert.match(guard,/\/_next\/image/);
 assert.match(guard,/if\(error\|\|!data\)return NextResponse\.json/);
 assert.match(read("lib/editorial-live.ts"),/scheduled_at/);
 assert.match(read(".vercelignore"),/!proxy\.ts/);
});
test("Los 20 gráficos se copiaron intactos desde sus originales",(t)=>{
 if(!fs.existsSync(path.join(root,"data/graphic-integrity.json"))){
  t.skip("Los originales futuros permanecen fuera del repositorio público; se verifican en la máquina editorial.");
  return;
 }
 const manifest=JSON.parse(read("data/graphic-integrity.json"));
 assert.equal(manifest.items.length,20);
 for(const item of manifest.items){
  const hash=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,item.file))).digest("hex");
  assert.equal(hash,item.sha256,item.code);
 }
});
test("Los estilos de móvil corrigen la sobrescritura del pie de página",()=>{
 const css=read("app/magazine-community.css");
 assert.match(css,/@media \(max-width:700px\)\{[\s\S]*?footer-content\{grid-template-columns:minmax\(0,1fr\)/);
});

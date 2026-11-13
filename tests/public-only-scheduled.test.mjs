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
 assert.match(guard,/if\(error\|\|!data\|\|!isVisible\)return NextResponse\.json/);
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

test("Las doce tarjetas de los artículos conservan el archivo original sin modificaciones",(t)=>{
 const file=path.join(root,"data/article-graphic-integrity.json");
 if(!fs.existsSync(file)){t.skip("Los archivos privados se comprueban en el equipo editorial, no en GitHub");return;}
 const data=JSON.parse(fs.readFileSync(file,"utf8").replace(/^\uFEFF/,""));
 assert.equal(data.items.length,12);
 for(let i=0;i<12;i++){
  const item=data.items[i];
  assert.equal(item.code,"ART-"+String(i+1).padStart(3,"0"));
  assert.ok(fs.existsSync(path.join(root,item.file)));
  const sha=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,item.file))).digest("hex");
  assert.equal(sha,item.sha256,item.code+" debe mantener su arte original");
 }
});
test("Portadas originales de artículos: biblioteca, ficha, SEO y privacidad según programación",()=>{
 const library=read("app/articulos/page.tsx");
 const article=read("app/articulos/[slug]/page.tsx");
 const guard=read("proxy.ts");
 assert.match(library,/research-card-cover/);
 assert.match(article,/research-article-cover/);
 assert.match(article,/a\.imagen\?\{url:a\.imagen,width:1254,height:1254/);
 assert.match(guard,/articleCover/);
 assert.match(guard,/\.eq\("cover_url",assetPath\)/);
 assert.match(guard,/\.eq\("code","ART-"\+articleCover\[1\]\)/);
 assert.match(guard,/process\.env\.SUPABASE_SECRET_KEY/);
 assert.match(guard,/data\?\.state==="scheduled"/);
 assert.match(guard,/Date\.now\(\)/);
 assert.match(guard,/"\/articulos\/:path\*"/);
 assert.match(read(".gitignore"),/\/public\/articulos\/art-/);
});

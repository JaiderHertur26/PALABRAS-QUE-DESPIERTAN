import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=(f)=>fs.readFileSync(path.join(root,f),"utf8");

test("Los estilos de investigación se cargan sólo en la ruta de artículos",()=>{
 const globalLayout=read("app/layout.tsx");
 const articleLayout=read("app/articulos/layout.tsx");
 assert.doesNotMatch(globalLayout,/import "\.\/research\.css"/);
 assert.match(articleLayout,/import "\.\.\/research\.css"/);
 assert.match(read("app/research.css"),/\.research-library/);
});
test("El contenido móvil inferior se difiere sin ocultarlo al usuario",()=>{
 const css=read("app/editorial-improvements.css");
 assert.match(css,/\.home-latest,\.discover\{content-visibility:auto\}/);
 assert.match(css,/contain-intrinsic-size:auto 440px/);
 assert.match(css,/contain-intrinsic-size:auto 960px/);
 assert.doesNotMatch(css,/content-visibility:hidden/);
});

test("Los estilos de la comunidad no viajan en la portada ni se pierden en los formularios",()=>{
 const home=read("app/magazine-community.css");
 const discussions=read("app/community-interactions.css");
 assert.doesNotMatch(home,/\.discussion-shell\{/);
 assert.doesNotMatch(home,/\.moderation-toolbar\{/);
 assert.match(discussions,/\.discussion-shell\{/);
 assert.match(discussions,/\.moderation-toolbar\{/);
 for(const file of ["components/community/AuthPanel.tsx","components/community/Discussion.tsx","components/community/ModerationConsole.tsx"]){
  assert.match(read(file),/import "@\/app\/community-interactions\.css"/);
 }
 assert.ok(Buffer.byteLength(home)<16000);
 assert.ok(Buffer.byteLength(discussions)>4000);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Las portadas tienen respaldo persistente en Storage privado en despliegues desde GitHub",()=>{
 const next=read("next.config.ts");
 const route=read("app/api/articulos/portada/[filename]/route.ts");
 assert.match(next,/articulos\/art-:id/);
 assert.match(next,/\/api\/articulos\/portada\/art-:id/);
 assert.match(route,/pqd-article-covers-private-v1/);
 assert.match(route,/\.eq\("kind","articulo"\)/);
 assert.match(route,/\.eq\("cover_url",coverUrl\)/);
 assert.match(route,/article\?\.state==="published"/);
 assert.match(route,/article\?\.state==="scheduled"/);
 assert.match(route,/scheduled_at/);
 assert.match(route,/Date\.now\(\)/);
 assert.match(route,/\.storage\.from\(bucket\)\.download/);
 assert.match(route,/private, no-store/);
 assert.doesNotMatch(route,/getPublicUrl|createSignedUrl/);
});

test("No se trasladan las catorce portadas futuras al repositorio público",()=>{
 const ignore=read(".gitignore");
 assert.match(ignore,/\/public\/articulos\/art-\[0-9\]/);
});

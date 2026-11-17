import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

test("Tarjetas de mensajes se entregan desde Storage privado y solo desde la fecha",()=>{
 const code=read("app/api/mensajes/portada/[filename]/route.ts");
 assert.match(code,/pqd-article-covers-private-v1/);
 assert.match(code,/approved_by_author/);
 assert.match(code,/scheduled_at/);
 assert.match(code,/Date\.parse/);
 assert.match(code,/\.eq\("cover_url",canonical\)/);
 assert.match(code,/original-storage/);
 assert.doesNotMatch(code,/export async function POST/);
 assert.doesNotMatch(code,/text-faithful-fallback/);
});
test("Historias usan PNG auténticos privados, no se liberan por anticipado",()=>{
 const code=read("app/api/mensajes/historia/[code]/route.ts");
 assert.match(code,/pqd-article-covers-private-v1/);
 assert.match(code,/approved_by_author/);
 assert.match(code,/scheduled_at/);
 assert.match(code,/original-story-storage/);
});
test("Las reescrituras ejecutan el control antes de cualquier archivo público",()=>{
 const conf=read("next.config.ts");
 assert.match(conf,/beforeFiles/);
 assert.match(conf,/\/mensajes\/\:filename/);
 assert.match(conf,/\/mensajes\/historias\/\:code/);
 const code=read("proxy.ts");
 assert.match(code,/\/_next\/image/);
 assert.match(code,/editorial_items/);
});
test("Los PNG futuros no se distribuyen desde Git en el despliegue",()=>{
 const files=fs.readdirSync(path.join(root,"public","mensajes"));
 assert.equal(files.some(f=>/^pd-(?:0(?:4[1-9]|[5-9]\d)|100)-.*\.png$/.test(f)),false);
 const story=path.join(root,"public","mensajes","historias");
 const future=fs.existsSync(story)?fs.readdirSync(story):[];
 assert.equal(future.some(f=>/^pd-(?:0(?:4[1-9]|[5-9]\d)|100)\.png$/.test(f)),false);
});

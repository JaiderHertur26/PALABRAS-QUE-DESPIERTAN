import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=f=>fs.readFileSync(new URL("../"+f,import.meta.url));
test("La tarjeta original sigue intacta y su imagen visible recibe prioridad móvil",()=>{
 const a=read("app/articulos/[slug]/page.tsx").toString();
 assert.match(a,/fetchPriority="high"/);
 assert.match(a,/priority fetchPriority="high"/);
 assert.match(a,/sizes="\(max-width:420px\) 90vw, \(max-width:760px\) 420px, 35vw"/);
 assert.match(a,/src=\{a\.imagen\}/);
 const png=read("app/icon.png");const original=read("assets/master/icon-original-256.png");
 assert.ok(png.length<12000);
 assert.ok(original.length>100000);
 assert.equal(png.readUInt32BE(16),96);
 assert.equal(png.readUInt32BE(20),96);
 assert.equal(original.readUInt32BE(16),256);
 assert.equal(original.readUInt32BE(20),256);
});

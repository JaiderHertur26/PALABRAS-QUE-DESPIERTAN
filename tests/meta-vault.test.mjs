import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read=(p)=>fs.readFileSync(path.resolve(import.meta.dirname,"..",p),"utf8");
test("Almacén privado de tokens Meta cifra con AES-256-GCM y exige dirección y puente",()=>{
 const src=read("app/api/editorial/meta/vault/route.ts");
 assert.match(src,/pqd-meta-credentials-v1/);
 assert.match(src,/AES|aes-256-gcm/);
 assert.match(src,/createCipheriv\("aes-256-gcm"/);
 assert.match(src,/setAAD/);
 assert.match(src,/timingSafeEqual/);
 assert.match(src,/userClient\.auth\.getUser/);
 assert.match(src,/editorial_is_authorized/);
 assert.match(src,/X-PQD-Meta-Bridge|x-pqd-meta-bridge/);
 assert.match(src,/SUPABASE_SECRET_KEY/);
 assert.match(src,/upsert:true/);
 assert.match(src,/instagram_content_publish/);
 assert.doesNotMatch(src,/NEXT_PUBLIC_SUPABASE_SECRET_KEY|console\.log\(body\.token/);
});

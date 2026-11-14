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

test("Verificación de Instagram sin exponer ni inferir la identidad",()=>{
 const verifier=read("lib/meta-account-verification.ts");
 const vault=read("app/api/editorial/meta/vault/route.ts");
 assert.match(verifier,/createDecipheriv\("aes-256-gcm"/);
 assert.match(verifier,/setAuthTag/);
 assert.match(verifier,/setAAD/);
 assert.match(verifier,/debug_token/);
 assert.match(verifier,/instagram_basic/);
 assert.match(verifier,/instagram_content_publish/);
 assert.match(verifier,/candidates\.find\(x=>x\.username==="palabrasquedespiertan"\)/);
 assert.match(verifier,/awaiting_account_permission/);
 assert.match(vault,/verifiedAccount:false/);
 assert.match(vault,/await verifySavedInstagram/);
 assert.match(vault,/item\.verifiedAccount=verification\.verified/);
 assert.match(vault,/username:item\.verifiedAccount\?item\.username:null/);
 assert.doesNotMatch(vault,/return reply\(\{.*token[,:]/);
});

test("Validación de fanpage orgánica con identidad y rol, sin publicar ni filtrar tokens",()=>{
 const probe=read("lib/meta-account-verification.ts");
 const vault=read("app/api/editorial/meta/vault/route.ts");
 assert.match(probe,/verifySavedFacebook/);
 assert.match(probe,/\/me\/accounts/);
 assert.match(probe,/granular_scopes/);
 assert.match(probe,/isKnownPage/);
 assert.match(probe,/palabrasquedespiertan01/);
 assert.match(probe,/instagram_business_account/);
 assert.match(probe,/CREATE_CONTENT/);
 assert.match(probe,/canCreateContent:canCreate&&hasPageToken/);
 assert.match(vault,/facebookPageVerified/);
 assert.match(vault,/lastFacebookVerificationAttemptAt/);
 assert.match(vault,/facebookPageVerified:item.facebookPageVerified===true/);
 assert.doesNotMatch(vault,/pageAccessToken|page\.access_token|encrypted:item\.encrypted/);
 assert.doesNotMatch(probe,/method:"POST"|method:'POST'|\/feed\b|\/photos\b/);
});

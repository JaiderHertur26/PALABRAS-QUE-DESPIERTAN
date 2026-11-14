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

test("Borradores de Meta se almacenan en bucket privado separado, accesibles solo por dirección",()=>{
 const model=read("lib/editorial-meta-drafts.ts");
 const route=read("app/api/editorial/meta/drafts/route.ts");
 const media=read("app/api/editorial/meta/drafts/media/route.ts");
 assert.match(model,/pqd-meta-drafts-v1/);
 assert.doesNotMatch(model,/pqd-meta-credentials-v1/);
 assert.match(model,/timingSafeEqual/);
 assert.match(model,/user.email\?\.toLowerCase\(\)!=="pquedespiertan@gmail.com"/);
 assert.match(model,/editorial_is_authorized/);
 assert.match(model,/privateDraftStore/);
 assert.match(route,/authorizedDraftRequest\(req\)/);
 assert.match(media,/authorizedDraftRequest\(req\)/);
 assert.match(route,/expectedUpdatedAt/);
 assert.match(route,/updatedAt\|\|null/);
 assert.match(route,/upsert:true/);
 assert.doesNotMatch(route,/graph.facebook.com|media_publish|\/feed|is_published/);
});
test("La edición y sustitución de imágenes revoca aprobación de contenido",()=>{
 const model=read("lib/editorial-meta-drafts.ts");
 const media=read("app/api/editorial/meta/drafts/media/route.ts");
 assert.match(model,/contentChanged/);
 assert.match(model,/const approved=body.contentApproved===true&&!contentChanged/);
 assert.match(model,/Adjunta las imágenes y guárdalas antes de aprobar/);
 assert.match(media,/changedImage/);
 assert.match(media,/contentApproved:revokesApproval\?false/);
 assert.match(media,/approvalAt:revokesApproval\?null/);
 assert.match(media,/x-pqd-expected-revision/);
 assert.match(media,/sha256/);
 assert.match(media,/image\/png/);
 assert.match(media,/image\/jpeg/);
 assert.match(media,/Math.abs\(ratio-9\/16\)>0.025/);
 assert.match(media,/width\*height>16_000_000/);
 assert.doesNotMatch(media,/graph.facebook.com|media_publish|POST.*\/feed/);
});
test("Tipos de cuenta Instagram para proteger historias",()=>{
 const probe=read("lib/meta-account-verification.ts");
 const vault=read("app/api/editorial/meta/vault/route.ts");
 assert.match(probe,/account_type/);
 assert.match(probe,/accountType/);
 assert.match(vault,/instagramAccountType/);
 assert.match(vault,/item.verifiedAccount&&item.instagramAccountType/);
});

test("Publicación Meta sólo en TEST-001 aprobado y con bloqueo atómico por red",()=>{
 const model=read("lib/editorial-meta-delivery.ts");
 const route=read("app/api/editorial/meta/publish/route.ts");
 assert.match(model,/ONLY_APPROVED_TEST001_FEED_ALLOWED/);
 assert.match(model,/draft.contentApproved/);
 assert.match(model,/upsert:false/);
 assert.match(model,/readReceipt\(id,channel\)/);
 assert.match(model,/status:"needs_review"/);
 assert.match(model,/mediaSha256/);
 assert.match(model,/sha256/);
 assert.match(model,/INSTAGRAM_STORIES_BUSINESS_REQUIRED/);
 assert.match(model,/instagramIdentity\(record,token,false\)/);
 assert.match(route,/authorizedDraftRequest\(request\)/);
 assert.match(route,/PUBLICAR_TEST001_UNA_VEZ/);
 assert.match(route,/facebook_feed","instagram_feed/);
 assert.doesNotMatch(route,/cron|setInterval|autoPublish/);
});

test("Meta preflight comprueba permisos y página antes de reservar o publicar",()=>{
 const src=read("lib/editorial-meta-delivery.ts");
 const endpoint=read("app/api/editorial/meta/publish/route.ts");
 assert.match(src,/approvedTestId=/);
 assert.match(src,/approvedFeedHash=/);
 assert.match(src,/approvedCaptionHashes=/);
 assert.match(src,/createHash\("sha256"\).update\(copy\)/);
 assert.match(src,/checkChannelEligibility\(draft,channel\)/);
 assert.match(src,/if\(!preflight.ready\)throw/);
 assert.match(src,/DRAFT_CHANGED_DURING_PREFLIGHT/);
 assert.match(src,/await pageToken\(record,token\)/);
 assert.match(src,/await signedImage\(draft,"feed"\)/);
 assert.match(endpoint,/request.nextUrl.searchParams.get\("preflight"\)==="1"/);
 assert.match(endpoint,/publicationReadiness\(id\)/);
 assert.match(src,/upsert:false/);
});

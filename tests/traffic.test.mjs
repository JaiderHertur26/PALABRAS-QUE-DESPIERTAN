import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("La revista registra cambios de página sin cookies ni identidad de lectores",()=>{
 const tracker=read("components/VisitTracker.tsx");
 assert.match(tracker,/usePathname/);
 assert.match(tracker,/fetch\("\/api\/visitas"/);
 assert.match(tracker,/credentials:"omit"/);
 assert.doesNotMatch(tracker,/localStorage|sessionStorage|document\.cookie|fingerprint|userId/);
 assert.match(read("app/layout.tsx"),/<VisitTracker\/>/);
});
test("El servidor autoriza las páginas consultadas y no registra contenido pendiente",()=>{
 const route=read("app/api/visitas/route.ts");
 const lib=read("lib/visit-analytics.ts");
 assert.match(route,/origin!=="https:\/\/www\.palabrasquedespiertan\.online"/);
 assert.match(route,/resolveVisit\(input\.path\)/);
 assert.match(lib,/\.eq\("slug",slug\)/);
 assert.match(lib,/data\.state!=="published"/);
 assert.match(lib,/Date\.now\(\)/);
 assert.match(lib,/new Blob\(\["1"\]/);
 assert.match(lib,/upsert:false/);
 assert.doesNotMatch(lib,/ipAddress|remoteAddr|x-forwarded-for|user-agent/);
});
test("La consulta de estadísticas exige autorización editorial real",()=>{
 const api=read("app/api/visitas/route.ts");
 assert.match(api,/client\.auth\.getUser\(bearer\[1\]\)/);
 assert.match(api,/editorial_is_authorized/);
 assert.match(api,/pquedespiertan@gmail\.com/);
 assert.match(api,/no-store/);
 assert.match(read("app/privacidad/page.tsx"),/páginas vistas/);
});

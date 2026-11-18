import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=(file)=>fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
test("La portada usa un único catálogo compacto para artículos y mensajes",()=>{
 const live=read("lib/editorial-live.ts");
 const page=read("app/page.tsx");
 const part=live.slice(live.indexOf("const homeRows="),live.indexOf("export async function publicInicio"));
 assert.match(part,/\.select\("kind,slug,code,title,subtitle,summary,state,scheduled_at,published_at,cover_url,season,series,position"\)/);
 assert.match(part,/\.in\("kind",\["articulo","mensaje"\]\)/);
 assert.doesNotMatch(part,/\.select\("[^"]*body/);
 assert.match(part,/\.filter\(effective\)/);
 assert.match(page,/await publicInicio\(\)/);
 assert.doesNotMatch(page,/await Promise\.all\(\[publicArticulos\(\),publicTemas\(\),publicMensajes\(\)\]\)/);
});
test("La simplificación no introduce caché compartida ni debilita el control editorial",()=>{
 const live=read("lib/editorial-live.ts");
 const part=live.slice(live.indexOf("const homeRows="));
 assert.match(live,/import "server-only"/);
 assert.match(live,/Date\.now\(\)/);
 assert.match(live,/cache:"no-store"/);
 assert.doesNotMatch(part,/unstable_cache|force-cache|revalidate:\\s*[1-9]/);
 assert.match(part,/list\.filter\(r=>r\.kind==="articulo"\)/);
 assert.match(part,/list\.filter\(r=>r\.kind==="mensaje"\)/);
});
test("Tarjeta destacada acepta ficha breve sin cambiar el estilo ni las tarjetas completas",()=>{
 const card=read("components/MessageCard.tsx");
 assert.match(card,/Pick<Mensaje,"id"\|"slug"\|"titulo"\|"imagen">/);
 assert.match(card,/featured:true/);
 assert.match(card,/className="featured-message-image"/);
 assert.match(card,/className="message-excerpt"/);
});

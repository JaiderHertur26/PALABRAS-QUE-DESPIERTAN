import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=f=>fs.readFileSync(new URL("../"+f,import.meta.url),"utf8");

test("La comunidad usa carga diferida sin quitar sus controles de seguridad",()=>{
 const gate=read("components/community/DiscussionDeferred.tsx");
 assert.match(gate,/lazy\(async\(\)=>\(\{default:\(await import\("\.\/Discussion"\)\)\.Discussion\}\)\)/);
 assert.match(gate,/IntersectionObserver/);
 assert.match(gate,/rootMargin:"600px 0px"/);
 assert.match(gate,/if\(active\|\|props\.tipo==="tema"\)return/);
 assert.match(gate,/Leer testimonios y participar/);
 assert.match(gate,/setActive\(true\)/);
 assert.match(gate,/Ver conversación y participar/);
 assert.match(gate,/href="\/participar"/);
 assert.match(gate,/Suspense/);
 assert.doesNotMatch(gate,/@supabase|Discussion\s+from|SUPABASE_SECRET_KEY/);
 const live=read("components/community/Discussion.tsx");
 assert.match(live,/fetch\("\/api\/comunidad\/comentarios/);
 assert.match(live,/fetch\("\/api\/comunidad\/reportes"/);
 assert.match(live,/AuthPanel/);
});

test("Artículos, mensajes y testimonios inician con la conversación diferida",()=>{
 for(const f of ["app/articulos/[slug]/page.tsx","app/mensajes/[slug]/page.tsx","app/testimonios/[slug]/page.tsx"]){
  const src=read(f);
  assert.match(src,/import \{DiscussionDeferred\} from "@\/components\/community\/DiscussionDeferred"/,f);
  assert.match(src,/<DiscussionDeferred tipo=/,f);
  assert.doesNotMatch(src,/import \{Discussion\} from "@\/components\/community\/Discussion"/,f);
 }
});
test("La vista previa no altera la identidad visual ni provoca componentes privados",()=>{
 const css=read("app/editorial-improvements.css");
 assert.match(css,/\.discussion-preview\{/);
 assert.match(css,/\.discussion-lazy-root\{/);
 assert.doesNotMatch(css,/\.discussion-preview\{[^}]*display:none/);
});

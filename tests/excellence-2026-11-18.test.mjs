import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Los temas de navegación son explícitos y no muestran obras por sí mismos",()=>{
 const src=read("lib/editorial-topics.ts");
 assert.match(src,/articulosCurados/);
 assert.match(src,/mensajesCurados/);
 assert.doesNotMatch(src,/SUPABASE_SECRET_KEY|editorial_items/);
 assert.match(src,/ART-010/);
 assert.match(src,/PD-001/);
});
test("La búsqueda por temas, tipo y relevancia se construye solo con publicaciones visibles",()=>{
 const src=read("lib/search-all.ts");
 assert.match(src,/publicArticulos,publicMensajes/);
 assert.match(src,/temasDeArticulo/);
 assert.match(src,/temasDeMensaje/);
 assert.match(src,/puntuar/);
 assert.doesNotMatch(src,/snapshotArticles|snapshotMessages|SUPABASE_SECRET_KEY/);
 const ui=read("app/buscar/page.tsx");
 assert.match(ui,/temasDisponibles/);
 assert.match(ui,/UnifiedSearchForm/);
});
test("Las relaciones de fondo se declaran explícitamente y requieren ambos extremos publicados",()=>{
 const map=read("lib/editorial-links.ts");
 const render=read("components/EditorialConnections.tsx");
 assert.match(map,/PD-001.*ART-010/);
 assert.match(render,/articulos\.find/);
 assert.match(render,/mensajes\.find/);
 assert.match(render,/enlacesDeFundamento/);
 assert.doesNotMatch(render,/articulos\.slice\(0,2\)|mensajes\.slice\(0,2\)/);
});
test("La portada móvil permite llegar a publicaciones directamente",()=>{
 const page=read("app/page.tsx");
 const css=read("app/editorial-improvements.css");
 assert.match(page,/home-hero-shortcuts/);
 assert.match(page,/Última investigación/);
 assert.match(page,/Mensaje más reciente/);
 assert.match(css,/max-width:680px/);
 assert.match(css,/hero-art\{height:145px/);
});
test("Novedades y RSS usan solo el catálogo público y no recopilan datos personales",()=>{
 const page=read("app/novedades/page.tsx");
 const feed=read("app/feed.xml/route.ts");
 assert.match(page,/publicArticulos,publicMensajes/);
 assert.match(feed,/publicArticulos,publicMensajes/);
 assert.match(feed,/escapeXml/);
 assert.match(feed,/Cache-Control/);
 assert.doesNotMatch(page+feed,/insert\(|fetch\(.*subscribe|localStorage|email_address/);
 assert.ok(fs.existsSync(path.join(root,"app/feed.xml/route.ts")));
});
test("La indexación y la programación existente siguen protegidas",()=>{
 const live=read("lib/editorial-live.ts");
 const messages=read("app/mensajes/[slug]/page.tsx");
 const sitemap=read("app/sitemap.ts");
 assert.match(live,/state==="scheduled".*scheduled_at.*Date\.now/);
 assert.match(messages,/if\(!m\)notFound\(\)/);
 assert.match(sitemap,/publicArticulos,publicMensajes,publicTemas/);
 assert.doesNotMatch(sitemap,/pending|snapshotArticles|snapshotMessages/);
});
test("La portada usa fondos livianos sin alterar el PNG original",()=>{
 const css=read("app/site.css")+read("app/editorial-improvements.css");
 const home=read("app/page.tsx");
 const card=read("components/MessageCard.tsx");
 const desktop=path.join(root,"public/identidad/cruz-fondo-home.webp");
 const mobile=path.join(root,"public/identidad/cruz-fondo-home-mobile.webp");
 const original=path.join(root,"public/identidad/cruz-fondo.png");
 assert.match(css,/cruz-fondo-home\.webp/);
 assert.match(css,/cruz-fondo-home-mobile\.webp/);
 assert.match(home,/rel="preload" as="image"/);
 assert.match(card,/sizes="\(max-width: 680px\) 320px/);
 assert.ok(fs.statSync(original).size>1000000);
 assert.ok(fs.statSync(desktop).size<75000);
 assert.ok(fs.statSync(mobile).size<75000);
});
test("Se mantiene la identidad visual sin cambios en las tarjetas originales",()=>{
 const css=read("app/editorial-improvements.css");
 const home=read("app/page.tsx");
 assert.match(css,/--article-scale/);
 assert.match(home,/identidad\/portada-oficial\.png/);
 assert.match(home,/MensajeCard|MessageCard/);
 assert.doesNotMatch(css,/\.featured-message-image\s*\{[^}]*display:none/);
});

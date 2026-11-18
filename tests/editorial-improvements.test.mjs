import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const load=(p)=>fs.readFileSync(path.join(root,p),"utf8");

test("La búsqueda unificada solo obtiene datos de las funciones de visibilidad pública",()=>{
 const search=load("lib/search-all.ts");
 const ui=load("app/buscar/page.tsx");
 assert.match(search,/publicArticulos,publicMensajes/);
 assert.match(search,/buscarTodoPublico/);
 assert.doesNotMatch(search,/snapshotArticles|editorial_items|SUPABASE_SECRET/);
 assert.match(ui,/articulos\.map/);
 assert.match(ui,/mensajes\.map/);
});
test("Mensajes publicados tienen canonical e indexación; el contenido futuro conserva 404",()=>{
 const detail=load("app/mensajes/[slug]/page.tsx");
 const live=load("lib/editorial-live.ts");
 assert.match(detail,/robots:\{index:true,follow:true\}/);
 assert.match(detail,/canonical:"\/mensajes\/"/);
 assert.match(detail,/if\(!m\)notFound\(\)/);
 assert.match(live,/state==="scheduled".*scheduled_at.*Date\.now/);
});
test("La lectura de artículos contiene herramientas y mantiene la aprobación de la fuente",()=>{
 const article=load("app/articulos/[slug]/page.tsx");
 const tools=load("components/ArticleReadingTools.tsx");
 assert.match(article,/ArticleReadingTools/);
 assert.match(article,/id="lectura-articulo"/);
 assert.match(tools,/navigator\.share/);
 assert.match(tools,/window\.print/);
 assert.match(tools,/setCalido/);
 assert.match(tools,/api\.whatsapp\.com/);
 assert.match(article,/publicArticulos/);
});
test("La portada y la navegación ofrecen acceso directo al contenido, sin filtrar borradores",()=>{
 const home=load("app/page.tsx");
 const header=load("components/Header.tsx");
 assert.match(home,/ultimoArticulo/);
 assert.match(home,/publicInicio/);
 assert.match(load("lib/editorial-live.ts"),/export async function publicInicio/);
 assert.match(header,/nav-more/);
 assert.match(header,/secondary|secundarios/);
});
test("El sitemap publica solo material autorizado y la vista previa no usa imágenes futuras",()=>{
 const sitemap=load("app/sitemap.ts");
 const layout=load("app/layout.tsx");
 assert.match(sitemap,/publicArticulos,publicMensajes,publicTemas/);
 assert.match(layout,/vista-previa-social\.jpg/);
 assert.ok(fs.existsSync(path.join(root,"public/identidad/vista-previa-social.jpg")));
 assert.doesNotMatch(sitemap,/snapshotMessages|snapshotArticles|pending/);
});

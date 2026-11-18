import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=file=>fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
test("El artículo individual consulta solo su obra, con validación de fecha y estado",()=>{
 const source=read("lib/editorial-live.ts");
 const start=source.indexOf("export const publicArticulo=cache(");
 const end=source.indexOf("export type ArticuloIndice",start);
 const part=source.slice(start,end);
 assert.ok(start>0);
 assert.match(part,/\.eq\("kind","articulo"\)\.eq\("slug",slug\)\.maybeSingle\(\)/);
 assert.match(part,/if\(!data\|\|!effective\(data as Row\)\)return null/);
 assert.match(part,/cache\(async\(slug:string\)/);
 assert.match(part,/contenido:body/);
 assert.match(part,/imagen:row\.cover_url/);
 assert.doesNotMatch(part,/force-cache|unstable_cache|revalidate:\s*[1-9]/);
});
test("El índice no descarga cuerpos ni publica materiales futuros",()=>{
 const source=read("lib/editorial-live.ts");
 const part=source.slice(source.indexOf("export const publicArticulosIndice="));
 assert.match(part,/\.select\("slug,code,title,state,scheduled_at"\)/);
 assert.match(part,/\.filter\(effective\)/);
 assert.doesNotMatch(part,/\.select\("[^"]*body/);
});
test("La página reutiliza la ficha individual y conserva navegación y enlaces",()=>{
 const page=read("app/articulos/[slug]/page.tsx");
 assert.match(page,/const a=await publicArticulo\(slug\)/);
 assert.match(page,/publicArticulo\(slug\),publicArticulosIndice\(\),publicMensajes\(\)/);
 assert.match(page,/if\(!a\)notFound\(\)/);
 assert.match(page,/ArticleReadingTools/);
 assert.match(page,/ArticleBody contenido=\{a\.contenido\}/);
 assert.match(page,/EditorialConnections desde="articulo" codigo=\{a\.id\} articulos=\{\[a\]\} mensajes=\{mensajes\}/);
 assert.doesNotMatch(page,/await publicArticulos\(\)/);
});

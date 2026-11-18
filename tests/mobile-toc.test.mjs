import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=f=>fs.readFileSync(new URL("../"+f,import.meta.url),"utf8");

test("El índice móvil es un detalle nativo y se mantiene la versión completa para escritorio",()=>{
 const page=read("app/articulos/[slug]/page.tsx");
 assert.match(page,/<nav className="research-toc-desktop"/);
 assert.match(page,/<details className="research-toc-mobile">/);
 assert.match(page,/<summary>Explorar los \{headings\.length\} apartados/);
 assert.match(page,/const headings=articleHeadings\(a\.contenido\)\.slice\(0,28\)/);
 assert.equal((page.match(/headings\.map\(h=>/g)||[]).length,2);
 assert.match(page,/className=\{h\.level===3\?"toc-subsection":undefined\}/);
 assert.match(page,/<Link prefetch=\{false\} href="\/articulos" className="research-return"/);
 assert.match(page,/id="indice-articulo"/);
 assert.match(page,/<ArticleBody contenido=\{a\.contenido\}\/>/);
 assert.match(page,/<DiscussionDeferred tipo="articulo"/);
});
test("Móvil oculta el índice extenso hasta la activación nativa sin ocultar el texto",()=>{
 const css=read("app/research.css");
 assert.match(css,/\.research-toc-mobile\{display:none\}/);
 assert.match(css,/\.research-toc-desktop\{display:none\}/);
 assert.match(css,/\.research-toc-mobile\{display:block\}/);
 assert.match(css,/\.research-toc-mobile>summary:focus-visible/);
 assert.doesNotMatch(css,/\.research-prose\{content-visibility:auto/);
});

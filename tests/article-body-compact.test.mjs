import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(import.meta.url);
const ts=require("typescript");
const file=path.join(root,"components","ArticleBody.tsx");
const source=fs.readFileSync(file,"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{
 module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,
 target:ts.ScriptTarget.ES2022,esModuleInterop:true
}}).outputText;
const m=new Module(file);
m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
m._compile(compiled,file);
const {renderArticleHtml,articleHeadings}=m.exports;

test("El formato compacto mantiene párrafos, títulos y listas en orden",()=>{
 const md="## La dignidad de la persona\n\nUna verdad **importante** y *profunda*.\n\n- Primer punto\n- Segundo punto\n\n1. Paso uno\n2. Paso dos\n\n---\n\n## La dignidad de la persona\nFin.";
 const html=renderArticleHtml(md);
 assert.equal(html,
  '<h2 id="la-dignidad-de-la-persona">La dignidad de la persona</h2>'
  +'<p>Una verdad <strong>importante</strong> y <em>profunda</em>.</p>'
  +'<ul><li>Primer punto</li><li>Segundo punto</li></ul>'
  +'<ol><li>Paso uno</li><li>Paso dos</li></ol>'
  +'<hr/><h2 id="la-dignidad-de-la-persona-2">La dignidad de la persona</h2>'
  +'<p>Fin.</p>');
 assert.deepEqual(articleHeadings(md).map(x=>x.anchor),[
  "la-dignidad-de-la-persona","la-dignidad-de-la-persona-2"
 ]);
});
test("Ningún HTML del texto editorial puede ejecutarse",()=>{
 const html=renderArticleHtml("Texto <script>alert('x')</script> <img src=x onerror=alert(1)> y & \"comillas\".");
 assert.doesNotMatch(html,/<script>|<img|onerror="/i);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(html,/&amp;/);
 assert.match(html,/&quot;comillas&quot;/);
});
test("Los enlaces HTTPS se muestran seguros y preservan el escapado de parámetros",()=>{
 const html=renderArticleHtml("Fuente https://www.vatican.va/documento?a=1&b=2, y javascript:alert(1)");
 assert.match(html,/<a class="inline-link article-external" href="https:\/\/www\.vatican\.va\/documento\?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">vatican\.va<\/a>,/);
 assert.doesNotMatch(html,/href="javascript:/);
 assert.equal((html.match(/<a /g)||[]).length,1);
});
test("El artículo contiene un único bloque HTML, sin serializar miles de nodos JSX",()=>{
 assert.match(source,/dangerouslySetInnerHTML=\{\{__html:renderArticleHtml\(contenido\)\}\}/);
 assert.match(source,/className="research-prose"/);
 assert.doesNotMatch(source,/renderToStaticMarkup|react-dom\/server/);
});

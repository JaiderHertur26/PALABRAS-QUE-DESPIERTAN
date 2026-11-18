import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(file)=>readFileSync(new URL("../"+file,import.meta.url),"utf8");

test("El artículo no precarga otras rutas editoriales antes de que el lector haga clic",()=>{
 const p=read("app/articulos/[slug]/page.tsx");
 assert.match(p,/<Breadcrumbs prefetch=\{false\}/);
 for(const needle of [
  'prefetch={false} href="/articulos"',
  'prefetch={false} href={"/articulos/"+before.slug}',
  'prefetch={false} href={"/articulos/"+after.slug}',
  'prefetch={false} href="/revista"'
 ])assert.ok(p.includes(needle),needle);
 assert.match(p,/const \[a,articulos,mensajes\]=await Promise\.all/);
 assert.match(p,/<ArticleBody contenido=\{a\.contenido\}\/>/);
});

test("Las etiquetas y relaciones conservan enlaces accesibles sin precarga",()=>{
 const topics=read("components/ArticleTopicBadges.tsx");
 const related=read("components/EditorialConnections.tsx");
 const crumbs=read("components/Breadcrumbs.tsx");
 assert.match(topics,/<Link key=\{id\} href=\{"\/buscar\?tipo=articulos&tema="\+id\} prefetch=\{false\}>/);
 assert.match(related,/<Link key=\{item\.id\} href=\{item\.href\} prefetch=\{false\}>/);
 assert.match(related,/<Link key=\{id\} href=\{"\/buscar\?tema="\+id\} prefetch=\{false\}>/);
 assert.match(related,/<Link className="text-link" href=\{catalogo\} prefetch=\{false\}>/);
 assert.match(crumbs,/prefetch\?:boolean/);
 assert.match(crumbs,/prefetch=\{prefetch\}/);
});

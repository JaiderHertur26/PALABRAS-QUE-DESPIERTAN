import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=(file)=>fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
test("El menú funciona con controles HTML accesibles sin estado JavaScript",()=>{
 const header=read("components/Header.tsx");
 const css=read("app/editorial-improvements.css");
 assert.doesNotMatch(header,/"use client"|useState|usePathname|onClick/);
 assert.match(header,/<details className="mobile-menu">/);
 assert.match(header,/<summary className="mobile-toggle" aria-label="Menú principal">/);
 assert.match(header,/<nav className="mobile-panel" aria-label="Navegación móvil">/);
 assert.match(header,/href="\/buscar"/);
 assert.match(css,/\.mobile-menu\[open\] \.mobile-panel/);
 assert.match(css,/grid-template-columns:repeat\(2/);
});
test("La analítica se descarga como script ligero sin hidratar React",()=>{
 const layout=read("app/layout.tsx");
 const src=read("public/visit-analytics.js");
 assert.match(layout,/<script src="\/visit-analytics\.js" defer\/>/);
 assert.doesNotMatch(layout,/VisitTracker|<VisitTracker/);
 assert.doesNotMatch(src,/React|localStorage|document\.cookie|fingerprint|userId/);
 assert.match(src,/window\.navigation/);
 assert.match(src,/MutationObserver/);
});
test("La renderización diferida siempre reserva espacio y nunca oculta las publicaciones",()=>{
 const css=read("app/editorial-improvements.css");
 assert.match(css,/content-visibility:auto/);
 assert.match(css,/contain-intrinsic-size:auto/);
 assert.doesNotMatch(css,/content-visibility:hidden/);
});

test("La portada, las tarjetas y el pie preservan navegación sin bundles de enlaces cliente",()=>{
 for(const file of ["app/page.tsx","components/Footer.tsx","components/MessageCard.tsx"]){
  const source=read(file);
  assert.doesNotMatch(source,/import Link from "next\/link"|<Link\b/);
  assert.match(source,/<a\b/);
 }
 assert.match(read("app/page.tsx"),/<a className="button-gold" href="\/mensajes"/);
 assert.match(read("components/Footer.tsx"),/<a href="\/privacidad"/);
});

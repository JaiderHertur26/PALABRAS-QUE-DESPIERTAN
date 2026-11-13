import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const social=readFileSync(new URL("../lib/social.ts",import.meta.url),"utf8");
const component=readFileSync(new URL("../components/SocialLinks.tsx",import.meta.url),"utf8");
const header=readFileSync(new URL("../components/Header.tsx",import.meta.url),"utf8");
const footer=readFileSync(new URL("../components/Footer.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/redes/page.tsx",import.meta.url),"utf8");

test("los dos accesos sociales corresponden a las cuentas oficiales",()=>{
  assert.match(social,/https:\/\/www\.facebook\.com\/PalabrasQueDespiertan01/);
  assert.match(social,/https:\/\/www\.instagram\.com\/palabrasquedespiertan\//);
});

test("los botones de redes son enlaces externos seguros y accesibles",()=>{
  assert.match(component,/href=\{account\.url\}/);
  assert.match(component,/target="_blank"/);
  assert.match(component,/rel="noopener noreferrer"/);
  assert.match(component,/aria-label/);
});

test("hay accesos directos en encabezado, menú móvil, pie y página Redes",()=>{
  assert.match(header,/SocialLinks compact className="header-social"/);
  assert.match(header,/SocialLinks compact className="menu-social"/);
  assert.match(footer,/SocialLinks className="footer-social"/);
  assert.match(page,/socialAccounts\.map/);
  assert.match(page,/href=\{account\.url\}/);
});

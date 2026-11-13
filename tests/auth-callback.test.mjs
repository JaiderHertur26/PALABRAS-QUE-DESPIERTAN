import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(base,p),"utf8");

test("el callback intercambia el código PKCE y envía cookies en su respuesta",()=>{
 const src=read("app/auth/callback/route.ts");
 assert.match(src,/exchangeCodeForSession\(code\)/);
 assert.match(src,/response\.cookies\.set\(name,value,options\)/);
 assert.match(src,/request\.cookies\.set\(name,value\)/);
 assert.match(src,/Cache-Control/);
 assert.match(src,/no-store/);
 assert.match(src,/esModerador\(user\.id\)/);
 assert.match(src,/\/moderacion/);
 assert.doesNotMatch(src,/NextResponse\.redirect\(request\.nextUrl\.searchParams\.get/);
});
test("sin sesión la página editorial ofrece acceso sin exponer la moderación",()=>{
 const page=read("app/moderacion/page.tsx");
 const route=read("app/api/moderacion/route.ts");
 assert.match(page,/if\(!user\)redirect\("\/participar\?acceso=iniciar&destino=moderacion"\)/);
 assert.match(page,/esModerador\(user\.id\)/);
 assert.match(page,/notFound\(\)/);
 assert.match(route,/esModerador\(user\.id\)/);
 assert.match(route,/Área editorial restringida/);
});
test("el proxy de Next actualiza cookies y evita cachés en rutas autenticadas",()=>{
 const src=read("proxy.ts");
 assert.match(src,/export async function proxy/);
 assert.match(src,/client\.auth\.getUser\(\)/);
 assert.match(src,/response\.cookies\.set\(name,value,options\)/);
 assert.match(src,/Cache-Control/);
 assert.match(src,/\/moderacion\/:path\*/);
 assert.match(src,/\/api\/moderacion\/:path\*/);
 assert.match(src,/palabrasquedespiertan\.vercel\.app/);
 assert.match(src,/www\.palabrasquedespiertan\.online/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const source=name=>fs.readFileSync(path.join(root,name),"utf8");
const schema=source("database/schema.sql");
const seed=source("database/community-seed.sql");

test("referencia del Supabase nuevo fijada en configuración pública",()=>{
 const cfg=source("lib/supabase/config.ts");
 assert.match(cfg,/lwuzkjvolxwkxdyafcjv/);
 assert.match(cfg,/supabase\.co/);
 assert.match(cfg,/sb_publishable_/);
 assert.match(cfg,/NEXT_PUBLIC_COMUNIDAD_ACTIVA==="true"/);
 assert.match(source(".env.example"),/NEXT_PUBLIC_COMUNIDAD_ACTIVA=false/);
 assert.doesNotMatch(cfg,/SUPABASE_SECRET_KEY/);
 assert.match(source(".env.example"),/lwuzkjvolxwkxdyafcjv\.supabase\.co/);
});

test("la clave de escritura no se filtra al navegador",()=>{
 assert.doesNotMatch(source("lib/supabase/client.ts"),/SUPABASE_SECRET_KEY|sb_secret_/);
 assert.match(source("lib/supabase/server.ts"),/import "server-only"/);
 assert.match(source("lib/supabase/server.ts"),/process\.env\.SUPABASE_SECRET_KEY/);
 assert.match(source("lib/supabase/server.ts"),/sb_secret_/);
});

test("la semilla contiene solamente hilos vigentes y autorizados",()=>{
 const messages=JSON.parse(source("data/site-content.json")).mensajes;
 const articles=JSON.parse(source("data/public-articles.json")).articulos;
 const permits=JSON.parse(source("data/article-publication-allowlist.json")).articulos;
 const allowed=new Set(permits.filter(x=>x.autorizaWeb===true).map(x=>x.id));
 const permitted=articles.filter(a=>allowed.has(a.id)&&a.estado==="PUBLICADO EN REVISTA PROPIA");
 const topics=JSON.parse(source("data/testimony-topics.json"));
 const ids=[...seed.matchAll(/\('(?:mensaje|articulo|tema)',\s*'([^']+)',/g)].map(x=>x[1]);
 const expected=[...messages.map(m=>m.slug),...permitted.map(a=>a.slug),...topics.map(t=>t.slug)];
 assert.equal(ids.length,expected.length);
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(new Set(ids),new Set(expected));
 assert.match(seed,/update public\.discussion_subjects set enabled=false/);
 assert.equal((seed.match(/,\s*false\)/g)??[]).length,expected.length,"Todos los hilos nacen cerrados");
 assert.equal((seed.match(/,\s*true\)/g)??[]).length,0,"Ningún hilo queda abierto por defecto");
});

test("la auditoría PostgreSQL se registra con la decisión en la misma transacción",()=>{
 assert.match(schema,/create or replace function private\.audit_discussion_decision/);
 assert.match(schema,/before update on public\.discussion_entries/);
 assert.match(schema,/insert into public\.discussion_audit/);
 assert.match(schema,/moderation_note/);
 assert.match(schema,/reviewed_by/);
 assert.match(schema,/Transición editorial no permitida/);
 const api=source("app/api/moderacion/route.ts");
 assert.doesNotMatch(api,/\.from\("discussion_audit"\)\.insert/);
 assert.match(api,/\.eq\("status","pending"\)/);
 assert.match(api,/\.eq\("status",origen\)/);
 assert.match(api,/moderation_note:nota/);
});

test("los comentarios del hilo oculto quedan ocultos y la aprobación valida al padre",()=>{
 assert.match(schema,/create or replace function private\.hide_approved_replies/);
 assert.match(schema,/where parent_id=new\.id and status='approved'/);
 assert.match(schema,/where id=new\.parent_id and status='approved'/);
 assert.match(schema,/if new\.status='approved'/);
});

test("los límites de frecuencia no admiten carreras paralelas por autor",()=>{
 const matches=schema.match(/pg_advisory_xact_lock/g)??[];
 assert.equal(matches.length,2);
 assert.match(schema,/interval '60 seconds'/);
 assert.match(schema,/interval '24 hours'/);
});

test("no se versionan credenciales locales ni copias de la carpeta privada",()=>{
 const gitignore=source(".gitignore");
 assert.match(gitignore,/\.env\.\*/);
 assert.match(gitignore,/\/GITHUB\//);
 assert.match(gitignore,/\/00_DOCUMENTO_MAESTRO/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const topics=JSON.parse(fs.readFileSync(path.join(root,"data","testimony-topics.json"),"utf8"));
const articleStore=JSON.parse(fs.readFileSync(path.join(root,"data","public-articles.json"),"utf8"));
const published=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
const sql=fs.readFileSync(path.join(root,"database","schema.sql"),"utf8");
const source=(p)=>fs.readFileSync(path.join(root,p),"utf8");

test("seis temas de testimonios originales con fundamentos bíblicos",()=>{
 assert.equal(topics.length,6);
 assert.equal(new Set(topics.map(t=>t.slug)).size,topics.length);
 for(const t of topics){
  assert.match(t.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(t.titulo.length>5);
  assert.ok(t.pregunta.startsWith("¿")&&t.pregunta.endsWith("?"));
  assert.ok(t.introduccion.length>65);
  assert.ok(t.referencia.length>8);
 }
});
test("los testimonios distinguen experiencia y enseñanza doctrinal",()=>{
 const lineamientos=source("lib/community/rules.ts");
 assert.match(lineamientos,/doctrina oficial/);
 assert.match(lineamientos,/datos personales de terceros/);
 assert.match(lineamientos,/publican inmediatamente/);
 assert.match(lineamientos,/no una afirmación doctrinal/);
});
test("solo los artículos aprobados y autorizados aparecen en la revista",()=>{
 assert.equal(articleStore.version,2);
 assert.equal(articleStore.articulos.length,12);
 assert.deepEqual(articleStore.articulos.map(a=>a.id),Array.from({length:12},(_,i)=>"ART-"+String(i+1).padStart(3,"0")));
 assert.ok(articleStore.articulos.every(a=>a.estado==="PUBLICADO EN REVISTA PROPIA"&&a.contenido.length>3500));
 assert.deepEqual(published.articulos,[]); // catálogo PD independiente; los ART viven en public-articles.json
});
test("RLS habilitado en todas las tablas expuestas del módulo",()=>{
 for(const table of ["discussion_subjects","discussion_entries","discussion_reports","discussion_moderators","discussion_audit"]){
  assert.ok(sql.includes(`alter table public.${table} enable row level security;`),table);
 }
 assert.match(sql,/status='approved'/);
 assert.match(sql,/for insert to authenticated/);
 assert.match(sql,/auth.uid\(\)/);
});
test("los comentarios se publican al verificar el correo y aceptar privacidad",()=>{
 assert.match(sql,/status text not null default 'approved'/);
 assert.match(sql,/status='approved'/);
 assert.match(sql,/consent_confirmed/);
 assert.match(source("app/api/comunidad/comentarios/route.ts"),/status:201/);
});
test("protecciones contra respuestas cruzadas, exceso de frecuencia y niveles",()=>{
 assert.match(sql,/parent_record.subject_type<>new.subject_type/);
 assert.match(sql,/parent_record.subject_id<>new.subject_id/);
 assert.match(sql,/new.depth>2/);
 assert.match(sql,/interval '60 seconds'/);
 assert.match(sql,/interval '24 hours'/);
});
test("acceso de moderadores y secretos permanecen del lado del servidor",()=>{
 assert.ok(!source("lib/supabase/client.ts").includes("SUPABASE_SECRET_KEY"));
 assert.ok(source("lib/supabase/server.ts").includes("SUPABASE_SECRET_KEY"));
 assert.ok(source("app/api/moderacion/route.ts").includes("esModerador"));
 assert.ok(source(".gitignore").includes(".env"));
 assert.ok(source(".vercelignore").includes("/*"));
});
test("no se reutilizan las bases de otras aplicaciones",()=>{
 assert.doesNotMatch(source(".env.example"),/pjuyqyqtpnoftzfpdlng|foczofcmwampjvlfbsqn/);
 assert.ok(!/foczofcmwampjvlfbsqn|pjuyqyqtpnoftzfpdlng/.test(sql));
});

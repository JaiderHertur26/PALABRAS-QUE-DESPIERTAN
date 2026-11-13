/**
 * Publica las rutas de conversación autorizadas en la base DEDICADA.
 * Solo genera SQL revisable; NUNCA ejecuta conexiones o cambios remotos.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const [{mensajes},temas,publicArticles,allowlist]=await Promise.all([
 fs.readFile(path.join(root,"data/site-content.json"),"utf8").then(JSON.parse),
 fs.readFile(path.join(root,"data/testimony-topics.json"),"utf8").then(JSON.parse),
 fs.readFile(path.join(root,"data/public-articles.json"),"utf8").then(JSON.parse),
 fs.readFile(path.join(root,"data/article-publication-allowlist.json"),"utf8").then(JSON.parse)
]);
const allowed=new Set(allowlist.articulos.filter(a=>a.autorizaWeb===true).map(a=>a.id));
const articles=publicArticles.articulos.filter(a=>allowed.has(a.id)&&a.estado==="PUBLICADO EN REVISTA PROPIA");
const rows=[
 ...mensajes.map(m=>["mensaje",m.slug,m.titulo]),
 ...temas.map(t=>["tema",t.slug,t.titulo]),
 ...articles.map(a=>["articulo",a.slug,a.titulo])
];
const ids=new Set(rows.map(x=>x[0]+":"+x[1]));
if(ids.size!==rows.length)throw new Error("Temas de discusión duplicados.");
function sql(s){return "'"+s.replace(/'/g,"''")+"'";}
const activate=process.env.ACTIVATE_COMMUNITY!=="false";
const values=rows.map(r=>" ("+r.map(sql).join(", ")+", "+(activate?"true":"false")+")").join(",\n");
const migration=[
 "-- GENERADO AUTOMÁTICAMENTE. Revise antes de ejecutar en Supabase DEDICADO.",
 "-- Sólo registra hilos para publicaciones aprobadas y temas propuestos.",
 "-- Estado habilitado: "+(activate?"SÍ (revisar aprobación antes de aplicar)":"NO, protección previa al lanzamiento"),
 "begin;",
 "update public.discussion_subjects set enabled=false;",
 "insert into public.discussion_subjects(kind,subject_id,title,enabled) values",
 values,
 "on conflict(kind,subject_id) do update set title=excluded.title, enabled=excluded.enabled;",
 "commit;",
 ""
].join("\n");
const out=path.join(root,"database","community-seed.sql");
await fs.writeFile(out,migration,"utf8");
console.log("SEMILLA DE COMUNIDAD: "+mensajes.length+" mensajes, "+articles.length+" artículos, "+temas.length+" temas = "+rows.length+" hilos. Habilitados: "+(activate?"SÍ":"NO")+". No se aplicó a ninguna base de datos.");

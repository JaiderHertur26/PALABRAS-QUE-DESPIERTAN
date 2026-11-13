/**
 * Pruebas HTTP del servidor de producción local.
 * npm run start -- -p 3191
 * $env:WEB_BASE_URL="http://localhost:3191"; npm run smoke
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const datos=JSON.parse(await fs.readFile(path.join(root,"data","site-content.json"),"utf8"));
const topics=JSON.parse(await fs.readFile(path.join(root,"data","testimony-topics.json"),"utf8"));
const articles=JSON.parse(await fs.readFile(path.join(root,"data","public-articles.json"),"utf8")).articulos;
const base=process.env.WEB_BASE_URL||"http://localhost:3191";
const routes=[
 "/","/revista","/mensajes","/articulos","/testimonios","/participar",
 "/series","/temporadas","/teologia","/autor","/contacto","/redes",
 "/buscar","/privacidad","/aviso-legal","/robots.txt","/icon.png",
 "/manifest.webmanifest","/sitemap.xml",
 ...datos.temporadas.map(t=>"/temporadas/"+t.id),
 ...datos.temporadas.flatMap(t=>t.series.map(s=>"/series/"+s.id)),
 ...datos.mensajes.map(m=>"/mensajes/"+m.slug),
 ...topics.map(t=>"/testimonios/"+t.slug),
 ...articles.map(a=>"/articulos/"+a.slug)
];
let ok=0;
for(const ruta of routes){
 const res=await fetch(base+ruta);
 assert.equal(res.status,200,ruta+" respondió "+res.status);
 if(!ruta.endsWith(".png")&&!ruta.endsWith(".webmanifest")&&!ruta.endsWith(".xml")){
  const html=await res.text();
  if(!ruta.endsWith(".txt")){
   assert.match(html,/<title>/,ruta+" carece de título HTML");
   assert.match(html,/PALABRAS|Palabras/,ruta+" no parece pertenecer al proyecto");
  } else { assert.match(html,/Allow:\s*\//,ruta+" debe permitir revista pública"); assert.match(html,/Disallow:\s*\/api\//,ruta+" debe restringir APIs privadas"); }
 }
 assert.equal(res.headers.get("x-content-type-options"),"nosniff",ruta);
 ok++;
}
const articlePage=await fetch(base+"/articulos/"+articles[0].slug).then(x=>x.text());
assert.match(articlePage,/Una lectura que continúa en diálogo/,"Los artículos deben incluir el diálogo moderado");
const testimonyPage=await fetch(base+"/testimonios/"+topics[0].slug).then(x=>x.text());
assert.match(testimonyPage,/Testimonios y respuestas/,"Los testimonios deben permitir comentarios y respuestas");
const archive=await fetch(base+"/mensajes").then(x=>x.text());
assert.match(archive,/Dios ya lo sabe/);
assert.doesNotMatch(archive,/La puerta que se abre/,"No debe verse un mensaje programado");
const blocked=await fetch(base+"/mensajes/pd-002-la-puerta-que-se-abre");
assert.equal(blocked.status,404,"El mensaje PD-002 programado no debe estar accesible");
const hiddenArticle=await fetch(base+"/articulos/manuscrito-no-autorizado");
assert.equal(hiddenArticle.status,404,"Los artículos no publicados deben responder 404");
const moderator=await fetch(base+"/moderacion",{redirect:"manual"});
assert.ok([307,308].includes(moderator.status),"Sin sesión el panel debe redirigir al acceso, no mostrar 404");
assert.match(moderator.headers.get("location")??"",/\/participar\?acceso=iniciar/,"La redirección debe explicar cómo identificarse");
const search=await fetch(base+"/buscar?q=ORACION").then(r=>r.text());
assert.match(search,/Dios ya lo sabe/,"La búsqueda debe ignorar tildes");
const comments=await fetch(base+"/api/comunidad/comentarios?tipo=mensaje&id=pd-001-dios-ya-lo-sabe");
assert.equal(comments.status,200,"La consulta debe responder sin exponer borradores");
const list=await comments.json();
assert.ok(Array.isArray(list.entries));
if(list.enabled===false)assert.equal(list.entries.length,0,"No simular comentarios cuando el backend no está configurado");
const unknown=await fetch(base+"/api/comunidad/comentarios?tipo=mensaje&id=pd-002-la-puerta-que-se-abre");
assert.equal(unknown.status,404,"No habilitar discusión para mensajes no publicados");
const failedPost=await fetch(base+"/api/comunidad/comentarios",{
 method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({tipo:"tema",id:topics[0].slug,nombre:"Anónimo",texto:"Una experiencia de prueba que no debe almacenarse.",consentimiento:false})
});
assert.ok([400,401,503].includes(failedPost.status),"No aceptar envíos sin sesión o consentimiento");
console.log("SMOKE HTTP APROBADO: "+ok+" rutas 200; contenido no publicado inaccesible; diálogo, privacidad, búsqueda, seguridad y moderación verificados.");

/**
 * Prueba HTTP del sitio ya compilado. Ejecución:
 *   npm run start -- -p 3190
 *   $env:WEB_BASE_URL='http://localhost:3190'; npm run smoke
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const {temporadas,mensajes}=JSON.parse(await fs.readFile(path.join(root,"data","site-content.json"),"utf8"));
const base=process.env.WEB_BASE_URL||"http://localhost:3190";
const routes=[
 "/","/mensajes","/series","/temporadas","/teologia","/autor",
 "/contacto","/redes","/buscar","/privacidad","/aviso-legal","/robots.txt","/icon.png",
 ...temporadas.map(t=>"/temporadas/"+t.id),
 ...temporadas.flatMap(t=>t.series.map(s=>"/series/"+s.id)),
 ...mensajes.map(m=>"/mensajes/"+m.slug)
];
let ok=0;
for(const ruta of routes){
 const res=await fetch(base+ruta);
 assert.equal(res.status,200,ruta+" respondió "+res.status);
 if(!ruta.endsWith(".png")){
  const html=await res.text();
  if(!ruta.endsWith(".txt")){
   assert.match(html,/noindex/,ruta+" carece de bloqueo de indexación");
   assert.match(html,/PALABRAS|Palabras/,ruta+" no parece pertenecer al proyecto");
  } else {
   assert.match(html,/Disallow:\s*\//,ruta+" no restringe indexación");
  }
 }
 assert.equal(res.headers.get("x-content-type-options"),"nosniff",ruta);
 ok++;
}
const mensaje=await fetch(base+"/mensajes").then(x=>x.text());
assert.match(mensaje,/Dios ya lo sabe/);
assert.doesNotMatch(mensaje,/La puerta que se abre/);
const primerMensaje=await fetch(base+"/mensajes/pd-002-la-puerta-que-se-abre");
assert.equal(primerMensaje.status,404,"No debe poder consultarse un mensaje programado");
const busqueda=await fetch(base+"/buscar?q=ORACION").then(x=>x.text());
assert.match(busqueda,/Dios ya lo sabe/,"El buscador debe ignorar tildes");
console.log("SMOKE HTTP APROBADO: "+ok+" rutas 200, bloqueo de borradores, búsqueda, 404, noindex y cabeceras.");

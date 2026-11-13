import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const snapshot=JSON.parse(await fs.readFile(path.join(web,"data","site-content.json"),"utf8"));
const allow=JSON.parse(await fs.readFile(path.join(web,"data","publication-allowlist.json"),"utf8"));
const autorizado=new Map(allow.publicaciones.filter(x=>x.autorizaWeb===true).map(x=>[x.id,x]));
function fallar(m){throw new Error("CONTROL EDITORIAL: "+m);}
const series=snapshot.temporadas.flatMap(t=>t.series);
if(snapshot.version!==2)fallar("versión de catálogo inesperada");
if(snapshot.temporadas.length!==12||series.length!==36)fallar("plan maestro incompleto");
if(snapshot.articulos.length!==0)fallar("existen artículos no autorizados en el snapshot público");
if(snapshot.mensajes.length>autorizado.size)fallar("hay mensajes que no pertenecen a la lista blanca");
if(new Set(snapshot.mensajes.map(m=>m.id)).size!==snapshot.mensajes.length)fallar("identificadores PD repetidos");

for(const m of snapshot.mensajes) {
 const permiso=autorizado.get(m.id);
 if(!permiso)fallar("mensaje público sin autorización: "+m.id);
 if(!/^PD-\d{3}$/.test(m.id)||!m.slug.startsWith(m.id.toLowerCase()+"-"))fallar("ID o slug inválido: "+m.id);
 if(!m.texto||!m.titulo||!m.referencia||!m.fecha||m.autor!=="P. Jaider Herrera Turizo")fallar("mensaje incompleto: "+m.id);
 if(!snapshot.temporadas.some(t=>t.id===m.temporada)||!series.some(s=>s.id===m.serie))fallar("relación editorial inválida: "+m.id);
 if(m.imagen!=="/mensajes/"+m.id.toLowerCase()+".png")fallar("ruta de imagen no permitida: "+m.id);
 const bytes=await fs.readFile(path.join(web,"public",m.imagen.slice(1)));
 const sha=createHash("sha256").update(bytes).digest("hex");
 if(sha!==permiso.sha256)fallar("SHA256 público no coincide: "+m.id);
 if(m.instagram&&(!m.instagram.startsWith("https://www.instagram.com/")&&!m.instagram.startsWith("https://instagram.com/")))fallar("enlace externo no validado");
}
for(const t of snapshot.temporadas) {
 const n=snapshot.mensajes.filter(m=>m.temporada===t.id).length;
 if(n!==t.publicaciones)fallar("recuento de temporada incorrecto: "+t.id);
 for(const s of t.series) {
  if(snapshot.mensajes.filter(m=>m.serie===s.id).length!==s.publicaciones)fallar("recuento de serie incorrecto: "+s.id);
 }
}
const identidad=[
 ["public/identidad/cruz-fondo.png","3ceb3342f306e0872cca6cb0edcffe661f498f35d5f10da0e296748bf6b2029b"],
 ["public/identidad/portada-oficial.png","259001b1803576f4c4cf7b7b5a0aa7a05c192b1a782468fe78501062f6d646d8"]
];
for(const [nombre,esperado] of identidad){
 const bytes=await fs.readFile(path.join(web,nombre));
 if(createHash("sha256").update(bytes).digest("hex")!==esperado)fallar("alteración gráfica: "+nombre);
}
console.log("CONTROL APROBADO: 12 temporadas, 36 series, "+snapshot.mensajes.length+" PD públicos permitidos, 0 ART publicados, originales íntegros.");

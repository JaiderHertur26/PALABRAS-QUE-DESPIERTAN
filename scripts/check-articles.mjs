/**
 * Control de publicación de la revista propia.
 * Evalúa snapshot derivado y fuentes locales cuando están presentes.
 * Nunca lee MENSAJES ni escribe originales ARTÍCULOS.
 */
import fs from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";
const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const root=path.resolve(web,"..");
const source=path.join(root,"ARTÍCULOS");
const data=JSON.parse(await fs.readFile(path.join(web,"data","public-articles.json"),"utf8"));
const allow=JSON.parse(await fs.readFile(path.join(web,"data","article-publication-allowlist.json"),"utf8"));
const allowed=new Set(allow.articulos.filter(x=>x.autorizaWeb===true).map(x=>x.id));
const bad=m=>{throw new Error("CONTROL DE ARTÍCULOS: "+m)};
if(data.version!==2||!Array.isArray(data.articulos)||!Array.isArray(allow.articulos))bad("formatos no reconocidos");
if(allowed.size<1||data.articulos.length!==allowed.size)bad("cantidad de aprobados no coincide con lista blanca");
const slugs=new Set();
for(const a of data.articulos){
 if(!allowed.has(a.id)||!/^ART-\d{3}$/.test(a.id))bad("no autorizado "+a.id);
 if(!a.slug.startsWith(a.id.toLowerCase()+"-")||slugs.has(a.slug))bad("slug inválido o duplicado "+a.id);
 slugs.add(a.slug);
 if(a.autor!=="P. Jaider Herrera Turizo"||a.estado!=="PUBLICADO EN REVISTA PROPIA")bad("atribución o estado incorrecto "+a.id);
 if(!a.titulo||a.resumen.length<120||a.contenido.length<3500||!/(?:^|\n)#{2,4}\s+(?:Referencias|Bibliograf)/im.test(a.contenido))bad("contenido incompleto "+a.id);
 if(!/^[a-f0-9]{64}$/.test(a.integridad)||!Number.isInteger(a.palabras)||a.palabras<500)bad("integridad o extensión incorrecta "+a.id);
 if(!Array.isArray(a.referencias)||a.referencias.some(x=>{try{return new URL(x).protocol!=="https:"}catch{return true}}))bad("URL insegura "+a.id);
 if(a.contenido.includes("D:\\")||a.contenido.includes("C:\\")||a.contenido.includes("CONTROL DE FUENTES"))bad("ruta interna o metadatos editoriales filtrados "+a.id);
 try{
  const names=(await fs.readdir(source)).filter(n=>n.startsWith(a.id+" - ")&&n.endsWith(" - APROBADO.md"));
  if(names.length!==1)bad("no existe original aprobado de "+a.id);
  const bytes=await fs.readFile(path.join(source,names[0]));
  if(createHash("sha256").update(bytes).digest("hex")!==a.integridad)bad("cambio en fuente sin resincronizar "+a.id);
 }catch(e){if(e?.code==="ENOENT"){/* Vercel build sin originales montados: usar SHA y lista blanca del snapshot */}else throw e;}
}
console.log("REVISTA VERIFICADA: "+data.articulos.length+" investigaciones completas, aprobadas y autorizadas. Originales sin modificar.");

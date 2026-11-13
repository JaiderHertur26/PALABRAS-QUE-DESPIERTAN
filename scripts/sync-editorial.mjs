/**
 * PALABRAS QUE DESPIERTAN · Importador editorial de solo lectura.
 *
 * Origen: MENSAJES; destino: exclusivamente PÁGINA WEB.
 * Un mensaje se publica en la web solo si:
 *   1) figura explícitamente en publication-allowlist.json,
 *   2) está confirmado como PUBLICADO en catálogo,
 *   3) está editorialmente APROBADO,
 *   4) tiene fecha real de publicación no futura,
 *   5) su ficha permite extraer el pensamiento aprobado y
 *   6) su imagen supera la comprobación SHA256.
 *
 * No se importa ningún borrador ni manuscrito ART. Nunca escribe en MENSAJES.
 */
import fs from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const raiz=path.resolve(web,"..");
const maestro=path.join(raiz,"MENSAJES");
const carpetaPublica=path.join(web,"public");
const origenGraficos=path.join(maestro,"IDENTIDAD EDITORIAL","RECURSOS GRAFICOS");
const assets=[
 ["FONDO_OFICIAL_CRUZ_DORADA.png","identidad/cruz-fondo.png","3ceb3342f306e0872cca6cb0edcffe661f498f35d5f10da0e296748bf6b2029b"],
 ["PORTADA_OFICIAL_PALABRAS_QUE_DESPIERTAN.png","identidad/portada-oficial.png","259001b1803576f4c4cf7b7b5a0aa7a05c192b1a782468fe78501062f6d646d8"]
];

function leerCSV(texto){
 const filas=[];let fila=[];let campo="";let comillas=false;
 const t=texto.replace(/^\uFEFF/,"");
 for(let i=0;i<t.length;i++){
  const c=t[i];
  if(c==='"'){
   if(comillas && t[i+1]==='"'){campo+='"';i++;}
   else comillas=!comillas;
  } else if(c===","&&!comillas){fila.push(campo);campo="";}
  else if((c==="\r"||c==="\n")&&!comillas){
   if(c==="\r"&&t[i+1]==="\n")i++;
   fila.push(campo);campo="";
   if(fila.some(x=>x!==""))filas.push(fila);
   fila=[];
  } else campo+=c;
 }
 if(comillas)throw new Error("CSV con comillas sin cerrar");
 if(campo||fila.length){fila.push(campo);filas.push(fila);}
 const [encabezados,...datos]=filas;
 if(!encabezados?.includes("ESTADO_PUBLICACION")||!encabezados.includes("ID"))throw new Error("Cabeceras inesperadas en el catálogo");
 return datos.map(celdas=>Object.fromEntries(encabezados.map((clave,i)=>[clave,celdas[i]??""])));
}

function temporadasDesdePlan(md){
 const lista=[];let actual;
 for(const linea of md.split(/\r?\n/)){
  const match=linea.match(/^\s*(\d{2})\.\s+(.+)$/);
  if(match){
   actual={id:"T"+match[1],numero:Number(match[1]),titulo:match[2].trim(),series:[],publicaciones:0};
   lista.push(actual);continue;
  }
  if(!actual)continue;
  if(actual.numero===7){
   const s=linea.match(/^\s*S(0[1-3])\.\s+(.+)$/);
   if(s)actual.series.push({id:actual.id+"-S"+s[1],titulo:s[2].replace(/\s*\([^)]*\)\s*$/,"").trim(),publicaciones:0});
  }else{
   for(const s of linea.matchAll(/(?:^|·)\s*([ABC])\.\s*([^·]+)/g)){
    actual.series.push({id:actual.id+"-S"+String(actual.series.length+1).padStart(2,"0"),titulo:s[2].trim(),publicaciones:0});
   }
  }
 }
 if(lista.length!==12||lista.some(t=>t.series.length!==3))throw new Error("Plan maestro incompleto o modificado: se esperaban 12 temporadas y 36 series");
 return lista;
}

function rutaEditorial(relativo){
 if(typeof relativo!=="string"||relativo.startsWith("/")||relativo.includes("\\")||relativo.split("/").some(x=>x===".."||x==="."||!x))throw new Error("Ruta editorial no segura");
 const absoluta=path.resolve(maestro,...relativo.split("/"));
 if(!absoluta.startsWith(maestro+path.sep))throw new Error("Ruta fuera de MENSAJES");
 return absoluta;
}
function sha256(bytes){return createHash("sha256").update(bytes).digest("hex");}
async function validarImagen(origen,destino,hashEsperado){
 if(!/^[a-f0-9]{64}$/i.test(hashEsperado))throw new Error("Huella SHA256 inválida");
 const bytes=await fs.readFile(origen);
 if(sha256(bytes)!==hashEsperado.toLowerCase())throw new Error("Integridad gráfica no verificada: "+origen);
 return {destino: path.join(carpetaPublica,...destino.split("/")), bytes};
}
function extraerPensamiento(md,id){
 const match=md.match(/## Pensamiento aprobado\s*\r?\n([\s\S]*?)(?=\r?\n\s*(?:## |\*\*(?:Fundamento|Referencia)|$))/i);
 if(!match)throw new Error("No aparece el encabezado Pensamiento aprobado en la ficha "+id);
 let texto=match[1].trim().replace(/^«/,"").replace(/»\s*\.?$/,"").trim();
 if(!texto||texto.length>1500||texto.includes("##"))throw new Error("Pensamiento no validable: "+id);
 return texto;
}
function instagramValidado(valor){
 if(!valor)return null;
 try{
  const url=new URL(valor);
  if(url.protocol==="https:"&&["instagram.com","www.instagram.com"].includes(url.hostname))return url.toString();
 }catch{}
 return null;
}
function slug(texto){
 return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

const [plan,csv,listaBlanca]=await Promise.all([
 fs.readFile(path.join(maestro,"PLAN MAESTRO - 12 TEMPORADAS.md"),"utf8"),
 fs.readFile(path.join(maestro,"CATALOGO_GENERAL_MENSAJES.csv"),"utf8"),
 fs.readFile(path.join(web,"data","publication-allowlist.json"),"utf8").then(JSON.parse)
]);
const temporadas=temporadasDesdePlan(plan);
const registros=leerCSV(csv);
const porId=new Map(registros.map(r=>[r.ID,r]));
if(porId.size!==registros.length)throw new Error("ID duplicado en el catálogo");
if(listaBlanca.version!==1||!Array.isArray(listaBlanca.publicaciones))throw new Error("Lista blanca inválida");

const publicados=[];
const escrituras=[];
const ids=new Set();
const hoy=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Bogota",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

for(const [origen,destino,hash] of assets)escrituras.push(await validarImagen(path.join(origenGraficos,origen),destino,hash));
for(const permiso of listaBlanca.publicaciones){
 if(!/^PD-\d{3}$/.test(permiso.id)||ids.has(permiso.id))throw new Error("ID inválido o duplicado en lista blanca");
 ids.add(permiso.id);
 if(permiso.autorizaWeb!==true)continue;
 const row=porId.get(permiso.id);
 if(!row)throw new Error("Mensaje autorizado no encontrado en catálogo: "+permiso.id);
 if(!/^PUBLICADO(?:\s|$)/i.test(row.ESTADO_PUBLICACION.trim())){
  console.log("Excluido: "+permiso.id+" todavía no figura como publicado.");
  continue;
 }
 if(!row.ESTADO_EDITORIAL.toUpperCase().includes("APROBADO"))throw new Error("Falta aprobación editorial para "+permiso.id);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(row.FECHA_PUBLICACION)||row.FECHA_PUBLICACION>hoy)throw new Error("Fecha pública no confirmada: "+permiso.id);
 const ficha=await fs.readFile(rutaEditorial(permiso.ficha),"utf8");
 const texto=extraerPensamiento(ficha,permiso.id);
 const nombreFicha=ficha.match(/\*\*Título:\*\*\s*(.+)/i)?.[1]?.trim();
 if(nombreFicha&&nombreFicha!==row.TITULO)throw new Error("El título difiere del catálogo: "+permiso.id);
 const destino=permiso.id.toLowerCase()+".png";
 escrituras.push(await validarImagen(rutaEditorial(permiso.grafica),"mensajes/"+destino,permiso.sha256));
 const temporada="T"+row.TEMPORADA,serie=temporada+"-S"+row.SERIE;
 const t=temporadas.find(x=>x.id===temporada);const s=t?.series.find(x=>x.id===serie);
 if(!t||!s)throw new Error("Serie inexistente en el plan: "+permiso.id);
 publicados.push({
  id:permiso.id,slug:permiso.id.toLowerCase()+"-"+slug(row.TITULO),
  titulo:row.TITULO,texto,referencia:row.REFERENCIAS,
  temporada,serie,fecha:row.FECHA_PUBLICACION,
  autor:"P. Jaider Herrera Turizo",imagen:"/mensajes/"+destino,
  instagram:instagramValidado(row.INSTAGRAM_URL)
 });
 t.publicaciones++;s.publicaciones++;
}

publicados.sort((a,b)=>a.id.localeCompare(b.id));
const datos={
 version:2,
 fuente:"PLAN MAESTRO - 12 TEMPORADAS.md + CATALOGO_GENERAL_MENSAJES.csv + lista blanca web",
 temporadas,mensajes:publicados,articulos:[]
};

/* Escribir solo después de completar todas las validaciones. */
for(const {destino,bytes} of escrituras){
 await fs.mkdir(path.dirname(destino),{recursive:true});
 await fs.writeFile(destino,bytes);
}
const salida=path.join(web,"data","site-content.json");
const temporal=salida+".tmp";
await fs.writeFile(temporal,JSON.stringify(datos,null,2)+"\n","utf8");
await fs.rename(temporal,salida);
const excluidos=registros.filter(r=>/^PUBLICADO(?:\s|$)/i.test(r.ESTADO_PUBLICACION.trim())&&!ids.has(r.ID));
if(excluidos.length)console.warn("Publicados en el catálogo pero sin permiso web explícito: "+excluidos.map(x=>x.ID).join(", "));
console.log("Sincronización segura: 12 temporadas, 36 series, "+publicados.length+" mensajes confirmados, 0 manuscritos públicos.");

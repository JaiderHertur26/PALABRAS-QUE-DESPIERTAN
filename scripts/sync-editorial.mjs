/**
 * Sincroniza una instantánea pública desde los archivos maestros SIN ESCRIBIRLOS.
 * Política conservadora: fecha real + estado PUBLICADO + aprobación + imagen auténtica.
 * El proceso se ejecuta manualmente. No publica borradores, artículos ni programados.
 */
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proyecto = path.resolve(web, "..");
const mensajes = path.join(proyecto, "MENSAJES");
const fuentesImagenes = path.join(mensajes, "IDENTIDAD EDITORIAL", "RECURSOS GRAFICOS");
const publicado01 = path.join(mensajes, "PENDIENTES", "T07 - LA ORACION QUE ABRE EL CORAZON");
const salidaImagenes = path.join(web, "public", "identidad");
const salidaMensajes = path.join(web, "public", "mensajes");

const originalAssets = [
  ["FONDO_OFICIAL_CRUZ_DORADA.png", "cruz-fondo.png", "3ceb3342f306e0872cca6cb0edcffe661f498f35d5f10da0e296748bf6b2029b"],
  ["PORTADA_OFICIAL_PALABRAS_QUE_DESPIERTAN.png", "portada-oficial.png", "259001b1803576f4c4cf7b7b5a0aa7a05c192b1a782468fe78501062f6d646d8"]
];

function parseCSV(csv) {
  const rows = []; let row = []; let field = ""; let inside = false;
  csv = csv.replace(/^\uFEFF/, "");
  for (let i=0; i<csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (inside && csv[i+1] === '"') { field += '"'; i++; }
      else inside = !inside;
    } else if (ch === "," && !inside) { row.push(field); field = ""; }
    else if ((ch === "\n" || ch === "\r") && !inside) {
      if (ch === "\r" && csv[i+1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(value => value !== "")) rows.push(row);
      row=[];
    } else field += ch;
  }
  if (inside) throw new Error("CSV inválido: comillas sin cerrar");
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...values] = rows;
  return values.map((cells) => Object.fromEntries(headers.map((key, i) => [key, cells[i] ?? ""])));
}
function slug(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function parseTemporadas(md) {
  const lista=[]; let actual;
  for (const linea of md.split(/\r?\n/)) {
    const titulo = linea.match(/^\s*(\d{2})\.\s+(.+)$/);
    if (titulo) {
      actual = {id: "T"+titulo[1], numero: Number(titulo[1]), titulo: titulo[2].trim(), series: [], publicaciones: 0};
      lista.push(actual); continue;
    }
    if (!actual) continue;
    if (actual.numero === 7) {
      const s=linea.match(/^\s*S(0[1-3])\.\s+(.+)$/);
      if(s) actual.series.push({id:actual.id+"-S"+s[1], titulo:s[2].replace(/\s*\([^)]*\)\s*$/, "").trim(), publicaciones:0});
    } else {
      for (const m of linea.matchAll(/(?:^|·)\s*([ABC])\.\s*([^·]+)/g)) {
        actual.series.push({id:actual.id+"-S"+String(actual.series.length+1).padStart(2,"0"), titulo:m[2].trim(), publicaciones:0});
      }
    }
  }
  if (lista.length !== 12 || lista.some(t => t.series.length !== 3)) throw new Error("Plan maestro inesperado: no hay 12 temporadas y 36 series.");
  return lista;
}
async function copiarVerificado(origen, destino, hashEsperado) {
  const buffer=await fs.readFile(origen);
  const hash=createHash("sha256").update(buffer).digest("hex");
  if (hash !== hashEsperado) throw new Error("La imagen original NO coincide con su SHA256: "+origen);
  await fs.mkdir(path.dirname(destino),{recursive:true});
  await fs.writeFile(destino, buffer);
}
const plan=await fs.readFile(path.join(mensajes,"PLAN MAESTRO - 12 TEMPORADAS.md"),"utf8");
const csv=await fs.readFile(path.join(mensajes,"CATALOGO_GENERAL_MENSAJES.csv"),"utf8");
const temporadas=parseTemporadas(plan);
const registros=parseCSV(csv);
if (registros.length !== 20) throw new Error("El catálogo ha cambiado; revisar su formato antes de sincronizar. Registros: "+registros.length);
for(const [nombre, destino, sha] of originalAssets)
  await copiarVerificado(path.join(fuentesImagenes,nombre), path.join(salidaImagenes,destino),sha);

const publicados=[];
for(const item of registros) {
  const estado=item.ESTADO_PUBLICACION.trim().toUpperCase();
  const editorial=item.ESTADO_EDITORIAL.toUpperCase();
  if (!/^PUBLICADO(?:\s|$)/.test(estado)) continue;
  if (!editorial.includes("APROBADO") || !/^\d{4}-\d{2}-\d{2}$/.test(item.FECHA_PUBLICACION))
    throw new Error("Publicación sin aprobación o fecha verificada: "+item.ID);
  // El archivo fuente y su hash quedan obligatoriamente comprobados, nunca se toma una imagen distinta.
  if(item.ID !== "PD-001") throw new Error("Mensaje publicado nuevo: validar ficha, ruta de imagen y SHA256 antes de publicarlo en la web: "+item.ID);
  const ficha=await fs.readFile(path.join(publicado01,"001 - DIOS_YA_LO_SABE.md"),"utf8");
  const texto=ficha.match(/## Pensamiento aprobado\s*\r?\n\s*([^\r\n]+)/i)?.[1]?.trim().replace(/^«|»[.\s]*$/g, "");
  if (!texto) throw new Error("Falta el texto aprobado de PD-001");
  await copiarVerificado(
    path.join(publicado01,"GRAFICAS","TARJETA OFICIAL ORIGINAL 001.png"),
    path.join(salidaMensajes,"pd-001.png"),
    "bd8f1eac71b6b2ff47643fb7a14dc69295d937bfb0b0480162b5825d995c6a83");
  const temporada="T"+item.TEMPORADA, serie=temporada+"-S"+item.SERIE;
  const mensaje={
    id:item.ID, slug:item.ID.toLowerCase()+"-"+slug(item.TITULO),
    titulo:item.TITULO, texto, referencia:item.REFERENCIAS,
    temporada, serie, fecha:item.FECHA_PUBLICACION,
    autor:"P. Jaider Herrera Turizo", imagen:"/mensajes/pd-001.png",
    instagram: /^https:\/\//.test(item.INSTAGRAM_URL) ? item.INSTAGRAM_URL : null
  };
  publicados.push(mensaje);
  const t=temporadas.find(s=>s.id===temporada);
  const s=t?.series.find(e=>e.id===serie);
  if(!t || !s) throw new Error("Mensaje sin serie válida: "+item.ID);
  t.publicaciones++; s.publicaciones++;
}
const datos={
  version:1,
  fuente:"PLAN MAESTRO - 12 TEMPORADAS.md + CATALOGO_GENERAL_MENSAJES.csv",
  temporadas, mensajes:publicados,
  // Los artículos internos y las publicaciones programadas NO se copian a la web.
  articulos:[]
};
await fs.mkdir(path.join(web,"data"),{recursive:true});
await fs.writeFile(path.join(web,"data","site-content.json"),JSON.stringify(datos,null,2)+"\n","utf8");
console.log("Sincronización segura completada: "+temporadas.length+" temporadas, "+temporadas.reduce((n,t)=>n+t.series.length,0)+" series, "+publicados.length+" mensajes públicos, 0 artículos públicos.");

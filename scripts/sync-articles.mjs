/**
 * Revista web de PALABRAS QUE DESPIERTAN.
 * Importación DE SOLO LECTURA de manuscritos ART-### APROBADOS;
 * no toca MENSAJES, ni los originales de ARTÍCULOS.
 */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.resolve(web,'..');
const root=path.join(project,'ARTÍCULOS');
const allow=JSON.parse(await fs.readFile(path.join(web,'data','article-publication-allowlist.json'),'utf8'));
if(allow.version!==1 || !Array.isArray(allow.articulos))throw Error('Lista blanca ART inválida');
const index=await fs.readFile(path.join(root,'INDICE MAESTRO - ARTICULOS Y MENSAJES.md'),'utf8');
const entradas=new Map();
for(const line of index.split(/\r?\n/)){
 const m=line.match(/^\|\s*(ART-\d{3})\s*\|\s*([^|]+)\|\s*([^|]+)\|/);
 if(m)entradas.set(m[1],{titulo:m[2].trim(),estado:m[3].trim()});
}
const files=await fs.readdir(root);
const idUsed=new Set(),slugUsed=new Set(),articles=[];
const anchor=s=>s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=s=>createHash('sha256').update(s).digest('hex');
function extract(source,caption){
 const lines=source.replace(/\r/g,'').split('\n');
 const i=lines.findIndex(x=>new RegExp('^#{2,3}\\s+'+caption+'\\s*$','i').test(x.trim()));
 if(i<0)return '';
 const body=[];
 for(let n=i+1;n<lines.length;n++){
  if(/^#{2,3}\s+/.test(lines[n]))break;
  body.push(lines[n]);
 }
 return body.join('\n').trim();
}
function fullArticle(source){
 const lines=source.replace(/\r/g,'').split('\n');
 let first=lines.findIndex(l=>/^#{2,3}\s+(?:(?:\d+\.\s+)?Introducci[oó]n|Estado de la cuesti[oó]n)/i.test(l.trim()));
 if(first<0)throw Error('Introducción de artículo no encontrada');
 const content=[];
 let lastHeading='';
 for(const line of lines.slice(first)){
  const h=line.match(/^#{2,4}\s+(.+)\s*$/);
  if(h) {
   const title=h[1].replace(/\*/g,'').trim();
   if(/^(?:Nota metodol[oó]gica|Nota de (?:control|revisi[oó]n|delimitaci[oó]n|evaluaci[oó]n|publicaci[oó]n|alcance acad[eé]mico)|Nota acad[eé]mica)/i.test(title) && /(referencias|bibliograf)/i.test(lastHeading))break;
   if(/^(?:Nota metodol[oó]gica|Nota de (?:control|revisi[oó]n|delimitaci[oó]n|evaluaci[oó]n|publicaci[oó]n|alcance acad[eé]mico)|Nota acad[eé]mica)/i.test(title)&&content.some(x=>/^(?:#{2,4}\s+)?(?:Referencias|Bibliograf)/i.test(x.trim())))break;
   lastHeading=title;
  }
  content.push(line);
 }
 const result=content.join('\n').trim();
 if(result.length<3500 || !/(?:^|\n)#{2,4}\s+(?:Referencias|Bibliograf)/im.test(result))throw Error('Artículo incompleto (cuerpo o bibliografía)');
 return result;
}
function firstParagraph(s){
 return s.split(/\n\s*\n/).map(x=>x.trim()).find(x=>x && !/^\*\*(Palabras clave|Keywords)\b/.test(x))?.replace(/\*\*/g,'') ?? '';
}

for(const entry of allow.articulos){
 const id=entry.id;
 if(!/^ART-\d{3}$/.test(id)||idUsed.has(id))throw Error('ID duplicado o inválido '+id);
 idUsed.add(id);
 if(entry.autorizaWeb!==true)continue;
 const matched=files.filter(n=>n.startsWith(id+' - ')&&n.endsWith(' - APROBADO.md'));
 if(matched.length!==1)throw Error('Debe existir un único manuscrito aprobado de '+id);
 const meta=entradas.get(id);
 if(!meta || !meta.estado.includes('APROBADO POR EL AUTOR'))throw Error('Falta aprobación en índice '+id);
 const source=await fs.readFile(path.join(root,matched[0]),'utf8');
 const header=source.slice(0,Math.min(source.indexOf('Resumen'),2200));
 if(!/\*\*Estado editorial:\*\*\s*APROBADO POR EL AUTOR/i.test(header))throw Error('Falta aprobación dentro del manuscrito '+id);
 const resumen=firstParagraph(extract(source,'Resumen'));
 const abstract=firstParagraph(extract(source,'Abstract'));
 const contenido=fullArticle(source);
 if(resumen.length<120 || contenido.length<3500)throw Error('Insuficiente contenido '+id);
 const refs=Array.from(new Set((contenido.match(/https?:\/\/[^\s<>)\]]+/g)||[])
  .map(s=>s.replace(/[.,;]+$/,'')))).filter(s=>{try{const u=new URL(s);return u.protocol==='https:'}catch{return false}});
 const titulo=meta.titulo.split(':')[0].trim();
 const sourceHeading=source.split(/\r?\n/).slice(0,16).find(line=>/^##\s+/.test(line)&&!/^##\s+(?:Resumen|Abstract|Introducci[oó]n)/i.test(line));
 const subtitulo=sourceHeading?sourceHeading.replace(/^##\s+/,'').trim():meta.titulo.slice(titulo.length).replace(/^:\s*/,'').trim();
 const slug=id.toLowerCase()+'-'+anchor(titulo).slice(0,90);
 if(slugUsed.has(slug))throw Error('Slug repetido '+slug);
 slugUsed.add(slug);
 articles.push({id,slug,titulo,subtitulo,
  resumen,abstract,contenido,referencias:refs,autor:'P. Jaider Herrera Turizo',
  fecha:'2026-11-13',fechaEdicion:'2026-11-13',estado:'PUBLICADO EN REVISTA PROPIA',
  integridad:hash(source),palabras:contenido.split(/\s+/).length
 });
}
articles.sort((a,b)=>a.id.localeCompare(b.id));
if(articles.length!==10)throw Error('Cantidad inesperada ART '+articles.length);
const dest=path.join(web,'data','public-articles.json');
const tmp=dest+'.tmp';
await fs.writeFile(tmp,JSON.stringify({version:2,fuente:'Derivado verificable de ARTÍCULOS; solo aprobados y autorizados',articulos:articles},null,2)+'\n','utf8');
await fs.rename(tmp,dest);
console.log('REVISTA: '+articles.length+' artículos autorizados; integridad SHA256 y metadatos. '+articles.reduce((n,a)=>n+a.palabras,0)+' palabras públicas.');

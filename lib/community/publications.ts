import topicsData from "@/data/testimony-topics.json";
import articlesData from "@/data/public-articles.json";
import articlePermissions from "@/data/article-publication-allowlist.json";
import {encontrarMensaje} from "@/lib/editorial";

export type TestimonioTema={
 slug:string;titulo:string;subtitulo:string;pregunta:string;
 introduccion:string;referencia:string;categoria:string;numero:string;destacado:boolean;
};
export type ArticuloPublico={
 id:string;slug:string;titulo:string;subtitulo:string;resumen:string;abstract:string;contenido:string;
 referencias:string[];fecha:string;fechaEdicion:string;autor:string;integridad:string;palabras:number;
 estado:string;imagen?:string;relacionados?:string[];
};

export const temas:readonly TestimonioTema[]=topicsData;
const permitidos=new Set(articlePermissions.articulos.filter(a=>a.autorizaWeb===true).map(a=>a.id));
export const articulos:readonly ArticuloPublico[]=articlesData.articulos.filter(a=>permitidos.has(a.id)&&a.estado==="PUBLICADO EN REVISTA PROPIA");
export const temaPorSlug=(slug:string)=>temas.find(t=>t.slug===slug);
export const articuloPorSlug=(slug:string)=>articulos.find(a=>a.slug===slug);

export type Contexto="mensaje"|"articulo"|"tema";
export function destinoPublico(tipo:string,id:string):{tipo:Contexto;id:string;titulo:string}|null{
 if(tipo==="mensaje") {
  const m=encontrarMensaje(id);return m?{tipo:"mensaje",id:m.slug,titulo:m.titulo}:null;
 }
 if(tipo==="articulo"){
  const a=articuloPorSlug(id);return a?{tipo:"articulo",id:a.slug,titulo:a.titulo}:null;
 }
 if(tipo==="tema"){
  const t=temaPorSlug(id);return t?{tipo:"tema",id:t.slug,titulo:t.titulo}:null;
 }
 return null;
}

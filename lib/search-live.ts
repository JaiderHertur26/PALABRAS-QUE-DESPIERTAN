import "server-only";
import {limpiarBusqueda,seriePorId} from "@/lib/editorial";
import {publicMensajes} from "@/lib/editorial-live";
export async function buscarPublicos(opciones:{q?:string;temporada?:string;serie?:string;orden?:string}={}){
 const query=limpiarBusqueda((opciones.q??"").slice(0,120));
 let items=(await publicMensajes()).filter(m=>{
  if(opciones.temporada&&m.temporada!==opciones.temporada)return false;
  if(opciones.serie&&m.serie!==opciones.serie)return false;
  if(!query)return true;
  const series=seriePorId(m.serie);
  return limpiarBusqueda([m.id,m.titulo,m.texto,m.referencia,series?.serie.titulo,series?.temporada.titulo].join(" ")).includes(query);
 });
 if(opciones.orden==="antiguos")items.sort((a,b)=>a.fecha.localeCompare(b.fecha));
 if(opciones.orden==="numero")items.sort((a,b)=>a.id.localeCompare(b.id));
 return items;
}

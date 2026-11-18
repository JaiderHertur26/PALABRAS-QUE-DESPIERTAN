import "server-only";
import {limpiarBusqueda,seriePorId} from "@/lib/editorial";
import {publicArticulos,publicMensajes} from "@/lib/editorial-live";

/** La fuente es siempre el catálogo público, filtrado por fecha en editorial-live. */
export async function buscarTodoPublico(q:string,tipo:"todos"|"mensajes"|"articulos"="todos"){
 const needle=limpiarBusqueda(q.slice(0,120));
 const [mensajes,articulos]=await Promise.all([
  tipo==="articulos"?Promise.resolve([]):publicMensajes(),
  tipo==="mensajes"?Promise.resolve([]):publicArticulos(),
 ]);
 const filteredMessages=mensajes.filter(m=>{
  if(!needle)return true;
  const grupo=seriePorId(m.serie);
  return limpiarBusqueda([m.id,m.titulo,m.texto,m.referencia,grupo?.serie.titulo,grupo?.temporada.titulo].join(" ")).includes(needle);
 });
 const filteredArticles=articulos.filter(a=>{
  if(!needle)return true;
  return limpiarBusqueda([a.id,a.titulo,a.subtitulo,a.resumen,a.contenido].join(" ")).includes(needle);
 }).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 return {mensajes:filteredMessages,articulos:filteredArticles,total:filteredMessages.length+filteredArticles.length};
}

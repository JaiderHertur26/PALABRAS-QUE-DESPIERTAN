import "server-only";
import {limpiarBusqueda,seriePorId} from "@/lib/editorial";
import {publicArticulos,publicMensajes} from "@/lib/editorial-live";
import {esTema,temasDeArticulo,temasDeMensaje,temasEditoriales,type TemaId} from "@/lib/editorial-topics";
export type TipoBusqueda="todos"|"mensajes"|"articulos";

function puntuar(needle:string,partes:Array<{texto:string;peso:number}>){
 if(!needle)return 0;
 let score=0;
 for(const {texto,peso} of partes){
  const hay=limpiarBusqueda(texto||"");
  if(hay.includes(needle))score+=peso+(hay===needle?2:0);
 }
 return score;
}

/** Siempre parte exclusivamente de publicArticulos/publicMensajes, que validan fecha y estado. */
export async function buscarTodoPublico(q:string,tipo:TipoBusqueda="todos",tema=""){
 const needle=limpiarBusqueda(q.slice(0,120));
 const temaActivo: TemaId|null=esTema(tema)?tema:null;
 const [mensajes,articulos]=await Promise.all([
  tipo==="articulos"?Promise.resolve([]):publicMensajes(),
  tipo==="mensajes"?Promise.resolve([]):publicArticulos()
 ]);
 const filteredMessages=mensajes.filter(m=>{
  if(temaActivo&&!temasDeMensaje(m).includes(temaActivo))return false;
  if(!needle)return true;
  const grupo=seriePorId(m.serie);
  return puntuar(needle,[
   {texto:m.titulo,peso:9},{texto:m.id,peso:8},{texto:m.referencia,peso:6},
   {texto:grupo?.serie.titulo||"",peso:3},{texto:grupo?.temporada.titulo||"",peso:2},
   {texto:m.texto,peso:4}
  ])>0;
 }).sort((a,b)=>{
  if(needle){
   const score=(m:typeof a)=>puntuar(needle,[{texto:m.titulo,peso:9},{texto:m.referencia,peso:6},{texto:m.texto,peso:4}]);
   const delta=score(b)-score(a);if(delta)return delta;
  }
  return b.fecha.localeCompare(a.fecha);
 });
 const filteredArticles=articulos.filter(a=>{
  if(temaActivo&&!temasDeArticulo(a).includes(temaActivo))return false;
  if(!needle)return true;
  return puntuar(needle,[
   {texto:a.titulo,peso:10},{texto:a.id,peso:8},{texto:a.subtitulo||"",peso:7},
   {texto:a.resumen,peso:4},{texto:a.contenido,peso:1}
  ])>0;
 }).sort((a,b)=>{
  if(needle){
   const score=(v:typeof a)=>puntuar(needle,[{texto:v.titulo,peso:10},{texto:v.subtitulo||"",peso:7},{texto:v.resumen,peso:4},{texto:v.contenido,peso:1}]);
   const delta=score(b)-score(a);if(delta)return delta;
  }
  return b.fecha.localeCompare(a.fecha);
 });
 const temasDisponibles=temasEditoriales.filter(t=>articulos.some(a=>temasDeArticulo(a).includes(t.id))||mensajes.some(m=>temasDeMensaje(m).includes(t.id))).map(t=>t.id);
 return {mensajes:filteredMessages,articulos:filteredArticles,total:filteredMessages.length+filteredArticles.length,temasDisponibles};
}

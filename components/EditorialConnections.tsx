import Link from "next/link";
import type {ArticuloPublico} from "@/lib/community/publications";
import type {Mensaje} from "@/lib/editorial";
import {enlacesDeFundamento} from "@/lib/editorial-links";
import {temaPorId,temasDeArticulo,temasDeMensaje} from "@/lib/editorial-topics";

export function EditorialConnections({articulos=[],mensajes=[],desde,codigo}:{
 articulos?:ArticuloPublico[];mensajes?:Mensaje[];desde:"articulo"|"mensaje";codigo:string;
}){
 const otros=desde==="mensaje"
  ?enlacesDeFundamento.filter(x=>x.mensaje===codigo).flatMap(x=>{
   const a=articulos.find(a=>a.id===x.articulo);
   return a?[{id:a.id,titulo:a.titulo,href:"/articulos/"+a.slug,etiqueta:"Investigación de fondo"}]:[];
  })
  :enlacesDeFundamento.filter(x=>x.articulo===codigo).flatMap(x=>{
   const m=mensajes.find(m=>m.id===x.mensaje);
   return m?[{id:m.id,titulo:m.titulo,href:"/mensajes/"+m.slug,etiqueta:"Reflexión vinculada"}]:[];
  });
 const actual=desde==="articulo"?articulos.find(a=>a.id===codigo):mensajes.find(m=>m.id===codigo);
 const etiquetas=actual
  ?desde==="articulo"?temasDeArticulo(actual as ArticuloPublico):temasDeMensaje(actual as Mensaje)
  :[];
 const catalogo=desde==="articulo"?"/mensajes":"/articulos";
 return <aside className="article-related" aria-labelledby="continue-reading-title">
  <p className="eyebrow">{otros.length?"LECTURAS VINCULADAS":"OTROS CAMINOS DE LECTURA"}</p>
  <h2 id="continue-reading-title">{otros.length?"Profundiza en esta idea":"Sigue descubriendo"}</h2>
  {otros.length>0
   ?<><p>Estas publicaciones desarrollan una relación temática concreta, cada una con su propio contexto y nivel de profundidad.</p>
      <div className="article-related-links">{otros.map(item=><Link key={item.id} href={item.href} prefetch={false}><small>{item.etiqueta} · {item.id}</small><strong>{item.titulo} ↗</strong></Link>)}</div></>
   :<p>Continúa por los temas de esta lectura o explora otras publicaciones de la revista. No se atribuye aquí un fundamento idéntico a contenidos distintos.</p>}
  {etiquetas.length>0&&<nav className="editorial-topic-links" aria-label="Temas de esta lectura">
   {etiquetas.map(id=><Link key={id} href={"/buscar?tema="+id} prefetch={false}>{temaPorId(id).nombre}</Link>)}
  </nav>}
  <p><Link className="text-link" href={catalogo} prefetch={false}>Explorar {desde==="articulo"?"mensajes publicados":"investigaciones publicadas"} ↗</Link></p>
 </aside>;
}

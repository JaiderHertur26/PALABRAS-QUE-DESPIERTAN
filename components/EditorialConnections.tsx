import Link from "next/link";
import type {ArticuloPublico} from "@/lib/community/publications";
import type {Mensaje} from "@/lib/editorial";

/** Lecturas en otros formatos, sin atribuir correspondencias doctrinales no revisadas. */
export function EditorialConnections({articulos=[],mensajes=[],desde}:{
 articulos?:ArticuloPublico[];mensajes?:Mensaje[];desde:"articulo"|"mensaje";
}){
 const items=desde==="articulo"
  ?mensajes.slice(0,2).map(m=>({key:m.id,titulo:m.titulo,href:"/mensajes/"+m.slug,categoria:"Reflexión breve · "+m.id}))
  :[...articulos].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,2).map(a=>({key:a.id,titulo:a.titulo,href:"/articulos/"+a.slug,categoria:"Investigación · "+a.id}));
 const catalogo=desde==="articulo"?"/mensajes":"/articulos";
 const nombre=desde==="articulo"?"mensajes publicados":"biblioteca de investigaciones";
 if(items.length===0)return <aside className="article-related">
  <p className="eyebrow">SIGUE LEYENDO</p><h2>Continúa tu recorrido</h2>
  <p>Explora otros contenidos de la revista cuando estén disponibles.</p>
  <Link className="text-link" href={catalogo}>Visitar {nombre} ↗</Link>
 </aside>;
 return <aside className="article-related" aria-labelledby="continue-reading-title">
  <p className="eyebrow">OTRAS LECTURAS DE LA REVISTA</p>
  <h2 id="continue-reading-title">Continúa tu recorrido</h2>
  <p>Descubre otras publicaciones de la revista. Cada contenido conserva su propio contexto y fundamento; no se presupone que desarrollen el mismo tema.</p>
  <div className="article-related-links">{items.map(item=><Link key={item.key} href={item.href}><small>{item.categoria}</small><strong>{item.titulo} ↗</strong></Link>)}</div>
  <p><Link className="text-link" href={catalogo}>Explorar {nombre} ↗</Link></p>
 </aside>;
}

import Link from "next/link";
import {esTema,temaPorId,type TemaId} from "@/lib/editorial-topics";
import type {TipoBusqueda} from "@/lib/search-all";
export function UnifiedSearchForm({q,tipo,tema,disponibles}:{
 q:string;tipo:TipoBusqueda;tema:string;disponibles:TemaId[];
}){
 const actual=esTema(tema)?tema:"";
 function rutaTema(id:string){
  const params=new URLSearchParams();
  if(q)params.set("q",q);
  if(tipo!=="todos")params.set("tipo",tipo);
  if(id)params.set("tema",id);
  const s=params.toString();
  return "/buscar"+(s?"?"+s:"");
 }
 return <form action="/buscar" method="GET" role="search" className="unified-search">
  <label htmlFor="busqueda-general">¿Qué deseas descubrir?</label>
  <div className="unified-search-controls">
   <input id="busqueda-general" name="q" type="search" defaultValue={q} maxLength={120}
    placeholder="Ej.: oración, creación, Colosenses 1" autoComplete="off"/>
   <label className="sr-only" htmlFor="tipo-busqueda">Tipo de contenido</label>
   <select id="tipo-busqueda" name="tipo" defaultValue={tipo}>
    <option value="todos">Todo el contenido</option>
    <option value="mensajes">Mensajes</option>
    <option value="articulos">Artículos</option>
   </select>
   <label className="sr-only" htmlFor="tema-busqueda">Tema</label>
   <select id="tema-busqueda" name="tema" defaultValue={actual}>
    <option value="">Todos los temas</option>
    {disponibles.map(id=><option key={id} value={id}>{temaPorId(id).nombre}</option>)}
   </select>
   <button className="button-gold" type="submit">Buscar</button>
  </div>
  <p>Explora únicamente contenidos publicados. Los mensajes también pueden filtrarse por temporada y serie en el <Link href="/mensajes">archivo de reflexiones</Link>.</p>
  {disponibles.length>0&&<nav className="editorial-topic-links" aria-label="Explorar temas publicados">
   <Link href={rutaTema("")} className={!actual?"is-current":undefined} aria-current={!actual?"page":undefined}>Todos</Link>
   {disponibles.map(id=><Link key={id} href={rutaTema(id)} className={actual===id?"is-current":undefined}
    aria-current={actual===id?"page":undefined}>{temaPorId(id).nombre}</Link>)}
  </nav>}
 </form>;
}

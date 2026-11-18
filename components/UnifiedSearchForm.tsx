import Link from "next/link";
export function UnifiedSearchForm({q,tipo}:{q:string;tipo:"todos"|"mensajes"|"articulos"}){
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
   <button className="button-gold" type="submit">Buscar</button>
  </div>
  <p>Busca únicamente entre contenidos publicados. Para filtrar por temporada o serie, visita el <Link href="/mensajes">archivo de mensajes</Link>.</p>
 </form>;
}

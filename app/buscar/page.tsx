import type { Metadata } from "next";
import { filtrarPublico } from "@/lib/editorial";
import { MessageCard } from "@/components/MessageCard";
export const metadata:Metadata={title:"Buscar"};
export default async function Buscar({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams; const encontrados=filtrarPublico(q);
 return <section className="shell content-page"><p className="eyebrow">BÚSQUEDA EN EL ARCHIVO PÚBLICO</p><h1>Buscar reflexiones</h1>
 <form action="/buscar" method="GET" role="search" className="search-form">
 <label htmlFor="q">Palabra, título o referencia bíblica</label>
 <div><input id="q" name="q" defaultValue={q} placeholder="Ej.: oración, Mateo..." maxLength={120}/>
 <button className="button-gold" type="submit">Buscar</button></div>
 </form>
 <p aria-live="polite">{encontrados.length} {encontrados.length===1?"mensaje disponible":"mensajes disponibles"}{q?" para «"+q+"»":""}.</p>
 <div className="cards-grid">{encontrados.map(m=><MessageCard mensaje={m} key={m.id}/>)}</div>
 </section>;
}

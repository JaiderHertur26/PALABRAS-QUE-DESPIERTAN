import type {Metadata} from "next";
import {buscarMensajes,temporadas,seriePorId} from "@/lib/editorial";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {ArchiveFilters} from "@/components/ArchiveFilters";
import {MessageCard} from "@/components/MessageCard";
import {SectionIntro} from "@/components/SectionIntro";

export const metadata:Metadata={title:"Buscar",robots:{index:false,follow:false}};
type Params={q?:string;temporada?:string;serie?:string;orden?:string};
export default async function Buscar({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const q=typeof p.q==="string"?p.q.slice(0,120):"";
 const temporada=temporadas.some(t=>t.id===p.temporada)?p.temporada:"";
 const serie=p.serie&&seriePorId(p.serie)?p.serie:"";
 const orden=p.orden==="antiguos"||p.orden==="numero"?p.orden:"recientes";
 const resultados=buscarMensajes({q,temporada,serie,orden});
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Buscar"}]}/>
  <SectionIntro eyebrow="BUSCADOR" title="Encuentra una palabra para tu camino" description="Busca entre las reflexiones publicadas, por palabra clave, referencia bíblica, serie o temporada."/>
  <ArchiveFilters q={q} temporada={temporada} serie={serie} orden={orden} action="/buscar"/>
  <p className="archive-count" role="status">{resultados.length} {resultados.length===1?"reflexión disponible":"reflexiones disponibles"}{q?" para «"+q+"»":""}</p>
  {resultados.length ? <div className="cards-grid">{resultados.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div>
   : <div className="empty-state"><h2>No hay coincidencias</h2><p>Intenta otra palabra, número de mensaje, serie o referencia bíblica. Los contenidos aún no publicados no aparecen en la búsqueda.</p></div>}
 </section>;
}

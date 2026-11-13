import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {seriePorId,mensajesDeSerie,temporadas,etiquetaEstado} from "@/lib/editorial";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {MessageCard} from "@/components/MessageCard";

export const dynamicParams = false;
export function generateStaticParams(){ return temporadas.flatMap(t=>t.series.map(s=>({id:s.id}))); }
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;const datos=seriePorId(id);
 return {title:datos?.serie.titulo??"Serie no disponible",description:datos? `Serie «${datos.serie.titulo}» de la temporada «${datos.temporada.titulo}».`:undefined};
}
export default async function SerieDetalle({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const datos=seriePorId(id);if(!datos)notFound();
 const {temporada,serie}=datos;const disponibles=mensajesDeSerie(serie.id);
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Series",href:"/series"},{texto:serie.titulo}]}/>
  <div className="collection-detail-head">
   <div><p className="eyebrow">{temporada.id} · SERIE {serie.id.slice(-2)}</p><h1>{serie.titulo}</h1>
   <p className="lead">Un itinerario dentro de <Link className="inline-link" href={`/temporadas/${temporada.id}`}>{temporada.titulo.toLocaleLowerCase("es")}</Link>.</p>
   <span className="publication-status">{etiquetaEstado(disponibles.length)}</span></div>
   <span className="large-ornament" aria-hidden="true">✦</span>
  </div>
  {disponibles.length ? <><div className="section-divider"><h2>Reflexiones publicadas</h2><span>{disponibles.length}</span></div>
    <div className="cards-grid">{disponibles.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div></>
    : <div className="empty-state"><h2>Esta serie aún no tiene mensajes publicados</h2><p>Forma parte del plan editorial, pero no se anticiparán aquí textos, imágenes ni fechas de publicaciones pendientes.</p><Link href="/mensajes" className="button-outline">Leer mensajes disponibles</Link></div>}
  <div className="end-link"><Link href="/series" className="text-link">Explorar otras series ↗</Link></div>
 </section>;
}

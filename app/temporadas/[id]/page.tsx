import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {temporadas,temporadaPorId,mensajesDeTemporada,etiquetaEstado} from "@/lib/editorial";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {MessageCard} from "@/components/MessageCard";
export const dynamicParams=false;
export function generateStaticParams(){return temporadas.map(t=>({id:t.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;const t=temporadaPorId(id);return {title:t?.titulo??"Temporada no disponible",description:t?`Temporada ${t.numero} de Palabras que despiertan, con tres series previstas.`:undefined};
}
export default async function TemporadaDetalle({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;const t=temporadaPorId(id);if(!t)notFound();
 const publicados=mensajesDeTemporada(id);
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Temporadas",href:"/temporadas"},{texto:t.titulo}]}/>
  <div className="collection-detail-head">
    <div><p className="eyebrow">TEMPORADA {String(t.numero).padStart(2,"0")}</p><h1>{t.titulo}</h1>
    <p className="lead">Tres series temáticas conectadas por un mismo itinerario de reflexión.</p>
    <span className="publication-status">{etiquetaEstado(t.publicaciones)}</span></div>
    <span className="huge-number" aria-hidden="true">{String(t.numero).padStart(2,"0")}</span>
  </div>
  <div className="section-divider"><h2>Sus tres series</h2><span>03</span></div>
  <div className="series-cards">{t.series.map((s,i)=><Link href={`/series/${s.id}`} className="series-card" key={s.id}>
   <span className="series-card-number">{String(i+1).padStart(2,"0")}</span>
   <span><strong>{s.titulo}</strong><small>{etiquetaEstado(s.publicaciones)}</small></span>
   <span className="card-arrow" aria-hidden="true">↗</span>
  </Link>)}</div>
  {publicados.length > 0 && <><div className="section-divider"><h2>Mensajes publicados</h2><span>{publicados.length}</span></div>
   <div className="cards-grid">{publicados.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div></>}
  {publicados.length === 0 && <p className="collection-hint">Los contenidos de esta temporada se incorporarán aquí cuando su publicación sea confirmada.</p>}
  <div className="end-link"><Link href="/temporadas" className="text-link">Ver las doce temporadas ↗</Link></div>
 </section>;
}

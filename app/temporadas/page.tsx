import type {Metadata} from "next";
import Link from "next/link";
import {temporadas,etiquetaEstado} from "@/lib/editorial";
import {publicMensajes} from "@/lib/editorial-live";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Temporadas",description:"Las doce temporadas del itinerario editorial Palabras que despiertan."};
export const dynamic="force-dynamic";
export default async function Temporadas() {
 const messages=await publicMensajes();
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Temporadas"}]}/>
  <SectionIntro eyebrow="EL GRAN ITINERARIO" title="Doce temporadas, un camino de fe" description="Cada temporada ilumina una dimensión de nuestra relación con Dios y con los demás. El recorrido editorial comenzó con la Temporada 07: Aprender a confiar."/>
  <div className="seasons-grid">
  {temporadas.map(t=><Link href={`/temporadas/${t.id}`} className={`season-card ${messages.some(m=>m.temporada===t.id)?"season-active":""}`} key={t.id}>
    <div className="season-topline"><span className="season-index">{String(t.numero).padStart(2,"0")}</span><span className="season-status">{etiquetaEstado(messages.filter(m=>m.temporada===t.id).length)}</span></div>
    <h2>{t.titulo}</h2>
    <ol>{t.series.map(s=><li key={s.id}>{s.titulo}</li>)}</ol>
    <span className="season-more">Explorar temporada <span aria-hidden="true">↗</span></span>
  </Link>)}
  </div>
 </section>;
}

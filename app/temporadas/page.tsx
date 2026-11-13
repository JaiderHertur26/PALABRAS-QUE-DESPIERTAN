import type {Metadata} from "next";
import Link from "next/link";
import {temporadas,etiquetaEstado} from "@/lib/editorial";
import {publicMensajes} from "@/lib/editorial-live";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Temporadas",description:"Temporadas con mensajes publicados en Palabras que despiertan."};
export const dynamic="force-dynamic";
export default async function Temporadas() {
 const messages=await publicMensajes();
 const visibles=temporadas.filter(t=>messages.some(m=>m.temporada===t.id));
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Temporadas"}]}/>
  <SectionIntro eyebrow="ITINERARIOS YA PUBLICADOS" title="Temporadas para leer" description="Aquí aparecen únicamente las temporadas que ya tienen mensajes públicos. Las demás permanecen en el Centro Editorial hasta su estreno."/>
  <div className="seasons-grid">
  {visibles.map(t=><Link href={`/temporadas/${t.id}`} className={`season-card ${messages.some(m=>m.temporada===t.id)?"season-active":""}`} key={t.id}>
    <div className="season-topline"><span className="season-index">{String(t.numero).padStart(2,"0")}</span><span className="season-status">{etiquetaEstado(messages.filter(m=>m.temporada===t.id).length)}</span></div>
    <h2>{t.titulo}</h2>
    <ol>{t.series.filter(s=>messages.some(m=>m.serie===s.id)).map(s=><li key={s.id}>{s.titulo}</li>)}</ol>
    <span className="season-more">Explorar temporada <span aria-hidden="true">↗</span></span>
  </Link>)}
  </div>
 </section>;
}

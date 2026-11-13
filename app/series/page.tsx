import type { Metadata } from "next";
import Link from "next/link";
import {temporadas, cuentaSeries, etiquetaEstado} from "@/lib/editorial";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";

export const metadata:Metadata={title:"Series",description:"Itinerarios temáticos del plan editorial de Palabras que despiertan."};
export default function Series() {
 return <section className="shell content-page inner-main">
 <Breadcrumbs items={[{texto:"Series"}]}/>
 <SectionIntro eyebrow="ITINERARIOS DE REFLEXIÓN" title="Series para recorrer la fe" description={`El proyecto contempla ${cuentaSeries} series agrupadas en doce temporadas. Cada una propone un camino de mensajes conectados, sin sustituir el estudio personal de la Palabra de Dios.`}/>
 <div className="series-sections">
  {[...temporadas].sort((a,b)=>a.id==="T07"?-1:b.id==="T07"?1:a.numero-b.numero).map(t=>
   <section className="series-section" key={t.id} aria-labelledby={`titulo-${t.id}`}>
    <div className="collection-heading">
      <span className="season-number">{String(t.numero).padStart(2,"0")}</span>
      <div><p className="eyebrow">TEMPORADA {String(t.numero).padStart(2,"0")}</p><h2 id={`titulo-${t.id}`}>{t.titulo}</h2></div>
      <Link href={`/temporadas/${t.id}`} className="text-link">Ver temporada ↗</Link>
    </div>
    <div className="series-cards">
     {t.series.map((s,i)=><Link href={`/series/${s.id}`} className="series-card" key={s.id}>
      <span className="series-card-number">{String(i+1).padStart(2,"0")}</span>
      <span><strong>{s.titulo}</strong><small>{etiquetaEstado(s.publicaciones)}</small></span>
      <span className="card-arrow" aria-hidden="true">↗</span>
     </Link>)}
    </div>
   </section>
  )}
 </div>
 </section>;
}

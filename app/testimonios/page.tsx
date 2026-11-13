import Link from "next/link";
import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {publicTemas} from "@/lib/editorial-live";
import {avisoTestimonios} from "@/lib/community/rules";
export const metadata:Metadata={title:"Testimonios",description:"Testimonios y diálogo desde la fe católica, en temas de oración, confianza, perdón, esperanza y servicio."};
export const dynamic="force-dynamic";
export default async function Testimonios(){
 const temas=await publicTemas();
 return <section className="shell content-page testimonials-page">
  <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Testimonios"}]}/>
  <SectionIntro eyebrow="LA FE QUE SE COMPARTE" title="Testimonios: historias que también despiertan" description="Un espacio para escuchar y compartir experiencias a la luz de la fe católica, con respeto por cada persona y sin confundir la vivencia personal con la enseñanza doctrinal."/>
  <div className="testimony-intro">
   <div className="testimony-intro-symbol" aria-hidden="true">✝</div>
   <div><p className="eyebrow">EL SENTIDO DE ESTE ESPACIO</p><h2>No buscamos relatos perfectos, sino experiencias contadas con verdad.</h2>
    <p>La esperanza, la oración, la confianza y el perdón se viven de formas diferentes. La comunidad se enriquece cuando aprendemos a escuchar sin juzgar ni convertir nuestra experiencia en una regla para los demás.</p>
    <Link href="/participar" className="text-link">Conocer las normas de participación ↗</Link>
   </div>
  </div>
  <div className="magazine-section-heading"><div><p className="eyebrow">DIÁLOGOS PROPUESTOS</p><h2>Elige un tema para conversar</h2></div><span className="topic-amount">{temas.length} temas</span></div>
  <div className="topic-grid">
   {temas.map(t=><Link href={`/testimonios/${t.slug}`} className="topic-card" key={t.slug}>
    <span className="topic-number">{t.numero}</span><p className="eyebrow">{t.categoria}</p><h3>{t.titulo}</h3><p className="topic-subtitle">{t.subtitulo}</p><blockquote>{t.pregunta}</blockquote><small>{t.referencia}</small><span className="topic-cta">Leer y participar ↗</span>
   </Link>)}
  </div>
  <div className="testimony-disclaimer"><span aria-hidden="true">✧</span><p>{avisoTestimonios}</p></div>
 </section>;
}

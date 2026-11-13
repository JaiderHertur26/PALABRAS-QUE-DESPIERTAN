import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {temaPorSlug,temas} from "@/lib/community/publications";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {Discussion} from "@/components/community/Discussion";
import {avisoTestimonios} from "@/lib/community/rules";
export const dynamicParams=false;
export function generateStaticParams(){return temas.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const t=temaPorSlug(slug);
 return {title:t?.titulo??"Tema no disponible",description:t?.subtitulo};
}
export default async function Tema({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const t=temaPorSlug(slug);if(!t)notFound();
 return <section className="shell content-page testimony-detail">
  <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Testimonios",href:"/testimonios"},{texto:t.titulo}]}/>
  <header className="topic-detail-header">
   <div><p className="eyebrow">TESTIMONIOS · TEMA {t.numero} · {t.categoria.toLocaleUpperCase("es")}</p>
    <h1>{t.titulo}</h1><p className="lead">{t.subtitulo}</p></div>
   <span className="topic-detail-number" aria-hidden="true">{t.numero}</span>
  </header>
  <div className="topic-reading"><p className="eyebrow">PARA SITUAR EL DIÁLOGO</p><p>{t.introduccion}</p>
   <p className="biblical-ref">Para meditar: {t.referencia}</p>
   <div className="topic-question"><span aria-hidden="true">“</span><h2>{t.pregunta}</h2></div>
  </div>
  <div className="testimony-disclaimer"><span aria-hidden="true">✧</span><p>{avisoTestimonios}</p></div>
  <Discussion tipo="tema" id={t.slug} titulo={t.titulo}/>
  <div className="end-link"><Link className="text-link" href="/testimonios">Explorar otros temas ↗</Link></div>
 </section>;
}

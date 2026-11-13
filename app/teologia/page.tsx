import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Teología",description:"Fundamento bíblico, doctrina católica y reflexión: el espacio de investigación de Palabras que despiertan."};
export default function Teologia(){
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Teología"}]}/>
  <SectionIntro eyebrow="PROFUNDIZAR EN LA FE" title="La fe que busca comprender" description="Un lugar para profundizar en los fundamentos de los mensajes: Sagrada Escritura, Tradición, Magisterio y reflexión teológica."/>
  <div className="theology-intro">
   <div className="theology-intro-art"><Image src="/identidad/cruz-fondo.png" alt="Cruz luminosa del fondo gráfico oficial" width={1024} height={1536} sizes="(max-width:800px) 96vw, 38vw"/></div>
   <div><p className="eyebrow">EL SENTIDO DE ESTA BIBLIOTECA</p><h2>Del pensamiento breve al fundamento profundo.</h2>
    <p>Las reflexiones de Palabras que despiertan no quieren quedarse en frases aisladas. La investigación teológica permitirá mostrar la relación entre una intuición pastoral, el contexto de la Escritura y la enseñanza de la Iglesia.</p>
    <p>Los artículos aprobados por el autor pueden leerse íntegramente en la revista web propia. Presentamos su fundamento bíblico, las fuentes de la Iglesia y las reflexiones teológicas con claridad y con referencias contrastables.</p>
    <Link className="text-link" href="/articulos">Visitar la biblioteca de artículos ↗</Link>
   </div>
  </div>
  <div className="section-divider"><h2>Cómo leeremos los artículos</h2></div>
  <div className="principles-grid">
   <article><span aria-hidden="true">01</span><h3>Palabra de Dios</h3><p>Lectura contextual de los textos bíblicos y respeto por su sentido.</p></article>
   <article><span aria-hidden="true">02</span><h3>La fe de la Iglesia</h3><p>Referencias verificables a la Tradición y al Magisterio, distinguidas de la reflexión personal.</p></article>
   <article><span aria-hidden="true">03</span><h3>Vida cotidiana</h3><p>Comprender para vivir con mayor profundidad, sin confundir acompañamiento espiritual con afirmaciones clínicas.</p></article>
  </div>
  <div className="empty-state theology-status"><h2>Biblioteca de investigación abierta</h2><p>Consulta los estudios completos de la revista Palabras que despiertan: creación, imagen de Dios, cruz, Espíritu Santo, confianza y oración, entre otros temas.</p><Link className="button-gold" href="/articulos">Explorar artículos publicados ↗</Link></div>
 </section>;
}

import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {autor} from "@/lib/editorial";
export const metadata:Metadata={title:"Sobre el autor",description:`${autor}, responsable editorial de Palabras que despiertan.`};
export default function Autor(){
 return <section className="shell content-page">
  <Breadcrumbs items={[{texto:"Sobre el autor"}]}/>
  <SectionIntro eyebrow="AUTORÍA Y MISIÓN" title={autor} description="Un proyecto de reflexión católica que une pensamientos breves, investigación teológica y preguntas para la vida."/>
  <div className="author-profile">
   <div className="author-photo-placeholder"><Image src="/identidad/cruz-fondo.png" alt="Cruz dorada, símbolo de Palabras que despiertan; no representa una fotografía del autor" width={1024} height={1536} sizes="(max-width:800px) 95vw, 35vw"/></div>
   <div><p className="eyebrow">PALABRAS QUE DESPIERTAN</p><h2>Una palabra puede iniciar un camino.</h2>
    <p>Este proyecto nace de una convicción pastoral: la fe también puede iluminar nuestra manera de comprender la existencia, de vivir las relaciones y de enfrentar las preguntas más hondas.</p>
    <p>Los pensamientos breves invitan a detenerse. Los artículos de investigación buscan dar profundidad a esas intuiciones, desde la Sagrada Escritura y la enseñanza de la Iglesia.</p>
    <p>La obra se identifica con la firma <strong>{autor}</strong>. La información biográfica ampliada y cualquier retrato se incorporarán únicamente con autorización del autor.</p>
    <Link href="/mensajes" className="button-outline">Conocer las reflexiones ↗</Link>
   </div>
  </div>
 </section>;
}

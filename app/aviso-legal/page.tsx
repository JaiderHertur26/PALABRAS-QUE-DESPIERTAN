import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {autor} from "@/lib/editorial";
export const metadata:Metadata={title:"Aviso legal",robots:{index:false,follow:false}};
export default function AvisoLegal(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Aviso legal"}]}/>
  <SectionIntro eyebrow="RESPONSABILIDAD EDITORIAL" title="Aviso legal" description="Criterios de autoría, participación y respeto a la identidad doctrinal de PALABRAS QUE DESPIERTAN."/>
  <div className="policy-content">
   <h2>Identidad y obra editorial</h2><p>El proyecto PALABRAS QUE DESPIERTAN identifica sus pensamientos y reflexiones con la firma <strong>{autor}</strong>. Su orientación expresa es católica, fiel a la Sagrada Escritura, la Tradición y el Magisterio de la Iglesia.</p>
   <h2>Autoría y reproducción</h2><p>La reproducción o adaptación de los pensamientos, artículos e imágenes originales fuera de los permisos aplicables requiere autorización. Los testimonios y comentarios pertenecen a sus autores, quienes conservan su responsabilidad sobre lo que compartan.</p>
   <h2>Diferenciar las voces</h2><p>La enseñanza de la Iglesia, el trabajo teológico del autor y las experiencias personales de los lectores no tienen el mismo nivel de autoridad. Los testimonios no constituyen declaraciones doctrinales ni acreditan por sí solos hechos sobrenaturales.</p>
   <h2>Moderación editorial</h2><p>La edición se reserva la revisión previa, rechazo o retirada razonada de comentarios y testimonios por motivos de dignidad, privacidad, respeto, seguridad, pertinencia o fidelidad a la línea editorial. Se permite expresar dudas y perspectivas distintas con respeto.</p>
   <h2>Finalidad y límites</h2><p>Los textos buscan suscitar reflexión y acompañamiento espiritual; no reemplazan la atención clínica, psicológica, legal ni la orientación pastoral personal cuando sean necesarias.</p>
   <p><Link href="/participar" className="text-link">Consultar normas de participación ↗</Link></p>
  </div>
 </section>;
}

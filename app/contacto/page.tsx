import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Contacto",description:"Contacto de la revista Palabras que despiertan.",robots:{index:true,follow:true}};
export default function Contacto(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Contacto"}]}/>
  <SectionIntro eyebrow="CERCANÍA Y COMUNIDAD" title="Hablemos desde la Palabra" description="Un espacio editorial para leer, dialogar, compartir testimonios y plantear dudas con serenidad y respeto."/>
  <div className="empty-state">
   <h2>Correo de la revista</h2>
   <p>Para consultas editoriales, aclaraciones sobre artículos, incidencias de participación y solicitudes relacionadas con tus datos personales, puedes escribir directamente al correo de PALABRAS QUE DESPIERTAN.</p>
   <p><a href="mailto:pquedespiertan@gmail.com" className="text-link">pquedespiertan@gmail.com</a></p>
   <p>Para preguntas sobre la fe y experiencias personales, evita incluir información sensible sobre otras personas o detalles propios de la confesión sacramental.</p>
  </div>
 </section>;
}

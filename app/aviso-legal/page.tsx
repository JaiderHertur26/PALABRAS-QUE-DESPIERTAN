import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {autor} from "@/lib/editorial";
export const metadata:Metadata={title:"Aviso legal",robots:{index:false,follow:false}};
export default function AvisoLegal(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Aviso legal"}]}/>
  <SectionIntro eyebrow="RESPONSABILIDAD EDITORIAL" title="Aviso legal" description="Criterios de autoría, lectura y uso responsable de los contenidos de Palabras que despiertan."/>
  <div className="policy-content">
   <h2>Identidad editorial</h2>
   <p>El proyecto Palabras que despiertan identifica sus pensamientos y reflexiones con la firma <strong>{autor}</strong>.</p>
   <h2>Contenido y autoría</h2>
   <p>Los pensamientos originales y las imágenes editoriales identificadas pertenecen a sus respectivos titulares. La reproducción o adaptación fuera de los permisos otorgados requiere autorización.</p>
   <h2>Referencias bíblicas</h2>
   <p>Una referencia a la Sagrada Escritura señala el fundamento o la inspiración de una reflexión, pero no significa que el pensamiento del autor sea una transcripción literal del texto bíblico.</p>
   <h2>Finalidad de este espacio</h2>
   <p>Los contenidos buscan formar y suscitar reflexión personal desde la fe católica. No sustituyen asesoramiento profesional médico, psicológico, jurídico ni otras intervenciones especializadas cuando sean necesarias.</p>
   <h2>Estado del sitio</h2>
   <p>Esta versión está en desarrollo editorial. La información operativa y los canales de contacto se completarán antes de la publicación definitiva.</p>
   <p><Link href="/contacto" className="text-link">Consultar la sección de contacto ↗</Link></p>
  </div>
 </section>;
}

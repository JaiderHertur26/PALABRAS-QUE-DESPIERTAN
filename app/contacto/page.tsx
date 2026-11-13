import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Contacto",robots:{index:false,follow:false}};
export default function Contacto(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Contacto"}]}/>
  <SectionIntro eyebrow="CERCANÍA Y COMUNIDAD" title="Hablemos desde la Palabra" description="Gracias por acercarte a este espacio. El proyecto está preparando un canal de contacto adecuado para acompañar sus publicaciones."/>
  <div className="empty-state">
   <h2>Canal de contacto en preparación</h2>
   <p>Por seguridad y respeto a la privacidad, el formulario de mensajes se activará únicamente cuando exista un destino de recepción autorizado y se disponga de mecanismos de protección de datos y prevención del correo no deseado.</p>
   <Link href="/redes" className="button-outline">Ver redes disponibles ↗</Link>
  </div>
 </section>;
}

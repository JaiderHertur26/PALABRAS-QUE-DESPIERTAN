import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {mensajes} from "@/lib/editorial";
export const metadata:Metadata={title:"Redes"};
export default function Redes(){
 const enlace=mensajes[0]?.instagram;
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Redes"}]}/>
  <SectionIntro eyebrow="COMUNIDAD Y DIFUSIÓN" title="Compartir una palabra que haga bien" description="Las redes sociales acercan cada pensamiento a los lectores. Esta página reúne el archivo permanente de las reflexiones cuya publicación ha sido confirmada."/>
  <div className="social-section"><span className="social-symbol" aria-hidden="true">◎</span><div><h2>Instagram</h2>
   <p>El primer mensaje de la obra, «Dios ya lo sabe», fue registrado como publicado en Instagram. Accede a su publicación desde el enlace documentado.</p>
   {enlace && <a className="button-outline" href={enlace} target="_blank" rel="noopener noreferrer">Ver la publicación PD-001 ↗</a>}
  </div></div>
  <div className="social-section"><span className="social-symbol" aria-hidden="true">f</span><div><h2>Facebook</h2>
   <p>«Palabras que despiertan» también se difunde en Facebook. El enlace directo a la página se incorporará cuando haya sido verificado.</p>
  </div></div>
  <p className="social-note">El proyecto no publica cifras de seguidores ni enlaza perfiles no confirmados.</p>
  <div className="end-link"><Link href="/mensajes" className="text-link">Ir al archivo de mensajes ↗</Link></div>
 </section>;
}

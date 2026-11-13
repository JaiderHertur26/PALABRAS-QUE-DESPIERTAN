import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {AuthPanel} from "@/components/community/AuthPanel";
import {avisoTestimonios,reglasParticipacion} from "@/lib/community/rules";
export const metadata:Metadata={title:"Normas de participación",description:"Cómo comentar, responder y compartir testimonios con respeto y seguridad."};
export default function Participar(){
 return <section className="shell content-page participate-page">
  <Breadcrumbs items={[{texto:"Participar"}]}/>
  <SectionIntro eyebrow="COMUNIDAD · CONVERSACIÓN Y RESPETO" title="Una comunidad que escucha antes de responder" description="Los mensajes, artículos y testimonios pueden convertirse en espacios de encuentro. Queremos conversaciones abiertas a las preguntas, respetuosas con las personas y fieles a la identidad católica del proyecto."/>
  <div className="participate-layout"><div>
   <h2>Principios para conversar</h2>
   <ol className="rules-list">{reglasParticipacion.map((r,i)=><li key={r}><span>{String(i+1).padStart(2,"0")}</span><p>{r}</p></li>)}</ol>
   <div className="testimony-disclaimer"><span aria-hidden="true">✧</span><p>{avisoTestimonios}</p></div>
  </div><aside className="participate-aside">
   <p className="eyebrow">CÓMO FUNCIONA</p><h2>Tres pasos para participar</h2>
   <div className="participate-steps"><p><strong>1. Identifícate con tu correo.</strong> Recibirás un enlace de acceso que permite verificar que eres una persona real.</p>
   <p><strong>2. Escribe con libertad y cuidado.</strong> Puedes comentar un texto, responder a otro lector o compartir tu experiencia en un tema propuesto.</p>
   <p><strong>3. Publica y dialoga.</strong> La participación aparecerá al enviarla con correo verificado. Puedes responder y reportar contenidos que incumplan las normas; la edición podrá retirarlos.</p></div>
   <p className="community-auth-note">El inicio de sesión permite identificar al equipo editorial. La publicación de nuevos comentarios para todos los lectores se activará cuando esté operativo el correo de acceso de Supabase.</p>
   <AuthPanel soloAcceso/>
   <Link className="button-outline" href="/testimonios">Explorar los testimonios ↗</Link>
  </aside></div>
 </section>;
}

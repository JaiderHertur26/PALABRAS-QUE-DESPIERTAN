import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {usuarioVerificado,esModerador,clienteModeracion} from "@/lib/supabase/server";
import {ModerationConsole} from "@/components/community/ModerationConsole";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Moderación editorial",robots:{index:false,follow:false}};
export default async function Moderacion(){
 const {user}=await usuarioVerificado();
 if(!user||!clienteModeracion()||!await esModerador(user.id))notFound();
 return <section className="shell content-page">
  <p className="eyebrow">ÁREA INTERNA · ACCESO RESTRINGIDO</p><h1>Centro de moderación editorial</h1>
  <p className="lead">Ningún comentario ni testimonio aparece públicamente sin revisión. Protege la identidad de los lectores y valora el contenido con caridad, justicia y prudencia.</p>
  <ModerationConsole/>
 </section>;
}

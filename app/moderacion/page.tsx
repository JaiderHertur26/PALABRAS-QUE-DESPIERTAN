import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {usuarioVerificado,esModerador,clienteModeracion} from "@/lib/supabase/server";
import {ModerationConsole} from "@/components/community/ModerationConsole";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Moderación editorial",robots:{index:false,follow:false}};
export default async function Moderacion(){
 const {user}=await usuarioVerificado();
 if(!user?.email_confirmed_at||!clienteModeracion()||!await esModerador(user.id))notFound();
 return <section className="shell content-page">
  <p className="eyebrow">ÁREA INTERNA · ACCESO RESTRINGIDO</p><h1>Centro de moderación editorial</h1>
  <p className="lead">Las participaciones de usuarios con correo verificado se publican directamente. Desde aquí podrás atender reportes, retirar contenidos indebidos y consultar las decisiones editoriales con prudencia.</p>
  <ModerationConsole/>
 </section>;
}

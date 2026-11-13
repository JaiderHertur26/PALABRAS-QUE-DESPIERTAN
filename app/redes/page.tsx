import type {Metadata} from "next";
import Link from "next/link";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
import {SocialIcon} from "@/components/SocialLinks";
import {socialAccounts} from "@/lib/social";

export const metadata: Metadata = {
  title: "Redes sociales",
  description: "Accede a las cuentas oficiales de Palabras que despiertan en Facebook e Instagram."
};

export default function Redes(){
  return <section className="shell content-page narrow">
    <Breadcrumbs items={[{texto:"Redes"}]}/>
    <SectionIntro eyebrow="COMUNIDAD Y DIFUSIÓN" title="Síguenos y comparte la fe"
      description="Continúa la lectura y acompaña nuestras reflexiones en los perfiles oficiales de Facebook e Instagram."/>

    <div className="social-directory">
      {socialAccounts.map(account=><article className="social-section" key={account.id}>
        <span className="social-symbol" aria-hidden="true"><SocialIcon id={account.id}/></span>
        <div>
          <h2>{account.nombre}</h2>
          <p>{account.descripcion}</p>
          <p className="social-profile-name">{account.usuario}</p>
          <a className="button-outline" href={account.url}
            target="_blank" rel="noopener noreferrer"
            aria-label={"Abrir nuestra cuenta oficial de "+account.nombre+" en una pestaña nueva"}>
            Visitar {account.nombre} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>)}
    </div>

    <p className="social-note">Los enlaces conducen directamente a las cuentas oficiales. Se abrirán en una pestaña nueva.</p>
    <div className="end-link"><Link href="/mensajes" className="text-link">Ir al archivo de mensajes ↗</Link></div>
  </section>;
}

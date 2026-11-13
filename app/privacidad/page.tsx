import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Privacidad",robots:{index:false,follow:false}};
export default function Privacidad(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Privacidad"}]}/>
  <SectionIntro eyebrow="INFORMACIÓN DEL SITIO" title="Privacidad y tratamiento de datos" description="Información provisional sobre las funciones de esta primera versión. Se revisará antes del lanzamiento público definitivo."/>
  <div className="policy-content">
   <h2>Lectura sin registro</h2>
   <p>En la versión actual puedes consultar los mensajes públicos sin crear una cuenta. No existe un formulario de registro ni se solicitan datos personales mediante el sitio.</p>
   <h2>Contacto</h2>
   <p>El formulario de contacto no está habilitado porque aún no hay un canal de recepción aprobado ni un proceso definido para gestionar los mensajes de los lectores.</p>
   <h2>Servicios técnicos</h2>
   <p>Cuando el sitio se aloje en una plataforma, el proveedor de infraestructura podrá procesar datos técnicos indispensables para servir las páginas, como solicitudes y registros operativos, de acuerdo con sus políticas. Esta versión no incorpora herramientas propias de analítica publicitaria ni rastreadores de mercadeo.</p>
   <h2>Enlaces externos</h2>
   <p>Al visitar un enlace hacia Instagram u otra plataforma, se aplican las condiciones de privacidad del servicio de destino.</p>
   <h2>Antes del lanzamiento</h2>
   <p>Se completará esta información con los datos de contacto autorizados, los servicios efectivamente utilizados y los procedimientos que correspondan. Este texto no sustituye una política jurídica revisada para un despliegue público definitivo.</p>
  </div>
 </section>;
}

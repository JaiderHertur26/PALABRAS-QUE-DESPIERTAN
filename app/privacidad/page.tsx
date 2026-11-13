import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";
export const metadata:Metadata={title:"Privacidad",robots:{index:false,follow:false}};
export default function Privacidad(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Privacidad"}]}/>
  <SectionIntro eyebrow="INFORMACIÓN PROVISIONAL" title="Privacidad y tratamiento de datos" description="Estas medidas describen el sistema previsto para comentarios y testimonios. La política definitiva, los responsables y los canales para ejercer derechos deberán aprobarse antes de habilitar la participación pública."/>
  <div className="policy-content">
   <h2>Lectura sin crear una cuenta</h2><p>La lectura pública no requiere registro. Para dejar comentarios, responder o enviar testimonios se prevé la verificación mediante un enlace enviado al correo electrónico.</p>
   <h2>Datos que se tratarían al participar</h2><p>El proveedor de autenticación conservaría los datos necesarios para verificar la cuenta. La revista registraría el nombre público elegido, el texto enviado, su tema, fecha, estado editorial y referencia técnica de la cuenta. El correo y las referencias de cuenta no aparecerían en las publicaciones visibles.</p>
   <h2>Revisión antes de publicar</h2><p>Ninguna aportación se mostraría públicamente sin revisión. Los moderadores autorizados podrían leer el contenido pendiente, atender reportes, aprobar o rechazar publicaciones y conservar un historial de decisiones para seguridad editorial.</p>
   <h2>Información que no debes publicar</h2><p>No compartas datos de menores, información médica o íntima, situaciones personales identificables de terceros, datos de contacto privados ni confidencias sacramentales. Un testimonio es una experiencia personal que se comparte voluntariamente.</p>
   <h2>Derechos, conservación y contacto</h2><p>Antes del lanzamiento se definirán el responsable del tratamiento, la base jurídica aplicable, el tiempo de conservación, los procedimientos para solicitudes de consulta o eliminación y un canal de contacto verificado. Hasta que esto ocurra, el envío de participaciones permanecerá cerrado.</p>
   <h2>Servicios técnicos y enlaces</h2><p>El alojamiento y la autenticación pueden procesar datos técnicos indispensables para el funcionamiento. Los enlaces externos se rigen por las condiciones del servicio de destino. La versión actual no incorpora analítica publicitaria propia.</p>
  </div>
 </section>;
}

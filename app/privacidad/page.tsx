import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {SectionIntro} from "@/components/SectionIntro";

export const metadata:Metadata={title:"Privacidad y protección de datos",description:"Tratamiento de datos y derechos de los lectores de Palabras que despiertan."};
export default function Privacidad(){
 return <section className="shell content-page narrow">
  <Breadcrumbs items={[{texto:"Privacidad"}]}/>
  <SectionIntro eyebrow="PRIVACIDAD DE LOS LECTORES" title="Política de tratamiento de datos personales" description="Información clara sobre el acceso, las conversaciones, los testimonios y el ejercicio de tus derechos."/>
  <div className="policy-content">
   <h2>Responsable y contacto</h2>
   <p>El proyecto editorial PALABRAS QUE DESPIERTAN, dirigido por el P. Jaider Herrera Turizo, administra los contenidos y la participación de la revista. Para consultas y solicitudes relacionadas con tus datos, escribe a <a href="mailto:pquedespiertan@gmail.com">pquedespiertan@gmail.com</a>.</p>
   <h2>¿Qué información recogemos?</h2>
   <p>Leer la revista no exige registrarse. Si decides participar, usamos tu correo electrónico para verificar el acceso y conservar la cuenta; recogemos el seudónimo o nombre público que elijas, el texto de comentarios y testimonios, su tema, la fecha, los reportes de seguridad y los registros imprescindibles para administrar la comunidad. Tu correo, el identificador interno de usuario y los reportes no se publican.</p>
   <h2>Estadísticas anónimas de lectura</h2>
   <p>Para comprender qué partes de la revista son más consultadas, contamos páginas vistas en la portada, artículos, mensajes, testimonios y secciones. Este conteo no requiere registrarse ni emplea cookies analíticas, identificadores persistentes, huellas digitales o perfiles individuales. Guardamos únicamente la fecha en horario colombiano y el identificador público de la sección o publicación consultada. No almacenamos la dirección IP, el correo ni el navegador del lector en estas estadísticas. Las cifras expresan páginas vistas, no personas únicas, y pueden ser aproximadas debido a bloqueadores o navegación sin JavaScript. El resumen es accesible únicamente a la dirección editorial.</p>
   <h2>Finalidad y autorización</h2>
   <p>Estos datos se usan exclusivamente para permitir el acceso, publicar tus participaciones, organizar respuestas, prevenir abusos, atender denuncias y gestionar solicitudes sobre tu información. Antes de publicar debes aceptar expresamente las normas de participación y el tratamiento aquí descrito. La participación es voluntaria y no condiciona la lectura.</p>
   <h2>Publicación de comentarios y testimonios</h2>
   <p>Los comentarios de usuarios con correo verificado se hacen públicos después de superar comprobaciones automáticas de seguridad, sin aprobación editorial previa. Se muestra el nombre público elegido y el texto. La dirección editorial podrá retirar contenidos abusivos, improcedentes o que expongan datos personales, y conservar registros de actuaciones para seguridad y atención de reclamaciones.</p>
   <h2>Servicios y transferencias</h2>
   <p>El sitio emplea Vercel para el alojamiento y Supabase para autenticación y datos de la comunidad. Estos proveedores pueden tratar información técnica en otras jurisdicciones conforme a sus condiciones. No vendemos datos de lectores ni habilitamos publicidad personalizada propia.</p>
   <h2>Seguridad y conservación</h2>
   <p>Aplicamos acceso restringido por funciones, verificación de correo, límites contra envíos excesivos y mecanismos de denuncia. Conservamos los datos mientras la cuenta y las participaciones sean necesarias para las finalidades indicadas o para gestionar solicitudes legítimas. Las solicitudes de eliminación se estudiarán atendiendo a las obligaciones legales y la integridad de las conversaciones.</p>
   <h2>Tus derechos</h2>
   <p>Puedes solicitar información, consulta, corrección, actualización, supresión o revocación del consentimiento escribiendo a <a href="mailto:pquedespiertan@gmail.com">pquedespiertan@gmail.com</a>, indicando desde el mismo correo de tu cuenta la petición y, si corresponde, el enlace a la publicación. Responderemos conforme a las normas colombianas de protección de datos personales, especialmente la Ley 1581 de 2012 y sus disposiciones aplicables.</p>
   <h2>Cuidado de la privacidad de terceros</h2>
   <p>No publiques datos de niños, niñas o adolescentes, información médica identificable, datos de contacto privados de otras personas, ni revelaciones protegidas por secreto pastoral o sacramental. Si identificas una publicación problemática, utiliza «Reportar» o escribe al correo editorial.</p>
   <p><strong>Actualizada:</strong> 13 de noviembre de 2026.</p>
  </div>
 </section>;
}

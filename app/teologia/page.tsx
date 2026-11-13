import type { Metadata } from "next";
export const metadata:Metadata={title:"Teología"};
export default function Teologia(){
 return <section className="shell content-page narrow"><p className="eyebrow">BIBLIOTECA TEOLÓGICA</p><h1>La fe que busca comprender</h1>
 <p className="lead">Este espacio reunirá investigaciones sobre la Sagrada Escritura, la tradición viva de la Iglesia y sus vínculos con los mensajes breves.</p>
 <div className="empty-state"><h2>Artículos en preparación editorial</h2><p>Existen manuscritos de trabajo, pero aún no han recibido autorización para aparecer en la página pública. Sus textos y archivos permanecen protegidos en el área editorial.</p></div>
 </section>;
}

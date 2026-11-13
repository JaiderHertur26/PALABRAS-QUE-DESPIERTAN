import type { Metadata } from "next";
export const metadata:Metadata={title:"Contacto"};
export default function Contacto(){
 return <section className="shell content-page narrow"><p className="eyebrow">COMUNIDAD Y CONTACTO</p><h1>Contacto</h1>
 <p className="lead">Gracias por acercarte a Palabras que despiertan.</p>
 <div className="empty-state"><h2>Canal de contacto en preparación</h2>
 <p>Para proteger la privacidad del autor y de los lectores, no se mostrará un formulario sin destino verificado ni mecanismos contra spam y tratamiento de datos adecuados.</p>
 </div></section>;
}

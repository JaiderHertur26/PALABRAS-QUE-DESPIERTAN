import type { Metadata } from "next";
import {autor} from "@/lib/editorial";
export const metadata:Metadata={title:"Sobre el autor"};
export default function Autor(){
 return <section className="shell content-page narrow"><p className="eyebrow">SOBRE EL AUTOR</p><h1>{autor}</h1>
 <p className="lead">«Palabras que despiertan» es una propuesta de reflexión católica que busca iluminar la vida cotidiana desde la fe y suscitar una relación más profunda con Dios.</p>
 <p>Las reflexiones y sus fundamentos teológicos se presentan con fidelidad a la Sagrada Escritura y a la enseñanza de la Iglesia.</p>
 <p>La biografía ampliada se incorporará cuando el autor apruebe el texto y, en su caso, proporcione una fotografía autorizada.</p></section>;
}

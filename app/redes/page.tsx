import type { Metadata } from "next";
import Link from "next/link";
import { mensajes } from "@/lib/editorial";
export const metadata:Metadata={title:"Redes"};
export default function Redes(){
 const reciente=mensajes[0];
 return <section className="shell content-page narrow"><p className="eyebrow">CANALES DE DIFUSIÓN</p><h1>Redes</h1>
 <p className="lead">Las reflexiones se difunden en Facebook e Instagram. La página web conservará el archivo de los mensajes cuya publicación se confirme.</p>
 {reciente?.instagram && <p><a className="button-outline" href={reciente.instagram} target="_blank" rel="noopener noreferrer">Ver PD-001 en Instagram</a></p>}
 <p>La dirección pública de Facebook se incorporará cuando quede verificada. No se muestran enlaces no confirmados.</p>
 <p><Link href="/mensajes" className="text-link">Leer el archivo público</Link></p>
 </section>;
}

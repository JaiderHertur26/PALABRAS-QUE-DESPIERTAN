import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import { encontrarMensaje, mensajes } from "@/lib/editorial";
export function generateStaticParams(){ return mensajes.map(m=>({slug:m.slug})); }
export async function generateMetadata({params}: {params:Promise<{slug:string}>}):Promise<Metadata> {
 const {slug}=await params; const m=encontrarMensaje(slug);
 return {title:m?.titulo??"Mensaje no disponible",description:m?.texto};
}
export default async function DetalleMensaje({params}: {params:Promise<{slug:string}>}) {
 const {slug}=await params;const m=encontrarMensaje(slug);
 if(!m)notFound();
 return <article className="shell article-detail">
   <Link href="/mensajes" className="text-link">Volver a mensajes</Link>
   <p className="eyebrow">{m.id} · {m.serie.replace("T07-","")} · {m.referencia}</p>
   <h1>{m.titulo}</h1>
   <p className="date-line">Publicado el {new Intl.DateTimeFormat("es-CO",{dateStyle:"long",timeZone:"UTC"}).format(new Date(m.fecha+"T12:00:00Z"))}</p>
   <div className="article-columns">
     <Image src={m.imagen} width={1254} height={1254} alt={"Tarjeta oficial de "+m.titulo} className="detail-image" priority/>
     <div className="reading-text"><blockquote>«{m.texto}»</blockquote><p className="biblical-ref">{m.referencia}</p><p className="author-signature">{m.autor}</p>
     {m.instagram && <p><a href={m.instagram} rel="noopener noreferrer" target="_blank" className="text-link">Ver publicación registrada en Instagram</a></p>}
     </div>
   </div>
 </article>;
}

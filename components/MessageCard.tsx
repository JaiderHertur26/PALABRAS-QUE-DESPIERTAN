import Link from "next/link";
import Image from "next/image";
import type { Mensaje } from "@/lib/editorial";
export function MessageCard({mensaje,featured=false}: {mensaje:Mensaje; featured?:boolean}) {
  return <article className={featured?"message-card featured":"message-card"}>
    <Link href={"/mensajes/"+mensaje.slug} className="cover-link" aria-label={"Leer "+mensaje.titulo}>
      <Image src={mensaje.imagen} alt={"Tarjeta original del mensaje "+mensaje.id+": "+mensaje.titulo} width={1254} height={1254} className="message-image"/>
    </Link>
    <div className="message-card-body">
      <p className="eyebrow">{mensaje.id} · {mensaje.referencia}</p>
      <h3><Link href={"/mensajes/"+mensaje.slug}>{mensaje.titulo}</Link></h3>
      <p className="message-excerpt">{mensaje.texto}</p>
      <Link className="text-link" href={"/mensajes/"+mensaje.slug}>Leer reflexión</Link>
    </div>
  </article>;
}

import Image from "next/image";
import type { Mensaje } from "@/lib/editorial";
import { fechaDePublicacion, extracto, seriePorId } from "@/lib/editorial";

export function MessageCard({mensaje, featured=false}: {mensaje:Mensaje; featured?:boolean}) {
  const serie = seriePorId(mensaje.serie);
  if (featured) {
    return <a href={`/mensajes/${mensaje.slug}`} className="featured-message" aria-label={`Leer la reflexión destacada: ${mensaje.titulo}`}>
      <Image src={mensaje.imagen} alt={`Tarjeta editorial auténtica ${mensaje.id}, ${mensaje.titulo}`} width={1254} height={1254} priority sizes="(max-width: 680px) 320px, (max-width: 1350px) 390px, 370px" className="featured-message-image" />
      <span className="featured-message-link">Leer reflexión <span aria-hidden="true">↗</span></span>
    </a>;
  }
  return <article className="message-card">
    <a href={`/mensajes/${mensaje.slug}`} className="message-cover" aria-label={`Leer ${mensaje.titulo}`}>
      <Image src={mensaje.imagen} alt={`Tarjeta oficial de ${mensaje.titulo}`} width={1254} height={1254} className="message-image" sizes="(max-width: 680px) 90vw, (max-width: 1100px) 46vw, 340px"/>
    </a>
    <div className="message-card-body">
      <p className="eyebrow">{mensaje.id} · {serie?.serie.titulo ?? "Reflexión"}</p>
      <h3><a href={`/mensajes/${mensaje.slug}`}>{mensaje.titulo}</a></h3>
      <p className="message-excerpt">{extracto(mensaje.texto)}</p>
      <p className="message-date">{fechaDePublicacion(mensaje.fecha)}</p>
      <a className="text-link" href={`/mensajes/${mensaje.slug}`}>Leer reflexión <span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}

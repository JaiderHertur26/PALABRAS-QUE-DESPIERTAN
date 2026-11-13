import {notFound} from "next/navigation";
import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReaderTools } from "@/components/ReaderTools";
import {Discussion} from "@/components/community/Discussion";
import {encontrarMensaje, mensajes, fechaDePublicacion, seriePorId, siguienteYAnterior} from "@/lib/editorial";

export const dynamicParams=false;
export function generateStaticParams(){return mensajes.map(m=>({slug:m.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const m=encontrarMensaje(slug);
 if(!m)return {title:"Mensaje no disponible",robots:{index:false}};
 return {title:m.titulo,description:m.texto,openGraph:{title:`${m.titulo} | Palabras que despiertan`,description:m.texto,type:"article",images:[{url:m.imagen,width:1254,height:1254,alt:`Tarjeta original ${m.id}`}]},robots:{index:false,follow:false}};
}

export default async function DetalleMensaje({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const m=encontrarMensaje(slug);
 if(!m)notFound();
 const grupo=seriePorId(m.serie);
 const vecinos=siguienteYAnterior(m.id);
 return <article className="shell article-detail">
  <Breadcrumbs items={[{texto:"Mensajes",href:"/mensajes"},...(grupo?[{texto:grupo.serie.titulo,href:`/series/${grupo.serie.id}`}]:[]),{texto:m.titulo}]}/>
  <header className="detail-header">
   <p className="eyebrow">{m.id} · {grupo?.temporada.id} · {grupo?.serie.titulo}</p>
   <h1>{m.titulo}</h1>
   <p className="date-line">Publicado el <time dateTime={m.fecha}>{fechaDePublicacion(m.fecha)}</time> <span aria-hidden="true">·</span> {m.autor}</p>
  </header>
  <div className="article-columns">
   <figure className="editorial-figure">
    <Image src={m.imagen} width={1254} height={1254} alt={`Tarjeta editorial original de la reflexión «${m.titulo}»`} className="detail-image" priority sizes="(max-width:850px) 94vw, 50vw"/>
    <figcaption>Imagen original de la publicación {m.id}.</figcaption>
   </figure>
   <div>
    <ReaderTools titulo={m.titulo} texto={m.texto} referencia={m.referencia} autor={m.autor}/>
    <div className="detail-context">
     <p className="eyebrow">PARA CONTINUAR</p>
     <h2>Un camino que se profundiza</h2>
     <p>Esta reflexión pertenece a la serie <Link className="inline-link" href={`/series/${m.serie}`}>{grupo?.serie.titulo ?? "de mensajes"}</Link>, de la temporada <Link className="inline-link" href={`/temporadas/${m.temporada}`}>{grupo?.temporada.titulo ?? m.temporada}</Link>.</p>
     <p>La referencia bíblica orienta la lectura espiritual del mensaje. El texto de la reflexión es una elaboración del autor, no una cita literal de la Escritura.</p>
     {m.instagram && <a className="text-link" target="_blank" rel="noopener noreferrer" href={m.instagram}>Ver publicación original en Instagram ↗</a>}
    </div>
   </div>
  </div>
  <Discussion tipo="mensaje" id={m.slug} titulo={m.titulo}/>
  <nav className="reading-navigation" aria-label="Navegar entre mensajes publicados">
    {vecinos.anterior ? <Link href={`/mensajes/${vecinos.anterior.slug}`}>← Anterior <strong>{vecinos.anterior.titulo}</strong></Link> : <span/>}
    <Link className="all-messages-link" href="/mensajes">Todos los mensajes</Link>
    {vecinos.siguiente ? <Link href={`/mensajes/${vecinos.siguiente.slug}`}>Siguiente → <strong>{vecinos.siguiente.titulo}</strong></Link> : <span/>}
  </nav>
 </article>;
}

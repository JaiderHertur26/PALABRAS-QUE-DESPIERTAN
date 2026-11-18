import Link from "next/link";
import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {publicArticulos,publicMensajes} from "@/lib/editorial-live";
import {socialAccounts} from "@/lib/social";
import {fechaDePublicacion} from "@/lib/editorial";
export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"Novedades de la revista",
 description:"Últimos mensajes y artículos publicados de Palabras que despiertan. Sigue la revista desde Facebook, Instagram o un lector RSS.",
 alternates:{canonical:"/novedades",types:{"application/rss+xml":"/feed.xml"}}
};
export default async function Novedades(){
 const [articulos,mensajes]=await Promise.all([publicArticulos(),publicMensajes()]);
 const novedades=[
  ...articulos.map(a=>({id:a.id,titulo:a.titulo,subtitulo:a.subtitulo||a.resumen,fecha:a.fecha,url:"/articulos/"+a.slug,tipo:"Investigación"})),
  ...mensajes.map(m=>({id:m.id,titulo:m.titulo,subtitulo:m.texto,fecha:m.fecha,url:"/mensajes/"+m.slug,tipo:"Reflexión"}))
 ].sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id.localeCompare(a.id)).slice(0,12);
 return <div className="shell content-page novedades-page">
  <Breadcrumbs items={[{texto:"Novedades"}]}/>
  <div className="section-heading">
   <p className="eyebrow">SIGUE EL CAMINO DE LA PALABRA</p>
   <h1>Novedades para seguir despertando</h1>
   <p className="lead">Vuelve cuando quieras: aquí aparecen solo artículos y reflexiones que ya han sido publicados.</p>
  </div>
  <div className="novedades-follow">
   <div><h2>Continúa con nosotros</h2><p>Puedes seguir las cuentas oficiales o añadir nuestro canal RSS a tu lector de noticias. El canal RSS no necesita registrarte ni entregar datos personales.</p></div>
   <div className="novedades-follow-links">
    {socialAccounts.map(s=><a key={s.id} className="button-outline" href={s.url} target="_blank" rel="noopener noreferrer">{s.nombre} ↗</a>)}
    <a className="button-gold" href="/feed.xml" type="application/rss+xml">Canal RSS ↗</a>
   </div>
  </div>
  <section aria-labelledby="novedades-lista-titulo">
   <h2 id="novedades-lista-titulo" className="novedades-list-title">Publicaciones recientes</h2>
   {novedades.length?<ol className="novedades-list">
    {novedades.map(item=><li key={item.id}>
     <div><p className="eyebrow">{item.tipo} · {item.id}</p><h3><Link href={item.url}>{item.titulo}</Link></h3>
      <p>{item.subtitulo.slice(0,190)}{item.subtitulo.length>190?"…":""}</p></div>
     <time dateTime={item.fecha}>{fechaDePublicacion(item.fecha)}</time>
    </li>)}
   </ol>:<p>Las primeras novedades aparecerán después de su publicación autorizada.</p>}
  </section>
 </div>;
}

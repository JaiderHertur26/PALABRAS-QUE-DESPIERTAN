import Image from "next/image";
import Link from "next/link";
import {autor,descripcion,etiquetaEstado,mensajes,temporadas} from "@/lib/editorial";
import {MessageCard} from "@/components/MessageCard";

export default function Inicio(){
 const destacado=mensajes[0];
 const t07=temporadas.find(t=>t.id==="T07")!;
 const temporadasVisibles=[t07,temporadas.find(t=>t.id==="T01")!,temporadas.find(t=>t.id==="T02")!];
 return <>
 <section className="home-hero" aria-labelledby="home-title">
  <div className="shell hero-content">
   <div className="hero-copy">
    <p className="hero-topline"><span aria-hidden="true">✦</span> REFLEXIONES QUE ILUMINAN LA FE</p>
    <h1 id="home-title"><span>PALABRAS QUE</span><em>DESPIERTAN</em></h1>
    <p className="hero-summary">{descripcion}</p>
    <div className="hero-actions"><Link className="button-gold" href="/mensajes">Leer mensajes <span aria-hidden="true">↗</span></Link><Link className="button-outline" href="/series">Explorar series <span aria-hidden="true">↗</span></Link></div>
   </div>
   <div className="hero-art">
    <Image src="/identidad/portada-oficial.png" alt="Brote luminoso que nace de la tierra, imagen original del proyecto" width={1024} height={1536} priority sizes="(max-width:820px) 86vw, 26vw"/>
   </div>
   <aside className="hero-spotlight" aria-labelledby="destacado-title">
    <p id="destacado-title" className="eyebrow">MENSAJE DESTACADO</p>
    {destacado ? <MessageCard mensaje={destacado} featured/> : <p>La primera reflexión estará disponible cuando se confirme su publicación.</p>}
   </aside>
  </div>
 </section>

 <section className="shell discover" aria-label="Descubrir los contenidos">
   <div className="discover-grid">
    <article className="discovery-panel">
     <div className="panel-heading"><h2><span aria-hidden="true">◇</span> SERIES</h2><Link href="/series">Ver todas ↗</Link></div>
     <p className="panel-desc">Itinerarios de mensajes con un mismo hilo de vida y fe.</p>
     <div className="mini-card-grid">
      {t07.series.slice(0,2).map((s,i)=><Link className="mini-card" href={`/series/${s.id}`} key={s.id}>
       <span className="mini-art" aria-hidden="true"><Image src={i===0?"/identidad/cruz-fondo.png":"/identidad/portada-oficial.png"} width={140} height={140} alt="" sizes="120px"/></span>
       <span><strong>{s.titulo}</strong><small>{s.publicaciones?etiquetaEstado(s.publicaciones):"Planificada"}</small></span>
      </Link>)}
     </div>
    </article>
    <article className="discovery-panel">
     <div className="panel-heading"><h2><span aria-hidden="true">▤</span> TEMPORADAS</h2><Link href="/temporadas">Ver todas ↗</Link></div>
     <p className="panel-desc">Doce grandes etapas, una propuesta de formación interior.</p>
     <div className="season-mini-list">
      {temporadasVisibles.map(t=><Link href={`/temporadas/${t.id}`} className="season-mini" key={t.id}>
       <span className="mini-index">{String(t.numero).padStart(2,"0")}</span>
       <span><strong>{t.titulo}</strong><small>{t.publicaciones?etiquetaEstado(t.publicaciones):"Sin publicaciones aún"}</small></span>
       <span className="mini-arrow" aria-hidden="true">›</span>
      </Link>)}
     </div>
    </article>
    <article className="discovery-panel">
     <div className="panel-heading"><h2><span aria-hidden="true">✧</span> TEOLOGÍA</h2><Link href="/teologia">Conocer ↗</Link></div>
     <p className="panel-desc">Investigación y reflexión para comprender, vivir y amar la fe.</p>
     <div className="theology-mini-list">
      <Link href="/teologia" className="theology-mini"><span aria-hidden="true" className="theology-icon">✝</span><span><strong>La fe que busca comprender</strong><small>Conoce el propósito de la biblioteca teológica</small></span><span aria-hidden="true">›</span></Link>
      <Link href="/teologia" className="theology-mini"><span aria-hidden="true" className="theology-icon">▤</span><span><strong>Investigaciones en preparación</strong><small>Publicación sujeta a revisión del autor</small></span><span aria-hidden="true">›</span></Link>
     </div>
    </article>
   </div>
 </section>

 <section className="home-invitation" aria-labelledby="invitation-title">
  <div className="shell invitation-inner">
   <span className="invitation-symbol" aria-hidden="true">✝</span>
   <div><p className="eyebrow">UN PENSAMIENTO PARA DETENERTE</p><h2 id="invitation-title">A veces una palabra basta para abrir una pregunta.</h2><p>Lee despacio, vuelve a la Escritura y permite que la reflexión dialogue con tu propia vida. Cada mensaje es una invitación, no una respuesta automática a todas las inquietudes.</p></div>
   <Link className="button-outline" href="/mensajes">Comenzar a leer ↗</Link>
  </div>
 </section>

 <section className="home-author" aria-labelledby="author-title">
  <div className="shell author-inner">
   <div className="author-art"><Image src="/identidad/cruz-fondo.png" width={1024} height={1536} alt="Cruz dorada luminosa sobre fondo oscuro, identidad gráfica original" sizes="170px"/></div>
   <div className="author-heading"><p className="eyebrow">SOBRE EL AUTOR</p><h2 id="author-title">{autor}</h2></div>
   <p>Una propuesta editorial católica inspirada en la Sagrada Escritura y la enseñanza de la Iglesia, que busca iluminar las decisiones y preguntas de la vida cotidiana.</p>
   <Link className="button-outline" href="/autor">Conocer más ↗</Link>
  </div>
 </section>
 </>;
}

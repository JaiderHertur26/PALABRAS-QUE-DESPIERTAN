import Image from "next/image";
import Link from "next/link";
import {autor,descripcion,etiquetaEstado,mensajes,temporadas} from "@/lib/editorial";
import {MessageCard} from "@/components/MessageCard";
import {articulos} from "@/lib/community/publications";
import {temas} from "@/lib/community/publications";

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
    <div className="hero-actions"><Link className="button-gold" href="/mensajes">Leer mensajes <span aria-hidden="true">↗</span></Link><Link className="button-outline" href="/revista">Abrir la revista <span aria-hidden="true">↗</span></Link></div>
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
      <Link href={articulos.length?`/articulos/${articulos[articulos.length-1].slug}`:"/articulos"} className="theology-mini"><span aria-hidden="true" className="theology-icon">▤</span><span><strong>Artículos de investigación</strong><small>{articulos.length} artículos publicados en nuestra revista</small></span><span aria-hidden="true">›</span></Link>
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

 <section className="shell home-magazine-teaser" aria-labelledby="magazine-title">
  <div><p className="eyebrow">NUESTRA REVISTA TEOLÓGICA</p><h2 id="magazine-title">Pensar la fe. Escuchar la vida.</h2>
   <p>Una propuesta editorial que reúne reflexiones breves, fundamentos teológicos y conversaciones cuidadas. El lector no termina en la última línea: puede continuar con preguntas, comentarios y testimonios.</p>
   <div className="magazine-teaser-links"><Link className="button-gold" href="/revista">Entrar en la revista ↗</Link><Link className="button-outline" href="/articulos">Artículos de investigación ↗</Link></div>
  </div>
  <div className="home-teaser-ornament" aria-hidden="true">✝</div>
 </section>
 <section className="shell home-testimony-preview" aria-labelledby="testimony-preview-title">
  <div className="magazine-section-heading"><div><p className="eyebrow">COMUNIDAD DE LECTORES</p><h2 id="testimony-preview-title">Testimonios que invitan al diálogo</h2></div>
  <Link className="text-link" href="/testimonios">Explorar temas ↗</Link></div>
  <div className="topic-grid compact">{temas.filter(t=>t.destacado).map(t=><Link key={t.slug} href={`/testimonios/${t.slug}`} className="topic-card">
   <span className="topic-number">{t.numero}</span><p className="eyebrow">{t.categoria}</p><h3>{t.titulo}</h3><p>{t.pregunta}</p><span className="topic-cta">Leer y compartir ↗</span>
  </Link>)}</div>
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

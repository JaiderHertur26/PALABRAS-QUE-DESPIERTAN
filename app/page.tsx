import Image from "next/image";
import Link from "next/link";
import { mensajes, temporadas, autor } from "@/lib/editorial";
import { MessageCard } from "@/components/MessageCard";

export default function Home() {
 const destacado=mensajes[0];
 const t07=temporadas.find(t=>t.id==="T07")!;
 const mostradas=[t07, temporadas.find(t=>t.id==="T01")!, temporadas.find(t=>t.id==="T02")!];
 return <>
   <section className="hero shell" aria-labelledby="marca-titulo">
    <div className="hero-copy">
      <h1 id="marca-titulo"><span>PALABRAS QUE</span><em>DESPIERTAN</em></h1>
      <p className="hero-summary">Mensajes breves que iluminan la fe,<br/> despiertan la conciencia y tocan la vida.</p>
      <div className="actions"><Link className="button-gold" href="/mensajes">♧ &nbsp; Leer mensajes</Link><Link className="button-outline" href="/series">◇ &nbsp; Explorar series</Link></div>
    </div>
    <div className="hero-art" aria-label="Brote iluminado de la portada original de Palabras que despiertan">
      <Image src="/identidad/portada-oficial.png" alt="Brote dorado que emerge de la tierra, procedente de la portada original aprobada" width={1024} height={1536} priority/>
    </div>
    <aside className="hero-highlight" aria-label="Mensaje destacado">
      <p className="eyebrow">MENSAJE DESTACADO</p>
      {destacado ? <MessageCard mensaje={destacado} featured/> : <p>No hay un mensaje publicado todavía.</p>}
    </aside>
   </section>
   <section className="discover shell" aria-label="Explorar el proyecto">
    <div className="discover-grid">
      <article className="discovery-panel panel-series">
        <div className="panel-heading"><h2>◇ &nbsp; SERIES</h2><Link href="/series">Ver todas →</Link></div>
        <p className="panel-desc">Itinerarios de mensajes con un mismo hilo de vida y fe.</p>
        <div className="mini-card-grid">
          {t07.series.slice(0,2).map((s,i)=><Link href="/series" className="mini-card" key={s.id}>
            <span className={"mini-art mini-art-"+i} aria-hidden="true"><Image src={i===0?"/identidad/cruz-fondo.png":"/identidad/portada-oficial.png"} width={150} height={150} alt=""/></span>
            <span><strong>{s.titulo}</strong><small>{s.publicaciones ? s.publicaciones+" reflexión publicada" : "Próximamente"}</small></span>
          </Link>)}
        </div>
      </article>
      <article className="discovery-panel panel-temporadas">
        <div className="panel-heading"><h2>▤ &nbsp; TEMPORADAS</h2><Link href="/temporadas">Ver todas →</Link></div>
        <p className="panel-desc">Colecciones de mensajes organizadas por etapas.</p>
        <div className="season-mini-list">
          {mostradas.map(t=><Link href="/temporadas" className="season-mini" key={t.id}>
            <strong>{String(t.numero).padStart(2,"0")}</strong>
            <span>{t.titulo}<small>{t.publicaciones?"En publicación":"Sin publicaciones aún"}</small></span><b aria-hidden="true">›</b>
          </Link>)}
        </div>
      </article>
      <article className="discovery-panel panel-teologia">
        <div className="panel-heading"><h2>▥ &nbsp; TEOLOGÍA</h2><Link href="/teologia">Ver espacio →</Link></div>
        <p className="panel-desc">Reflexiones más profundas para comprender, vivir y amar la fe.</p>
        <div className="theology-list">
          <Link href="/teologia" className="theology-mini"><span className="theology-art" aria-hidden="true">✝</span><span><strong>Estudios bíblicos y teológicos</strong><small>Biblioteca en preparación editorial</small></span><b aria-hidden="true">›</b></Link>
          <Link href="/teologia" className="theology-mini"><span className="theology-art book-art" aria-hidden="true">▤</span><span><strong>Artículos de investigación</strong><small>Publicación sujeta a revisión y autorización</small></span><b aria-hidden="true">›</b></Link>
        </div>
      </article>
    </div>
   </section>
   <section className="author-strip"><div className="shell author-inner">
     <div className="author-art" aria-hidden="true"><Image src="/identidad/cruz-fondo.png" alt="" width={1024} height={1536}/></div>
     <div className="author-heading"><p className="eyebrow">SOBRE EL AUTOR</p><h2>{autor}</h2></div>
     <p>Una propuesta editorial católica inspirada en la Palabra de Dios: mensajes breves y estudios que buscan iluminar la vida cotidiana, fortalecer la confianza en Dios y despertar un corazón más abierto a su amor.</p>
     <Link className="button-outline" href="/autor">Conocer más</Link>
   </div></section>
 </>;
}

import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {autor,mensajes,temporadas} from "@/lib/editorial";
import {articulos,temas} from "@/lib/community/publications";
import {MessageCard} from "@/components/MessageCard";
import {Breadcrumbs} from "@/components/Breadcrumbs";
export const metadata:Metadata={
 title:"Revista teológica",description:"Revista de publicación y reflexión teológica: mensajes, investigaciones y testimonios de Palabras que despiertan."
};

export default function Revista(){
 const mensaje=mensajes[0];
 const t07=temporadas.find(t=>t.id==="T07");
 return <div className="magazine-page">
  <div className="shell magazine-top">
   <Breadcrumbs items={[{texto:"Revista"}]}/>
   <div className="magazine-masthead">
    <span>REVISTA DE REFLEXIÓN Y PUBLICACIÓN TEOLÓGICA</span>
    <h1>PALABRAS <em>QUE DESPIERTAN</em></h1>
    <p>La fe que se piensa, se contempla y se lleva a la vida.</p>
    <div className="masthead-rule"><span>Edición inaugural · Artículos autorizados</span><span>Dirección: {autor}</span></div>
   </div>
   <div className="magazine-cover-grid">
    <div className="magazine-cover-copy">
     <p className="eyebrow">EN PORTADA · APRENDER A CONFIAR</p>
     <h2>Una palabra que abre el corazón.</h2>
     <p>La revista nace para dar a cada pensamiento su lugar en un camino mayor: una meditación, el fundamento de la fe, la investigación y el diálogo con quienes leen.</p>
     <p>La oración no comienza porque Dios desconozca nuestra vida. Comienza cuando el corazón se dispone a encontrarse con Él.</p>
     <Link className="button-gold" href={mensaje?`/mensajes/${mensaje.slug}`:"/mensajes"}>Leer el mensaje inaugural <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="magazine-cover-visual"><Image src="/identidad/portada-oficial.png" alt="Portada original con brote dorado iluminado" width={1024} height={1536} priority sizes="(max-width:900px) 80vw, 38vw"/></div>
   </div>
  </div>

  <section className="shell magazine-editorial" aria-labelledby="editorial-title">
   <div className="magazine-section-kicker"><span>01</span><p>DESDE LA REDACCIÓN</p></div>
   <h2 id="editorial-title">Una revista para despertar preguntas, no solo acumular respuestas.</h2>
   <div className="magazine-columns">
    <p>PALABRAS QUE DESPIERTAN quiere ser una casa de lectura: los mensajes breves despiertan la conciencia; la investigación bíblica y teológica ayuda a reconocer su fundamento; los testimonios permiten escuchar cómo la fe se encarna en historias concretas.</p>
    <p>Este espacio tiene una orientación católica explícita, abierta al diálogo respetuoso. Distingue la enseñanza de la Iglesia, el estudio del autor y las experiencias personales, sin confundir sus niveles de autoridad.</p>
   </div>
  </section>

  <section className="shell magazine-section" aria-labelledby="mag-messages">
   <div className="magazine-section-heading"><div><p className="eyebrow">LA PALABRA BREVE</p><h2 id="mag-messages">Mensajes para meditar</h2></div><Link className="text-link" href="/mensajes">Archivo de mensajes ↗</Link></div>
   <div className="magazine-feature">
    <div className="magazine-feature-items">{mensajes.slice(0,3).map(m=><MessageCard mensaje={m} key={m.id}/>)}</div>
    <div className="magazine-feature-notes"><span className="magazine-issue-number">07</span><h3>{t07?.titulo}</h3>
     <p>La publicación comenzó con la Temporada 07 y la serie «La oración que abre el corazón». Los demás mensajes se incorporarán después de su difusión oficial.</p>
     <Link className="text-link" href="/temporadas/T07">Explorar este itinerario ↗</Link>
    </div>
   </div>
  </section>

  <section className="magazine-academic" aria-labelledby="mag-articles">
   <div className="shell magazine-academic-inner">
    <div className="magazine-section-heading"><div><p className="eyebrow">CUADERNOS DE INVESTIGACIÓN</p><h2 id="mag-articles">Teología con fundamento</h2></div><Link className="text-link" href="/articulos">Abrir biblioteca ↗</Link></div>
    <div className="magazine-academic-grid">
     <article><span>✝</span><h3>Escritura y contexto</h3><p>Estudiar antes de interpretar, y distinguir el texto bíblico de nuestras aplicaciones.</p></article>
     <article><span>✦</span><h3>Tradición y Magisterio</h3><p>Comprender en comunión con la fe de la Iglesia, con referencias y criterios claros.</p></article>
     <article><span>◇</span><h3>Psicología y vida</h3><p>Dialogar con conocimientos rigurosos sin sustituir la teología ni atribuir resultados clínicos.</p></article>
    </div>
    <div className="magazine-article-links"><p className="academic-footnote">{articulos.length} investigaciones aprobadas y disponibles en la revista.</p>{articulos.slice(-3).reverse().map(a=><Link className="magazine-article-link" key={a.slug} href={`/articulos/${a.slug}`}><span>{a.id}</span><strong>{a.titulo}</strong><span aria-hidden="true">↗</span></Link>)}</div>
   </div>
  </section>

  <section className="shell magazine-section" aria-labelledby="mag-voices">
   <div className="magazine-section-heading"><div><p className="eyebrow">EL DIÁLOGO CON LOS LECTORES</p><h2 id="mag-voices">Testimonios: la fe en la vida real</h2></div><Link className="text-link" href="/testimonios">Todos los temas ↗</Link></div>
   <div className="topic-grid compact">
    {temas.filter(t=>t.destacado).map(t=><Link className="topic-card" href={`/testimonios/${t.slug}`} key={t.slug}>
     <span className="topic-number">{t.numero}</span><span className="eyebrow">{t.categoria}</span><h3>{t.titulo}</h3><p>{t.pregunta}</p><span className="topic-cta">Entrar en la conversación ↗</span>
    </Link>)}
   </div>
   <div className="magazine-endnote"><p>Una revista es también un encuentro. Los comentarios y testimonios se publicarán bajo revisión editorial para proteger el respeto, la privacidad y la fidelidad al propósito del proyecto.</p><Link href="/participar" className="button-outline">Normas de participación ↗</Link></div>
  </section>
 </div>;
}

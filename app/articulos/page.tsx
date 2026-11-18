import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {publicArticulos} from "@/lib/editorial-live";
import {ArticleTopicBadges} from "@/components/ArticleTopicBadges";
import {temasDeArticulo,temasEditoriales} from "@/lib/editorial-topics";

export const metadata:Metadata={
 title:"Artículos de investigación teológica",
 description:"Biblioteca de investigaciones teológicas originales de P. Jaider Herrera Turizo, publicadas en la revista Palabras que despiertan.",
 alternates:{canonical:"/articulos"},
 openGraph:{title:"Artículos | Palabras que despiertan",description:"Escritura, Tradición, Magisterio y vida: una colección original de investigación teológica."}
};

export const dynamic="force-dynamic";
export default async function Articulos(){
 const ordenados=[...await publicArticulos()].sort((a,b)=>a.id.localeCompare(b.id));
 const temasVisibles=temasEditoriales.filter(t=>ordenados.some(a=>temasDeArticulo(a).includes(t.id)));
 return <main className="shell research-library">
  <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Artículos"}]}/>
  <header className="research-library-header">
   <p className="eyebrow">REVISTA PALABRAS QUE DESPIERTAN · INVESTIGACIÓN TEOLÓGICA</p>
   <h1>Una biblioteca para ir a las raíces de la fe.</h1>
   <p className="lead">Investigaciones originales que unen Sagrada Escritura, Tradición, Magisterio y experiencia humana. De una pregunta que despierta a una reflexión que permite comprender.</p>
   <div className="research-library-stats"><span>{ordenados.length} artículos publicados</span><span>Autor: P. Jaider Herrera Turizo</span><a className="text-link" href="#articulos-publicados">Ver investigaciones ↓</a></div>
  </header>
  <div className="research-library-intro">
   <p>Investigaciones originales aprobadas por el autor y publicadas en esta revista independiente. No son documentos oficiales del Magisterio ni trabajos con evaluación externa por pares.</p>
   <Link className="text-link" href="/teologia">Nuestro enfoque teológico ↗</Link>
  </div>
  {temasVisibles.length>0&&<nav className="editorial-topic-links research-topic-menu" aria-label="Explorar investigaciones por tema">
   <span>EXPLORAR POR TEMA</span>
   {temasVisibles.map(t=><Link key={t.id} href={"/buscar?tipo=articulos&tema="+t.id}>{t.nombre}</Link>)}
  </nav>}
  <section id="articulos-publicados" aria-labelledby="library-title">
   <div className="research-section-top"><h2 id="library-title">Cuadernos de investigación</h2><span>ART-001 — ART-{String(ordenados.length).padStart(3,"0")}</span></div>
   <div className="research-library-grid">
    {ordenados.map((a,i)=><article className="research-card" key={a.slug}>
     {a.imagen&&<Link className="research-card-cover" href={"/articulos/"+a.slug} aria-label={"Ver el artículo "+a.titulo}>
      <Image src={a.imagen} alt={"Tarjeta gráfica original de "+a.titulo} width={1254} height={1254} sizes="(max-width:510px) calc(100vw - 5rem), (max-width:1020px) 28vw, 15vw" loading="lazy"/>
     </Link>}
     <div className="research-card-content">
      <span className="research-card-number">{String(i+1).padStart(2,"0")}</span>
      <p className="eyebrow">{a.id} · INVESTIGACIÓN TEOLÓGICA</p>
      <h3><Link href={"/articulos/"+a.slug}>{a.titulo}</Link></h3>
      <ArticleTopicBadges articulo={a} limit={2}/>
      {a.subtitulo && <p className="research-card-subtitle">{a.subtitulo}</p>}
      <p className="research-card-excerpt">{a.resumen.length>260?a.resumen.slice(0,260).trimEnd()+"…":a.resumen}</p>
      <div className="research-card-footer"><span>{Math.max(1,Math.round((a.palabras||0)/230))} min de lectura</span><Link href={"/articulos/"+a.slug}>Leer investigación ↗</Link></div>
     </div>
    </article>)}
   </div>
  </section>
  <aside className="research-library-note"><p>Una misma investigación puede inspirar mensajes breves, pero los dos formatos tienen sus propios procesos editoriales. Las referencias se ofrecen en cada artículo para que el lector pueda contrastar las fuentes.</p></aside>
 </main>;
}

import Link from "next/link";
import type {Metadata} from "next";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {articulos} from "@/lib/community/publications";

export const metadata:Metadata={
 title:"Artículos de investigación teológica",
 description:"Biblioteca de investigaciones teológicas originales de P. Jaider Herrera Turizo, publicadas en la revista Palabras que despiertan.",
 alternates:{canonical:"/articulos"},
 openGraph:{title:"Artículos | Palabras que despiertan",description:"Escritura, Tradición, Magisterio y vida: una colección original de investigación teológica."}
};

export default function Articulos(){
 const ordenados=[...articulos].sort((a,b)=>a.id.localeCompare(b.id));
 return <main className="shell research-library">
  <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Artículos"}]}/>
  <header className="research-library-header">
   <p className="eyebrow">REVISTA PALABRAS QUE DESPIERTAN · INVESTIGACIÓN TEOLÓGICA</p>
   <h1>Una biblioteca para ir a las raíces de la fe.</h1>
   <p className="lead">Investigaciones originales que unen Sagrada Escritura, Tradición, Magisterio y experiencia humana. De una pregunta que despierta a una reflexión que permite comprender.</p>
   <div className="research-library-stats"><span>{ordenados.length} artículos editoriales</span><span>Autor: P. Jaider Herrera Turizo</span><span>Edición inaugural · 2026</span></div>
  </header>
  <div className="research-library-intro">
   <p>Estos artículos integran la colección de investigación teológica de <em>Palabras que despiertan</em>. Se publican con aprobación editorial del autor en nuestra revista independiente; no se presentan como trabajos evaluados por pares ni como documentos oficiales del Magisterio.</p>
   <Link className="text-link" href="/teologia">Conoce nuestro enfoque teológico ↗</Link>
  </div>
  <section aria-labelledby="library-title">
   <div className="research-section-top"><h2 id="library-title">Cuadernos de investigación</h2><span>ART-001 — ART-{String(ordenados.length).padStart(3,"0")}</span></div>
   <div className="research-library-grid">
    {ordenados.map((a,i)=><article className="research-card" key={a.slug}>
     <span className="research-card-number">{String(i+1).padStart(2,"0")}</span>
     <div>
      <p className="eyebrow">{a.id} · INVESTIGACIÓN TEOLÓGICA</p>
      <h3><Link href={"/articulos/"+a.slug}>{a.titulo}</Link></h3>
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

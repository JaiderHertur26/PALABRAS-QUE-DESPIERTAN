import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {ArticleBody,articleHeadings} from "@/components/ArticleBody";
import {Discussion} from "@/components/community/Discussion";
import {articulos,articuloPorSlug} from "@/lib/community/publications";

export const dynamicParams=false;
export function generateStaticParams(){return articulos.map(a=>({slug:a.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const a=articuloPorSlug(slug);
 if(!a)return {title:"Artículo no disponible",robots:{index:false}};
 const excerpt=a.resumen.slice(0,160);
 return {
  title:a.titulo,description:excerpt,
  alternates:{canonical:"/articulos/"+a.slug},
  openGraph:{type:"article",title:a.titulo,description:excerpt,locale:"es_CO",
   authors:[a.autor],publishedTime:a.fecha,images:[{url:"/identidad/cruz-fondo.png",width:1024,height:1536}]},
  robots:{index:true,follow:true}
 };
}

export default async function Articulo({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const a=articuloPorSlug(slug);
 if(!a)notFound();
 const sorted=[...articulos].sort((u,v)=>u.id.localeCompare(v.id));
 const index=sorted.findIndex(item=>item.id===a.id);
 const before=index>0?sorted[index-1]:null;
 const after=index<sorted.length-1?sorted[index+1]:null;
 const headings=articleHeadings(a.contenido).filter(x=>x.level===2);
 const schema={
  "@context":"https://schema.org","@type":"Article",headline:a.titulo,
  description:a.resumen,articleSection:"Teología católica",inLanguage:"es-CO",
  author:{"@type":"Person",name:a.autor},
  publisher:{"@type":"Organization",name:"Palabras que despiertan"},
  datePublished:a.fecha,dateModified:a.fecha,
  mainEntityOfPage:{"@type":"WebPage","@id":"/articulos/"+a.slug},
  isAccessibleForFree:true
 };
 return <article className="research-article">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  <div className="shell">
   <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Artículos",href:"/articulos"},{texto:a.titulo}]}/>
   <header className="research-article-header">
    <p className="eyebrow">PALABRAS QUE DESPIERTAN · {a.id} · INVESTIGACIÓN TEOLÓGICA</p>
    <h1>{a.titulo}</h1>
    {a.subtitulo && <p className="research-subtitle">{a.subtitulo}</p>}
    <div className="research-byline"><span>{a.autor}</span><span>Edición 2026</span><span>{Math.max(1,Math.round((a.palabras||0)/230))} min de lectura</span></div>
   </header>
   <div className="research-article-grid">
    <aside className="research-aside" aria-label="Navegación por el artículo">
      <div className="research-toc">
       <p className="eyebrow">EN ESTE ARTÍCULO</p>
       <nav><ol>{headings.slice(0,28).map(h=><li key={h.anchor}><a href={"#"+h.anchor}>{h.title}</a></li>)}</ol></nav>
       <Link href="/articulos" className="research-return">← Toda la biblioteca</Link>
      </div>
    </aside>
    <div className="research-reading">
     <section className="research-abstract"><p className="eyebrow">RESUMEN</p><p>{a.resumen}</p></section>
     <ArticleBody contenido={a.contenido}/>
     <div className="research-editorial-footnote">
      <p><strong>Nota editorial.</strong> Investigación y reflexión teológica del autor, publicada en una revista independiente. Las referencias bíblicas, la doctrina de la Iglesia y las interpretaciones propuestas se distinguen en el desarrollo. Esta publicación no declara evaluación científica externa ni aprobación eclesiástica.</p>
     </div>
    </div>
   </div>
   <nav className="research-pagination" aria-label="Anterior y siguiente artículo">
    {before?<Link href={"/articulos/"+before.slug}><small>← INVESTIGACIÓN ANTERIOR</small><strong>{before.titulo}</strong></Link>:<span/>}
    {after?<Link href={"/articulos/"+after.slug}><small>SIGUIENTE INVESTIGACIÓN →</small><strong>{after.titulo}</strong></Link>:<span/>}
   </nav>
   <Discussion tipo="articulo" id={a.slug} titulo={a.titulo}/>
   <div className="research-bottom"><Link href="/revista" className="button-outline">Volver a la revista ↗</Link></div>
  </div>
 </article>;
}

import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {ArticleBody,articleHeadings} from "@/components/ArticleBody";
import {DiscussionDeferred} from "@/components/community/DiscussionDeferred";
import {publicArticulo,publicArticulosIndice,publicMensajes} from "@/lib/editorial-live";
import {ArticleReadingTools} from "@/components/ArticleReadingTools";
import {EditorialConnections} from "@/components/EditorialConnections";
import {ArticleTopicBadges} from "@/components/ArticleTopicBadges";

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const a=await publicArticulo(slug);
 if(!a)return {title:"Artículo no disponible",robots:{index:false}};
 const excerpt=a.resumen.slice(0,160);
 return {
  title:a.titulo,description:excerpt,
  alternates:{canonical:"/articulos/"+a.slug},
  openGraph:{type:"article",title:a.titulo,description:excerpt,locale:"es_CO",
   authors:[a.autor],publishedTime:a.fecha,images:[a.imagen?{url:a.imagen,width:1254,height:1254,alt:a.titulo}:{url:"/identidad/cruz-fondo.png",width:1024,height:1536}]},
  robots:{index:true,follow:true}
 };
}

export default async function Articulo({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const [a,articulos,mensajes]=await Promise.all([publicArticulo(slug),publicArticulosIndice(),publicMensajes()]);
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
  mainEntityOfPage:{"@type":"WebPage","@id":"https://www.palabrasquedespiertan.online/articulos/"+a.slug},
  image:a.imagen||"/identidad/cruz-fondo.png",
  isAccessibleForFree:true
 };
 return <article className="research-article">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  <div className="shell">
   <Breadcrumbs items={[{texto:"Revista",href:"/revista"},{texto:"Artículos",href:"/articulos"},{texto:a.titulo}]}/>
   <header className="research-article-header">
    <div className="research-article-cover-grid">
     <div className="research-article-intro">
      <p className="eyebrow">PALABRAS QUE DESPIERTAN · {a.id} · INVESTIGACIÓN TEOLÓGICA</p>
      <h1>{a.titulo}</h1>
      {a.subtitulo && <p className="research-subtitle">{a.subtitulo}</p>}
      <ArticleTopicBadges articulo={a}/>
      <div className="research-byline"><span>{a.autor}</span><span>Publicado el {new Date(a.fecha+"T12:00:00Z").toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}</span><span>{Math.max(1,Math.round((a.palabras||0)/230))} min de lectura</span></div>
      <div className="research-article-jump"><a className="button-gold" href="#lectura-articulo">Comenzar a leer ↓</a><a className="button-outline" href="#indice-articulo">Ver índice ↓</a></div>
     </div>
     {a.imagen&&<figure className="research-article-cover">
      <Image src={a.imagen} alt={"Imagen editorial original del artículo "+a.titulo} width={1254} height={1254} priority fetchPriority="high" sizes="(max-width:420px) 90vw, (max-width:760px) 420px, 35vw"/>
      <figcaption>Tarjeta gráfica original · {a.id}</figcaption>
     </figure>}
    </div>
   </header>
   <div className="research-article-grid">
    <aside className="research-aside" id="indice-articulo" aria-label="Navegación por el artículo">
      <div className="research-toc">
       <p className="eyebrow">EN ESTE ARTÍCULO</p>
       <nav><ol>{headings.slice(0,28).map(h=><li key={h.anchor}><a href={"#"+h.anchor}>{h.title}</a></li>)}</ol></nav>
       <Link href="/articulos" className="research-return">← Toda la biblioteca</Link>
      </div>
    </aside>
    <div className="research-reading" id="lectura-articulo">
     <ArticleReadingTools titulo={a.titulo} url={"https://www.palabrasquedespiertan.online/articulos/"+a.slug}>
     <section className="research-abstract"><p className="eyebrow">RESUMEN</p><p>{a.resumen}</p></section>
     <ArticleBody contenido={a.contenido}/>
     <div className="research-editorial-footnote">
      <p><strong>Nota editorial.</strong> Investigación y reflexión teológica del autor, publicada en una revista independiente. Las referencias bíblicas, la doctrina de la Iglesia y las interpretaciones propuestas se distinguen en el desarrollo. Esta publicación no declara evaluación científica externa ni aprobación eclesiástica.</p>
     </div>
     </ArticleReadingTools>
    </div>
   </div>
   <nav className="research-pagination" aria-label="Anterior y siguiente artículo">
    {before?<Link href={"/articulos/"+before.slug}><small>← INVESTIGACIÓN ANTERIOR</small><strong>{before.titulo}</strong></Link>:<span/>}
    {after?<Link href={"/articulos/"+after.slug}><small>SIGUIENTE INVESTIGACIÓN →</small><strong>{after.titulo}</strong></Link>:<span/>}
   </nav>
   <EditorialConnections desde="articulo" codigo={a.id} articulos={[a]} mensajes={mensajes}/>
   <DiscussionDeferred tipo="articulo" id={a.slug} titulo={a.titulo}/>
   <div className="research-bottom"><Link href="/revista" className="button-outline">Volver a la revista ↗</Link></div>
  </div>
 </article>;
}

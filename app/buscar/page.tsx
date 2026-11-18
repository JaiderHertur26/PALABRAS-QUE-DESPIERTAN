import Image from "next/image";
import Link from "next/link";
import type {Metadata} from "next";
import {buscarTodoPublico} from "@/lib/search-all";
import {Breadcrumbs} from "@/components/Breadcrumbs";
import {MessageCard} from "@/components/MessageCard";
import {SectionIntro} from "@/components/SectionIntro";
import {UnifiedSearchForm} from "@/components/UnifiedSearchForm";
import {esTema,temaPorId} from "@/lib/editorial-topics";

export const metadata:Metadata={title:"Buscar",description:"Buscador de mensajes y artículos publicados de Palabras que despiertan.",robots:{index:false,follow:true}};
export const dynamic="force-dynamic";
type Params={q?:string;tipo?:string;tema?:string};
export default async function Buscar({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const q=typeof p.q==="string"?p.q.slice(0,120):"";
 const tipo=p.tipo==="mensajes"||p.tipo==="articulos"?p.tipo:"todos";
 const tema=typeof p.tema==="string"&&esTema(p.tema)?p.tema:"";
 const {mensajes,articulos,total,temasDisponibles}=await buscarTodoPublico(q,tipo,tema);
 return <section className="shell content-page unified-search-page">
  <Breadcrumbs items={[{texto:"Buscar"}]}/>
  <SectionIntro eyebrow="BUSCADOR EDITORIAL" title="Encuentra una palabra para tu camino"
   description="Explora reflexiones e investigaciones teológicas por tema, título o referencia bíblica."/>
  <UnifiedSearchForm q={q} tipo={tipo} tema={tema} disponibles={temasDisponibles}/>
  <p className="unified-search-count" role="status">{total} {total===1?"resultado publicado":"resultados publicados"}{q?<> para «{q}»</>:null}{tema?<> en {temaPorId(tema).nombre}</>:null}</p>
  {articulos.length>0&&<section aria-labelledby="resultados-articulos" className="unified-search-group">
   <div className="magazine-section-heading"><h2 id="resultados-articulos">Artículos de investigación <small>({articulos.length})</small></h2></div>
   <div className="unified-article-results">{articulos.map(a=><article key={a.slug} className="unified-article-result">
    {a.imagen&&<Link href={"/articulos/"+a.slug} className="unified-article-cover" aria-label={"Leer "+a.titulo}>
     <Image src={a.imagen} alt={"Tarjeta original "+a.id} width={1254} height={1254} sizes="(max-width:620px) 100px, 150px"/>
    </Link>}
    <div><p className="eyebrow">{a.id} · INVESTIGACIÓN</p><h3><Link href={"/articulos/"+a.slug}>{a.titulo}</Link></h3>
     {a.subtitulo&&<p className="unified-article-subtitle">{a.subtitulo}</p>}
     <p>{a.resumen.slice(0,220)}{a.resumen.length>220?"…":""}</p>
     <Link className="text-link" href={"/articulos/"+a.slug}>Leer investigación ↗</Link></div>
   </article>)}</div>
  </section>}
  {mensajes.length>0&&<section aria-labelledby="resultados-mensajes" className="unified-search-group">
   <div className="magazine-section-heading"><h2 id="resultados-mensajes">Mensajes para meditar <small>({mensajes.length})</small></h2></div>
   <div className="cards-grid">{mensajes.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div>
  </section>}
  {total===0&&<div className="empty-state"><h2>No hay coincidencias publicadas</h2>
   <p>Prueba una expresión más breve o consulta directamente los archivos. No se muestran borradores ni publicaciones futuras.</p>
   <div className="unified-empty-links"><Link className="button-outline" href="/mensajes">Mensajes</Link><Link className="button-outline" href="/articulos">Artículos</Link></div>
  </div>}
 </section>;
}

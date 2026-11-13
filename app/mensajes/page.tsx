import type { Metadata } from "next";
import { buscarMensajes, mensajes, temporadas, seriePorId } from "@/lib/editorial";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArchiveFilters } from "@/components/ArchiveFilters";
import { MessageCard } from "@/components/MessageCard";
import { SectionIntro } from "@/components/SectionIntro";

export const metadata: Metadata = { title: "Mensajes", description: "Archivo público de reflexiones de Palabras que despiertan." };
type Parametros = {q?:string; temporada?:string; serie?:string; orden?:string};
export default async function Mensajes({searchParams}: {searchParams: Promise<Parametros>}) {
 const p=await searchParams;
 const q=typeof p.q==="string"?p.q.slice(0,120):"";
 const temporada=temporadas.some(t=>t.id===p.temporada)?p.temporada:"";
 const serie=p.serie && seriePorId(p.serie)?p.serie:"";
 const orden=["recientes","antiguos","numero"].includes(p.orden??"")?p.orden:"recientes";
 const resultado=buscarMensajes({q,temporada,serie,orden});
 const filtrado=Boolean(q||temporada||serie||orden!=="recientes");
 return <div className="shell content-page">
  <Breadcrumbs items={[{texto:"Mensajes"}]}/>
  <SectionIntro eyebrow="ARCHIVO DE REFLEXIONES" title="Mensajes que despiertan" description="Palabras breves para leer despacio, contemplar y llevar a la vida. Este archivo muestra únicamente los pensamientos publicados y verificados."/>
  <ArchiveFilters q={q} temporada={temporada} serie={serie} orden={orden}/>
  <div className="archive-result-header"><p role="status">{resultado.length} {resultado.length===1?"reflexión disponible":"reflexiones disponibles"}{filtrado?" con estos filtros":""}</p>
   <span className="archive-note">{mensajes.length} {mensajes.length===1?"mensaje publicado":"mensajes publicados"} en el archivo</span>
  </div>
  {resultado.length>0 ? <div className={mensajes.length<=2&&!filtrado?"archive-feature-layout":""}>
    <div className="cards-grid">{resultado.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div>
    {mensajes.length<=2&&!filtrado&&<aside className="archive-companion">
      <p className="eyebrow">EL CAMINO COMIENZA</p>
      <h2>Aprender a confiar</h2>
      <p>La publicación de Palabras que despiertan comenzó con la Temporada 07 y la serie «La oración que abre el corazón».</p>
      <p>Los pensamientos siguientes aparecerán aquí únicamente después de comprobar su publicación. Mientras tanto, puedes volver a esta primera reflexión y profundizar en su fundamento bíblico.</p>
      <a className="text-link" href="/series/T07-S01">Conocer la primera serie ↗</a>
    </aside>}
  </div> :
   <div className="empty-state"><h2>No encontramos reflexiones con esos criterios</h2><p>Prueba una palabra más general o regresa al archivo completo. Los mensajes pendientes de publicación no aparecen en esta página.</p><a className="button-outline" href="/mensajes">Ver todos los mensajes</a></div>}
 </div>;
}

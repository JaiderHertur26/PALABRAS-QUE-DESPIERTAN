import type { Metadata } from "next";
import { temporadas } from "@/lib/editorial";
export const metadata:Metadata={title:"Temporadas"};
export default function Temporadas(){
 return <section className="shell content-page"><p className="eyebrow">PLAN EDITORIAL</p><h1>Temporadas</h1>
 <p className="lead">Doce grandes recorridos temáticos. La numeración sigue el plan maestro; la primera temporada que se publica es la 07.</p>
 <div className="seasons-grid">
 {temporadas.map(t=><article className="season-card" key={t.id}><div className="season-index">{String(t.numero).padStart(2,"0")}</div>
 <h2>{t.titulo}</h2><ul>{t.series.map(s=><li key={s.id}>{s.titulo}</li>)}</ul>
 <p className="status-label">{t.publicaciones ? "En publicación · "+t.publicaciones+" reflexión disponible" : "Sin publicaciones todavía"}</p>
 </article>)}
 </div></section>;
}

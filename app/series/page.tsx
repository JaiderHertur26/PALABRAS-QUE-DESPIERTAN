import type { Metadata } from "next";
import Link from "next/link";
import { temporadas } from "@/lib/editorial";
export const metadata:Metadata={title:"Series"};
export default function Series(){
 return <section className="shell content-page"><p className="eyebrow">RECORRIDOS TEMÁTICOS</p><h1>Series</h1>
 <p className="lead">36 series previstas dentro de 12 temporadas. El comienzo editorial se realiza en la Temporada 07.</p>
 {temporadas.map(t=><section key={t.id} className="series-section">
 <h2>{t.id} · {t.titulo}</h2>
 <div className="series-list">{t.series.map(s=><div className="series-row" key={s.id}>
 <div><span className="eyebrow">{s.id}</span><h3>{s.titulo}</h3></div>
 <span className="status-label">{s.publicaciones ? s.publicaciones+" publicado" : "Sin publicaciones aún"}</span>
 </div>)}</div></section>)}
 <Link href="/mensajes" className="text-link">Leer mensajes disponibles</Link>
 </section>;
}

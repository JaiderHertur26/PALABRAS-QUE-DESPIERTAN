import Link from "next/link";
import { temporadas, seriePorId } from "@/lib/editorial";

export function ArchiveFilters({q="",temporada="",serie="",orden="recientes",action="/mensajes"}:{
  q?: string; temporada?:string; serie?:string; orden?:string; action?:string;
}) {
  const temporadaActual = temporadas.find(t=>t.id===temporada);
  const seriesElegibles = temporadaActual?.series ?? temporadas.flatMap(t=>t.series).filter(s=>s.publicaciones>0);
  return <form method="GET" action={action} role="search" className="archive-filters">
    <div className="filter-search">
      <label htmlFor="q">Buscar por título, palabra o cita bíblica</label>
      <input type="search" id="q" name="q" defaultValue={q} maxLength={120} placeholder="Ej.: oración, confianza, Mateo 6"/>
    </div>
    <div className="filter-field">
      <label htmlFor="temporada">Temporada</label>
      <select id="temporada" name="temporada" defaultValue={temporada}>
        <option value="">Todas las temporadas</option>
        {temporadas.filter(t=>t.publicaciones>0 || t.id===temporada).map(t=><option key={t.id} value={t.id}>{t.id} · {t.titulo}</option>)}
      </select>
    </div>
    <div className="filter-field">
      <label htmlFor="serie">Serie</label>
      <select id="serie" name="serie" defaultValue={serie}>
        <option value="">Todas las series</option>
        {seriesElegibles.map(s=><option value={s.id} key={s.id}>{s.titulo}</option>)}
        {serie && !seriesElegibles.some(s=>s.id===serie) && <option value={serie}>{seriePorId(serie)?.serie.titulo ?? serie}</option>}
      </select>
    </div>
    <div className="filter-field">
      <label htmlFor="orden">Orden</label>
      <select id="orden" name="orden" defaultValue={orden}>
        <option value="recientes">Más recientes</option>
        <option value="antiguos">Más antiguos</option>
        <option value="numero">Por número</option>
      </select>
    </div>
    <div className="filter-buttons">
      <button className="button-gold" type="submit">Aplicar filtros</button>
      <Link href={action} className="text-link">Restablecer</Link>
    </div>
  </form>;
}

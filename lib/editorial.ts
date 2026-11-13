import catalogo from "@/data/site-content.json";

export type Serie = { id: string; titulo: string; publicaciones: number };
export type Temporada = { id: string; numero: number; titulo: string; series: Serie[]; publicaciones: number };
export type Mensaje = {
  id: string;
  slug: string;
  titulo: string;
  texto: string;
  referencia: string;
  temporada: string;
  serie: string;
  fecha: string;
  autor: string;
  imagen: string;
  instagram: string | null;
};

export const nombreProyecto = "Palabras que despiertan";
export const autor = "P. Jaider Herrera Turizo";
export const lema = "Reflexiones que iluminan la fe";
export const descripcion = "Mensajes breves que iluminan la fe, despiertan la conciencia y tocan la vida.";
export const temporadas: Temporada[] = catalogo.temporadas;
export const mensajes: Mensaje[] = [...catalogo.mensajes].sort((a,b) => b.fecha.localeCompare(a.fecha));
export const articulosPublicados: readonly never[] = []; // Ningún manuscrito autorizado.
export const cuentaSeries = temporadas.reduce((total, temporada) => total + temporada.series.length, 0);

export function temporadaPorId(id: string) {
  return temporadas.find(temporada => temporada.id.toLowerCase() === id.toLowerCase());
}

export function seriePorId(id: string): { temporada: Temporada; serie: Serie } | undefined {
  for (const temporada of temporadas) {
    const serie = temporada.series.find(s => s.id.toLowerCase() === id.toLowerCase());
    if (serie) return { temporada, serie };
  }
  return undefined;
}

export function mensajesDeSerie(serieId: string) {
  return mensajes.filter(mensaje => mensaje.serie === serieId);
}

export function mensajesDeTemporada(temporadaId: string) {
  return mensajes.filter(mensaje => mensaje.temporada === temporadaId);
}

export function encontrarMensaje(slug: string) {
  return mensajes.find(mensaje => mensaje.slug === slug);
}

export function limpiarBusqueda(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function buscarMensajes(opciones: {q?: string; temporada?: string; serie?: string; orden?: string} = {}) {
  const q = limpiarBusqueda((opciones.q ?? "").slice(0, 120));
  let resultado = mensajes.filter(mensaje => {
    if (opciones.temporada && mensaje.temporada !== opciones.temporada) return false;
    if (opciones.serie && mensaje.serie !== opciones.serie) return false;
    if (!q) return true;
    const contextoSerie = seriePorId(mensaje.serie);
    const corpus = [
      mensaje.id, mensaje.titulo, mensaje.texto, mensaje.referencia, mensaje.autor,
      contextoSerie?.serie.titulo, contextoSerie?.temporada.titulo
    ].filter(Boolean).join(" ");
    return limpiarBusqueda(corpus).includes(q);
  });
  if (opciones.orden === "antiguos") resultado = [...resultado].sort((a,b)=>a.fecha.localeCompare(b.fecha));
  if (opciones.orden === "numero") resultado = [...resultado].sort((a,b)=>a.id.localeCompare(b.id));
  return resultado;
}

export function fechaDePublicacion(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", {day: "numeric", month: "long", year: "numeric", timeZone:"UTC"})
    .format(new Date(fecha + "T12:00:00.000Z"));
}

export function etiquetaEstado(cantidad: number) {
  return cantidad > 0 ? `${cantidad} ${cantidad === 1 ? "mensaje publicado" : "mensajes publicados"}` : "Sin publicaciones todavía";
}

export function extracto(texto: string, largo = 148) {
  return texto.length > largo ? texto.slice(0, largo).trimEnd().replace(/[\s,;:.]+$/,"")+"…" : texto;
}

export const siguienteYAnterior = (id: string) => {
  const secuencia = [...mensajes].sort((a,b)=>a.id.localeCompare(b.id));
  const index = secuencia.findIndex(item => item.id === id);
  return { anterior: index > 0 ? secuencia[index-1] : null, siguiente: index >= 0 ? secuencia[index+1] ?? null : null };
};

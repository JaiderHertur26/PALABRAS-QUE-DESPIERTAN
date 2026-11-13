import datos from "@/data/site-content.json";

export type Serie = { id: string; titulo: string; publicaciones: number };
export type Temporada = { id: string; numero: number; titulo: string; series: Serie[]; publicaciones: number };
export type Mensaje = {
  id: string; slug: string; titulo: string; texto: string; referencia: string;
  temporada: string; serie: string; fecha: string; autor: string; imagen: string;
  instagram: string | null;
};
export const temporadas: Temporada[] = datos.temporadas;
export const mensajes: Mensaje[] = datos.mensajes;
export const articuloPublicados: never[] = []; // Ningún manuscrito está autorizado para la web.
export const autor = "P. Jaider Herrera Turizo";

export function encontrarMensaje(slug: string): Mensaje | undefined {
  return mensajes.find((mensaje) => mensaje.slug === slug);
}
export function filtrarPublico(q: string): Mensaje[] {
  const term = q.trim().toLocaleLowerCase("es");
  if (!term) return mensajes;
  return mensajes.filter(m => [m.titulo, m.texto, m.referencia, m.id].join(" ").toLocaleLowerCase("es").includes(term));
}

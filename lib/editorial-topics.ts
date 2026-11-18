import type {ArticuloPublico} from "@/lib/community/publications";
import type {Mensaje} from "@/lib/editorial";

/* Temas de navegación, no declaraciones de equivalencia doctrinal entre obras. */
export const temasEditoriales=[
 {id:"oracion",nombre:"Oración",descripcion:"Abrir el corazón a Dios"},
 {id:"confianza",nombre:"Confianza",descripcion:"La esperanza puesta en Dios"},
 {id:"creacion",nombre:"Creación",descripcion:"Nuestro origen y destino"},
 {id:"dignidad",nombre:"Dignidad humana",descripcion:"Imagen y semejanza"},
 {id:"cristo",nombre:"Jesucristo",descripcion:"El Hijo y su obra"},
 {id:"salvacion",nombre:"Salvación",descripcion:"La cruz y la vida nueva"},
 {id:"trinidad",nombre:"Trinidad",descripcion:"El amor del Dios trino"},
 {id:"iglesia",nombre:"Iglesia",descripcion:"La comunión en Cristo"},
 {id:"espiritu",nombre:"Espíritu Santo",descripcion:"La nueva creación"},
 {id:"esperanza",nombre:"Esperanza",descripcion:"La promesa y su plenitud"}
] as const;
export type TemaId=typeof temasEditoriales[number]["id"];
export function esTema(valor:string):valor is TemaId{
 return temasEditoriales.some(t=>t.id===valor);
}
export function temaPorId(id:TemaId){return temasEditoriales.find(t=>t.id===id)!;}
export function normalizarTema(texto:string){
 return texto.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}

/* Clasificación basada en títulos y fundamentos editoriales efectivamente revisados.
   Los códigos no existentes no se publican: el catálogo de Supabase controla visibilidad. */
const articulosCurados:Record<string,readonly TemaId[]>={
 "ART-001":["creacion","cristo","trinidad"],
 "ART-002":["dignidad","cristo"],
 "ART-003":["salvacion","cristo"],
 "ART-004":["salvacion","esperanza"],
 "ART-005":["salvacion","cristo"],
 "ART-006":["trinidad","cristo"],
 "ART-007":["iglesia","cristo"],
 "ART-008":["espiritu","esperanza"],
 "ART-009":["confianza","oracion"],
 "ART-010":["oracion","confianza"],
 "ART-011":["esperanza","creacion"],
 "ART-012":["esperanza","salvacion"]
};
const mensajesCurados:Record<string,readonly TemaId[]>={
 "PD-001":["oracion","confianza"],
 "PD-002":["oracion","confianza"]
};
const pistas:Record<TemaId,RegExp>={
 oracion:/\b(oracion|orar|rezar|plegaria)\b/,
 confianza:/\b(confiar|confianza|confiamos)\b/,
 creacion:/\b(creacion|creados|creado|criatura)\b/,
 dignidad:/\b(dignidad|imagen y semejanza)\b/,
 cristo:/\b(cristo|jesus|jesucristo|hijo de dios)\b/,
 salvacion:/\b(salvacion|redencion|calvario|cruz)\b/,
 trinidad:/\b(trinidad|trinitario|trinitaria)\b/,
 iglesia:/\b(iglesia|eucaristia|bautismal)\b/,
 espiritu:/\b(espiritu santo|pentecostes)\b/,
 esperanza:/\b(esperanza|resurreccion|jerusalen celestial|vida eterna)\b/
};
function temasEvidentes(texto:string):TemaId[]{
 const n=normalizarTema(texto);
 return temasEditoriales.filter(t=>pistas[t.id].test(n)).map(t=>t.id);
}
export function temasDeArticulo(a:ArticuloPublico):TemaId[]{
 const declarados=articulosCurados[a.id];
 return declarados?[...declarados]:temasEvidentes([a.titulo,a.subtitulo].join(" "));
}
export function temasDeMensaje(m:Mensaje):TemaId[]{
 const declarados=mensajesCurados[m.id];
 return declarados?[...declarados]:temasEvidentes([m.titulo,m.texto,m.referencia].join(" "));
}
export function comparteTema(a:readonly TemaId[],b:readonly TemaId[]):boolean{
 return a.some(id=>b.includes(id));
}

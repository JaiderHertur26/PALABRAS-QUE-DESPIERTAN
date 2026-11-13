import {maxCaracteres,minCaracteres} from "./rules";

export function validarNombre(valor:unknown){
 if(typeof valor!=="string")return "Escribe un nombre público.";
 const n=valor.trim().replace(/\s+/g," ");
 if(n.length<2||n.length>48)return "El nombre público debe tener entre 2 y 48 caracteres.";
 if(/[<>\u0000-\u001f]/.test(n))return "El nombre contiene caracteres no permitidos.";
 return null;
}
export function validarComentario(valor:unknown){
 if(typeof valor!=="string")return "Escribe tu participación.";
 const n=valor.trim();
 if(n.length<minCaracteres||n.length>maxCaracteres)return `Escribe entre ${minCaracteres} y ${maxCaracteres} caracteres.`;
 if(/[\u0000-\u0008\u000b\u000e-\u001f]/.test(n))return "El texto contiene caracteres no permitidos.";
 if(/https?:\/\/\S+/gi.test(n))return "No se permiten enlaces externos en las participaciones.";
 return null;
}
export function esUUID(valor:unknown):valor is string{
 return typeof valor==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}
export const motivosReporte=["ofensa","datos_personales","contenido_inapropiado","spam","otro"] as const;
export type MotivoReporte=(typeof motivosReporte)[number];

export type TipoConversacion="mensaje"|"articulo"|"tema";
export type EntradaPublica={
 id:string;
 subject_type:TipoConversacion;
 subject_id:string;
 parent_id:string|null;
 display_name:string;
 body:string;
 depth:number;
 created_at:string;
 status:"approved";
};
export type RespuestaListado={
 enabled:boolean;
 entries:EntradaPublica[];
 hasMore:boolean;
 page:number;
 message?:string;
};
export type EstadoEnvio={ok:boolean;message:string;error?:string};

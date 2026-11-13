import {NextRequest,NextResponse} from "next/server";
import {destinoPublico} from "@/lib/community/publications";
import {validarComentario,validarNombre,esUUID} from "@/lib/community/validation";
import {clienteLectura,comunidadConfiguradaServidor,usuarioVerificado} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const TAMANIO_PAGINA=60;

export async function GET(request:NextRequest){
 const tipo=request.nextUrl.searchParams.get("tipo")??"";
 const id=request.nextUrl.searchParams.get("id")??"";
 const destino=destinoPublico(tipo,id);
 if(!destino)return NextResponse.json({error:"Conversación no disponible."},{status:404});
 const raw=Number(request.nextUrl.searchParams.get("pagina")??0);
 const pagina=Number.isInteger(raw)&&raw>=0&&raw<100?raw:0;
 const client=clienteLectura();
 if(!client)return NextResponse.json({enabled:false,entries:[],hasMore:false,page:0,message:"La conversación no está disponible en este momento."},{headers:{"Cache-Control":"no-store"}});
 const {data,error,count}=await client.from("discussion_entries")
  .select("id,subject_type,subject_id,parent_id,display_name,body,depth,created_at,status",{count:"exact"})
  .eq("subject_type",destino.tipo).eq("subject_id",destino.id)
  .eq("status","approved")
  .order("created_at",{ascending:true}).order("id",{ascending:true})
  .range(pagina*TAMANIO_PAGINA,pagina*TAMANIO_PAGINA+TAMANIO_PAGINA-1);
 if(error)return NextResponse.json({error:"No fue posible consultar la conversación."},{status:503,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({enabled:true,entries:data??[],hasMore:(count??0)>(pagina+1)*TAMANIO_PAGINA,page:pagina},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(request:NextRequest){
 if(!comunidadConfiguradaServidor())return NextResponse.json({error:"La participación todavía no está habilitada."},{status:503});
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Origen de solicitud no autorizado."},{status:403});
 if(!request.headers.get("content-type")?.includes("application/json"))return NextResponse.json({error:"Formato inválido."},{status:415});
 const length=Number(request.headers.get("content-length")??0);
 if(length>7500)return NextResponse.json({error:"El contenido es demasiado largo."},{status:413});
 let data:Record<string,unknown>;
 try{data=await request.json();}catch{return NextResponse.json({error:"Datos inválidos."},{status:400});}
 if(typeof data.website==="string"&&data.website.trim())return NextResponse.json({error:"Solicitud rechazada."},{status:400});
 const destino=destinoPublico(String(data.tipo??""),String(data.id??""));
 if(!destino)return NextResponse.json({error:"La publicación no está habilitada para comentarios."},{status:404});
 const nombreError=validarNombre(data.nombre);
 const textoError=validarComentario(data.texto);
 if(nombreError||textoError)return NextResponse.json({error:nombreError??textoError},{status:400});
 if(data.consentimiento!==true)return NextResponse.json({error:"Debes aceptar las normas de participación y el tratamiento de tus datos antes de enviar."},{status:400});
 const padre=data.respuestaA===null||data.respuestaA===undefined||data.respuestaA===""?null:data.respuestaA;
 if(padre!==null&&!esUUID(padre))return NextResponse.json({error:"La respuesta no es válida."},{status:400});
 const {client,user}=await usuarioVerificado();
 if(!client||!user||!user.email_confirmed_at)return NextResponse.json({error:"Debes verificar tu correo antes de participar."},{status:401});
 const {error}=await client.from("discussion_entries").insert({
  subject_type:destino.tipo,subject_id:destino.id,parent_id:padre,
  author_id:user.id,display_name:(data.nombre as string).trim().replace(/\s+/g," "),
  body:(data.texto as string).trim(),consent_confirmed:true
 });
 if(error){
  if(error.code==="23505")return NextResponse.json({error:"La participación ya existe."},{status:409});
  if(error.code==="23514")return NextResponse.json({error:"La participación no supera las normas de publicación."},{status:400});
  if(error.code==="P0001")return NextResponse.json({error:"No se pudo publicar: comprueba que el texto no incluya enlaces ni datos personales y respete las normas."},{status:400});
  if(error.message.includes("Espera")||error.message.includes("límite diario")||error.message.includes("máximo"))return NextResponse.json({error:error.message},{status:429});
  return NextResponse.json({error:"No fue posible registrar tu participación. Inténtalo más tarde."},{status:503});
 }
 return NextResponse.json({ok:true,message:"Tu participación se publicó correctamente. Puedes verla en esta conversación."},{status:201});
}

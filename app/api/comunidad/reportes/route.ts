import {NextRequest,NextResponse} from "next/server";
import {motivosReporte,esUUID} from "@/lib/community/validation";
import {usuarioVerificado} from "@/lib/supabase/server";

export async function POST(request:NextRequest){
 if(request.headers.get("origin")&&request.headers.get("origin")!==request.nextUrl.origin)return NextResponse.json({error:"Origen no autorizado."},{status:403});
 if(!request.headers.get("content-type")?.includes("application/json"))return NextResponse.json({error:"Formato inválido."},{status:415});
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return NextResponse.json({error:"Formato inválido."},{status:400});}
 if(!esUUID(body.comentario)||!motivosReporte.includes(body.motivo as typeof motivosReporte[number]))return NextResponse.json({error:"Reporte inválido."},{status:400});
 const detalles=typeof body.detalles==="string"?body.detalles.trim().slice(0,600):"";
 const {client,user}=await usuarioVerificado();
 if(!client||!user||!user.email_confirmed_at)return NextResponse.json({error:"Inicia sesión con correo verificado para reportar un contenido."},{status:401});
 const {error}=await client.from("discussion_reports").insert({
  entry_id:body.comentario,reporter_id:user.id,motive:body.motivo,details:detalles||null
 });
 if(error){
  if(error.code==="23505")return NextResponse.json({error:"Ya registramos tu reporte de esta participación."},{status:409});
  return NextResponse.json({error:"No se pudo registrar el reporte."},{status:503});
 }
 return NextResponse.json({ok:true,message:"Tu reporte fue recibido para revisión."},{status:202});
}

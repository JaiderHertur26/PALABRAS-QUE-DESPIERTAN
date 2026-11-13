import {NextRequest,NextResponse} from "next/server";
import {clienteModeracion,usuarioVerificado,esModerador} from "@/lib/supabase/server";
import {esUUID} from "@/lib/community/validation";
export const dynamic="force-dynamic";

async function acceso(){
 const {user}=await usuarioVerificado();
 const admin=clienteModeracion();
 if(!user||!admin||!await esModerador(user.id))return null;
 return {user,admin};
}
const respuesta=(data:object,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});

export async function GET(){
 const permiso=await acceso();
 if(!permiso)return respuesta({error:"Área editorial restringida."},403);
 const {admin}=permiso;
 const [pending,reports]=await Promise.all([
  admin.from("discussion_entries")
   .select("id,subject_type,subject_id,parent_id,display_name,body,depth,created_at,status")
   .eq("status","pending").order("created_at",{ascending:true}).limit(100),
  admin.from("discussion_reports")
   .select("id,entry_id,motive,details,created_at")
   .eq("resolved",false).order("created_at",{ascending:true}).limit(80)
 ]);
 if(pending.error||reports.error)return respuesta({error:"No se pudo consultar la cola editorial."},503);
 const reportEntries=(reports.data??[]).map(x=>x.entry_id);
 let byId=new Map<string,{id:string;status:string;display_name:string;body:string;subject_type:string;subject_id:string}>();
 if(reportEntries.length){
  const {data,error}=await admin.from("discussion_entries")
   .select("id,status,display_name,body,subject_type,subject_id")
   .in("id",reportEntries);
  if(error)return respuesta({error:"No se pudieron abrir las participaciones reportadas."},503);
  byId=new Map((data??[]).map(x=>[x.id,x]));
 }
 return respuesta({
  pending:pending.data??[],
  reports:(reports.data??[]).map(r=>({...r,entry:byId.get(r.entry_id)??null}))
 });
}

export async function POST(request:NextRequest){
 if(request.headers.get("origin")&&request.headers.get("origin")!==request.nextUrl.origin)
  return respuesta({error:"Origen no autorizado."},403);
 if(!request.headers.get("content-type")?.includes("application/json"))
  return respuesta({error:"Formato inválido."},415);
 const permiso=await acceso();
 if(!permiso)return respuesta({error:"Área editorial restringida."},403);
 let data:Record<string,unknown>;
 try{data=await request.json();}catch{return respuesta({error:"Formato inválido."},400);}
 const {admin,user}=permiso;
 const nota=typeof data.nota==="string"?data.nota.trim().slice(0,500):"";

 if(data.tipo==="reporte"){
  if(!esUUID(data.id)||!["dismiss","hide"].includes(String(data.decision)))
   return respuesta({error:"Resolución inválida."},400);
  const report=await admin.from("discussion_reports")
   .select("id,entry_id,resolved").eq("id",data.id).maybeSingle();
  if(report.error||!report.data)return respuesta({error:"Reporte no encontrado."},404);
  if(report.data.resolved)return respuesta({error:"Este reporte ya fue revisado."},409);

  if(data.decision==="hide"){
   const entry=await admin.from("discussion_entries").select("id,status").eq("id",report.data.entry_id).maybeSingle();
   if(entry.error||!entry.data)return respuesta({error:"Publicación no encontrada."},404);
   if(entry.data.status==="approved"){
    // El trigger PostgreSQL registra atómicamente la decisión y oculta sus respuestas.
    const updated=await admin.from("discussion_entries")
     .update({status:"hidden",reviewed_by:user.id,moderation_note:nota||"Ocultada tras reporte"})
     .eq("id",report.data.entry_id).eq("status","approved").select("id");
    if(updated.error||!updated.data?.length)return respuesta({error:"No se pudo ocultar la publicación."},409);
   }else if(entry.data.status!=="hidden"){
    return respuesta({error:"La participación ya no está publicada."},409);
   }
  }
  const {error}=await admin.from("discussion_reports")
   .update({resolved:true,resolved_at:new Date().toISOString(),resolved_by:user.id,resolution_note:nota||null})
   .eq("id",report.data.id).eq("resolved",false);
  if(error)return respuesta({error:"Revisión aplicada, pero el reporte no se pudo cerrar; comprueba la cola."},503);
  return respuesta({ok:true,message:"Reporte revisado."});
 }

 if(!esUUID(data.id)||!["approve","reject"].includes(String(data.decision)))
  return respuesta({error:"Decisión de moderación inválida."},400);
 const destino=data.decision==="approve"?"approved":"rejected";
 // El trigger valida al moderador y registra la auditoría en la misma transacción.
 const resultado=await admin.from("discussion_entries")
  .update({status:destino,reviewed_by:user.id,moderation_note:nota||null})
  .eq("id",data.id).eq("status","pending").select("id");
 if(resultado.error)return respuesta({error:"El sistema rechazó la operación de moderación."},409);
 if(!resultado.data?.length)return respuesta({error:"La publicación no está pendiente o ya fue revisada."},409);
 return respuesta({ok:true,message:"Decisión editorial registrada con auditoría."});
}

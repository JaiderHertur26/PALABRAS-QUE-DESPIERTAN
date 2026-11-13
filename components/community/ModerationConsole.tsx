"use client";
import {useCallback,useEffect,useState} from "react";
type Pendiente={id:string;subject_type:string;subject_id:string;display_name:string;body:string;created_at:string;parent_id:string|null};
type Reporte={id:string;entry_id:string;motive:string;details:string|null;created_at:string;entry:{id:string;subject_type:string;subject_id:string;display_name:string;body:string;status:string}|null};
export function ModerationConsole(){
 const [pendientes,setPendientes]=useState<Pendiente[]>([]);
 const [reportes,setReportes]=useState<Reporte[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 const [nota,setNota]=useState("");
 const actualizar=useCallback(async()=>{
  setLoading(true);
  try{
   const r=await fetch("/api/moderacion",{cache:"no-store"});
   const j=await r.json();
   if(!r.ok)throw new Error(j.error??"Acceso denegado");
   setPendientes(j.pending??[]);setReportes(j.reports??[]);
  }catch(e){setMessage(e instanceof Error?e.message:"No fue posible consultar la cola.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void actualizar();},[actualizar]);
 async function decidir(id:string,decision:"approve"|"reject"|"hide"|"dismiss",tipo:"entrada"|"reporte"){
  setBusy(id);setMessage("");
  try{
   const response=await fetch("/api/moderacion",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id,decision,nota,tipo})
   });
   const j=await response.json();
   setMessage(j.error??j.warning??j.message??"Decisión procesada");
   if(response.ok){setNota("");await actualizar();}
  }catch{setMessage("No se pudo registrar la decisión.");}
  finally{setBusy(null);}
 }
 return <div className="moderation-console">
  <div className="moderation-toolbar"><h2>Pendientes de revisión ({pendientes.length})</h2><button type="button" onClick={()=>void actualizar()}>Actualizar</button></div>
  {message&&<p role="status" className="community-feedback">{message}</p>}
  {loading&&<p>Consultando la cola editorial…</p>}
  {!loading&&pendientes.length===0&&<p>No hay participaciones pendientes.</p>}
  <label className="moderation-note">Nota editorial (opcional, máximo 500 caracteres)
   <textarea maxLength={500} value={nota} onChange={e=>setNota(e.target.value)} rows={2}/>
  </label>
  <div className="pending-grid">{pendientes.map(p=><article key={p.id} className="moderation-card">
   <p className="eyebrow">{p.subject_type} · {p.subject_id}</p><h3>{p.display_name}</h3><blockquote>{p.body}</blockquote>
   <p className="community-auth-note">{new Date(p.created_at).toLocaleString("es-CO")} · {p.parent_id?"Respuesta":"Participación principal"}</p>
   <div className="moderation-buttons">
    <button type="button" disabled={busy===p.id} onClick={()=>void decidir(p.id,"approve","entrada")}>Aprobar</button>
    <button type="button" disabled={busy===p.id} onClick={()=>void decidir(p.id,"reject","entrada")}>Rechazar</button>
   </div>
  </article>)}</div>
  <div className="section-divider"><h2>Reportes pendientes</h2><span>{reportes.length}</span></div>
  {reportes.length===0?<p>No hay reportes sin resolver.</p>:
  <div className="pending-grid">{reportes.map(r=><article className="moderation-card" key={r.id}>
   <p className="eyebrow">{r.motive} · {r.entry?.subject_type??"Contenido"} · {r.entry?.subject_id??r.entry_id}</p>
   {r.entry ? <><h3>{r.entry.display_name}</h3><blockquote>{r.entry.body}</blockquote><p className="community-auth-note">Estado actual: {r.entry.status}</p></> : <p>Participación no disponible.</p>}
   <p className="community-auth-note">{r.details??"Reporte sin detalles."} · {new Date(r.created_at).toLocaleString("es-CO")}</p>
   <div className="moderation-buttons">
    <button type="button" disabled={busy===r.id} onClick={()=>void decidir(r.id,"dismiss","reporte")}>Conservar publicación y cerrar reporte</button>
    {r.entry?.status==="approved"&&<button type="button" disabled={busy===r.id} onClick={()=>void decidir(r.id,"hide","reporte")}>Ocultar y cerrar reporte</button>}
   </div>
  </article>)}</div>}
  <p className="moderation-warning">Cada reporte requiere una decisión prudente. Estas herramientas no emiten juicios automáticos ni sustituyen el acompañamiento pastoral.</p>
 </div>;
}

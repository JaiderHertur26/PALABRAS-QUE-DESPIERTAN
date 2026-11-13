"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {AuthPanel} from "./AuthPanel";
import type {EntradaPublica,RespuestaListado,TipoConversacion} from "@/lib/community/types";
import {avisoModeracion,maxCaracteres,minCaracteres,maxRespuestas} from "@/lib/community/rules";

type EntradaArbol=EntradaPublica&{replies:EntradaArbol[]};
function armarArbol(entradas:EntradaPublica[]){
 const mapa=new Map<string,EntradaArbol>();
 for(const e of entradas)mapa.set(e.id,{...e,replies:[]});
 const raices:EntradaArbol[]=[];
 for(const entry of mapa.values()){
  const padre=entry.parent_id?mapa.get(entry.parent_id):null;
  if(padre&&padre.id!==entry.id)padre.replies.push(entry);
  else raices.push(entry);
 }
 return raices;
}
function fecha(iso:string){
 return new Intl.DateTimeFormat("es-CO",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(iso));
}

export function Discussion({tipo,id,titulo}: {tipo:TipoConversacion;id:string;titulo:string}){
 const [entradas,setEntradas]=useState<EntradaPublica[]>([]);
 const [pagina,setPagina]=useState(0);
 const [more,setMore]=useState(false);
 const [enabled,setEnabled]=useState<boolean|null>(null);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState("");
 const [logged,setLogged]=useState(false);
 const [replyTo,setReplyTo]=useState<EntradaPublica|null>(null);
 const [name,setName]=useState("");
 const [body,setBody]=useState("");
 const [consent,setConsent]=useState(false);
 const [website,setWebsite]=useState("");
 const [submitting,setSubmitting]=useState(false);
 const [sendMessage,setSendMessage]=useState("");
 const [reportId,setReportId]=useState<string|null>(null);
 const [reportReason,setReportReason]=useState("contenido_inapropiado");
 const [reportText,setReportText]=useState("");
 const [reportMessage,setReportMessage]=useState("");
 const [reportSending,setReportSending]=useState(false);

 const cargar=useCallback(async (next=0)=>{
  setLoading(true);setLoadError("");
  try{
   const params=new URLSearchParams({tipo,id,pagina:String(next)});
   const response=await fetch("/api/comunidad/comentarios?"+params.toString(),{cache:"no-store"});
   const data=(await response.json()) as RespuestaListado&{error?:string};
   if(!response.ok)throw new Error(data.error??"No fue posible consultar las participaciones.");
   setEnabled(data.enabled);
   setEntradas(v=>next===0?data.entries:[...v,...data.entries.filter(x=>!v.some(y=>y.id===x.id))]);
   setMore(data.hasMore);setPagina(next);
  }catch(err){setLoadError(err instanceof Error?err.message:"Error de conexión");}
  finally{setLoading(false);}
 },[tipo,id]);

 useEffect(()=>{void cargar(0);setReplyTo(null);setSendMessage("");},[cargar]);

 async function enviar(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(submitting)return;
  if(!consent){setSendMessage("Acepta las normas y el tratamiento de datos.");return;}
  setSubmitting(true);setSendMessage("");
  try{
   const resp=await fetch("/api/comunidad/comentarios",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({tipo,id,nombre:name,texto:body,respuestaA:replyTo?.id??null,consentimiento:consent,website})
   });
   const result=await resp.json();
   if(!resp.ok){setSendMessage(result.error??"No fue posible enviar tu participación.");return;}
   setSendMessage(result.message??avisoModeracion);
   setBody("");setConsent(false);setReplyTo(null);
   await cargar(0);
  }catch{setSendMessage("No se pudo establecer conexión para enviar tu participación.");}
  finally{setSubmitting(false);}
 }
 async function reportar(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!reportId)return;
  setReportSending(true);setReportMessage("");
  try{
   const resp=await fetch("/api/comunidad/reportes",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({comentario:reportId,motivo:reportReason,detalles:reportText})
   });
   const result=await resp.json();
   setReportMessage(result.error??result.message??"Reporte enviado.");
   if(resp.ok){setReportId(null);setReportText("");}
  }catch{setReportMessage("No fue posible enviar el reporte.");}
  finally{setReportSending(false);}
 }
 function iniciarRespuesta(entry:EntradaPublica){
  setReplyTo(entry);setSendMessage("");
  document.getElementById(`discussion-form-${id}`)?.scrollIntoView({behavior:"smooth",block:"center"});
 }
 function comment(entry:EntradaArbol):React.ReactNode {
  return <article className="discussion-entry" key={entry.id} id={`comentario-${entry.id}`} style={{marginLeft:`${Math.min(entry.depth,2)*1.2}rem`}}>
   <header className="discussion-entry-head">
    <span className="comment-avatar" aria-hidden="true">{entry.display_name.slice(0,1).toUpperCase()}</span>
    <div><strong>{entry.display_name}</strong><time dateTime={entry.created_at}>{fecha(entry.created_at)}</time></div>
   </header>
   <p className="discussion-body">{entry.body}</p>
   <div className="discussion-actions">
    {entry.depth<maxRespuestas-1&&enabled&&<button type="button" onClick={()=>iniciarRespuesta(entry)}>Responder</button>}
    {enabled&&<button type="button" onClick={()=>{setReportId(reportId===entry.id?null:entry.id);setReportMessage("");}}>Reportar</button>}
   </div>
   {reportId===entry.id&&<form className="report-form" onSubmit={reportar}>
    <label>Motivo del reporte
     <select value={reportReason} onChange={e=>setReportReason(e.target.value)}>
      <option value="contenido_inapropiado">Contenido inapropiado</option>
      <option value="ofensa">Ofensa o falta de respeto</option>
      <option value="datos_personales">Datos personales</option>
      <option value="spam">Publicidad o spam</option>
      <option value="otro">Otro motivo</option>
     </select>
    </label>
    <label>Detalles opcionales
     <textarea value={reportText} onChange={e=>setReportText(e.target.value)} maxLength={600} rows={2}/>
    </label>
    <div><button type="submit" disabled={reportSending||!logged}>Enviar reporte</button> <button type="button" onClick={()=>setReportId(null)}>Cancelar</button></div>
    {!logged&&<p>Inicia sesión para enviar un reporte.</p>}
   </form>}
   {entry.replies.length>0&&<div className="discussion-children">{entry.replies.map(comment)}</div>}
  </article>;
 }

 return <section className="discussion-shell" aria-labelledby={`discussion-title-${id}`}>
   <div className="discussion-title-row"><div><p className="eyebrow">CONVERSACIÓN DE LA COMUNIDAD</p><h2 id={`discussion-title-${id}`}>{tipo==="tema"?"Testimonios y respuestas":"Una lectura que continúa en diálogo"}</h2>
     <p>Participa con respeto, caridad y libertad. Tu comentario se publica al verificar tu correo y cumplir las normas; puede retirarse si se reporta una infracción.</p></div>
     <span className="discussion-number">{entradas.length} <small>{entradas.length===1?"aporte visible":"aportes visibles"}</small></span>
   </div>

   {loading&&entradas.length===0&&<p className="discussion-state">Cargando participaciones…</p>}
   {loadError&&<div className="discussion-state" role="alert">{loadError}<button type="button" onClick={()=>void cargar(0)}>Reintentar</button></div>}
   {!loadError&&!loading&&enabled&&entradas.length===0&&<div className="discussion-empty">
     <span aria-hidden="true">✦</span><h3>Una conversación por comenzar</h3>
     <p>Todavía no hay participaciones en «{titulo}». Tu aporte puede ayudar a otros lectores a pensar y orar con mayor profundidad.</p>
   </div>}
   {entradas.length>0&&<div className="discussion-list">{armarArbol(entradas).map(comment)}</div>}
   {more&&<button type="button" className="button-outline" disabled={loading} onClick={()=>void cargar(pagina+1)}>{loading?"Cargando…":"Leer más participaciones"}</button>}
   {reportMessage&&<p className="report-feedback" role="status">{reportMessage}</p>}
   <div className="discussion-compose" id={`discussion-form-${id}`}>
    <h3>{replyTo?`Responder a ${replyTo.display_name}`:tipo==="tema"?"Compartir un testimonio":"Dejar una reflexión"}</h3>
    {replyTo&&<button type="button" className="cancel-reply" onClick={()=>setReplyTo(null)}>Cancelar respuesta</button>}
    <AuthPanel onUserChange={setLogged}/>
    {enabled&&logged&&<form onSubmit={enviar} className="comment-form">
      <label htmlFor={`nombre-${id}`}>Nombre que aparecerá públicamente
       <input id={`nombre-${id}`} value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={48} required placeholder="Tu nombre o seudónimo"/>
      </label>
      <label htmlFor={`texto-${id}`}>{tipo==="tema"?"Tu experiencia personal":"Tu comentario"}
       <textarea id={`texto-${id}`} value={body} onChange={e=>setBody(e.target.value)} minLength={minCaracteres} maxLength={maxCaracteres} rows={6} required placeholder="Escribe desde tu experiencia, con respeto y sin datos personales de terceros."/>
      </label>
      <div className="counter-line">{body.length} / {maxCaracteres} caracteres</div>
      <div className="honeypot" aria-hidden="true"><label>Website <input value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></label></div>
      <label className="consent-row"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>
       <span>He leído las <Link href="/participar">normas de participación</Link> y la <Link href="/privacidad">política de privacidad</Link>. Acepto que mi nombre público y texto se publiquen al enviarlos.</span>
      </label>
      <p className="review-note">{avisoModeracion}</p>
      <button className="button-gold" type="submit" disabled={submitting||!consent}>{submitting?"Publicando…":replyTo?"Publicar respuesta":"Publicar participación"}</button>
    </form>}
    {sendMessage&&<p className="community-feedback" role="status">{sendMessage}</p>}
   </div>
 </section>;
}

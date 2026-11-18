"use client";
import {lazy,Suspense,useEffect,useRef,useState} from "react";
import type {TipoConversacion} from "@/lib/community/types";

type Props={tipo:TipoConversacion;id:string;titulo:string};
/* La comunidad no requiere descargar autenticación al empezar a leer. */
const LazyDiscussion=lazy(async()=>({default:(await import("./Discussion")).Discussion}));

export function DiscussionDeferred(props:Props){
 const anchor=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(false);
 useEffect(()=>{
  if(active||props.tipo==="tema")return;
  const node=anchor.current;
  if(!node)return;
  if(typeof IntersectionObserver==="undefined"){setActive(true);return;}
  const observer=new IntersectionObserver((entries)=>{
   if(entries.some(entry=>entry.isIntersecting)){
    setActive(true);
    observer.disconnect();
   }
  },{rootMargin:"600px 0px"});
  observer.observe(node);
  return ()=>observer.disconnect();
 },[active,props.tipo]);
 return <div ref={anchor} id={`conversacion-${props.id}`} className="discussion-lazy-root">
  {active?
   <Suspense fallback={<div className="discussion-preview" role="status" aria-live="polite"><p className="eyebrow">COMUNIDAD DE LECTORES</p><p>Cargando la conversación…</p></div>}>
    <LazyDiscussion {...props}/>
   </Suspense>:
   <section className="discussion-preview" aria-labelledby={`conversacion-titulo-${props.id}`}>
    <p className="eyebrow">COMUNIDAD DE LECTORES</p>
    <h2 id={`conversacion-titulo-${props.id}`}>{props.tipo==="tema"?"Testimonios y respuestas":"La lectura continúa en diálogo"}</h2>
    <p>Comparte una reflexión o lee las experiencias de otros lectores. Las participaciones se revisan para proteger el respeto y la privacidad.</p>
    <div className="discussion-preview-actions">
     <button type="button" className="button-gold" onClick={()=>setActive(true)}>{props.tipo==="tema"?"Leer testimonios y participar":"Ver conversación y participar"}</button>
     <a className="button-outline" href="/participar">Normas de participación</a>
    </div>
   </section>}
 </div>;
}

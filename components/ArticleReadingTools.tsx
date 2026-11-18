"use client";
import {useState,type ReactNode,type CSSProperties} from "react";
export function ArticleReadingTools({titulo,url,children}:{titulo:string;url:string;children:ReactNode}){
 const [escala,setEscala]=useState(1);
 const [calido,setCalido]=useState(false);
 const [estado,setEstado]=useState("");
 const whatsapp="https://api.whatsapp.com/send?text="+encodeURIComponent(titulo+" — Palabras que despiertan\n"+url);
 const facebook="https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url);
 async function copiar(){
  try{await navigator.clipboard.writeText(url);setEstado("Enlace copiado para compartir.");}
  catch{setEstado("Selecciona la dirección de la página para compartirla.");}
 }
 async function compartir(){
  if(navigator.share){
   try{await navigator.share({title:titulo,url});setEstado("");}
   catch(e){if(e instanceof Error&&e.name!=="AbortError")setEstado("No fue posible compartir desde este navegador.");}
  }else await copiar();
 }
 return <section className="article-reading-tools" aria-label="Herramientas para leer y compartir">
  <div className="article-reading-toolbar">
   <strong>Leer con comodidad</strong>
   <div className="article-reading-actions">
    <button type="button" onClick={()=>setEscala(x=>Math.max(.9,Math.round((x-.1)*10)/10))} disabled={escala<=.9} aria-label="Reducir letra">A−</button>
    <button type="button" onClick={()=>setEscala(x=>Math.min(1.5,Math.round((x+.1)*10)/10))} disabled={escala>=1.5} aria-label="Aumentar letra">A+</button>
    <button type="button" onClick={()=>setCalido(x=>!x)} aria-pressed={calido}>Fondo claro</button>
    <button type="button" onClick={compartir}>Compartir</button>
    <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Compartir artículo en WhatsApp">WhatsApp</a>
    <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Compartir artículo en Facebook">Facebook</a>
    <button type="button" onClick={()=>window.print()}>Imprimir</button>
   </div>
  </div>
  {estado&&<p role="status" aria-live="polite" className="article-reading-feedback">{estado}</p>}
  <div className={"article-reading-body"+(calido?" is-warm":"")} style={{"--article-scale":escala} as CSSProperties}>{children}</div>
 </section>;
}

"use client";

import {useState} from "react";

export function ReaderTools({titulo, texto, referencia, autor}: {titulo:string; texto:string; referencia:string; autor:string}) {
  const [escala, setEscala] = useState(1);
  const [estado, setEstado] = useState("");
  async function copiar() {
    const contenido = `${titulo}\n\n«${texto}»\n${referencia}\n— ${autor}`;
    try {
      await navigator.clipboard.writeText(contenido);
      setEstado("Reflexión copiada.");
    } catch {
      setEstado("No fue posible copiar automáticamente. Selecciona el texto de la reflexión.");
    }
  }
  async function compartir() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({title: titulo, text: `${texto}\n${referencia}`, url: window.location.href});
        setEstado("Se abrió la opción para compartir.");
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setEstado("No se pudo compartir desde este navegador.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setEstado("Enlace copiado para compartir.");
      } catch {
        setEstado("Puedes compartir la dirección de esta página desde el navegador.");
      }
    }
  }
  return <div className="reader-area">
    <div className="reader-toolbar" aria-label="Herramientas de lectura">
      <span>Lectura</span>
      <div className="reader-controls">
        <button type="button" onClick={() => setEscala(x=>Math.max(.9,Math.round((x-.1)*10)/10))} aria-label="Reducir tamaño del texto" disabled={escala<=.9}>A−</button>
        <button type="button" onClick={() => setEscala(x=>Math.min(1.4,Math.round((x+.1)*10)/10))} aria-label="Aumentar tamaño del texto" disabled={escala>=1.4}>A+</button>
        <button type="button" onClick={copiar}>Copiar</button>
        <button type="button" onClick={compartir}>Compartir</button>
      </div>
    </div>
    <div className="reader-content" style={{fontSize: `${escala}em`}}>
      <blockquote>«{texto}»</blockquote>
      <p className="biblical-ref">{referencia}</p>
      <p className="author-signature">{autor}</p>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{estado}</p>
    {estado && <p className="reader-feedback">{estado}</p>}
  </div>;
}

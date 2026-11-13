"use client";
import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const enlaces = [
 {titulo:"Inicio",href:"/"},
 {titulo:"Mensajes",href:"/mensajes"},
 {titulo:"Series",href:"/series"},
 {titulo:"Temporadas",href:"/temporadas"},
 {titulo:"Teología",href:"/teologia"},
 {titulo:"Sobre el autor",href:"/autor"},
 {titulo:"Redes",href:"/redes"},
 {titulo:"Contacto",href:"/contacto"}
];

export function Header(){
 const pathname = usePathname();
 const [abierto, setAbierto] = useState(false);
 function activo(href:string){return href==="/" ? pathname==="/" : pathname.startsWith(href);}
 return <header className="site-header">
  <div className="header-inner">
   <Link href="/" className="brand" aria-label="Palabras que despiertan: ir al inicio" onClick={()=>setAbierto(false)}>
    <span className="brand-cross" aria-hidden="true">✝</span>
    <span className="brand-wordmark">PALABRAS <small>QUE</small> DESPIERTAN</span>
   </Link>
   <nav className="primary-nav" aria-label="Navegación principal">
    {enlaces.map(e=><Link key={e.href} href={e.href} aria-current={activo(e.href)?"page":undefined}>{e.titulo}</Link>)}
    <Link href="/buscar" aria-label="Buscar reflexiones" className="nav-search" aria-current={pathname==="/buscar"?"page":undefined}>
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
    </Link>
   </nav>
   <button className="mobile-toggle" type="button" onClick={()=>setAbierto(v=>!v)} aria-expanded={abierto} aria-controls="mobile-site-menu" aria-label={abierto?"Cerrar menú":"Abrir menú"}>
     <span/><span/><span/>
   </button>
  </div>
  <nav id="mobile-site-menu" className={`mobile-panel ${abierto?"is-open":""}`} aria-label="Navegación móvil" aria-hidden={!abierto}>
    {enlaces.map(e=><Link key={e.href} href={e.href} onClick={()=>setAbierto(false)} aria-current={activo(e.href)?"page":undefined} tabIndex={abierto?0:-1}>{e.titulo}</Link>)}
    <Link href="/buscar" onClick={()=>setAbierto(false)} tabIndex={abierto?0:-1}>Buscar reflexiones</Link>
  </nav>
 </header>;
}

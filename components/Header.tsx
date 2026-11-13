"use client";
import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {SocialLinks} from "@/components/SocialLinks";

const principal=[
 {titulo:"Inicio",href:"/"},
 {titulo:"Revista",href:"/revista"},
 {titulo:"Mensajes",href:"/mensajes"},
 {titulo:"Artículos",href:"/articulos"},
 {titulo:"Testimonios",href:"/testimonios"},
 {titulo:"Series",href:"/series"},
 {titulo:"Teología",href:"/teologia"},
 {titulo:"Sobre el autor",href:"/autor"},
 {titulo:"Contacto",href:"/contacto"}
];
const movil=[
 ...principal,
 {titulo:"Temporadas",href:"/temporadas"},
 {titulo:"Participar",href:"/participar"},
 {titulo:"Redes",href:"/redes"}
];
export function Header(){
 const pathname=usePathname();
 const [abierto,setAbierto]=useState(false);
 function activo(href:string){return href==="/"?pathname==="/":pathname.startsWith(href);}
 return <header className="site-header">
  <div className="header-inner">
   <Link href="/" className="brand" aria-label="Palabras que despiertan, ir al inicio" onClick={()=>setAbierto(false)}>
    <span className="brand-cross" aria-hidden="true">✝</span><span className="brand-wordmark">PALABRAS <small>QUE</small> DESPIERTAN</span>
   </Link>
   <nav className="primary-nav" aria-label="Navegación principal">
    {principal.map(item=><Link key={item.href} href={item.href} aria-current={activo(item.href)?"page":undefined}>{item.titulo}</Link>)}
    <Link href="/buscar" aria-label="Buscar reflexiones" className="nav-search" aria-current={pathname==="/buscar"?"page":undefined}>
     <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
    </Link>
   </nav>
   <SocialLinks compact className="header-social"/>
   <button className="mobile-toggle" type="button" onClick={()=>setAbierto(v=>!v)}
     aria-expanded={abierto} aria-controls="mobile-site-menu" aria-label={abierto?"Cerrar menú":"Abrir menú"}>
    <span/><span/><span/>
   </button>
  </div>
  <nav id="mobile-site-menu" className={`mobile-panel ${abierto?"is-open":""}`} aria-label="Navegación móvil" aria-hidden={!abierto}>
   {movil.map(item=><Link key={item.href} href={item.href} onClick={()=>setAbierto(false)} tabIndex={abierto?0:-1} aria-current={activo(item.href)?"page":undefined}>{item.titulo}</Link>)}
   <Link href="/buscar" onClick={()=>setAbierto(false)} tabIndex={abierto?0:-1}>Buscar en el archivo</Link>
   <SocialLinks compact className="menu-social"/>
  </nav>
 </header>;
}

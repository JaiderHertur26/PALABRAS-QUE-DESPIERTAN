import {SocialLinks} from "@/components/SocialLinks";

/* Navegación HTML nativa: no necesita hidratarse ni cargar JS para abrirse. */
const principal=[
 {titulo:"Inicio",href:"/"},
 {titulo:"Revista",href:"/revista"},
 {titulo:"Mensajes",href:"/mensajes"},
 {titulo:"Artículos",href:"/articulos"},
 {titulo:"Testimonios",href:"/testimonios"},
 {titulo:"Sobre el autor",href:"/autor"}
];
const secundarios=[
 {titulo:"Series",href:"/series"},
 {titulo:"Temporadas",href:"/temporadas"},
 {titulo:"Teología",href:"/teologia"},
 {titulo:"Contacto",href:"/contacto"},
 {titulo:"Participar",href:"/participar"},
 {titulo:"Novedades",href:"/novedades"},
 {titulo:"Redes",href:"/redes"}
];
const movil=[...principal,...secundarios];
export function Header(){
 return <header className="site-header">
  <div className="header-inner">
   <a href="/" className="brand" aria-label="Palabras que despiertan, ir al inicio">
    <span className="brand-cross" aria-hidden="true">✝</span><span className="brand-wordmark">PALABRAS <small>QUE</small> DESPIERTAN</span>
   </a>
   <nav className="primary-nav" aria-label="Navegación principal">
    {principal.map(item=><a key={item.href} href={item.href}>{item.titulo}</a>)}
    <details className="nav-more">
     <summary>Más <span aria-hidden="true">⌄</span></summary>
     <div className="nav-more-list">
      {secundarios.map(item=><a key={item.href} href={item.href}>{item.titulo}</a>)}
     </div>
    </details>
    <a href="/buscar" aria-label="Buscar mensajes y artículos" className="nav-search">
     <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
    </a>
   </nav>
   <SocialLinks compact className="header-social"/>
   <details className="mobile-menu">
    <summary className="mobile-toggle" aria-label="Menú principal">
     <span aria-hidden="true"/><span aria-hidden="true"/><span aria-hidden="true"/>
    </summary>
    <nav className="mobile-panel" aria-label="Navegación móvil">
     {movil.map(item=><a key={item.href} href={item.href}>{item.titulo}</a>)}
     <a href="/buscar">Buscar en la revista</a>
     <SocialLinks compact className="menu-social"/>
    </nav>
   </details>
  </div>
 </header>;
}

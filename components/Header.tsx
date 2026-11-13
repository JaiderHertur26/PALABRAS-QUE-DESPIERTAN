import Link from "next/link";
const nav = [
  ["Inicio","/"], ["Mensajes","/mensajes"], ["Series","/series"],
  ["Temporadas","/temporadas"], ["Teología","/teologia"], ["Sobre el autor","/autor"],
  ["Redes","/redes"], ["Contacto","/contacto"]
];
export function Header() {
  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="Palabras que despiertan, ir al inicio">
        <span className="brand-cross" aria-hidden="true">✝</span>
        <span>PALABRAS <small>QUE</small> DESPIERTAN</span>
      </Link>
      <nav className="primary-nav" aria-label="Navegación principal">
        {nav.map(([nombre,href]) => <Link href={href} key={href}>{nombre}</Link>)}
        <Link href="/buscar" className="nav-search" aria-label="Buscar publicaciones">⌕</Link>
      </nav>
      <details className="mobile-menu">
        <summary>Menú <span aria-hidden="true">☰</span></summary>
        <nav aria-label="Navegación móvil">
          {nav.map(([nombre,href]) => <Link key={href} href={href}>{nombre}</Link>)}
          <Link href="/buscar">Buscar</Link>
        </nav>
      </details>
    </div>
  </header>;
}

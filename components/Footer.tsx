import Link from "next/link";
export function Footer() {
  return <footer className="site-footer">
    <div className="footer-content">
      <div><span className="footer-symbol" aria-hidden="true">✝</span><strong>PALABRAS QUE DESPIERTAN</strong>
      <p>Reflexiones que iluminan la fe.</p></div>
      <div><strong>Explorar</strong><p><Link href="/mensajes">Mensajes</Link> · <Link href="/series">Series</Link> · <Link href="/temporadas">Temporadas</Link></p></div>
      <div><strong>Autor</strong><p>P. Jaider Herrera Turizo</p><p><Link href="/redes">Canales de difusión</Link></p></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} Palabras que despiertan · Todos los derechos reservados.</div>
  </footer>;
}

import Link from "next/link";
import {autor,descripcion,nombreProyecto} from "@/lib/editorial";
export function Footer(){
 return <footer className="site-footer">
  <div className="shell footer-content">
   <div className="footer-brand">
    <span className="footer-cross" aria-hidden="true">✝</span>
    <div><p className="footer-name">{nombreProyecto}</p><p>{descripcion}</p><span className="footer-author">{autor}</span></div>
   </div>
   <div><h2>La revista</h2><nav aria-label="Lectura de la revista">
    <Link href="/revista">Portada editorial</Link>
    <Link href="/mensajes">Mensajes</Link>
    <Link href="/articulos">Artículos teológicos</Link>
    <Link href="/series">Series</Link>
    <Link href="/temporadas">Temporadas</Link>
   </nav></div>
   <div><h2>Comunidad</h2><nav aria-label="Participación de la comunidad">
    <Link href="/testimonios">Testimonios</Link>
    <Link href="/participar">Normas de participación</Link>
    <Link href="/teologia">Fundamento teológico</Link>
    <Link href="/autor">Sobre el autor</Link>
    <Link href="/contacto">Contacto</Link>
   </nav></div>
   <div><h2>Información</h2><nav aria-label="Información del sitio">
    <Link href="/redes">Redes sociales</Link>
    <Link href="/privacidad">Privacidad</Link>
    <Link href="/aviso-legal">Aviso legal</Link>
   </nav></div>
  </div>
  <div className="shell footer-bottom">
   <span>© {new Date().getUTCFullYear()} {nombreProyecto} · {autor}. Todos los derechos reservados.</span>
   <span>La fe se cultiva, la Palabra se medita.</span>
  </div>
 </footer>;
}

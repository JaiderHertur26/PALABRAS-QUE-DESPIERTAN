import Link from "next/link";
import {autor,descripcion,nombreProyecto} from "@/lib/editorial";
export function Footer(){
 return <footer className="site-footer">
  <div className="shell footer-content">
   <div className="footer-brand">
    <span className="footer-cross" aria-hidden="true">✝</span>
    <div><p className="footer-name">{nombreProyecto}</p><p>{descripcion}</p><span className="footer-author">{autor}</span></div>
   </div>
   <div><h2>Explorar</h2><nav aria-label="Enlaces de contenido">
    <Link href="/mensajes">Mensajes publicados</Link>
    <Link href="/series">Series temáticas</Link>
    <Link href="/temporadas">Temporadas</Link>
    <Link href="/teologia">Teología</Link>
   </nav></div>
   <div><h2>El proyecto</h2><nav aria-label="Información del sitio">
    <Link href="/autor">Sobre el autor</Link>
    <Link href="/redes">Redes</Link>
    <Link href="/contacto">Contacto</Link>
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

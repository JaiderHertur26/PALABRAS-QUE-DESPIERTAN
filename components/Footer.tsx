import {SocialLinks} from "@/components/SocialLinks";
import {autor,descripcion,nombreProyecto} from "@/lib/editorial";
export function Footer(){
 return <footer className="site-footer">
  <div className="shell footer-content">
   <div className="footer-brand">
    <span className="footer-cross" aria-hidden="true">✝</span>
    <div><p className="footer-name">{nombreProyecto}</p><p>{descripcion}</p><span className="footer-author">{autor}</span></div>
   </div>
   <div><h2>La revista</h2><nav aria-label="Lectura de la revista">
    <a href="/revista">Portada editorial</a>
    <a href="/mensajes">Mensajes</a>
    <a href="/articulos">Artículos teológicos</a>
    <a href="/series">Series</a>
    <a href="/temporadas">Temporadas</a>
   </nav></div>
   <div><h2>Comunidad</h2><nav aria-label="Participación de la comunidad">
    <a href="/testimonios">Testimonios</a>
    <a href="/participar">Normas de participación</a>
    <a href="/teologia">Fundamento teológico</a>
    <a href="/autor">Sobre el autor</a>
    <a href="/contacto">Contacto</a>
   </nav></div>
   <div><h2>Información</h2><nav aria-label="Información del sitio">
    <a href="/redes">Redes sociales</a>
    <a href="/novedades">Novedades y RSS</a>
    <a href="/privacidad">Privacidad</a>
    <a href="/aviso-legal">Aviso legal</a>
   </nav><SocialLinks className="footer-social"/></div>
  </div>
  <div className="shell footer-bottom">
   <span>© {new Date().getUTCFullYear()} {nombreProyecto} · {autor}. Todos los derechos reservados.</span>
   <span>La fe se cultiva, la Palabra se medita.</span>
  </div>
 </footer>;
}

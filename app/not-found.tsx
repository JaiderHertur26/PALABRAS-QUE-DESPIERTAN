import Link from "next/link";
export default function NoEncontrado(){
 return <section className="shell content-page narrow">
  <p className="eyebrow">ERROR 404 · CONTENIDO NO ENCONTRADO</p>
  <h1>Este camino no está disponible</h1>
  <p className="lead">La página que buscas no existe, ha cambiado de dirección o aún no está publicada.</p>
  <Link className="button-gold" href="/">Regresar al inicio ↗</Link>
 </section>;
}

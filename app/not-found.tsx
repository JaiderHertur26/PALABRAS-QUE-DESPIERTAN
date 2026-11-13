import Link from "next/link";
export default function NoEncontrado(){
 return <section className="shell content-page narrow"><p className="eyebrow">404</p><h1>Página no encontrada</h1><p>Este contenido no existe o no está disponible públicamente.</p><Link className="button-gold" href="/">Volver al inicio</Link></section>;
}

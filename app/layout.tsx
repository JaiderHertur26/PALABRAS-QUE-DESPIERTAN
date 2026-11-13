import type { Metadata } from "next";
import "./globals.css";
import "./reference-layout.css";
import "./mobile-nav.css";
import "./mobile-final.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Palabras que despiertan", template: "%s | Palabras que despiertan" },
  description: "Mensajes breves que iluminan la fe, despiertan la conciencia y tocan la vida. Reflexiones del P. Jaider Herrera Turizo.",
  robots: { index: false, follow: false }
  // Versión local, sin dominio ni autorización de despliegue. Indexación desactivada.
};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="es"><body>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <Header/>
    <main id="contenido">{children}</main>
    <Footer/>
  </body></html>;
}

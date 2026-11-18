import type {Metadata, Viewport} from "next";
import "./globals.css";
import "./site.css";
import "./responsive.css";
import "./social.css";
import "./research.css";
import "./magazine-community.css";
import "./editorial-improvements.css";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import {VisitTracker} from "@/components/VisitTracker";
import {autor,descripcion,lema,nombreProyecto} from "@/lib/editorial";

export const metadata:Metadata = {
 metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.palabrasquedespiertan.online"),
 title:{default:nombreProyecto,template:`%s | ${nombreProyecto}`},
 applicationName:nombreProyecto,
 alternates:{types:{"application/rss+xml":"/feed.xml"}},
 description:descripcion,
 authors:[{name:autor}],
 creator:autor,
 category:"Religión y espiritualidad",
 keywords:["reflexiones católicas","oración","confianza en Dios","Palabra de Dios","pensamientos espirituales","teología católica"],
 openGraph:{
  type:"website",
  locale:"es_CO",
  siteName:nombreProyecto,
  title:nombreProyecto,
  description:`${lema}. ${descripcion}`,
  images:[{url:"/identidad/vista-previa-social.jpg",width:1200,height:630,alt:"Palabras que despiertan, revista teológica"}]
 },
 twitter:{card:"summary_large_image",title:nombreProyecto,description:descripcion,images:["/identidad/vista-previa-social.jpg"]},
 robots:{index:true,follow:true,noarchive:false,nosnippet:false},
 formatDetection:{email:false,address:false,telephone:false}
};

export const viewport:Viewport={
 width:"device-width",
 initialScale:1,
 themeColor:"#0b0806",
 colorScheme:"dark"
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="es-CO">
  <body>
   <a href="#contenido" className="skip-link">Saltar al contenido principal</a>
   <Header/>
   <main id="contenido">{children}</main>
   <Footer/>
   <VisitTracker/>
  </body>
 </html>;
}

import type {MetadataRoute} from "next";
import {publicArticulos,publicMensajes,publicTemas} from "@/lib/editorial-live";

export const dynamic="force-dynamic";
/** Incluye solamente obras autorizadas y ya visibles. Nunca anticipa contenidos programados. */
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const [articulos,mensajes,temas]=await Promise.all([publicArticulos(),publicMensajes(),publicTemas()]);
 const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.palabrasquedespiertan.online").replace(/\/+$/,"");
 const staticPaths=["/","/revista","/articulos","/teologia","/mensajes","/autor","/series",
  "/temporadas","/testimonios","/contacto","/redes","/participar","/novedades","/privacidad","/aviso-legal"];
 const launch=new Date("2026-11-13T12:00:00Z");
 const safeDate=(iso:string)=>{const time=Date.parse(iso+"T12:00:00Z");return new Date(Number.isFinite(time)?Math.min(time,Date.now()):Date.now())};
 return [
  ...staticPaths.map(route=>({url:base+route,lastModified:launch,changeFrequency:"monthly" as const,priority:route==="/"||route==="/revista"?1:0.6})),
  ...articulos.map(a=>({url:base+"/articulos/"+a.slug,lastModified:safeDate(a.fechaEdicion),changeFrequency:"monthly" as const,priority:0.85})),
  ...mensajes.map(m=>({url:base+"/mensajes/"+m.slug,lastModified:safeDate(m.fecha),changeFrequency:"monthly" as const,priority:0.8})),
  ...temas.map(t=>({url:base+"/testimonios/"+t.slug,lastModified:launch,changeFrequency:"monthly" as const,priority:0.55}))
 ];
}

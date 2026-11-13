import type {MetadataRoute} from "next";
import {articulos} from "@/lib/community/publications";
import {mensajes} from "@/lib/editorial";

export default function sitemap():MetadataRoute.Sitemap {
 const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://palabrasquedespiertan.vercel.app").replace(/\/+$/,"");
 const staticPaths=["/","/revista","/articulos","/teologia","/mensajes","/autor","/series","/temporadas"];
 const created=new Date("2026-11-13T12:00:00Z");
 return [
 ...staticPaths.map(route=>({url:base+route,lastModified:created,changeFrequency:"monthly" as const,priority:route==="/revista"?1:0.7})),
 ...articulos.map(a=>({url:base+"/articulos/"+a.slug,lastModified:new Date(a.fechaEdicion+"T12:00:00Z"),changeFrequency:"monthly" as const,priority:0.8})),
 ...mensajes.map(m=>({url:base+"/mensajes/"+m.slug,lastModified:new Date(m.fecha+"T12:00:00Z"),changeFrequency:"monthly" as const,priority:0.6}))
 ];
}

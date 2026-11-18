import {publicArticulos,publicMensajes} from "@/lib/editorial-live";
export const dynamic="force-dynamic";
export const revalidate=0;
const site="https://www.palabrasquedespiertan.online";
function escapeXml(s:string){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function fechaRss(d:string){const date=new Date(d+"T12:00:00Z");return Number.isNaN(date.getTime())?new Date(0).toUTCString():date.toUTCString();}
export async function GET(){
 const [articulos,mensajes]=await Promise.all([publicArticulos(),publicMensajes()]);
 const items=[
  ...articulos.map(a=>({id:a.id,titulo:a.titulo,descripcion:a.resumen,url:site+"/articulos/"+a.slug,fecha:a.fecha})),
  ...mensajes.map(m=>({id:m.id,titulo:m.titulo,descripcion:m.texto,url:site+"/mensajes/"+m.slug,fecha:m.fecha}))
 ].sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id.localeCompare(a.id)).slice(0,30);
 const xml='<?xml version="1.0" encoding="UTF-8"?>'+'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'+
 '<title>Palabras que despiertan — Novedades</title><link>'+site+'</link>'+
 '<description>Artículos y mensajes de reflexión católica oficialmente publicados.</description>'+
 '<language>es-CO</language><atom:link href="'+site+'/feed.xml" rel="self" type="application/rss+xml"/>'+
 items.map(i=>'<item><title>'+escapeXml(i.titulo)+'</title><link>'+escapeXml(i.url)+'</link>'+
  '<guid isPermaLink="true">'+escapeXml(i.url)+'</guid><pubDate>'+fechaRss(i.fecha)+'</pubDate>'+
  '<description>'+escapeXml(i.descripcion.slice(0,450))+'</description></item>').join("")+
 '</channel></rss>';
 return new Response(xml,{headers:{"Content-Type":"application/rss+xml; charset=utf-8",
  "Cache-Control":"public, s-maxage=60, stale-while-revalidate=30","X-Content-Type-Options":"nosniff"}});
}

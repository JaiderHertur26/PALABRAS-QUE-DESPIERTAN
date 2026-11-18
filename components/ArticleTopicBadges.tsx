import Link from "next/link";
import {temaPorId,temasDeArticulo,type TemaId} from "@/lib/editorial-topics";
import type {ArticuloPublico} from "@/lib/community/publications";

export function ArticleTopicBadges({articulo,limit=3}:{articulo:ArticuloPublico;limit?:number}){
 const temas: TemaId[]=temasDeArticulo(articulo).slice(0,limit);
 if(!temas.length)return null;
 return <nav className="article-topics" aria-label={"Temas de "+articulo.titulo}>
  {temas.map(id=><Link key={id} href={"/buscar?tipo=articulos&tema="+id} prefetch={false}>{temaPorId(id).nombre}</Link>)}
 </nav>;
}

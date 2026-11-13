import type {Metadata} from "next";
import { mensajes } from "@/lib/editorial";
import { MessageCard } from "@/components/MessageCard";
export const metadata: Metadata={title:"Mensajes"};
export default function Mensajes(){
 return <div className="shell content-page">
  <p className="eyebrow">ARCHIVO DE REFLEXIONES</p><h1>Mensajes</h1>
  <p className="lead">Cada pensamiento busca iluminar la fe y abrir una pregunta para la vida. Solo encontrarás aquí los mensajes cuya publicación ha sido confirmada.</p>
  <div className="cards-grid">{mensajes.map(m=><MessageCard key={m.id} mensaje={m}/>)}</div>
 </div>;
}

import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{
 return {
  name:"Palabras que despiertan",
  short_name:"Palabras",
  description:"Reflexiones que iluminan la fe.",
  start_url:"/",
  display:"browser",
  background_color:"#0b0806",
  theme_color:"#0b0806",
  lang:"es-CO",
  icons:[
   {src:"/icon.png",sizes:"256x256",type:"image/png",purpose:"any"},
   {src:"/apple-icon.png",sizes:"180x180",type:"image/png",purpose:"any"}
  ]
 };
}

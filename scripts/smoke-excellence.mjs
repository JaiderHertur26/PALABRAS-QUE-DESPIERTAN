import assert from "node:assert/strict";
const base=(process.env.BASE_URL||"https://www.palabrasquedespiertan.online").replace(/\/$/,"");
const checks=[
 ["/",200,["home-hero-shortcuts","cruz-fondo-home-mobile.webp","Última investigación"]],
 ["/buscar?tema=oracion",200,["Oración","resultados publicados"]],
 ["/buscar?tipo=articulos&tema=creacion",200,["Todo fue creado por Él y para Él"]],
 ["/articulos",200,["EXPLORAR POR TEMA","Cuadernos de investigación"]],
 ["/articulos/art-001-todo-fue-creado-por-el-y-para-el",200,["Comenzar a leer","Creación","Trinidad"]],
 ["/mensajes/pd-001-dios-ya-lo-sabe",200,["Dios ya lo sabe"]],
 ["/mensajes/pd-003-el-silencio",404,[]],
 ["/articulos/art-003-del-eden-al-calvario",404,[]],
 ["/novedades",200,["Publicaciones recientes","Canal RSS"]],
 ["/feed.xml",200,["<rss","/mensajes/pd-001"]],
 ["/sitemap.xml",200,["/novedades","/mensajes/pd-001"]],
 ["/identidad/cruz-fondo-home.webp",200,[]],
 ["/identidad/cruz-fondo-home-mobile.webp",200,[]]
];
let failed=0;
for(const [path,status,fragments] of checks){
 try{
  const res=await fetch(base+path,{signal:AbortSignal.timeout(30000)});
  const type=res.headers.get("content-type")||"";
  const body=type.includes("text")||type.includes("xml")?await res.text():"";
  const missing=fragments.filter(f=>!body.includes(f));
  const ok=res.status===status&&!missing.length;
  if(!ok)failed++;
  console.log(ok?"PASS":"FAIL",res.status,path,missing.length?"Missing: "+missing.join(", "):"");
  if(path==="/feed.xml"){assert.equal(type.includes("xml"),true);assert.equal(body.includes("ART-010"),false);}
  if(path==="/sitemap.xml"){assert.equal(body.includes("/mensajes/pd-003"),false);}
 }catch(e){failed++;console.log("ERROR",path,e.message);}
}
console.log("SMOKE_RESULT",checks.length-failed,"/",checks.length);
if(failed)process.exitCode=1;

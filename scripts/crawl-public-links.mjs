const origin=process.env.BASE_URL||"https://www.palabrasquedespiertan.online";
const base=new URL(origin);
const visited=new Set(),queued=new Set(["/"]);
const errors=[],ok=[];
const get=async(path)=>{
 try{
  const res=await fetch(new URL(path,base),{redirect:"follow",signal:AbortSignal.timeout(25000)});
  const type=res.headers.get("content-type")||"";
  const html=type.includes("text/html")?await res.text():"";
  if(!res.ok)errors.push({path,status:res.status});else ok.push(path);
  if(res.ok&&html&&!html.includes('lang="es-CO"'))errors.push({path,detail:"missing es-CO lang"});
  if(res.ok&&html&&!html.includes("<h1"))errors.push({path,detail:"missing H1"});
  for(const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
   let next;try{next=new URL(m[1].replaceAll("&amp;","&"),base);}catch{continue}
   if(next.origin!==base.origin)continue;
   if(next.pathname.startsWith("/api/")||next.pathname.startsWith("/_next/"))continue;
   const label=next.pathname+(next.search||"");
   if(label.length<250&&queued.size<130)queued.add(label);
  }
 }catch(e){errors.push({path,error:e.message});}
};
try{const rss=await fetch(new URL("/sitemap.xml",base));const t=await rss.text();
 for(const m of t.matchAll(/<loc>([^<]+)<\/loc>/g)){
  const u=new URL(m[1]);if(queued.size<130)queued.add(u.pathname);
 }
}catch(e){errors.push({sitemap:e.message});}
while(queued.size){
 const todo=[...queued].filter(p=>!visited.has(p)).slice(0,6);
 if(!todo.length)break;for(const p of todo)visited.add(p);
 await Promise.all(todo.map(get));
 if(visited.size>=130)break;
}
console.log("CRAWL",JSON.stringify({site:base.origin,visited:visited.size,ok:ok.length,errors:errors.length},null,2));
console.log("ERRORS",JSON.stringify(errors.slice(0,25),null,2));
console.log("ROUTES",JSON.stringify(ok.slice(0,90)));
if(errors.length)process.exitCode=1;

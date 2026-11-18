export type HeadingItem={level:number;title:string;anchor:string};

function slug(text:string){
 return text.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[*?¿!¡.:;«»()]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);
}
export function articleHeadings(markdown:string):HeadingItem[]{
 const used=new Map<string,number>();
 const found:HeadingItem[]=[];
 for(const line of markdown.split(/\r?\n/)){
  const match=line.match(/^(#{2,3})\s+(.+)/);
  if(!match)continue;
  const title=match[2].trim().replace(/\*\*/g,"").replace(/\*/g,"");
  const base=slug(title)||"apartado",n=used.get(base)||0;
  used.set(base,n+1);
  found.push({level:match[1].length,title,anchor:n?base+"-"+(n+1):base});
 }
 return found;
}

/* Escapar el contenido ANTES de convertir la tipografía editorial a HTML.
   Nunca se permite insertar HTML procedente del texto almacenado. */
function escapeHtml(s:string){
 return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#x27;");
}
function inlineHtml(input:string):string{
 const re=/(https?:\/\/[^\s<>)]+|\*\*[^*]+\*\*|\*[^*]+\*)/g;
 const result:string[]=[];
 let i=0,m:RegExpExecArray|null;
 while((m=re.exec(input))){
  result.push(escapeHtml(input.slice(i,m.index)));const raw=m[0];
  if(raw.startsWith("https://")){
   const value=raw.replace(/[.,;:]+$/,"");
   try{
    const link=new URL(value);
    if(link.protocol==="https:"){
     result.push('<a class="inline-link article-external" href="'+escapeHtml(link.href)
      +'" target="_blank" rel="noopener noreferrer">'+escapeHtml(link.hostname.replace(/^www\./,""))+"</a>");
     result.push(escapeHtml(raw.slice(value.length)));
    }else result.push(escapeHtml(raw));
   }catch{result.push(escapeHtml(raw));}
  }else if(raw.startsWith("**"))result.push("<strong>"+escapeHtml(raw.slice(2,-2))+"</strong>");
  else if(raw.startsWith("*"))result.push("<em>"+escapeHtml(raw.slice(1,-1))+"</em>");
  else result.push(escapeHtml(raw));
  i=re.lastIndex;
 }
 result.push(escapeHtml(input.slice(i)));
 return result.join("");
}

export function renderArticleHtml(contenido:string):string{
 const headings=articleHeadings(contenido);
 let nextHeading=0;
 const parts:string[]=[];
 const lines=contenido.split(/\r?\n/);
 let paragraph:string[]=[];
 let bullets:string[]=[];
 let numbered:string[]=[];
 function flushText(){
  if(paragraph.length){parts.push("<p>"+inlineHtml(paragraph.join(" ").trim())+"</p>");paragraph=[];}
 }
 function flushList(){
  if(bullets.length){parts.push("<ul>"+bullets.map(b=>"<li>"+inlineHtml(b)+"</li>").join("")+"</ul>");bullets=[];}
  if(numbered.length){parts.push("<ol>"+numbered.map(b=>"<li>"+inlineHtml(b)+"</li>").join("")+"</ol>");numbered=[];}
 }
 for(const raw of lines){
  const line=raw.trim();
  if(!line){flushText();flushList();continue;}
  if(line==="---"){flushText();flushList();parts.push("<hr/>");continue;}
  const heading=line.match(/^(#{2,3})\s+(.+)/);
  if(heading){
   flushText();flushList();
   const h=headings[nextHeading++];
   const tag=h.level===2?"h2":"h3";
   parts.push("<"+tag+' id="'+escapeHtml(h.anchor)+'">'+inlineHtml(h.title)+"</"+tag+">");
   continue;
  }
  const bullet=line.match(/^- (.+)/);
  const num=line.match(/^\d+\.\s+(.+)/);
  if(bullet){flushText();if(numbered.length)flushList();bullets.push(bullet[1]);continue;}
  if(num){flushText();if(bullets.length)flushList();numbered.push(num[1]);continue;}
  if(bullets.length||numbered.length)flushList();
  paragraph.push(line);
 }
 flushText();flushList();
 return parts.join("");
}

export function ArticleBody({contenido}:{contenido:string}){
 return <div className="research-prose" dangerouslySetInnerHTML={{__html:renderArticleHtml(contenido)}}/>;
}

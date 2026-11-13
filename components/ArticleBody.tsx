import React from "react";

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

function inlineParts(input:string):React.ReactNode[]{
 const output:React.ReactNode[]=[];
 const re=/(https?:\/\/[^\s<>)]+|\*\*[^*]+\*\*|\*[^*]+\*)/g;
 let i=0,m:RegExpExecArray|null,serial=0;
 function append(t:string){if(t)output.push(t);}
 while((m=re.exec(input))){
  append(input.slice(i,m.index));const raw=m[0];
  if(raw.startsWith("https://")){
   const value=raw.replace(/[.,;:]+$/,"");
   try {
    const link=new URL(value);
    if(link.protocol==="https:"){
     output.push(<a className="inline-link article-external" href={link.href} target="_blank" rel="noopener noreferrer" key={serial++}>{link.hostname.replace(/^www\./,"")}</a>);
     append(raw.slice(value.length));
    } else append(raw);
   }catch{append(raw);}
  }else if(raw.startsWith("**"))output.push(<strong key={serial++}>{raw.slice(2,-2)}</strong>);
  else if(raw.startsWith("*"))output.push(<em key={serial++}>{raw.slice(1,-1)}</em>);
  else append(raw);
  i=re.lastIndex;
 }
 append(input.slice(i));return output;
}

export function ArticleBody({contenido}:{contenido:string}){
 const headings=articleHeadings(contenido);
 let nextHeading=0;
 const parts:React.ReactNode[]=[];
 const lines=contenido.split(/\r?\n/);
 let paragraph:string[]=[];
 let bullets:string[]=[];
 let numbered:string[]=[];
 let item=0;
 function flushText(){
  if(paragraph.length){parts.push(<p key={"p"+item++}>{inlineParts(paragraph.join(" ").trim())}</p>);paragraph=[];}
 }
 function flushList(){
  if(bullets.length){parts.push(<ul key={"list"+item++}>{bullets.map((b,i)=><li key={i}>{inlineParts(b)}</li>)}</ul>);bullets=[];}
  if(numbered.length){parts.push(<ol key={"list"+item++}>{numbered.map((b,i)=><li key={i}>{inlineParts(b)}</li>)}</ol>);numbered=[];}
 }
 for(const raw of lines){
  const line=raw.trim();
  if(!line){flushText();flushList();continue;}
  if(line==="---"){flushText();flushList();parts.push(<hr key={"hr"+item++}/>);continue;}
  const heading=line.match(/^(#{2,3})\s+(.+)/);
  if(heading){
   flushText();flushList();
   const h=headings[nextHeading++];
   if(h.level===2)parts.push(<h2 id={h.anchor} key={"h"+item++}>{inlineParts(h.title)}</h2>);
   else parts.push(<h3 id={h.anchor} key={"h"+item++}>{inlineParts(h.title)}</h3>);
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
 return <div className="research-prose">{parts}</div>;
}

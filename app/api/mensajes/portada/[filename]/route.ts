import {createClient} from "@supabase/supabase-js";
import sharp from "sharp";
import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "@/lib/supabase/config";

export const runtime="nodejs";
export const dynamic="force-dynamic";

// PD-002 is already published. Do not make future message covers public here.
// Prefer the author's original PNG in protected Storage. The vector rendering
// below is an interim exact-text backup, never a replacement of the original.
const denied=()=>new Response("Imagen no disponible",{status:404,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
const failed=()=>new Response("Imagen temporalmente no disponible",{status:503,headers:{"Cache-Control":"private, no-store"}});

const card=String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1254 1254" role="img" aria-label="PD-002 — La puerta que se abre. Tarjeta de contingencia con texto original del autor.">
<defs>
 <radialGradient id="night"><stop offset="0" stop-color="#302013"/><stop offset=".57" stop-color="#100b08"/><stop offset="1" stop-color="#050403"/></radialGradient>
 <radialGradient id="light"><stop offset="0" stop-color="#d89c31" stop-opacity=".72"/><stop offset=".4" stop-color="#bf7c20" stop-opacity=".22"/><stop offset="1" stop-color="#5b2d00" stop-opacity="0"/></radialGradient>
 <linearGradient id="gold"><stop offset="0" stop-color="#a16d1d"/><stop offset=".46" stop-color="#ffdc74"/><stop offset="1" stop-color="#8a541c"/></linearGradient>
 <linearGradient id="page"><stop offset="0" stop-color="#e8bc5a"/><stop offset=".65" stop-color="#fff0c1"/><stop offset="1" stop-color="#92703d"/></linearGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="12"/></filter>
 <filter id="paper"><feTurbulence baseFrequency=".08" numOctaves="2" seed="3" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".035"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
</defs>
<rect width="1254" height="1254" fill="url(#night)"/>
<ellipse cx="625" cy="74" rx="280" ry="210" fill="url(#light)"/>
<ellipse cx="630" cy="1052" rx="520" ry="235" fill="url(#light)" opacity=".8"/>
<path d="M625 15V155M554 82H696" stroke="#f5ca53" stroke-width="8" opacity=".65" filter="url(#glow)"/>
<path d="M625 20V152M558 84H693" stroke="url(#gold)" stroke-width="3"/>
<g fill="url(#gold)" font-family="Georgia, 'Times New Roman',serif" text-anchor="middle">
<text x="627" y="204" font-size="49" letter-spacing="4">PALABRAS QUE DESPIERTAN</text>
</g>
<path d="M310 229H528M725 229H944" stroke="url(#gold)" stroke-width="2"/>
<path d="M545 236q39-17 82 4q44-21 83-4v32q-39-16-83 6q-44-22-82-6Z" fill="none" stroke="#e6bc5b" stroke-width="3"/>
<path d="M627 241V273" stroke="#e6bc5b" stroke-width="2"/>
<text x="627" y="305" font-family="Georgia,'Times New Roman',serif" font-size="18" letter-spacing="7" fill="#f3e5ce" text-anchor="middle">SERIE I · VERDADES QUE SIEMPRE ESTUVIERON AHÍ</text>
<path d="M390 346H575M679 346H864" stroke="#c49544" stroke-width="2"/>
<text x="627" y="357" font-family="Georgia,serif" font-size="29" letter-spacing="8" fill="#f6edda" text-anchor="middle">002</text>
<g fill="#f9f1e4" font-family="Georgia,'Times New Roman',serif" font-size="50" text-anchor="middle">
<text x="627" y="424">«Cuando comienzas a <tspan fill="#ffce5b" font-weight="bold">orar</tspan>, no estás</text>
<text x="627" y="485">abriendo una puerta para que Dios</text>
<text x="627" y="546">pueda entrar en tu vida. Su amor ya</text>
<text x="627" y="607">te precede. La oración abre tu</text>
<text x="627" y="668"><tspan fill="#ffce5b" font-weight="bold">corazón</tspan> para que puedas acoger</text>
<text x="627" y="729">libremente a Aquel que nunca ha</text>
<text x="627" y="790">dejado de buscarte».</text>
</g>
<path d="M314 834H442M813 834H941" stroke="url(#gold)" stroke-width="2"/>
<text x="627" y="847" font-family="Georgia,serif" font-size="30" font-style="italic" text-anchor="middle" fill="#f8eddd">Ap 3,20 · 1 Jn 4,19</text>
<!-- an open Scriptures motif, respecting the approved graphic's symbolic content -->
<ellipse cx="627" cy="1080" rx="465" ry="47" fill="#000" opacity=".58" filter="url(#glow)"/>
<path d="M140 996Q375 928 627 1002Q875 924 1115 996L1070 1090Q832 1037 627 1100Q416 1040 180 1090Z" fill="#39220d" stroke="#c38e3b" stroke-width="4"/>
<path d="M145 980Q386 918 627 984Q859 921 1110 980L1087 1059Q836 1010 627 1081Q422 1013 169 1062Z" fill="url(#page)" stroke="#f0d28d" stroke-width="3"/>
<path d="M627 983V1080" stroke="#ad782a" stroke-width="4"/>
<g stroke="#9d722c" stroke-width="2" opacity=".43">
<path d="M200 991Q416 960 607 1000M204 1013Q416 982 607 1021M204 1036Q413 1004 607 1042"/>
<path d="M650 1000Q857 965 1065 993M650 1021Q857 985 1065 1014M650 1042Q857 1007 1065 1037"/>
</g>
<path d="M160 1171H350M897 1171H1094" stroke="url(#gold)" stroke-width="2"/>
<text x="627" y="1181" font-family="Georgia,serif" font-size="36" font-style="italic" text-anchor="middle" fill="#f3e5ce">P. Jaider Herrera Turizo</text>
</svg>`;

export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 if(filename!=="pd-002-la-puerta-que-se-abre")return denied();
 const secret=process.env.SUPABASE_SECRET_KEY??"";
 if(!accesoPublicoConfigurado()||!secret.startsWith("sb_secret_"))return denied();
 const db=createClient(supabaseProjectUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:row,error}=await db.from("editorial_items")
  .select("code,kind,state,scheduled_at,approved_by_author,cover_url")
  .eq("kind","mensaje").eq("code","PD-002").maybeSingle();
 if(error)return failed();
 const visible=row?.approved_by_author===true&&(
  row.state==="published"||(row.state==="scheduled"&&row.scheduled_at&&Date.parse(row.scheduled_at)<=Date.now()));
 if(!visible)return denied();
 const bucket=db.storage.from("pqd-article-covers-private-v1");
 const candidates=[
  "mensajes/pd-002-la-puerta-que-se-abre.png",
  "pd-002-la-puerta-que-se-abre.png",
  "mensajes/pd-002.png",
  "pd-002.png"
 ];
 for(const path of candidates){
  const {data:file,error:storageError}=await bucket.download(path);
  if(!storageError&&file){
   return new Response(await file.arrayBuffer(),{
    status:200,headers:{"Content-Type":"image/png","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-PQD-Asset":"original-storage"}
   });
  }
 }
 // Recover the EXACT, already published artwork from a private source if available.
 // The URL is a short-lived sensitive server env variable, never exposed to a client.
 const temporarySource=process.env.PQD_PD002_ORIGINAL_SHARE_URL;
 if(temporarySource){
  try{
   const source=new URL(temporarySource);
   if(source.hostname==="palabrasquedespiertan-84600kc0x-jaiderherreras-projects.vercel.app"
       &&source.pathname==="/mensajes/pd-002-la-puerta-que-se-abre.png"
       &&source.searchParams.has("_vercel_share")){
    const trustedHosts=new Set([source.hostname,"vercel.com","www.vercel.com"]);
    const cookiesByHost=new Map<string,string[]>();
    let response=await fetch(source,{redirect:"manual",cache:"no-store"});
    console.info("PD002_MIGRATE_FETCH",response.status,response.headers.get("content-type"));
    for(let n=0;n<8&&response.status>=300&&response.status<400;n++){
     const currentHost=new URL(response.url).hostname;
     for(const item of response.headers.getSetCookie()){
      const cookie=item.split(";")[0];
      if(cookie.includes("=")){
       const array=cookiesByHost.get(currentHost)??[];
       array.push(cookie);
       cookiesByHost.set(currentHost,array);
      }
     }
     const where=response.headers.get("location");
     if(!where)break;
     const next=new URL(where,response.url);
     console.info("PD002_MIGRATE_REDIRECT_HOST",next.hostname);
     if(next.protocol!=="https:"||!trustedHosts.has(next.hostname))break;
     const headers=new Headers();
     const destCookies=cookiesByHost.get(next.hostname);
     if(destCookies?.length)headers.set("cookie",destCookies.join("; "));
     response=await fetch(next,{redirect:"manual",cache:"no-store",headers});
     console.info("PD002_MIGRATE_REDIRECT",response.status,response.headers.get("content-type"));
    }
    if(response.ok&&(response.headers.get("content-type")??"").includes("image/png")){
     const data=Buffer.from(await response.arrayBuffer());
     const digest=createHash("sha1").update(data).digest("hex");
     if(data.length>100000&&data.length<4000000
       &&digest==="c6cc5bfee7aafb53fbca09b5cd11a1c503e31ebd"){
      const key="mensajes/pd-002-la-puerta-que-se-abre.png";
      const {error:uploadError}=await bucket.upload(key,new Blob([new Uint8Array(data)],{type:"image/png"}),{
       upsert:false,contentType:"image/png",cacheControl:"0"
      });
      if(!uploadError){
       return new Response(new Uint8Array(data),{
        status:200,headers:{"Content-Type":"image/png","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-PQD-Asset":"original-restored"}
       });
      }
      // Handle a concurrent upload without serving an unverified file.
      const {data:existing,error:readError}=await bucket.download(key);
      if(!readError&&existing){
       const bytes=Buffer.from(await existing.arrayBuffer());
       if(createHash("sha1").update(bytes).digest("hex")===digest){
        return new Response(new Uint8Array(bytes),{
         status:200,headers:{"Content-Type":"image/png","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-PQD-Asset":"original-storage"}
        });
       }
      }
     }
    }
   }
  }catch(err){
   console.info("PD002_MIGRATE_ERROR",err instanceof Error?err.name:"unknown");
   // Do not expose the source URL or credentials in an error response.
  }
 }
 console.info("PD002_MIGRATE_FALLBACK",Boolean(temporarySource));
 // Interim, clearly identifiable substitute. Original PNG remains untouched.
 const png=await sharp(Buffer.from(card)).png().toBuffer();
 return new Response(new Uint8Array(png),{
  status:200,headers:{"Content-Type":"image/png","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-PQD-Asset":"text-faithful-fallback"}
 });
}

/**
 * One-time, tightly scoped migration endpoint for the original PD-002 PNG.
 * POST does not publish an unpublished message, change text, or change any date.
 * The endpoint will be removed after its successful verified migration.
 */
export async function POST(request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 if(filename!=="pd-002-la-puerta-que-se-abre")return denied();
 const migrationSecret=process.env.PQD_PD002_ORIGINAL_SHARE_URL;
 const serviceKey=process.env.SUPABASE_SECRET_KEY;
 if(!migrationSecret||!migrationSecret.includes("_vercel_share=")
    ||!serviceKey?.startsWith("sb_secret_")||!accesoPublicoConfigurado())return failed();
 const supplied=request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
 if(!supplied)return denied();
 const expected=createHmac("sha256",migrationSecret)
  .update("pqd-pd002-original-artwork-migration-2026-11-17").digest("hex");
 if(!timingSafeEqual(Buffer.from(supplied,"hex"),Buffer.from(expected,"hex")))return denied();

 const length=Number(request.headers.get("content-length")||"0");
 if(length&&length!==2019698)return new Response("Invalid asset size",{status:400});
 const bytes=Buffer.from(await request.arrayBuffer());
 const checksum=createHash("sha1").update(bytes).digest("hex");
 if(bytes.length!==2019698||checksum!=="c6cc5bfee7aafb53fbca09b5cd11a1c503e31ebd")
  return new Response("Invalid original artwork fingerprint",{status:400});

 const db=createClient(supabaseProjectUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:row,error:rowError}=await db.from("editorial_items")
  .select("code,kind,state,approved_by_author,scheduled_at")
  .eq("kind","mensaje").eq("code","PD-002").maybeSingle();
 const visible=row?.approved_by_author===true&&(
   row.state==="published"||(row.state==="scheduled"&&row.scheduled_at&&Date.parse(row.scheduled_at)<=Date.now()));
 if(rowError||!visible)return denied();

 const bucket=db.storage.from("pqd-article-covers-private-v1");
 const target="mensajes/pd-002-la-puerta-que-se-abre.png";
 const prior=await bucket.download(target);
 if(prior.data){
  const already=Buffer.from(await prior.data.arrayBuffer());
  if(createHash("sha1").update(already).digest("hex")!==checksum)
    return new Response("Original asset conflict",{status:409});
 }else{
  const {error:uploadError}=await bucket.upload(target,new Blob([new Uint8Array(bytes)],{type:"image/png"}),{
   upsert:false,contentType:"image/png",cacheControl:"0"
  });
  if(uploadError)return failed();
 }
 const {data:verified,error:verifyError}=await bucket.download(target);
 if(verifyError||!verified)return failed();
 const checkBytes=Buffer.from(await verified.arrayBuffer());
 if(checkBytes.length!==bytes.length||createHash("sha1").update(checkBytes).digest("hex")!==checksum)return failed();
 return Response.json({status:"original-restored",code:"PD-002",storage:"private",bytes:bytes.length,
  sha1:checksum},{status:200,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}

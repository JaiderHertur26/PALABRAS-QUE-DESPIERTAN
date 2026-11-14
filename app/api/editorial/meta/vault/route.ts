import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {createCipheriv,randomBytes,timingSafeEqual} from "node:crypto";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const url="https://lwuzkjvolxwkxdyafcjv.supabase.co";
const bucket="pqd-meta-credentials-v1";
const keyPath="v1/instagram-unified.json";
const noCache={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex,nofollow"};
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:noCache});

function secureEqual(a:string,b:string){
 const x=Buffer.from(a),y=Buffer.from(b);
 return x.length===y.length&&x.length>=32&&timingSafeEqual(x,y);
}
async function authorized(request:NextRequest){
 const shared=process.env.META_BRIDGE_KEY||"";
 if(!/^[0-9a-f]{64}$/i.test(shared)||!secureEqual(request.headers.get("x-pqd-meta-bridge")||"",shared))return false;
 const bearer=/^Bearer ([A-Za-z0-9_.-]+)$/.exec(request.headers.get("authorization")||"");
 const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";
 if(!bearer||!publishable.startsWith("sb_publishable_"))return false;
 const userClient=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+bearer[1]}}});
 const {data:{user},error}=await userClient.auth.getUser(bearer[1]);
 if(error||!user||user.is_anonymous||!user.email_confirmed_at||
 user.email?.toLowerCase()!=="pquedespiertan@gmail.com")return false;
 const {data:permitted,error:e}=await userClient.rpc("editorial_is_authorized");
 return !e&&permitted===true;
}
function store(){
 const secret=process.env.SUPABASE_SECRET_KEY||"";
 if(!secret.startsWith("sb_secret_")||process.env.NEXT_PUBLIC_SUPABASE_URL!==url)throw Error("Storage not configured");
 return createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from(bucket);
}
function cipherKey(){
 const raw=process.env.META_TOKEN_ENCRYPTION_KEY||"";
 if(!/^[a-f0-9]{64}$/i.test(raw))throw Error("Encryption not configured");
 return Buffer.from(raw,"hex");
}
type Stored={version:1;at:string;appId:string;scopes:string[];expiresAt:number|null;verifiedAccount:boolean;iv:string;tag:string;encrypted:string};
export async function GET(request:NextRequest){
 try{
  if(!await authorized(request))return reply({error:"Acceso no autorizado"},403);
  const {data,error}=await store().download(keyPath);
  if(error||!data)return reply({connected:false,scopes:[],verifiedAccount:false});
  const item=JSON.parse(await data.text()) as Stored;
  if(item.version!==1||item.appId!=="2572239026621118")throw Error("Invalid connection");
  return reply({connected:true,at:item.at,scopes:item.scopes,expiresAt:item.expiresAt,verifiedAccount:item.verifiedAccount});
 }catch{return reply({error:"No se pudo verificar la conexión"},503);}
}
export async function POST(request:NextRequest){
 try{
  if(!await authorized(request))return reply({error:"Acceso no autorizado"},403);
  if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return reply({error:"Formato no permitido"},415);
  if(Number(request.headers.get("content-length")||0)>7000)return reply({error:"Solicitud demasiado grande"},413);
  const body=await request.json() as {token?:unknown;scopes?:unknown;appId?:unknown;expiresAt?:unknown;verifiedAccount?:unknown};
  if(typeof body.token!=="string"||body.token.length<20||body.token.length>4096||
    body.appId!=="2572239026621118"||!Array.isArray(body.scopes)||
    body.scopes.some(x=>typeof x!=="string"||!/^[-_a-z0-9]{3,60}$/.test(x))||
    !body.scopes.includes("instagram_basic")||!body.scopes.includes("instagram_content_publish")||
    body.scopes.length>30)return reply({error:"Permisos de Instagram no válidos"},400);
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",cipherKey(),iv);
  cipher.setAAD(Buffer.from("pqd:meta:instagram:v1"));
  const encrypted=Buffer.concat([cipher.update(body.token,"utf8"),cipher.final()]);
  const payload:Stored={
    version:1,appId:"2572239026621118",at:new Date().toISOString(),
    scopes:body.scopes,expiresAt:typeof body.expiresAt==="number"?body.expiresAt:null,
    verifiedAccount:body.verifiedAccount===true,
    iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"),
    encrypted:encrypted.toString("base64"),
  };
  const {error}=await store().upload(keyPath,
    new Blob([JSON.stringify(payload)],{type:"application/json"}),
    {contentType:"application/json",upsert:true,cacheControl:"0"});
  if(error)throw Error("Storage upload failed");
  return reply({stored:true,at:payload.at,verifiedAccount:payload.verifiedAccount});
 }catch{return reply({error:"No se pudo almacenar la autorización"},503);}
}

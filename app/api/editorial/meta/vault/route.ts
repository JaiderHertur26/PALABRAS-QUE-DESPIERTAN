import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {createCipheriv,randomBytes,timingSafeEqual} from "node:crypto";
import {verifySavedInstagram,verifySavedFacebook,type MetaVaultRecord} from "@/lib/meta-account-verification";

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
type Stored=MetaVaultRecord;
export async function GET(request:NextRequest){
 try{
  if(!await authorized(request))return reply({error:"Acceso no autorizado"},403);
  const {data,error}=await store().download(keyPath);
  if(error||!data)return reply({connected:false,scopes:[],verifiedAccount:false});
  const item=JSON.parse(await data.text()) as Stored;
  if(item.version!==1||item.appId!=="2572239026621118")throw Error("Invalid connection");
  const now=Date.now();
  const latest=item.lastVerificationAttemptAt?Date.parse(item.lastVerificationAttemptAt):0;
  // A confirmed account is checked daily; a pending match at most every 15 minutes.
  const minDelay=item.verifiedAccount&&item.instagramAccountType?86_400_000:900_000;
  const appAuth=request.headers.get("x-pqd-meta-app-authorization")||"";
  if(now-latest>minDelay&&/^2572239026621118\|[a-fA-F0-9]{32}$/.test(appAuth)){
   try{
    const verification=await verifySavedInstagram(item,appAuth);
    item.lastVerificationAttemptAt=new Date(now).toISOString();
    item.verificationState=verification.state;
    item.verifiedAccount=verification.verified;
    item.accountId=verification.verified?verification.accountId:null;
    item.username=verification.verified?verification.username:null;
    item.instagramAccountType=verification.verified?verification.accountType||null:null;
    if(verification.verified)item.lastVerifiedAt=item.lastVerificationAttemptAt;
    item.expiresAt=verification.expiresAt;
    // Only metadata changes. The token ciphertext and encryption key are untouched.
    const {error:saveError}=await store().upload(keyPath,
      new Blob([JSON.stringify(item)],{type:"application/json"}),
      {contentType:"application/json",upsert:true,cacheControl:"0"});
    if(saveError)throw Error("Verification metadata not saved");
   }catch{
    // An external Meta outage must not erase the existing encrypted authorization.
    item.verificationState=item.verifiedAccount?"confirmed":"meta_unavailable";
   }
  }
  const facebookScopes=["pages_show_list","pages_read_engagement","pages_manage_posts"];
  const hasFacebookScopes=facebookScopes.every(x=>item.scopes.includes(x));
  const lastFacebook=item.lastFacebookVerificationAttemptAt?Date.parse(item.lastFacebookVerificationAttemptAt):0;
  // Facebook has its own verification schedule: Instagram can already be confirmed.
  const facebookDelay=item.facebookPageVerified?86_400_000:90_000;
  if(hasFacebookScopes&&now-lastFacebook>facebookDelay&&/^2572239026621118\|[a-fA-F0-9]{32}$/.test(appAuth)){
   try{
    const page=await verifySavedFacebook(item,appAuth);
    item.facebookVerificationState=page.state;
    item.lastFacebookVerificationAttemptAt=new Date(now).toISOString();
    if(page.state!=="meta_unavailable"){
     item.facebookPageVerified=page.verified;
     item.facebookPageId=page.verified?page.pageId:null;
     item.facebookPageName=page.verified?page.pageName:null;
     item.facebookPageUsername=page.verified?page.pageUsername:null;
     item.facebookCanCreateContent=page.verified&&page.canCreateContent;
     if(page.verified)item.lastFacebookVerifiedAt=item.lastFacebookVerificationAttemptAt;
    }
    const {error:saveError}=await store().upload(keyPath,
      new Blob([JSON.stringify(item)],{type:"application/json"}),
      {contentType:"application/json",upsert:true,cacheControl:"0"});
    if(saveError)throw Error("Facebook verification metadata not saved");
   }catch{
    // A Meta outage must not expose or replace the stored encrypted token.
    item.facebookVerificationState="meta_unavailable";
   }
  }
  return reply({
   connected:true,at:item.at,scopes:item.scopes,
   expiresAt:item.expiresAt,verifiedAccount:item.verifiedAccount===true,
   username:item.verifiedAccount?item.username:null,
   instagramAccountType:item.verifiedAccount?item.instagramAccountType||null:null,
   verificationState:item.verificationState||"unverified",
   lastVerifiedAt:item.lastVerifiedAt||null,
   facebookPageVerified:item.facebookPageVerified===true,
   facebookPageId:item.facebookPageVerified?item.facebookPageId:null,
   facebookPageName:item.facebookPageVerified?item.facebookPageName:null,
   facebookCanCreateContent:item.facebookCanCreateContent===true,
   facebookVerificationState:item.facebookVerificationState||"unverified",
   lastFacebookVerifiedAt:item.lastFacebookVerifiedAt||null
  });
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
    verifiedAccount:false,
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

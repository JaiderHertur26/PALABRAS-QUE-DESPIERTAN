import {NextRequest,NextResponse} from "next/server";
import {autoDispatch} from "@/lib/editorial-auto-publish";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET||"";
 if(secret.length<32||req.headers.get("authorization")!=="Bearer "+secret)
  return NextResponse.json({error:"No autorizado"},{status:401,headers:{"Cache-Control":"no-store"}});
 try{
  const result=await autoDispatch();
  console.log("PQD_AUTO_DISPATCH",JSON.stringify(result).slice(0,3500));
  return NextResponse.json(result,{headers:{"Cache-Control":"private,no-store"}});
 }catch(e){
  console.error("PQD_AUTO_DISPATCH_FAILED",e instanceof Error?e.message:"unknown");
  return NextResponse.json({error:"AUTO_DISPATCH_UNAVAILABLE"},{status:503});
 }
}

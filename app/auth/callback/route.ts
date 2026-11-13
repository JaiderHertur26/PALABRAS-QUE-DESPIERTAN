import {NextRequest,NextResponse} from "next/server";
import {clienteSesion} from "@/lib/supabase/server";

export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get("code");
 const destino=new URL("/participar",request.nextUrl.origin);
 if(!code){
  destino.searchParams.set("acceso","invalido");
  return NextResponse.redirect(destino);
 }
 const client=await clienteSesion();
 if(!client){
  destino.searchParams.set("acceso","no-configurado");
  return NextResponse.redirect(destino);
 }
 const {error}=await client.auth.exchangeCodeForSession(code);
 destino.searchParams.set("acceso",error?"invalido":"verificado");
 return NextResponse.redirect(destino);
}

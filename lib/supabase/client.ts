"use client";
import {createBrowserClient} from "@supabase/ssr";
import {accesoPublicoConfigurado,supabaseProjectUrl} from "./config";

export const comunidadConfigurada=accesoPublicoConfigurado;
export function clienteNavegador(){
 if(!accesoPublicoConfigurado())return null;
 return createBrowserClient(
   supabaseProjectUrl,
   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
 );
}

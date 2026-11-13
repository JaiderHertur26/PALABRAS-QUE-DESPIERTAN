"use client";
import {usePathname} from "next/navigation";
import {useEffect} from "react";

export function VisitTracker(){
 const path=usePathname();
 useEffect(()=>{
  if(!path)return;
  let reported=false;
  const track=()=>{
   if(reported||document.visibilityState!=="visible")return;
   reported=true;
   // Sin cookies, identificadores, huella digital ni datos personales.
   void fetch("/api/visitas",{method:"POST",credentials:"omit",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({path}),keepalive:true}).catch(()=>{});
  };
  const timer=window.setTimeout(track,1100);
  document.addEventListener("visibilitychange",track);
  return ()=>{window.clearTimeout(timer);document.removeEventListener("visibilitychange",track);};
 },[path]);
 return null;
}

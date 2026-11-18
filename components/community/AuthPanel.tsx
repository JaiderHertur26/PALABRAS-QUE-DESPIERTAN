"use client";
import "@/app/community-interactions.css";
import {useEffect,useMemo,useState} from "react";
import type {User} from "@supabase/supabase-js";
import {clienteNavegador,comunidadConfigurada,accesoAutenticacionConfigurado} from "@/lib/supabase/client";

export function AuthPanel({onUserChange,soloAcceso=false}: {onUserChange?:(logged:boolean)=>void;soloAcceso?:boolean}){
 const [email,setEmail]=useState("");
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true);
 const [sending,setSending]=useState(false);
 const [message,setMessage]=useState("");
 const configured=soloAcceso?accesoAutenticacionConfigurado():comunidadConfigurada();
 const supabase=useMemo(()=>clienteNavegador(),[]);

 useEffect(()=>{
  const access=new URLSearchParams(window.location.search).get("acceso");
  if(access==="iniciar")setMessage("Para acceder al centro editorial, introduce aquí tu correo verificado y abre el nuevo enlace que recibas.");
  if(access==="invalido")setMessage("El enlace de acceso no es válido o ha caducado. Solicita uno nuevo para iniciar sesión.");
  if(!supabase){setChecking(false);return;}
  let alive=true;
  supabase.auth.getUser().then(({data})=>{
   if(alive){setUser(data.user);setChecking(false);onUserChange?.(Boolean(data.user));}
  });
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   if(alive){setUser(session?.user??null);onUserChange?.(Boolean(session?.user));}
  });
  return ()=>{alive=false;subscription.unsubscribe();};
 },[supabase,onUserChange]);

 async function enviar(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!supabase)return;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){
   setMessage("Comprueba la dirección de correo.");return;
  }
  setSending(true);setMessage("");
  try{
   const {error}=await supabase.auth.signInWithOtp({
    email:email.trim(),options:{emailRedirectTo:window.location.origin+"/auth/callback",shouldCreateUser:true}
   });
   if(!error){
    setMessage("Enlace enviado. Revisa tu bandeja de entrada y el correo no deseado. Utiliza el enlace más reciente.");
   }else if(error.code==="over_email_send_rate_limit"){
    setMessage("Se alcanzó temporalmente el límite de correos del servicio. Inténtalo más tarde; no es un problema con tu dirección.");
   }else if(error.code==="over_request_rate_limit"||error.code==="otp_disabled"||error.status===429){
    setMessage("Has solicitado un enlace hace poco. Revisa tu correo y espera al menos un minuto antes de solicitar otro.");
   }else{
    setMessage("No pudimos enviar el enlace en este momento. Inténtalo más tarde o escribe a pquedespiertan@gmail.com.");
   }
  }catch{
   setMessage("No fue posible comunicarse con el servicio de correo. Comprueba tu conexión e inténtalo nuevamente.");
  }finally{setSending(false);}
 }
 async function salir(){
  if(!supabase)return;
  const {error}=await supabase.auth.signOut();
  if(!error){setUser(null);onUserChange?.(false);setMessage("Has cerrado la sesión.");}
 }
 if(!configured)return <div className="community-auth is-pending">
  <strong>Participación en preparación</strong>
  <p>La revista permite explorar sus temas. El acceso a las conversaciones se encuentra temporalmente cerrado.</p>
 </div>;
 if(checking)return <p className="community-auth-note">Comprobando tu acceso…</p>;
 if(user)return <div className="community-auth community-auth-verified">
  <span>Acceso verificado con <strong>{user.email}</strong></span>
  <div>{soloAcceso&&<a className="text-link" href="/moderacion">Centro editorial ↗</a>} <button type="button" onClick={salir}>Cerrar sesión</button></div>
 </div>;
 return <div className="community-auth">
  <strong>Para participar, verifica tu correo</strong>
  <p>No necesitas una contraseña. Te enviaremos un enlace de acceso para proteger la conversación.</p>
  <form onSubmit={enviar} className="auth-form">
   <label htmlFor="community-email">Correo electrónico</label>
   <div><input id="community-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254} placeholder="tu-correo@ejemplo.com"/>
   <button type="submit" disabled={sending} className="button-gold">{sending?"Enviando…":"Recibir enlace"}</button></div>
  </form>
  {message&&<p className="community-auth-message" role="status">{message}</p>}
  <p className="community-auth-note">Tu correo no aparece en las participaciones públicas. Puedes utilizar un nombre público diferente.</p>
 </div>;
}

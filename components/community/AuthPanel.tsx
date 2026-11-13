"use client";
import {useEffect,useMemo,useState} from "react";
import type {User} from "@supabase/supabase-js";
import {clienteNavegador,comunidadConfigurada} from "@/lib/supabase/client";

export function AuthPanel({onUserChange}: {onUserChange?:(logged:boolean)=>void}){
 const [email,setEmail]=useState("");
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true);
 const [sending,setSending]=useState(false);
 const [message,setMessage]=useState("");
 const configured=comunidadConfigurada();
 const supabase=useMemo(()=>clienteNavegador(),[]);

 useEffect(()=>{
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
  const {error}=await supabase.auth.signInWithOtp({
   email:email.trim(),options:{emailRedirectTo:window.location.origin+"/auth/callback",shouldCreateUser:true}
  });
  setMessage(error?"No fue posible enviar el correo. Comprueba la dirección e inténtalo después.":"Revisa tu correo y abre el enlace de acceso. Por seguridad, comprueba también la carpeta de no deseados.");
  setSending(false);
 }
 async function salir(){
  if(!supabase)return;
  const {error}=await supabase.auth.signOut();
  if(!error){setUser(null);onUserChange?.(false);setMessage("Has cerrado la sesión.");}
 }
 if(!configured)return <div className="community-auth is-pending">
  <strong>Participación en preparación</strong>
  <p>La revista ya permite explorar los temas y sus fundamentos. Los envíos se habilitarán después de conectar una base de datos exclusiva, verificar el acceso por correo y activar la moderación.</p>
 </div>;
 if(checking)return <p className="community-auth-note">Comprobando tu acceso…</p>;
 if(user)return <div className="community-auth community-auth-verified">
  <span>Acceso verificado con <strong>{user.email}</strong></span>
  <button type="button" onClick={salir}>Cerrar sesión</button>
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

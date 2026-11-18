/* Conteo anónimo: una sola URL interna por navegación; sin cookies ni huellas. */
(()=>{
 "use strict";
 let lastReported="";
 let pending="";
 let timeout=0;
 function report(){
  const path=window.location.pathname;
  pending="";
  if(path===lastReported||document.visibilityState!=="visible")return;
  lastReported=path;
  void fetch("/api/visitas",{
   method:"POST",credentials:"omit",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({path}),keepalive:true
  }).catch(()=>{});
 }
 function schedule(){
  const path=window.location.pathname;
  if(path===lastReported||path===pending)return;
  pending=path;
  window.clearTimeout(timeout);
  timeout=window.setTimeout(report,1100);
 }
 document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible")schedule();
 });
 window.addEventListener("pageshow",schedule);
 window.addEventListener("popstate",schedule);
 if(window.navigation?.addEventListener){
  window.navigation.addEventListener("navigatesuccess",schedule);
 }
 // La navegación interna de Next también actualiza el título en la cabecera.
 if(document.head&&window.MutationObserver){
  const observer=new MutationObserver(schedule);
  observer.observe(document.head,{childList:true,subtree:true,characterData:true});
 }
 schedule();
})();

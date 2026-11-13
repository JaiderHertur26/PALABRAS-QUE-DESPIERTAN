import {socialAccounts, type SocialId} from "@/lib/social";

export function SocialIcon({id}: {id: SocialId}) {
  if(id==="facebook"){
    return <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M14.4 21v-8.1h2.7l.4-3.3h-3.1V7.5c0-1 .3-1.7 1.8-1.7h1.7V2.9c-.3-.1-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.4v2.5H8.4v3.3h2.8V21h3.2Z"/>
    </svg>;
  }
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/>
    <circle cx="12" cy="12" r="4.2"/>
    <circle cx="17.5" cy="6.8" r="1" fill="currentColor" stroke="none"/>
  </svg>;
}

type SocialLinksProps = {compact?: boolean; className?: string};

export function SocialLinks({compact=false,className=""}: SocialLinksProps){
  return <div role="group" aria-label="Accesos directos a redes sociales oficiales"
    className={("social-links" + (compact ? " social-links--compact" : "") + " " + className).trim()}>
    {socialAccounts.map(account=><a key={account.id}
      className="social-link" href={account.url}
      target="_blank" rel="noopener noreferrer"
      title={"Visitar nuestro " + account.nombre}
      aria-label={"Visitar " + account.nombre + " oficial de Palabras que despiertan (se abre en una pestaña nueva)"}>
      <SocialIcon id={account.id}/>
      <span className={compact?"sr-only":"social-link-label"}>{account.nombre}</span>
    </a>)}
  </div>;
}

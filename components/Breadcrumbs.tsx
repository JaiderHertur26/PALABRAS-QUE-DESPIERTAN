import Link from "next/link";

export type Miga = { texto: string; href?: string };
export function Breadcrumbs({items,prefetch=true}: {items: Miga[];prefetch?:boolean}) {
  return <nav aria-label="Ruta de navegación" className="breadcrumbs">
    <ol>
      <li><Link href="/" prefetch={prefetch}>Inicio</Link></li>
      {items.map((item, i) => <li key={item.href ?? item.texto}>
        <span aria-hidden="true" className="breadcrumb-chevron">/</span>
        {item.href ? <Link href={item.href} prefetch={prefetch}>{item.texto}</Link> : <span aria-current="page">{item.texto}</span>}
      </li>)}
    </ol>
  </nav>;
}

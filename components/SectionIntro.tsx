export function SectionIntro({eyebrow,title,description}: {eyebrow: string; title:string; description?:string}) {
  return <div className="section-heading">
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {description && <p className="lead">{description}</p>}
    <span className="section-ornament" aria-hidden="true"/>
  </div>;
}

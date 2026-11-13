import type {MetadataRoute} from "next";
/* Artículos editoriales autorizados para la revista pública. Mantener fuera servicios privados. */
export default function robots():MetadataRoute.Robots {
 return {rules:[{userAgent:"*",allow:"/",disallow:["/api/","/auth/","/moderacion/"]}],sitemap:(process.env.NEXT_PUBLIC_SITE_URL||"https://www.palabrasquedespiertan.online").replace(/\/+$/,"")+"/sitemap.xml"};
}

import type {MetadataRoute} from "next";
/* La indexación permanece desactivada hasta la autorización pública del proyecto. */
export default function robots():MetadataRoute.Robots{
 return {rules:[{userAgent:"*",disallow:"/"}]};
}

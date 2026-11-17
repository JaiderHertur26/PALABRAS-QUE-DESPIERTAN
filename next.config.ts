import type {NextConfig} from "next";

const nextConfig:NextConfig={
 poweredByHeader:false,
 reactStrictMode:true,
 images:{formats:["image/avif","image/webp"]},
 // BEFORE the public filesystem: all scheduled message media is date-gated.
 async rewrites(){
  return {beforeFiles:[
   {source:"/mensajes/:filename(pd-\\d{3}-[a-z0-9-]+).png",destination:"/api/mensajes/portada/:filename"},
   {source:"/mensajes/historias/:code(pd-\\d{3}).png",destination:"/api/mensajes/historia/:code"},
   {source:"/articulos/art-:id(\\d{3}).png",destination:"/api/articulos/portada/art-:id"}
  ]};
 },
 async headers(){
  return [{
   source:"/:path*",
   headers:[
    {key:"X-Content-Type-Options",value:"nosniff"},
    {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
    {key:"X-Frame-Options",value:"DENY"},
    {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=()"},
    {key:"X-Permitted-Cross-Domain-Policies",value:"none"}
   ]
  }];
 }
};
export default nextConfig;

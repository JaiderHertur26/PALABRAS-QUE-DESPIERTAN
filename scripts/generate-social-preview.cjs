const sharp=require("sharp");
const path=require("path");
const fs=require("fs");
const root=path.resolve(__dirname,"..");
const base=path.join(root,"public","identidad","portada-oficial.png");
const target=path.join(root,"public","identidad","vista-previa-social.jpg");
const svg=`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#0c0806"/><stop offset=".55" stop-color="#140d08"/>
   <stop offset="1" stop-color="#120b07" stop-opacity=".12"/>
  </linearGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#100a07" stop-opacity="1"/>
   <stop offset=".55" stop-color="#100a07" stop-opacity=".97"/>
   <stop offset=".76" stop-color="#100a07" stop-opacity=".4"/>
   <stop offset="1" stop-color="#100a07" stop-opacity=".12"/>
  </linearGradient>
 </defs>
 <rect width="1200" height="630" fill="url(#fade)"/>
 <rect x="43" y="43" width="1114" height="544" rx="0" fill="none" stroke="#98713f" stroke-opacity=".66" stroke-width="2"/>
 <text x="82" y="141" font-size="67" font-family="Georgia,serif" fill="#d9af67">✝</text>
 <text x="165" y="130" font-family="Georgia,serif" font-size="18" letter-spacing="5" fill="#f5e6ca">REVISTA TEOLÓGICA</text>
 <line x1="83" x2="635" y1="170" y2="170" stroke="#a47c46" stroke-width="1"/>
 <text x="84" y="295" font-family="Georgia,serif" font-size="58" letter-spacing="5" fill="#f5e5ca">PALABRAS QUE</text>
 <text x="84" y="380" font-family="Georgia,serif" font-size="81" letter-spacing="2" fill="#d9af67">DESPIERTAN</text>
 <text x="86" y="440" font-family="Georgia,serif" font-size="23" font-style="italic" fill="#ead6b6">La fe que se piensa, se contempla</text>
 <text x="86" y="475" font-family="Georgia,serif" font-size="23" font-style="italic" fill="#ead6b6">y se lleva a la vida.</text>
 <line x1="84" x2="490" y1="527" y2="527" stroke="#a47c46" stroke-width="1"/>
 <text x="86" y="560" font-family="Georgia,serif" font-size="19" fill="#e2bf85">palabrasquedespiertan.online</text>
 </svg>`;
(async()=>{
 const original=await sharp(base).metadata();
 const cropTop=Math.round((original.height||1536)*.48);
 const img=await sharp(base).extract({left:0,top:cropTop,width:original.width||1024,height:(original.height||1536)-cropTop})
  .resize(680,630,{fit:"cover",position:"centre"}).jpeg({quality:87}).toBuffer();
 const result=await sharp({create:{width:1200,height:630,channels:3,background:"#0c0806"}})
  .composite([{input:img,left:520,top:0},{input:Buffer.from(svg),left:0,top:0}])
  .jpeg({quality:88,mozjpeg:true}).toFile(target);
 console.log("SOCIAL_PREVIEW_CREATED",result.width,result.height,result.size);
})().catch(e=>{console.error(e);process.exitCode=1});

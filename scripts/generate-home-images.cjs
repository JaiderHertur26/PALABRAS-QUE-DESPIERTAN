const sharp=require("sharp");
const path=require("path");
const root=path.resolve(__dirname,"..");
const source=path.join(root,"public","identidad","cruz-fondo.png");
async function main(){
 const variants=[
  {name:"cruz-fondo-home.webp",width:1440,height:700,quality:67},
  {name:"cruz-fondo-home-mobile.webp",width:720,height:830,quality:61}
 ];
 for(const variant of variants){
  const target=path.join(root,"public","identidad",variant.name);
  const out=await sharp(source).resize(variant.width,variant.height,{fit:"cover",position:"centre"})
   .webp({quality:variant.quality,effort:6}).toFile(target);
  console.log("OPTIMIZED_IMAGE",variant.name,out.width+"x"+out.height,out.size+" bytes");
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});

import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
function png(p){const b=fs.readFileSync(p);assert.equal(b.subarray(0,8).toString("hex"),"89504e470d0a1a0a");return [b.readUInt32BE(16),b.readUInt32BE(20),b.length]}
const number=f=>/^pd-(\d{3})/.exec(f)?.[1];
const seasonImage=f=>{const n=Number(number(f));return n>=71&&n<=100;};
test("Temporada 02: exactamente treinta portadas originales y treinta historias verticales",()=>{
 const covers=fs.readdirSync(path.join(root,"public","mensajes")).filter(x=>/^pd-\d{3}-.+\.png$/.test(x)&&seasonImage(x));
 const stories=fs.readdirSync(path.join(root,"public","mensajes","historias")).filter(x=>/^pd-\d{3}\.png$/.test(x)&&seasonImage(x));
 assert.equal(covers.length,30);assert.equal(stories.length,30);
 for(let n=71;n<=100;n++){
  const code="pd-"+String(n).padStart(3,"0");
  const names=covers.filter(x=>x.startsWith(code+"-"));assert.equal(names.length,1,code);
  const cover=png(path.join(root,"public","mensajes",names[0]));
  const story=png(path.join(root,"public","mensajes","historias",code+".png"));
  assert.deepEqual(cover.slice(0,2),[1254,1254]);assert.deepEqual(story.slice(0,2),[1080,1920]);
  assert.ok(cover[2]>100000&&story[2]>100000);
 }
});
test("Temporada 02: los tres títulos del plan maestro figuran en el catálogo de la web",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
 const season=data.temporadas.find(x=>x.id==="T02");assert.ok(season);
 for(const [id,name] of [["T02-S01","La libertad y la caída"],["T02-S02","La imagen que no se borró"],["T02-S03","La promesa de restauración"]])
  assert.equal(season.series.find(x=>x.id===id)?.titulo,name);
});
test("El programador incorpora la historia oficial de PD-100 y nunca la portada cuadrada para historias",()=>{
 const text=fs.readFileSync(path.join(root,"lib","editorial-auto-publish.ts"),"utf8");
 assert.match(text,/officialSeasonStory=ch\.endsWith\("story"\)/);
 assert.match(text,/OFFICIAL_STORY_IMAGE_UNAVAILABLE/);
 assert.match(text,/\/mensajes\/historias\//);
 assert.match(text,/detailedSeason=/);
 assert.ok(text.includes("|100)$"));
 const proxy=fs.readFileSync(path.join(root,"proxy.ts"),"utf8");
 assert.match(proxy,/const plannedStory=/);
 assert.match(proxy,/if\(planned\|\|plannedStory\|\|articleCover\)/);
 assert.match(proxy,/eligible=eligible\.eq\("code",plannedStory\[1\]\.toUpperCase\(\)\)/);
});

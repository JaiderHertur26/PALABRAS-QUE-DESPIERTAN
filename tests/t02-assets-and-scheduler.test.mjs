import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
test("Temporada 02: 30 portadas y 30 historias se reservan para Storage privado",()=>{
 const cover=fs.readFileSync(path.join(root,"app/api/mensajes/portada/[filename]/route.ts"),"utf8");
 const story=fs.readFileSync(path.join(root,"app/api/mensajes/historia/[code]/route.ts"),"utf8");
 assert.match(cover,/approved_by_author/);assert.match(story,/approved_by_author/);
 assert.match(cover,/Date\.parse/);assert.match(story,/Date\.parse/);
 const files=fs.readdirSync(path.join(root,"public","mensajes"));
 const stories=fs.readdirSync(path.join(root,"public","mensajes","historias"));
 for(let n=71;n<=100;n++){
  const code="pd-"+String(n).padStart(3,"0");
  assert.equal(files.some(f=>f.startsWith(code+"-")&&f.endsWith(".png")),false);
  assert.equal(stories.includes(code+".png"),false);
 }
});
test("Temporada 02: los tres títulos del plan maestro figuran en el catálogo de la web",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,"data","site-content.json"),"utf8"));
 const season=data.temporadas.find(x=>x.id==="T02");assert.ok(season);
 for(const [id,name] of [["T02-S01","La libertad y la caída"],["T02-S02","La imagen que no se borró"],["T02-S03","La promesa de restauración"]])
  assert.equal(season.series.find(x=>x.id===id)?.titulo,name);
});
test("El programador incorpora la historia oficial de PD-100 y nunca la portada cuadrada para historias",()=>{
 const value=fs.readFileSync(path.join(root,"lib","editorial-auto-publish.ts"),"utf8");
 assert.match(value,/officialSeasonStory=ch\.endsWith\("story"\)/);
 assert.match(value,/OFFICIAL_STORY_IMAGE_UNAVAILABLE/);
 assert.match(value,/\/mensajes\/historias\//);
 assert.match(value,/detailedSeason=/);
 assert.ok(value.includes("|100)$"));
 const proxy=fs.readFileSync(path.join(root,"proxy.ts"),"utf8");
 assert.match(proxy,/const plannedStory=/);
 assert.match(proxy,/if\(planned\|\|plannedStory\|\|articleCover\)/);
 assert.match(proxy,/eligible=eligible\.eq\("code",plannedStory\[1\]\.toUpperCase\(\)\)/);
});
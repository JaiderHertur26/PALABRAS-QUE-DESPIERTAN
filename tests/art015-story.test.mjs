import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const base=path.resolve(import.meta.dirname,"..");
test("La historia vertical de ART-015 tiene endpoint privado con fecha y aprobacion",()=>{
 const src=fs.readFileSync(path.join(base,"app","api","articulos","historia","[filename]","route.ts"),"utf8");
 assert.ok(src.includes("pqd-article-covers-private-v1"));
 assert.ok(src.includes("historias/"));
 assert.ok(src.includes('article.state==="scheduled"'));
 assert.ok(src.includes('Date.parse(article.scheduled_at)<=Date.now()'));
 assert.ok(src.includes('article?.approved_by_author===true'));
 assert.ok(src.includes('status:404'));
});
test("Meta usa la historia de autor ART-015 y no una reescalada del cover",()=>{
 const src=fs.readFileSync(path.join(base,"lib","editorial-auto-publish.ts"),"utf8");
 assert.ok(src.includes('officialArticleStory=ch.endsWith("story")&&i.kind==="articulo"&&/^ART-(?:015|016|017|018|019|020|021)$/.test(i.code)'));
 assert.ok(src.includes('SITE+"/api/articulos/historia/"+i.code.toLowerCase()'));
 assert.ok(src.includes("OFFICIAL_ARTICLE_STORY_IMAGE_UNAVAILABLE"));
});

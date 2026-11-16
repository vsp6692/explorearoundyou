const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pixelIcon}=require('../.test-output/pixel-icons.js');
const {HISTORY_CATEGORIES}=require('../.test-output/history.js');
const files=[...HISTORY_CATEGORIES.map(category=>pixelIcon(category)),pixelIcon('Everything'),pixelIcon('Food',true)];
assert.equal(new Set(files).size,9);
assert.equal(pixelIcon('Food',true),pixelIcon('Parks',true)); // Mystery appearance doesn't reveal category art.
assert.equal(pixelIcon('__proto__'),pixelIcon('Everything'));
assert.equal(pixelIcon('../secret'),pixelIcon('Everything'));
for(const file of files){
 assert.match(file,/^\/icons\/pixel\/[a-z]+\.svg$/);
 const content=fs.readFileSync(path.join(__dirname,'../public',file),'utf8');
 assert.match(content,/viewBox="0 0 12 12"/);assert.match(content,/shape-rendering="crispEdges"/);
 assert.doesNotMatch(content,/<script|<foreignObject|\bon\w+=|href=|<image/);
 const pixels=[...content.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1" fill="(#[0-9a-f]{6})"\/>/g)];
 assert.ok(pixels.length>10&&pixels.length<=144);
 assert.ok(pixels.every(p=>Number(p[1])<12&&Number(p[2])<12));
}
console.log('PASS: all category/mystery sprites present, distinct, bounded and self-contained; unknown categories fall back safely');

const assert=require('node:assert/strict');
const {applyMapTheme}=require('../.test-output/map-theme.js');
const {validateStyleMin}=require('@maplibre/maplibre-gl-style-spec');
const fs=require('node:fs');
const source=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):{version:8,sources:{geo:{type:'vector',tiles:['https://example.com/{z}/{x}/{y}.pbf']}},layers:[{id:'background',type:'background'},{id:'water',source:'geo','source-layer':'water',type:'fill'},{id:'park',source:'geo','source-layer':'park',type:'fill'},{id:'building-3d',source:'geo','source-layer':'building',type:'fill-extrusion',paint:{'fill-extrusion-height':['get','render_height']}}]};
const heights=source.layers.filter(l=>l.type==='fill-extrusion').map(l=>l.paint?.['fill-extrusion-height']);
const map={getStyle:()=>source,setPaintProperty:(id,key,value)=>{const layer=source.layers.find(l=>l.id===id);layer.paint={...layer.paint,[key]:value}}};
const geographicData=JSON.stringify({sources:source.sources,layers:source.layers.map(({paint,...rest})=>rest)});
applyMapTheme(map,false,false);const nature=structuredClone(source);
const water=()=>source.layers.find(l=>l.type==='fill'&&l['source-layer']==='water')?.paint?.['fill-color'];
const natureWater=water();applyMapTheme(map,false,true);assert.notEqual(water(),natureWater);
const pixelWater=water();applyMapTheme(map,true,true);assert.notEqual(water(),pixelWater);
for(const [dark,pixel] of [[false,false],[true,false],[false,true],[true,true],[false,false]]){
 applyMapTheme(map,dark,pixel);
 assert.deepEqual(validateStyleMin(source).map(e=>e.message),[]);
 assert.deepEqual(source.layers.filter(l=>l.type==='fill-extrusion').map(l=>l.paint?.['fill-extrusion-height']),heights);
 assert.equal(JSON.stringify({sources:source.sources,layers:source.layers.map(({paint,...rest})=>rest)}),geographicData);
}
assert.deepEqual(source,nature);
console.log('PASS: four valid map palettes, distinct pixel colours, exact Nature restoration, geography/labels/heights preserved');

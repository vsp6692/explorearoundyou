const assert=require('node:assert/strict');
const fs=require('node:fs');
const {prepareMapStyle}=require('../.test-output/prepare-map-style.js');
const {validateStyleMin,createExpression}=require('@maplibre/maplibre-gl-style-spec');
const compare=['<=',['get','ref_length'],6];
const road=(id='highway-shield-non-us',predicate=compare)=>({id,type:'symbol',source:'geo','source-layer':'transportation_name',filter:['all',predicate,['==',['get','network'],'test']],layout:{'icon-image':'road_6','text-field':['get','ref']}});
const fixture={version:8,metadata:{keep:'everything'},sprite:'https://example.com/sprites',glyphs:'https://example.com/{fontstack}/{range}.pbf',sources:{geo:{type:'vector',tiles:['https://example.com/{z}/{x}/{y}.pbf'],attribution:'© OpenStreetMap contributors'}},layers:[
 {id:'bg',type:'background',paint:{'background-color':'#eee'}},
 {id:'poi_test',type:'symbol',source:'geo','source-layer':'poi',minzoom:12,filter:['has','name'],layout:{'icon-image':['get','class'],'text-field':['get','name'],'text-font':['Noto Sans Regular']},paint:{'text-color':'#555','text-halo-color':'#fff'}},
 {id:'building',type:'fill-extrusion',source:'geo','source-layer':'building',paint:{'fill-extrusion-height':['get','render_height'],'fill-extrusion-base':['get','render_min_height']}},
 road(),road('highway-shield-us-interstate'),road('road_shield_us'),road('unrelated_road'),road('highway-shield-non-us-variant'),
]};
const original=structuredClone(fixture);
const output=prepareMapStyle(fixture);
assert.deepEqual(fixture,original);
assert.deepEqual(output.sources,original.sources);assert.equal(output.sources,fixture.sources);
for(const key of ['sprite','glyphs','metadata'])assert.deepEqual(output[key],original[key]);
assert.deepEqual(output.layers.map(l=>l.id),original.layers.map(l=>l.id));
assert.deepEqual(output.layers[2],original.layers[2]);
assert.equal(output.layers[2],fixture.layers[2]);
const poi=output.layers[1];
assert.equal(poi.source,original.layers[1].source);assert.equal(poi['source-layer'],'poi');
assert.equal(poi.layout.visibility,undefined);assert.equal(poi.layout['icon-image'],'');
assert.equal(poi.paint['icon-opacity'],0);assert.equal(poi.paint['text-opacity'],0);
assert.equal(poi.layout['icon-ignore-placement'],true);assert.equal(poi.layout['text-ignore-placement'],true);
assert.deepEqual(poi.filter,original.layers[1].filter);assert.equal(poi.minzoom,12);
assert.deepEqual(poi.layout['text-field'],original.layers[1].layout['text-field']);
assert.equal(poi.paint['text-halo-color'],'#fff');
assert.deepEqual(output.layers[6],original.layers[6]);assert.deepEqual(output.layers[7],original.layers[7]);
for(const layer of output.layers.slice(3,6)){
 assert.deepEqual(layer.filter[2],['==',['get','network'],'test']);
 const expression=createExpression(layer.filter[1],{type:'boolean'});assert.equal(expression.result,'success');
 for(const [value,expected] of [[0,true],[1,true],[6,true],[7,false],[-1,true],[null,false],[undefined,false],['2',false],[{},false]]){
  const feature={properties:value===undefined?{}:{ref_length:value}};
  assert.equal(expression.value.evaluate({zoom:12},feature),expected,`${layer.id}: ${JSON.stringify(value)}`);
 }
}
const changedShape={...fixture,layers:[road('highway-shield-non-us',['<',['get','ref_length'],6]),{...road('road_shield_us'),'source-layer':'another_layer'}]};
assert.deepEqual(prepareMapStyle(changedShape),changedShape);
assert.deepEqual(prepareMapStyle(output),output); // idempotent for style swaps
assert.deepEqual(validateStyleMin(output).map(e=>e.message),[]);
if(process.argv[2]){
 const live=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),before=structuredClone(live),prepared=prepareMapStyle(live);
 assert.deepEqual(live,before);assert.deepEqual(prepared.sources,live.sources);
 assert.deepEqual(prepared.layers.filter(l=>l.type==='fill-extrusion'),live.layers.filter(l=>l.type==='fill-extrusion'));
 assert.deepEqual(validateStyleMin(prepared).map(e=>e.message),[]);
 assert.equal(prepared.layers.filter(l=>l.type==='symbol'&&l['source-layer']==='poi').every(l=>l.layout['icon-image']===''&&l.layout.visibility!=='none'),true);
}
console.log('PASS: pre-load POI suppression retains source data, numeric road-shield guards, immutable targeted style changes');

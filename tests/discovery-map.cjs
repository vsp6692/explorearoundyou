const assert=require('node:assert/strict');
const {discover,mapPlaceFromFeature,normalizeLongitude}=require('../.test-output/places.js');
const {nearestWorldLongitude,groupMarkers}=require('../.test-output/marker-groups.js');
const feature=(kind,props={},coordinates=[179.99,13])=>({geometry:{type:'Point',coordinates},properties:{name:'Mapped place',class:kind,...props}});
const real=mapPlaceFromFeature(feature('restaurant',{cuisine:'south_indian',website:'https://example.org',wikidata:'Q123'}));
assert.equal(real.category,'Food');assert.equal(real.cuisine,'south_indian');assert.equal(real.wikidata,'Q123');
assert.equal(mapPlaceFromFeature(feature('hotel')).category,'Stays');
assert.equal(mapPlaceFromFeature(feature('theme_park')).category,'Fun');
assert.equal(mapPlaceFromFeature(feature('park')).category,'Parks');
assert.equal(mapPlaceFromFeature(feature('bus_stop')),undefined);
assert.equal(mapPlaceFromFeature(feature('hospital')),undefined);
for(const coordinates of [[NaN,13],[80,91],['80',13],[80,null],[]])assert.equal(mapPlaceFromFeature(feature('hotel',{},coordinates)),undefined);
assert.equal(mapPlaceFromFeature({...feature('hotel'),geometry:{type:'Polygon',coordinates:[]}}),undefined);
assert.equal(mapPlaceFromFeature(feature('restaurant',{name:'   '})),undefined);
assert.equal(mapPlaceFromFeature(feature('restaurant',{cuisine:{bad:true},wikidata:'not-an-id'})).cuisine,undefined);
assert.equal(mapPlaceFromFeature(feature('hotel',{},[540,13])).lon,-180);
assert.equal(mapPlaceFromFeature(feature('hotel',{},[-180,13])).id,mapPlaceFromFeature(feature('hotel',{},[540,13])).id);
assert.equal(normalizeLongitude(541),-179);assert.equal(normalizeLongitude(-541),179);
assert.equal(nearestWorldLongitude(-179,181),181);assert.equal(nearestWorldLongitude(179,-181),-181);
const wrapped={...real,lon:-179};
assert.equal(groupMarkers([wrapped],p=>({x:nearestWorldLongitude(p.lon,181)-131,y:50}),100,100).length,1);
// Search and loaded-map discovery must retain the same supported place kinds.
for(const [category,kinds] of Object.entries({Food:['food_court'],Stays:['apartment','chalet','camp_site','caravan_site'],Parks:['wood','forest','heath','grassland'],Fun:['arts_centre','amusement_arcade','adventure_park','escape_game','fitness_centre','climbing'],Attractions:['gallery','memorial','ruins','archaeological_site','fort','aquarium']})){
 for(const kind of kinds){const p=mapPlaceFromFeature(feature(kind));assert.ok(p,`Missing ${kind}`);assert.equal(p.category,category,kind)}
}
(async()=>{
 let called=0;
 global.fetch=async()=>{called++;return {ok:true,json:async()=>({elements:[null,{},[],{type:'node',id:'invalid',lat:13,lon:80,tags:{name:'Bad'}},{type:'node',id:9,lat:13,lon:80,tags:{name:'Working cafe',amenity:'cafe',description:{bad:true},cuisine:13}},{type:'node',id:9,lat:13,lon:80,tags:{name:'Duplicate',amenity:'cafe'}}]})}};
 const found=await discover(13,80,1,'Food',new AbortController().signal);
 assert.equal(found.length,1);assert.equal(found[0].name,'Working cafe');assert.equal(found[0].description,undefined);assert.equal(found[0].cuisine,undefined);
 await assert.rejects(()=>discover(13,80,1,'toString',new AbortController().signal),/Invalid discovery filters/);assert.equal(called,1);
 global.fetch=async()=>({ok:true,json:async()=>({elements:[{type:'way',id:20,center:{lat:13,lon:80},tags:{name:'Hotel with restaurant',amenity:'restaurant',tourism:'hotel'}}]})});
 const stays=await discover(13,80,2,'Stays',new AbortController().signal);assert.equal(stays[0].category,'Stays');assert.equal(stays[0].kind,'hotel');
 global.fetch=async()=>({ok:true,json:async()=>{throw new SyntaxError('HTML')}});
 await assert.rejects(()=>discover(13,80,3,'Stays',new AbortController().signal),/unreadable data/);
 const cancelled=new AbortController();global.fetch=async()=>({ok:true,json:async()=>{cancelled.abort();return {elements:[]}}});
 await assert.rejects(()=>discover(13,80,4,'Stays',cancelled.signal),{name:'AbortError'});
 console.log('PASS: wrapped-world discovery/pins, real map tags, malformed response isolation, exact category and abort handling');
})().catch(e=>{console.error(e);process.exitCode=1});

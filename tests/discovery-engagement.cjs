const assert=require('node:assert/strict');
const {chooseSurprise,rankDiscoveries,surpriseReason}=require('../.test-output/discovery-engagement.js');
const {matchesCuisine,cuisineSelector,CUISINES}=require('../.test-output/cuisines.js');
const place=(id,category='Food',distance=.2)=>({id,name:id,category,kind:'restaurant',lat:13,lon:80,distance});
const a=place('a'),b=place('b'),c=place('c','Parks'),d=place('d','Attractions');
assert.equal(chooseSurprise([],[]),undefined);
assert.equal(chooseSurprise([a],[],a).id,'a');
const alias={...a,id:'osm:a',name:' A '};
assert.equal(chooseSurprise([a,alias,b],[a],a,[],()=>0).id,'b');
assert.equal(chooseSurprise([a,b,c],[a],a,['Food'],()=>0).id,'b');
// Exhausting the preferred subset must still reveal the other available places.
assert.equal(chooseSurprise([a,b,c],[a,b],b,['Food'],()=>0).id,'c');
assert.equal(chooseSurprise([a,b,c],[a,b,c],b,[],()=>0).id,'a');
assert.equal(chooseSurprise([a,b],[],undefined,[],()=>1).id,'b');
assert.equal(chooseSurprise([a,b],[],undefined,[],()=>NaN).id,'a');
// A whole rotation remains distinct, even when aliases occur in the pool.
const recent=[];let current;
for(let i=0;i<4;i++){current=chooseSurprise([a,alias,b,c,d],recent,current,['Food'],()=>0);recent.push(current)}
assert.deepEqual(recent.map(p=>p.id),['a','b','c','d']);
assert.deepEqual(rankDiscoveries([c,a,b],{c:{}},['Food']).map(p=>p.id),['a','b','c']);
assert.deepEqual(rankDiscoveries([a,b,c],{b:{}}).map(p=>p.id),['b','a','c']);
assert.deepEqual(rankDiscoveries([a,{...b,distance:.1}]).map(p=>p.id),['b','a']);
const original=[c,a,b];rankDiscoveries(original,{a:{}},['Food']);assert.deepEqual(original,[c,a,b]);
assert.match(surpriseReason(a,['Food']),/matches your interests/);
assert.equal(surpriseReason(a,[]),'A nearby restaurant to discover. Check its details before you go.');
assert.equal(surpriseReason({...a,kind:'place'}),'A nearby place to discover. Check its details before you go.');
assert.equal(surpriseReason({...a,kind:'nearby landmark'}),'A nearby landmark to discover. Check its details before you go.');
for(const id of ['all','south_indian','indian','chinese','pizza','burgers','japanese','cafe','north_indian','street_food','desserts'])assert.ok(CUISINES.some(c=>c.id===id));
for(const [id,tag] of [['north_indian','north_indian'],['north_indian','punjabi'],['street_food','chaat'],['street_food','street_food'],['desserts','ice_cream'],['desserts','cake']]){
 assert.equal(matchesCuisine({...a,cuisine:tag},id),true);
 assert.ok(cuisineSelector(id).includes(tag));
 assert.equal(matchesCuisine({...a,cuisine:undefined},id),false);
}
assert.equal(matchesCuisine({...a,name:'North Indian restaurant',cuisine:'indian'},'north_indian'),false);
assert.equal(matchesCuisine({...a,kind:'fast food'},'street_food'),false);
assert.equal(matchesCuisine({...a,kind:'cafe'},'desserts'),false);
assert.equal(matchesCuisine({...a,cuisine:'street_food_extra'},'street_food'),false);
assert.equal(matchesCuisine({...a,cuisine:'pizza; street_food; desserts'},'street_food'),true);
assert.equal(matchesCuisine({...a,kind:'coffee_shop'},'cafe'),true);
assert.throws(()=>cuisineSelector('north_indian"];out;'));
console.log('PASS: distinct surprise rotation, canonical aliases, preference-preserving photo ranking, explicit cuisine matching');

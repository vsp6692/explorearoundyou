const assert=require('node:assert/strict');
const {planAdventure,readVisits,samePlace,badges,mysteryIds}=require('../.test-output/adventures.js');
const p=(id,lon,category='Parks',name=id)=>({id,name,lat:0,lon,category,kind:'park',distance:0});
const origin={lat:0,lon:0};
const pool=[p('a',.001),p('b',.002,'Food'),p('c',.003,'Fun'),p('far',1),p('duplicate',.001,'Parks','a')];
const plan=planAdventure(pool,origin,5,'variety');
assert.equal(plan.stops.length,3);assert.equal(new Set(plan.stops.map(p=>p.name)).size,3);assert.ok(plan.distance<5);
assert.equal(planAdventure([],origin,5,'short').stops.length,0);
assert.equal(planAdventure([p('shop',.001,'Shopping')],origin,5,'family').stops.length,0);
assert.ok(planAdventure([p('long',.03)],origin,10,'short').distance<=2);
assert.equal(samePlace(pool[0],pool[4]),true);
assert.deepEqual(readVisits('broken'),[]);assert.deepEqual(readVisits('{}'),[]);
assert.equal(readVisits(JSON.stringify([pool[0],pool[4],{id:'invalid'}])).length,1);
const legacy=readVisits(JSON.stringify([pool[0]]))[0];
assert.equal(legacy.visitedAt,undefined);
assert.equal(Object.hasOwn(legacy,'visitedAt'),false);
const dated=readVisits(JSON.stringify([{...pool[0],visitedAt:'2026-11-17T09:30:00+05:30'}]))[0];
assert.equal(dated.visitedAt,'2026-11-17T04:00:00.000Z');
assert.deepEqual(readVisits(JSON.stringify([dated]))[0],dated);
for(const visitedAt of ['bad',null,123,'2026-02-30T12:00:00Z','2026-11-17T24:00:00Z','2026-11-17']){
 const restored=readVisits(JSON.stringify([{...pool[0],visitedAt}]))[0];
 assert.equal(restored.name,pool[0].name);
 assert.equal(restored.visitedAt,undefined);
}
assert.equal(badges([])[0].count,0);assert.equal(badges([pool[0]])[0].count,1);
console.log('PASS: distinct stops, distance limits, empty plans, family category suggestions, visit validation and badges');

assert.equal(mysteryIds(pool).length,3);assert.deepEqual(mysteryIds(pool),mysteryIds([...pool].reverse()));assert.deepEqual(mysteryIds([]),[]);

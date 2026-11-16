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
assert.equal(badges([])[0].count,0);assert.equal(badges([pool[0]])[0].count,1);
console.log('PASS: distinct stops, distance limits, empty plans, family category suggestions, visit validation and badges');

assert.equal(mysteryIds(pool).length,3);assert.deepEqual(mysteryIds(pool),mysteryIds([...pool].reverse()));assert.deepEqual(mysteryIds([]),[]);

const assert=require('node:assert/strict');
const {visitedPlaceIds,revealPoints}=require('../.test-output/exploration.js');
const visit=(id,name='Park',lat=13,lon=80)=>({id,name,lat,lon,category:'Parks',kind:'park'});
const visits=[visit('node/1')];
const places=[visit('node/1'),visit('map:park',' park ',13.0001),visit('map:other','Other',13.0001),visit('map:far','Park',14)];
assert.deepEqual([...visitedPlaceIds(places,visits)],['node/1','map:park']);
assert.equal(visitedPlaceIds(places,[]).size,0); // Reset also clears marker state.
assert.equal(visitedPlaceIds([],visits).size,0);
assert.equal(visits.length,1);assert.equal(places.length,4); // No discovery marks visits automatically.
const view={width:400,height:600,longitude:80};
assert.deepEqual(revealPoints(visits,view,()=>({x:200.2,y:300.8})),[{id:'node/1',x:200,y:301}]);
assert.deepEqual(revealPoints(visits,view,()=>({x:500,y:100})),[]);
assert.deepEqual(revealPoints(visits,view,()=>({x:Infinity,y:100})),[]);
assert.deepEqual(revealPoints([],view,()=>({x:0,y:0})),[]);
let longitude;
revealPoints([visit('dateline','Island',0,-179)],{...view,longitude:179},(lon)=>{longitude=lon;return {x:200,y:200}});
assert.equal(longitude,181); // Closest world copy across the antimeridian.
const many=Array.from({length:200},(_,i)=>visit(String(i),'P'+i,13,i/2));
const bounded=revealPoints(many,view,(lon)=>({x:lon*2,y:300}));
assert.equal(bounded.length,150);assert.equal(bounded[0].x,199);
console.log('PASS: visited-ID reconciliation, reset/empty states, viewport bounds, wrap-around and bounded reveal work');

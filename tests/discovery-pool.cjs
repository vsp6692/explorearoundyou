const assert=require('node:assert/strict');
const {discoveryPool,searchLocations}=require('../.test-output/discovery-pool.js');
const p={id:'map:1',name:'Cafe',lat:13,lon:80,category:'Food',kind:'cafe',distance:0};
const richer={...p,id:'node/1',cuisine:'indian',website:'https://example.org'};
assert.deepEqual(discoveryPool([p],[richer]),[richer]);
assert.equal(discoveryPool([{...p,name:'Different business'}],[richer]).length,2);
assert.equal(discoveryPool([{...p,lat:14}],[richer]).length,2);
assert.equal(discoveryPool([p],[]).length,1); // Empty online response keeps map places.
assert.equal(discoveryPool([{...p,lat:NaN}],[]).length,0);
assert.deepEqual(searchLocations([null,{}, {display_name:'Bad',lat:null,lon:'0'},{display_name:'Bad',lat:'',lon:'0'},{display_name:'Bad',lat:'91',lon:'0'},{display_name:'Chennai',lat:'13',lon:'80'}]),[{name:'Chennai',lat:13,lon:80}]);
assert.throws(()=>searchLocations({}));assert.equal(searchLocations(Array(20).fill({display_name:'Place',lat:0,lon:0})).length,20);
console.log('PASS: richer discovery retention, empty network recovery and bounded location parsing');

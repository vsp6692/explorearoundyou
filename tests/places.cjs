const assert=require('node:assert/strict');
const {discover,distanceKm}=require('../.test-output/places.js');
(async()=>{
 assert.equal(distanceKm(13,80,13,80),0);
 assert.ok(Math.abs(distanceKm(0,0,0,1)-111.195)<.01);
 assert.ok(Number.isFinite(distanceKm(90,0,-90,180)));
 let calls=0;
 global.fetch=async(url,options)=>{calls++;assert.ok(url.includes('/api/interpreter'));assert.equal(options.method,'POST');assert.equal(options.signal.aborted,false);const query=options.body.get('data');assert.ok(query.includes('around:5000,13,80'));assert.ok(query.includes('leisure'));assert.ok(query.includes('out center tags;'));return {ok:true,json:async()=>({elements:[{type:'node',id:1,lat:13.001,lon:80,tags:{name:'Park',leisure:'park'}},{type:'way',id:2,center:{lat:13.002,lon:80},tags:{name:'Garden',leisure:'garden'}},{type:'node',id:3,lat:40,lon:80,tags:{name:'Outside',leisure:'park'}},{type:'node',id:4,lat:13,lon:80,tags:{}}]})}};
 const found=await discover(13,80,5,'Parks',new AbortController().signal);
 assert.equal(found.length,2);assert.equal(found[0].category,'Parks');assert.ok(found[0].distance<found[1].distance);
 await discover(13,80,5,'Parks',new AbortController().signal);assert.equal(calls,1);
 await assert.rejects(()=>discover(200,80,5,'Parks',new AbortController().signal));
 const aborted=new AbortController();aborted.abort();await assert.rejects(()=>discover(13,80,5,'Parks',aborted.signal));
 global.fetch=async()=>({ok:false});await assert.rejects(()=>discover(14,80,5,'Parks',new AbortController().signal));
 global.fetch=async()=>({ok:true,json:async()=>({remark:'runtime timeout',elements:[]})});await assert.rejects(()=>discover(15,80,5,'Parks',new AbortController().signal));
 console.log('PASS: distance, bounds, result parsing, sorting, cache, cancellation and service errors');
})().catch(e=>{console.error(e);process.exitCode=1});

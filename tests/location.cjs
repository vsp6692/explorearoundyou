const assert=require('node:assert/strict');
const {validLocation,createLocationRequest}=require('../.test-output/location.js');
const position=(lat=48.8566,lon=2.3522,accuracy=30,timestamp=Date.now())=>({coords:{latitude:lat,longitude:lon,accuracy},timestamp});
assert.equal(validLocation(position()).lat,48.8566);
for(const p of [position(91),position(0,181),position(0,0,-1),position(NaN),position(0,0,1,Date.now()-121000),position(0,0,1,Date.now()+61000)])assert.equal(validLocation(p),null);
assert.equal(validLocation(position(0,0,5000)).accuracy,5000); // Approximate fixes remain labelled, not silently discarded.
(async()=>{
 const controller=createLocationRequest();
 let options;
 assert.equal((await controller.request({getCurrentPosition(ok,_fail,o){options=o;ok(position())}})).status,'located');
 assert.equal(options.enableHighAccuracy,true);
 assert.equal((await controller.request(undefined)).status,'unavailable');
 assert.equal((await controller.request({getCurrentPosition(_ok,fail){fail({code:1})}})).status,'denied');
 assert.equal((await controller.request({getCurrentPosition(_ok,fail){fail({code:3})}})).status,'timeout');
 assert.equal((await controller.request({getCurrentPosition(ok){ok(position(200))}})).status,'unavailable');
 assert.equal((await controller.request({getCurrentPosition(){}} ,1)).status,'timeout');
 let oldSuccess;
 const old=controller.request({getCurrentPosition(ok){oldSuccess=ok}});
 const fresh=controller.request({getCurrentPosition(ok){ok(position(-33.8688,151.2093))}});
 assert.equal((await old).status,'cancelled');assert.equal((await fresh).fix.lon,151.2093);
 oldSuccess(position()); // Late callback cannot settle a superseded request.
 const pending=controller.request({getCurrentPosition(ok){oldSuccess=ok}});
 controller.cancel();assert.equal((await pending).status,'cancelled');oldSuccess(position());
 console.log('PASS: location validity, accuracy, permission/timeout handling and superseded callback cancellation');
})().catch(e=>{console.error(e);process.exitCode=1});

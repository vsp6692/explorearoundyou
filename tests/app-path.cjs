const assert=require('node:assert/strict');
const {appPath}=require('../.test-output/app-path.js');
const {placeShareUrl,readSharedPlace}=require('../.test-output/sharing.js');
const {defaultPhotoPlaces}=require('../.test-output/default-photo-places.js');
const {pixelIcon}=require('../.test-output/pixel-icons.js');
const previous=process.env.NEXT_PUBLIC_BASE_PATH;
try{
 delete process.env.NEXT_PUBLIC_BASE_PATH;assert.equal(appPath('/'),'/');
 process.env.NEXT_PUBLIC_BASE_PATH='/explorearoundyou';assert.equal(appPath('/'),'/explorearoundyou/');assert.equal(pixelIcon('Food'),'/explorearoundyou/icons/pixel/food.svg');
 assert.ok(defaultPhotoPlaces(13.0827,80.2707,5).every(p=>p.photo.src.startsWith('/explorearoundyou/images/')));
 const p={id:'node/1',name:'Cafe',lat:13,lon:80,category:'Food',kind:'cafe',distance:0};const url=new URL(placeShareUrl('https://example.com/?access_token=secret',p));assert.equal(url.pathname,'/explorearoundyou/');assert.equal(readSharedPlace(url.search).name,'Cafe');assert.equal(url.search.includes('secret'),false);
 for(const base of ['https://evil.com','//evil.com','/../x','/x/']){process.env.NEXT_PUBLIC_BASE_PATH=base;assert.throws(()=>appPath('/'))}
 process.env.NEXT_PUBLIC_BASE_PATH='';assert.throws(()=>appPath('//evil.com'));assert.throws(()=>appPath('relative'));
}finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_BASE_PATH;else process.env.NEXT_PUBLIC_BASE_PATH=previous}
console.log('PASS: root and Pages paths, photos, pixel markers and safe shared links');

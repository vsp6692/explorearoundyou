const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const swc=require('next/dist/build/swc'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const filename=path.resolve('components/TripCover.tsx');
const compiled=new Module(filename,module);compiled.filename=filename;compiled.paths=Module._nodeModulePaths(path.dirname(filename));
const normalRequire=compiled.require.bind(compiled);
compiled.require=id=>id==='../lib/app-path'?require('../.test-output/app-path.js'):id==='../lib/photos'?require('../.test-output/photos.js'):normalRequire(id);
compiled._compile(swc.transformSync(fs.readFileSync(filename,'utf8'),{filename,jsc:{parser:{syntax:'typescript',tsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code,filename);
const TripCover=compiled.exports.default;
for(const places of [[],[{name:'Legacy stop'}],[{name:'Mapped stop',photoTitle:'File:Mapped.jpg'}]]){
 const html=renderToStaticMarkup(React.createElement(TripCover,{trip:{places,cover:'mountains'}}));
 assert.match(html,/Inspiration cover/);assert.match(html,/journey-mountains.jpg/);assert.doesNotMatch(html,/Photo of/);
}
console.log('PASS: actual TripCover renders empty, legacy photo-less and pending-photo trips without crashing');

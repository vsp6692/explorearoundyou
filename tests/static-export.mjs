import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=process.env.NEXT_PUBLIC_BASE_PATH||'';
const html=await readFile('out/index.html','utf8');
const manifest=JSON.parse(await readFile('out/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,base+'/');assert.equal(manifest.scope,base+'/');
for(const page of ['privacy','credits']){const text=await readFile(`out/${page}/index.html`,'utf8');assert.ok(text.includes('https://github.com/vsp6692/explorearoundyou/issues')||page==='credits');assert.ok(text.includes(`${base}/?view=profile`))}
const urls=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]).filter(u=>u.startsWith('/'));
assert.ok(urls.some(u=>u.includes('/_next/')));
for(const url of urls){assert.ok(url.startsWith(base+'/'),`Unprefixed asset: ${url}`);await stat(resolve('out','.'+decodeURIComponent(url.slice(base.length).split('?')[0])))}
for(const path of ['/maplibre-gl-worker.mjs','/icons/pixel/food.svg','/images/journey-coast.jpg','/images/nearby/chennai-1.jpg'])assert.ok((await stat('out'+path)).size>0);
assert.ok(manifest.icons.every(i=>i.src.startsWith(base+'/')));
console.log(`PASS: exported entrypoint, ${urls.length} asset links, map worker, bundled photos, information pages and install manifest at ${base||'/'}`);

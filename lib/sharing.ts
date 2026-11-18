import {appPath} from './app-path';
import type {Place} from './places';
import {HISTORY_CATEGORIES} from './history';
export function placeShareUrl(origin:string,place:Place){
 const url=new URL(appPath('/'),origin);
 url.search=new URLSearchParams({lat:place.lat.toFixed(6),lon:place.lon.toFixed(6),place:place.name.slice(0,200),category:place.category}).toString();
 return url.href;
}
export function readSharedPlace(search:string):Place|null{
 const p=new URLSearchParams(search),name=p.get('place')?.trim(),latitude=p.get('lat'),longitude=p.get('lon');
 if(!name||name.length>200||!latitude?.trim()||!longitude?.trim())return null;
 const lat=Number(latitude),lon=Number(longitude);
 if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)return null;
 const category=HISTORY_CATEGORIES.includes(p.get('category')||'')?p.get('category')!:'Attractions';
 return {id:`map:shared:${lat}:${lon}:${name}`,lat,lon,name,category,kind:'shared location',distance:0};
}

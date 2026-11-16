import type {Place} from './places';
import {HISTORY_CATEGORIES} from './history';
import {commonsTitle} from './photos';
import {safeWebsite} from './search-intent';
export function readBookmarks(raw:string|null):Place[]{
 try{
  const rows=JSON.parse(raw||'[]');if(!Array.isArray(rows))return [];
  const result:Place[]=[],seen=new Set<string>();
  for(const p of rows.slice(0,2000)){
   if(!p||typeof p.id!=='string'||seen.has(p.id)||typeof p.name!=='string'||!p.name.trim()||!HISTORY_CATEGORIES.includes(p.category)||!Number.isFinite(p.lat)||Math.abs(p.lat)>90||!Number.isFinite(p.lon)||Math.abs(p.lon)>180)continue;
   const text=(key:string,max=600)=>typeof p[key]==='string'?p[key].slice(0,max):undefined;
   result.push({id:p.id,name:p.name.slice(0,200),lat:p.lat,lon:p.lon,category:p.category,kind:text('kind',100)||'place',distance:0,description:text('description'),address:text('address'),openingHours:text('openingHours',200),cuisine:text('cuisine',200),website:safeWebsite(text('website',2000)),photoTitle:commonsTitle(p.photoTitle)});seen.add(p.id);
  }
  return result;
 }catch{return []}
}

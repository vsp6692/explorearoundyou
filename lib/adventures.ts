import {distanceKm, type Place} from './places';
export type AdventureMode = 'short' | 'variety' | 'family';
export type Visit = Pick<Place,'id'|'name'|'lat'|'lon'|'category'|'kind'>;
const categories = new Set(['Food','Stays','Beaches','Parks','Attractions','Shopping','Fun']);
export function samePlace(a:Visit,b:Visit) {
 return a.id===b.id || (a.name.trim().toLowerCase()===b.name.trim().toLowerCase() && distanceKm(a.lat,a.lon,b.lat,b.lon)<.05);
}
export function readVisits(raw:string|null):Visit[] {
 try {const data=JSON.parse(raw||'[]');if(!Array.isArray(data))return [];const valid:Visit[]=[];
 for(const p of data.slice(0,2000))if(p&&typeof p.id==='string'&&typeof p.name==='string'&&typeof p.kind==='string'&&categories.has(p.category)&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180&&!valid.some(v=>samePlace(v,p)))valid.push({id:p.id,name:p.name,kind:p.kind,category:p.category,lat:p.lat,lon:p.lon});return valid;
 }catch{return []}
}
/** Suggest stops from known places; this is not a pedestrian routing engine. */
export function planAdventure(places:Place[],origin:{lat:number;lon:number},radius:number,mode:AdventureMode){
 const maxDistance=mode==='short'?2:5;
 const pool:Place[]=[];
 for(const p of places){if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||distanceKm(origin.lat,origin.lon,p.lat,p.lon)>radius)continue;if(mode==='family'&&!['Parks','Food','Fun','Attractions','Beaches'].includes(p.category))continue;if(!pool.some(v=>samePlace(v,p)))pool.push(p)}
 const stops:Place[]=[];let current=origin;let total=0;
 while(stops.length<3){const choices=pool.filter(p=>!stops.some(v=>samePlace(v,p))).map(p=>({place:p,leg:distanceKm(current.lat,current.lon,p.lat,p.lon)})).filter(p=>p.leg+total<=maxDistance).sort((a,b)=>{
 const score=(p:typeof a)=>p.leg+(mode!=='short'&&stops.some(s=>s.category===p.place.category)?.4:0);
 return score(a)-score(b)||a.place.id.localeCompare(b.place.id)
 });if(!choices.length)break;const next=choices[0];stops.push(next.place);total+=next.leg;current=next.place}
 return {stops,distance:total};
}
export function badges(visits:Visit[]){return [
 {name:'First Footstep',icon:'👣',count:visits.length,target:1},
 {name:'Beach Hunter',icon:'🏖️',count:visits.filter(v=>v.category==='Beaches').length,target:3},
 {name:'Café Hopper',icon:'☕',count:visits.filter(v=>/\b(cafe|coffee|tea)\b/i.test(v.kind)).length,target:3},
 {name:'Nature Explorer',icon:'🌿',count:visits.filter(v=>v.category==='Parks').length,target:3},
 {name:'Curious Explorer',icon:'🧭',count:new Set(visits.map(v=>v.category)).size,target:4},
]}

export function mysteryIds(places:Pick<Place,'id'>[]):string[] {
 const hash=(text:string)=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
 return [...new Set(places.map(p=>p.id))].sort((a,b)=>hash(a)-hash(b)||a.localeCompare(b)).slice(0,3);
}

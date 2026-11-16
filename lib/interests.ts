import {matchesCuisine} from './cuisines';
import {HISTORY_CATEGORIES} from './history';
import {distanceKm,type Place} from './places';
import {matchesIntent,type SearchIntent} from './search-intent';

export function cleanInterests(value:unknown):string[]{
 return Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string'&&HISTORY_CATEGORIES.includes(v)))]:[];
}
export function readInterests(value:string|null):string[]{try{return cleanInterests(JSON.parse(value||'[]'))}catch{return []}}

// Explicit interests affect ordering, never claims about suitability, prices or ratings.
export function selectDiscoveries(places:Place[],center:{lat:number;lon:number},radius:number,category:string,intent:SearchIntent|null,interests:string[],preferredOnly=false,cuisine='all'){
 const preferred=new Set(cleanInterests(interests));
 return places.map(p=>({...p,distance:distanceKm(center.lat,center.lon,p.lat,p.lon)}))
 .filter(p=>p.distance<=radius&&(category==='Everything'||p.category===category)&&(category!=='Food'||matchesCuisine(p,cuisine))&&matchesIntent(p,intent)&&(!preferredOnly||preferred.has(p.category)))
 .sort((a,b)=>(Number(preferred.has(b.category))-Number(preferred.has(a.category)))||a.distance-b.distance)
 .slice(0,180);
}

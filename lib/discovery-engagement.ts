import {samePlace} from './adventures';
import {cleanInterests} from './interests';
import type {Place} from './places';

/** Preferences stay ahead of photo availability; neither is a popularity signal. */
export function rankDiscoveries(places:Place[],photos:Readonly<Record<string,unknown>>={},interests:string[]=[]):Place[]{
 const preferred=new Set(cleanInterests(interests));
 return [...places].sort((a,b)=>
  Number(preferred.has(b.category))-Number(preferred.has(a.category))||
  Number(!!photos[b.id])-Number(!!photos[a.id])||
  a.distance-b.distance
 );
}

/** Rotate through distinct known places before recycling recent discoveries. */
export function chooseSurprise(places:Place[],recent:Place[],selected?:Place|null,interests:string[]=[],rng:()=>number=Math.random):Place|undefined{
 const unique:Place[]=[];
 for(const place of places)if(!unique.some(other=>samePlace(other,place)))unique.push(place);
 if(!unique.length)return;
 const alternatives=selected?unique.filter(place=>!samePlace(place,selected)):unique;
 const candidates=alternatives.length?alternatives:unique;
 const unseen=candidates.filter(place=>!recent.some(previous=>samePlace(previous,place)));
 const available=unseen.length?unseen:candidates;
 const preferred=new Set(cleanInterests(interests));
 const matches=available.filter(place=>preferred.has(place.category));
 const pool=matches.length?matches:available;
 const random=rng();
 const index=Number.isFinite(random)?Math.max(0,Math.min(pool.length-1,Math.floor(random*pool.length))):0;
 return pool[index];
}

/** Explain only a recorded interest or mapped category, without quality claims. */
export function surpriseReason(place:Place,interests:string[]=[]):string{
 if(cleanInterests(interests).includes(place.category))return `A ${place.category.toLowerCase()} discovery that matches your interests.`;
 const kind=place.kind.replaceAll('_',' ').trim().replace(/^nearby\s+/i,'');
 return kind&&kind!=='place'?`A nearby ${kind} to discover. Check its details before you go.`:'A nearby place to discover. Check its details before you go.';
}

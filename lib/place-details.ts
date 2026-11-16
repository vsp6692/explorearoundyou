import {distanceKm,type Place} from './places';
import {commonsTitle} from './photos';
import {safeWebsite} from './search-intent';
import {geocodeJson} from './geocoding';
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};
const text=(v:unknown)=>typeof v==='string'?v:undefined;
const normalized=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const kinds:Record<string,string[]>={Stays:['hotel','hostel','guest_house','motel','apartment'],Food:['restaurant','cafe','fast_food','food_court','ice_cream','bar','pub']};
export function matchPlaceRecord(place:Place,payload:unknown):Record<string,unknown>|undefined{
 if(!Array.isArray(payload))return;
 const matches=payload.map(object).filter(row=>{
  const lat=Number(row.lat),lon=Number(row.lon),ref=`${row.osm_type}/${row.osm_id}`;
  if(row.lat==null||row.lon==null||row.lat===''||row.lon===''||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(lat)||!Number.isFinite(lon)||distanceKm(place.lat,place.lon,lat,lon)>(place.category==='Stays'?.25:.12))return false;
  if(kinds[place.category]&&!kinds[place.category].includes(String(row.type)))return false;
  if(ref===place.id||ref===place.osmRef)return true;
  if(/^(node|way|relation)\/\d+$/.test(place.osmRef||place.id))return false;
  const names=[row.name,...Object.values(object(row.namedetails))].filter((n):n is string=>typeof n==='string');
  return names.some(name=>normalized(name)===normalized(place.name));
 });
 return matches.length===1?matches[0]:undefined;
}
export function mappedDetails(place:Place,row:Record<string,unknown>):Place{
 const tags=object(row.extratags),address=object(row.address);
 const osmRef=/^(node|way|relation)$/.test(String(row.osm_type))&&/^\d+$/.test(String(row.osm_id))?`${row.osm_type}/${row.osm_id}`:undefined;
 return {...place,osmRef,description:text(tags.description)?.slice(0,600)||place.description,address:[address.house_number,address.road,address.suburb,address.city||address.town].filter(v=>typeof v==='string').join(', ')||place.address,website:safeWebsite(text(tags.website)||text(tags['contact:website']))||place.website,cuisine:text(tags.cuisine)||place.cuisine,openingHours:text(tags.opening_hours)||place.openingHours,photoTitle:commonsTitle(tags.wikimedia_commons)||commonsTitle(tags.image)||place.photoTitle,wikidata:/^Q\d+$/.test(String(tags.wikidata))?String(tags.wikidata):place.wikidata};
}
export function linkedWikiDetails(payload:unknown,id:string){
 const entity=object(object(object(payload).entities)[id]),claims=object(entity.claims);
 const image=(Array.isArray(claims.P18)?claims.P18:[]).map(object).find(p=>p.rank!=='deprecated'&&object(p.mainsnak).snaktype==='value');
 const filename=text(object(object(image?.mainsnak).datavalue).value);
 return {description:text(object(object(entity.descriptions).en).value)?.slice(0,600),photoTitle:filename?commonsTitle(`File:${filename}`):undefined};
}
const cache=new Map<string,Place>();
export async function loadPlaceDetails(place:Place,signal:AbortSignal):Promise<Place>{
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const key=`${place.id}:${place.lat}:${place.lon}`;if(cache.has(key))return {...place,...cache.get(key)};
 const base=process.env.NEXT_PUBLIC_GEOCODER_URL||'https://nominatim.openstreetmap.org/search';
 const url=new URL(base),ref=(place.osmRef||place.id).match(/^(node|way|relation)\/(\d+)$/);
 if(ref){url.pathname=url.pathname.replace(/search\/?$/,'lookup');url.search=new URLSearchParams({osm_ids:`${ref[1][0].toUpperCase()}${ref[2]}`,format:'jsonv2',extratags:'1',namedetails:'1',addressdetails:'1'}).toString()}
 else{const dy=.004,dx=Math.min(.1,dy/Math.max(.1,Math.cos(place.lat*Math.PI/180)));url.search=new URLSearchParams({q:place.name,viewbox:`${Math.max(-180,place.lon-dx)},${Math.min(90,place.lat+dy)},${Math.min(180,place.lon+dx)},${Math.max(-90,place.lat-dy)}`,bounded:'1',format:'jsonv2',limit:'5',extratags:'1',namedetails:'1',addressdetails:'1'}).toString()}
 const row=matchPlaceRecord(place,await geocodeJson(url,signal));if(!row)throw Error('No unambiguous detail record was found for this place.');
 let result=mappedDetails(place,row);
 if(result.wikidata&&(!result.photoTitle||!result.description)){
  try{const wiki=new URL('https://www.wikidata.org/w/api.php');wiki.search=new URLSearchParams({action:'wbgetentities',ids:result.wikidata,props:'claims|descriptions',languages:'en',format:'json',origin:'*'}).toString();const response=await fetch(wiki,{signal});if(response.ok){const detail=linkedWikiDetails(await response.json(),result.wikidata);result={...result,photoTitle:result.photoTitle||detail.photoTitle,description:result.description||detail.description,descriptionSource:result.description?result.descriptionSource:detail.description?`https://www.wikidata.org/wiki/${result.wikidata}`:undefined}}}catch{if(signal.aborted)throw new DOMException('Aborted','AbortError')}
 }
 cache.set(key,result);if(cache.size>50)cache.delete(cache.keys().next().value!);return result;
}

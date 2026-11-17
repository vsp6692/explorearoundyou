import {distanceKm,type Place} from './places';
import {commonsTitle} from './photos';
import {safeWebsite} from './search-intent';
import {geocodeJson} from './geocoding';
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};
const text=(v:unknown)=>typeof v==='string'?v:undefined;
const coordinate=(value:unknown)=>typeof value==='number'||typeof value==='string'&&value.trim()!==''?Number(value):NaN;
const normalized=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function matchesCategory(category:string,row:Record<string,unknown>){
 const type=String(row.type),group=String(row.class||row.category||'');
 const kinds:Record<string,string[]>={Stays:['hotel','hostel','guest_house','motel','apartment'],Food:['restaurant','cafe','fast_food','food_court','ice_cream','bar','pub'],Parks:['park','garden','nature_reserve','wood','forest'],Beaches:['beach'],Attractions:['attraction','museum','viewpoint','artwork','monument','castle','zoo','theme_park','town_hall','community_centre','place_of_worship'],Fun:['playground','water_park','sports_centre','stadium','cinema','theatre','theme_park']};
 return category==='Shopping'?group==='shop'||['mall','department_store','supermarket','books'].includes(type):!kinds[category]||kinds[category].includes(type);
}
export function matchPlaceRecord(place:Place,payload:unknown):Record<string,unknown>|undefined{
 if(!Array.isArray(payload))return;
 const matches=payload.map(object).filter(row=>{
  const lat=coordinate(row.lat),lon=coordinate(row.lon),ref=`${row.osm_type}/${row.osm_id}`;
  if(row.lat==null||row.lon==null||row.lat===''||row.lon===''||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(lat)||!Number.isFinite(lon)||distanceKm(place.lat,place.lon,lat,lon)>(place.category==='Stays'?.25:.12))return false;
  if(ref===place.id||ref===place.osmRef)return true;
  if(!matchesCategory(place.category,row))return false;
  if(/^(node|way|relation)\/\d+$/.test(place.osmRef||place.id))return false;
  const names=[row.name,...Object.values(object(row.namedetails))].filter((n):n is string=>typeof n==='string');
  return names.some(name=>normalized(name)===normalized(place.name));
 });
 return matches.length===1?matches[0]:undefined;
}
export function mappedDetails(place:Place,row:Record<string,unknown>):Place{
 const tags=object(row.extratags),address=object(row.address);
 const osmRef=/^(node|way|relation)$/.test(String(row.osm_type))&&/^\d+$/.test(String(row.osm_id))?`${row.osm_type}/${row.osm_id}`:undefined;
 return {...place,osmRef,description:text(tags.description)?.slice(0,600)||place.description,descriptionSource:text(tags.description)?osmRef?`https://www.openstreetmap.org/${osmRef}`:undefined:place.descriptionSource,address:[address.house_number,address.road,address.suburb,address.city||address.town].filter(v=>typeof v==='string').join(', ')||place.address,website:safeWebsite(text(tags.website)||text(tags['contact:website']))||place.website,cuisine:text(tags.cuisine)||place.cuisine,openingHours:text(tags.opening_hours)||place.openingHours,photoTitle:commonsTitle(tags.wikimedia_commons)||commonsTitle(tags.image)||place.photoTitle,wikidata:/^Q\d+$/.test(String(tags.wikidata))?String(tags.wikidata):place.wikidata};
}
export function linkedWikiDetails(payload:unknown,id:string){
 const entity=object(object(object(payload).entities)[id]),claims=object(entity.claims);
 const images=(Array.isArray(claims.P18)?claims.P18:[]).map(object).filter(p=>p.rank!=='deprecated'&&object(p.mainsnak).snaktype==='value').sort((a,b)=>Number(b.rank==='preferred')-Number(a.rank==='preferred'));
 const photoTitle=images.map(image=>{const filename=text(object(object(image.mainsnak).datavalue).value);return filename?commonsTitle(`File:${filename}`):undefined}).find(Boolean);
 return {description:text(object(object(entity.descriptions).en).value)?.slice(0,600),photoTitle};
}
const cache=new Map<string,{at:number;place:Place;partial:boolean}>();
export async function loadPlaceDetails(place:Place,signal:AbortSignal,refresh=false):Promise<Place>{
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const key=`${place.id}:${place.name}:${place.category}:${place.lat}:${place.lon}`,cached=cache.get(key);
 if(!refresh&&cached&&Date.now()-cached.at<(cached.partial?60000:900000))return {...place,...cached.place,distance:place.distance};
 const base=process.env.NEXT_PUBLIC_GEOCODER_URL||'https://nominatim.openstreetmap.org/search';
 const url=new URL(base),ref=(place.osmRef||place.id).match(/^(node|way|relation)\/(\d+)$/);
 if(ref){url.pathname=url.pathname.replace(/search\/?$/,'lookup');url.search=new URLSearchParams({osm_ids:`${ref[1][0].toUpperCase()}${ref[2]}`,format:'jsonv2',extratags:'1',namedetails:'1',addressdetails:'1'}).toString()}
 else{const dy=.004,dx=Math.min(.1,dy/Math.max(.1,Math.cos(place.lat*Math.PI/180)));url.search=new URLSearchParams({q:place.name,viewbox:`${Math.max(-180,place.lon-dx)},${Math.min(90,place.lat+dy)},${Math.min(180,place.lon+dx)},${Math.max(-90,place.lat-dy)}`,bounded:'1',format:'jsonv2',limit:'5',extratags:'1',namedetails:'1',addressdetails:'1'}).toString()}
 let result=place,partial=false;
 try{
  if(/^Q\d+$/.test(place.wikidata||'')&&(ref||/^wiki:\d+$/.test(place.id))){
   // Real OSM results already identify their Wikidata entity; avoid a second
   // geocoder dependency before displaying that entity’s linked information.
   result=place;
  }else{
  const row=matchPlaceRecord(place,await geocodeJson(url,signal,refresh));
  if(!row)throw Error('No unambiguous detail record was found for this place.');
  result=mappedDetails(place,row);
  }
 }catch(error){
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  // Overpass/bookmarks can already carry an explicit Wikidata or Commons link.
  // A geocoder outage must not prevent using that existing association.
  if(!/^Q\d+$/.test(place.wikidata||'')&&!commonsTitle(place.photoTitle))throw error;
  partial=true;
 }
 if(result.wikidata&&!/^Q\d+$/.test(result.wikidata))result={...result,wikidata:undefined};
 if(result.wikidata&&(!result.photoTitle||!result.description)){
  try{const wiki=new URL('https://www.wikidata.org/w/api.php');wiki.search=new URLSearchParams({action:'wbgetentities',ids:result.wikidata,props:'claims|descriptions',languages:'en',format:'json',origin:'*'}).toString();const response=await fetch(wiki,{signal});if(!response.ok)throw Error('Linked place information is unavailable.');{const detail=linkedWikiDetails(await response.json(),result.wikidata);result={...result,photoTitle:result.photoTitle||detail.photoTitle,description:result.description||detail.description,descriptionSource:result.description?result.descriptionSource:detail.description?`https://www.wikidata.org/wiki/${result.wikidata}`:undefined}}}catch{if(signal.aborted)throw new DOMException('Aborted','AbortError');partial=true}
 }
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 cache.set(key,{at:Date.now(),place:result,partial});if(cache.size>50)cache.delete(cache.keys().next().value!);return result;
}

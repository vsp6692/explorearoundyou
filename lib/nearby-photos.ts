import {distanceKm,type Place} from './places';
import {commonsTitle,parseCommonsPhoto,type CommonsPhoto} from './photos';
export type NearbyPhotoPlace={place:Place;photo:CommonsPhoto};
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
const abort=()=>new DOMException('Aborted','AbortError');
const unsupported=/\b(presidency|district|constituency|taluk|tehsil|county|province|railway|railroad|metro station|municipal corporation|hospital|medical|veterinary|college|university|school)\b|^(list of|history of)\b/i;
function pages(payload:unknown){const data=object(payload);if(data.error)throw Error('Nearby photos are temporarily unavailable.');return Array.isArray(object(data.query).pages)?object(data.query).pages as unknown[]:[]}
export function nearbyWikiPlaces(payload:unknown,lat:number,lon:number,radius:number):Place[]{
 const found:Place[]=[],seen=new Set<number>();
 for(const raw of pages(payload).slice(0,50)){
  const p=object(raw),props=object(p.pageprops);
  if(typeof p.pageid!=='number'||!Number.isSafeInteger(p.pageid)||p.pageid<=0||seen.has(p.pageid)||p.ns!==0||typeof p.title!=='string'||!p.title.trim()||p.title.length>240||unsupported.test(p.title)||'disambiguation' in props||!/^Q\d+$/.test(String(props.wikibase_item)))continue;
  const primary=(Array.isArray(p.coordinates)?p.coordinates:[]).map(object).filter(c=>(c.primary===true||c.primary==='')&&c.globe==='earth');
  if(primary.length!==1)continue;
  const coord=primary[0];if(typeof coord.lat!=='number'||!Number.isFinite(coord.lat)||Math.abs(coord.lat)>90||typeof coord.lon!=='number'||!Number.isFinite(coord.lon)||Math.abs(coord.lon)>180)continue;
  const distance=distanceKm(lat,lon,coord.lat,coord.lon);if(distance>radius)continue;
  const website=`https://en.wikipedia.org/?curid=${p.pageid}`;
  seen.add(p.pageid);found.push({id:`wiki:${p.pageid}`,name:p.title.trim(),lat:coord.lat,lon:coord.lon,category:'Attractions',kind:'nearby landmark',distance,wikidata:String(props.wikibase_item),description:typeof p.extract==='string'?p.extract.slice(0,600):undefined,descriptionSource:website});
 }
 return found.sort((a,b)=>a.distance-b.distance).slice(0,24);
}
export function locatedWikiPlaces(payload:unknown,places:Place[],lat:number,lon:number,radius:number):Place[]{
 const entities=object(object(payload).entities);
 return places.flatMap(place=>{
  const claims=object(object(entities[place.wikidata||'']).claims);
  const instances=(Array.isArray(claims.P31)?claims.P31:[]).map(c=>String(object(object(object(object(c).mainsnak).datavalue).value).id||''));
  const item=instances.some(id=>['Q515','Q3957','Q532','Q486972','Q1549591'].includes(id))?{...place,kind:'area overview'}:place;
  const coordinates=(Array.isArray(claims.P625)?claims.P625:[]).map(object).filter(c=>c.rank!=='deprecated'&&object(c.mainsnak).snaktype==='value');
  const preferred=coordinates.filter(c=>c.rank==='preferred');const options=preferred.length?preferred:coordinates;
  const points=options.map(c=>object(object(object(c.mainsnak).datavalue).value)).filter(c=>c.globe==='http://www.wikidata.org/entity/Q2'&&typeof c.latitude==='number'&&Number.isFinite(c.latitude)&&Math.abs(c.latitude)<=90&&typeof c.longitude==='number'&&Number.isFinite(c.longitude)&&Math.abs(c.longitude)<=180);
  if(!points.length)return [item];
  if(points.length!==1)return [];
  const point=points[0],latitude=point.latitude as number,longitude=point.longitude as number,distance=distanceKm(lat,lon,latitude,longitude);
  return distance<=radius?[{...item,lat:latitude,lon:longitude,distance}]:[];
 });
}
export function linkedPhotoTitles(payload:unknown,places:Place[]):Map<string,string>{
 const entities=object(object(payload).entities),result=new Map<string,string>();
 for(const place of places){
  const id=place.wikidata;if(!id||!/^Q\d+$/.test(id))continue;
  const entity=object(entities[id]),claims=object(entity.claims);
  // An entity with a dissolution date may describe a vanished organisation or
  // historical territory rather than a present-day place to explore.
  if(Array.isArray(claims.P576)&&claims.P576.some(raw=>object(object(raw).mainsnak).snaktype==='value'))continue;
  const images=(Array.isArray(claims.P18)?claims.P18:[]).slice(0,100).map(object).filter(c=>c.rank!=='deprecated'&&object(c.mainsnak).snaktype==='value').sort((a,b)=>Number(b.rank==='preferred')-Number(a.rank==='preferred'));
  for(const claim of images){const value=object(object(claim.mainsnak).datavalue).value;if(typeof value!=='string')continue;const title=commonsTitle(`File:${value}`);if(title){result.set(place.id,title);break}}
 }
 return result;
}
function photoMap(payload:unknown,requested:string[]):Map<string,CommonsPhoto>{
 const data=object(payload),query=object(data.query),result=new Map<string,CommonsPhoto>();
 const aliases=new Map<string,string>();
 for(const raw of [...(Array.isArray(query.normalized)?query.normalized:[]),...(Array.isArray(query.redirects)?query.redirects:[])].slice(0,50)){
  const row=object(raw),from=commonsTitle(row.from),to=commonsTitle(row.to);if(from&&to)aliases.set(from,to);
 }
 const canonical=(title:string)=>{const seen=new Set<string>();while(aliases.has(title)&&!seen.has(title)&&seen.size<10){seen.add(title);title=aliases.get(title)!}return title};
 const allowed=new Map<string,string[]>();for(const title of requested){const key=canonical(title);allowed.set(key,[...(allowed.get(key)||[]),title])}
 for(const raw of pages(payload).slice(0,50)){
  const page=object(raw),title=commonsTitle(page.title);if(!title||!allowed.has(title))continue;
  const photo=parseCommonsPhoto({query:{pages:[page]}});if(!photo)continue;
  for(const requestedTitle of allowed.get(title)!)result.set(requestedTitle,photo);
 }
 return result;
}
export function combineNearbyPhotos(places:Place[],titles:Map<string,string>,payload:unknown):NearbyPhotoPlace[]{
 const images=photoMap(payload,[...new Set(titles.values())]);
 return places.flatMap(place=>{const photoTitle=titles.get(place.id),photo=photoTitle?images.get(photoTitle):undefined;return photo&&photoTitle?[{place:{...place,photoTitle},photo}]:[]}).slice(0,12);
}
async function json(url:URL,signal:AbortSignal):Promise<unknown>{
 if(signal.aborted)throw abort();
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Nearby photos are temporarily unavailable.');
 if(Number(response.headers?.get('content-length')||0)>5000000)throw Error('Nearby photo data was too large.');
 const payload:unknown=await response.json();if(signal.aborted)throw abort();
 if(object(payload).error)throw Error('Nearby photos are temporarily unavailable.');return payload;
}
const cache=new Map<string,{at:number;places:NearbyPhotoPlace[]}>();
export async function discoverPhotoPlaces(lat:number,lon:number,radius:number,signal:AbortSignal):Promise<NearbyPhotoPlace[]>{
 if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180||!Number.isFinite(radius)||radius<.1||radius>10)throw Error('Invalid nearby photo area.');
 if(signal.aborted)throw abort();
 const key=`${lat.toFixed(4)}:${lon.toFixed(4)}:${radius}`,cached=cache.get(key);
 if(cached&&Date.now()-cached.at<900000)return cached.places.map(item=>({...item,place:{...item.place,distance:distanceKm(lat,lon,item.place.lat,item.place.lon)}})).filter(item=>item.place.distance<=radius);
 const wiki=new URL('https://en.wikipedia.org/w/api.php');wiki.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'geosearch',ggscoord:`${lat}|${lon}`,ggsradius:String(Math.round(radius*1000)),ggslimit:'32',ggsprimary:'primary',prop:'coordinates|pageprops|extracts',colimit:'max',coprimary:'primary',exintro:'1',explaintext:'1',exsentences:'2',ppprop:'wikibase_item|disambiguation'}).toString();
 const candidates=nearbyWikiPlaces(await json(wiki,signal),lat,lon,radius);
 let result:NearbyPhotoPlace[]=[];
 if(candidates.length){
  const wikidata=new URL('https://www.wikidata.org/w/api.php');wikidata.search=new URLSearchParams({action:'wbgetentities',format:'json',origin:'*',ids:[...new Set(candidates.map(p=>p.wikidata!))].join('|'),props:'claims'}).toString();
  const entities=await json(wikidata,signal),located=locatedWikiPlaces(entities,candidates,lat,lon,radius);
  const titles=linkedPhotoTitles(entities,located);
  if(titles.size){
   const commons=new URL('https://commons.wikimedia.org/w/api.php');commons.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',prop:'imageinfo',titles:[...new Set(titles.values())].join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'480',redirects:'1'}).toString();
   result=combineNearbyPhotos(located,titles,await json(commons,signal));
  }
 }
 if(signal.aborted)throw abort();cache.set(key,{at:Date.now(),places:result});if(cache.size>24)cache.delete(cache.keys().next().value!);return result;
}

// Resolve only image/entity references already supplied by real map records.
// This never searches for business photographs by name.
export async function loadMappedPhotoPlaces(input:Place[],signal:AbortSignal):Promise<NearbyPhotoPlace[]>{
 if(signal.aborted)throw abort();
 const places=input.filter(p=>commonsTitle(p.photoTitle)||/^Q\d+$/.test(p.wikidata||'')).slice(0,12);
 if(!places.length)return [];
 const titles=new Map<string,string>();for(const place of places){const title=commonsTitle(place.photoTitle);if(title)titles.set(place.id,title)}
 const linked=places.filter(p=>!titles.has(p.id)&&/^Q\d+$/.test(p.wikidata||''));
 if(linked.length){const url=new URL('https://www.wikidata.org/w/api.php');url.search=new URLSearchParams({action:'wbgetentities',format:'json',origin:'*',ids:[...new Set(linked.map(p=>p.wikidata!))].join('|'),props:'claims'}).toString();for(const [id,title] of linkedPhotoTitles(await json(url,signal),linked))titles.set(id,title)}
 if(!titles.size)return [];
 const commons=new URL('https://commons.wikimedia.org/w/api.php');commons.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',prop:'imageinfo',titles:[...new Set(titles.values())].join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'480',redirects:'1'}).toString();
 return combineNearbyPhotos(places,titles,await json(commons,signal));
}

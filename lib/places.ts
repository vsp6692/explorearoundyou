import {cuisineSelector} from './cuisines';
import {commonsTitle} from './photos';
export type Place = { id:string; name:string; lat:number; lon:number; category:string; kind:string; distance:number; description?:string; address?:string; openingHours?:string; website?:string; cuisine?:string; photoTitle?:string; osmRef?:string; wikidata?:string; descriptionSource?:string };
const selectors:Record<string,string[]>={Food:['amenity~"^(restaurant|cafe|fast_food|ice_cream)$"'],Stays:['tourism~"^(hotel|hostel|guest_house)$"'],Beaches:['natural="beach"'],Parks:['leisure~"^(park|garden|nature_reserve)$"'],Attractions:['tourism~"^(attraction|museum|viewpoint)$"'],Shopping:['shop~"^(mall|department_store|books)$"'],Fun:['leisure~"^(playground|water_park|sports_centre)$"']};
export function distanceKm(a:number,b:number,c:number,d:number){const rad=Math.PI/180;const x0=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;const x=Math.min(1,Math.max(0,x0));return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
const cache=new Map<string,{at:number;places:Place[]}>();
export async function discover(lat:number,lon:number,radius:number,category:string,signal:AbortSignal,cuisine='all'):Promise<Place[]>{
 if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180||(!Number.isFinite(radius)||radius<0.1||radius>10)||!(category==='Everything'||Object.hasOwn(selectors,category)))throw Error('Invalid discovery filters');
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const cuisineFilter=category==='Food'?cuisineSelector(cuisine):'';
 const key=[lat.toFixed(4),lon.toFixed(4),radius,category,cuisine].join(':');const old=cache.get(key);if(old&&Date.now()-old.at<600000)return old.places;
 const entries=category==='Everything'?Object.entries(selectors):[[category,selectors[category]||[]] as [string,string[]]];
 const query=`[out:json][timeout:20];(${entries.flatMap(([,filters])=>filters.map(f=>`nwr(around:${radius*1000},${lat},${lon})[${f}]${cuisineFilter}[name];`)).join('')});out center tags 180;`;
 const response=await fetch(process.env.NEXT_PUBLIC_OVERPASS_URL||'https://maps.mail.ru/osm/tools/overpass/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),signal});
 if(!response.ok)throw Error(`The nearby-place service returned HTTP ${response.status}. Please try again later.`);
 let data:unknown;try{data=await response.json()}catch{throw Error('The nearby-place service returned unreadable data. Please try again later.')}
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 if(!data||typeof data!=='object'||'remark' in data||!('elements' in data)||!Array.isArray(data.elements))throw Error('Discovery returned incomplete data');
 const seen=new Set<string>();
 const places:Place[]=data.elements.flatMap((raw:unknown)=>{
  if(!raw||typeof raw!=='object')return [];
  const e=raw as Record<string,unknown>;
  if(!['node','way','relation'].includes(String(e.type))||typeof e.id!=='number'||!Number.isSafeInteger(e.id)||e.id<=0)return [];
  const id=`${e.type}/${e.id}`;if(seen.has(id))return [];
  const center=e.center&&typeof e.center==='object'?e.center as Record<string,unknown>:{};
  const lat2=e.lat??center.lat,lon2=e.lon??center.lon;
  if(typeof lat2!=='number'||typeof lon2!=='number'||!Number.isFinite(lat2)||!Number.isFinite(lon2)||Math.abs(lat2)>90||Math.abs(lon2)>180)return [];
  const tags=e.tags&&typeof e.tags==='object'?e.tags as Record<string,unknown>:{};
  const t:Record<string,string>={};for(const [key,value] of Object.entries(tags))if(typeof value==='string')t[key]=value;
  if(!t.name?.trim())return [];
  const kind=t.amenity||t.tourism||t.leisure||t.natural||t.shop||'place';
  let cat='Attractions';
  if(t.shop)cat='Shopping';else if(t.natural==='beach')cat='Beaches';else if(['hotel','hostel','guest_house'].includes(kind))cat='Stays';else if(t.amenity)cat='Food';else if(['park','garden','nature_reserve'].includes(kind))cat='Parks';else if(t.leisure)cat='Fun';
  // A hotel can also map its restaurant. Keep the category explicitly queried.
  if(category!=='Everything')cat=category;
  const distance=distanceKm(lat,lon,lat2,lon2);if(distance>radius)return [];
  seen.add(id);
  return [{id,name:t.name.trim(),lat:lat2,lon:lon2,category:cat,kind:(category==='Stays'?t.tourism||kind:kind).replaceAll('_',' '),distance,description:t.description?.slice(0,600),address:[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' '),openingHours:t.opening_hours,website:t.website||t['contact:website'],wikidata:/^Q\d+$/.test(t.wikidata||'')?t.wikidata:undefined,photoTitle:commonsTitle(t.wikimedia_commons)||commonsTitle(t.image),cuisine:t.cuisine?.replaceAll(';',', ')}];
 });
 places.sort((a,b)=>a.distance-b.distance);cache.set(key,{at:Date.now(),places});if(cache.size>30)cache.delete(cache.keys().next().value!);return places;
}

/** Canonical longitudes keep map copies compatible with APIs and local records. */
export function normalizeLongitude(lon:number){return ((lon+180)%360+360)%360-180}
/** Read only real named tile points; absent metadata stays absent. */
export function mapPlaceFromFeature(feature:{geometry:{type:string;coordinates:unknown};properties?:Record<string,unknown>|null}):Place|undefined{
 if(feature.geometry.type!=='Point'||!Array.isArray(feature.geometry.coordinates))return;
 const [rawLon,lat]=feature.geometry.coordinates;
 if(typeof rawLon!=='number'||typeof lat!=='number'||!Number.isFinite(rawLon)||!Number.isFinite(lat)||Math.abs(lat)>90)return;
 const lon=normalizeLongitude(rawLon),props=feature.properties||{},name=props.name||props['name:en'];
 if(typeof name!=='string'||!name.trim())return;
 const kind=String(props.subclass||props.class||'place'),group=String(props.class||''),tags=[kind,group];
 if(tags.some(tag=>/^(clinic|hospital|doctor|dentist|school|college|university|rail|station|bus|tram|subway)(_|$)/.test(tag)))return;
 let category:string;
 if(tags.some(tag=>/^(restaurant|cafe|fast_food|ice_cream|food|bar|pub)$/.test(tag)))category='Food';
 else if(tags.some(tag=>/^(hotel|hostel|lodging|guest_house|motel)$/.test(tag)))category='Stays';
 else if(tags.includes('beach'))category='Beaches';
 else if(tags.some(tag=>/^(park|garden|nature_reserve)$/.test(tag)))category='Parks';
 else if(tags.some(tag=>/^(shop|mall|store|department_store)$/.test(tag)))category='Shopping';
 else if(tags.some(tag=>/^(playground|sport|sports_centre|stadium|cinema|theatre|theme_park|water_park)$/.test(tag)))category='Fun';
 else if(tags.some(tag=>/^(attraction|museum|artwork|monument|castle|viewpoint|zoo|town_hall|community_centre|place_of_worship)$/.test(tag)))category='Attractions';
 else return;
 const text=(key:string)=>typeof props[key]==='string'?props[key] as string:undefined;
 return {id:`map:${name.trim()}:${lat.toFixed(5)}:${lon.toFixed(5)}`,name:name.trim(),lat,lon,category,kind:kind.replaceAll('_',' '),distance:0,cuisine:text('cuisine'),description:text('description')?.slice(0,600),address:text('address'),website:text('website')||text('contact:website'),openingHours:text('opening_hours'),photoTitle:commonsTitle(props.wikimedia_commons)||commonsTitle(props.image),wikidata:/^Q\d+$/.test(text('wikidata')||'')?text('wikidata'):undefined};
}

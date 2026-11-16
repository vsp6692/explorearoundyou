import {distanceKm,type Place} from './places';
// Keep richer network fields when a nearby map label describes the same place.
// Distinct businesses with different names or coordinates remain separate.
export function discoveryPool(visible:Place[],wider:Place[]):Place[]{
 const result:Place[]=[],ids=new Set<string>(),names=new Map<string,Place[]>();
 for(const place of [...wider,...visible]){
  if(!Number.isFinite(place.lat)||Math.abs(place.lat)>90||!Number.isFinite(place.lon)||Math.abs(place.lon)>180)continue;
  const key=JSON.stringify([place.category,place.name.trim().toLocaleLowerCase()]),sameName=names.get(key)||[];
  if(ids.has(place.id)||sameName.some(p=>distanceKm(p.lat,p.lon,place.lat,place.lon)<.05))continue;
  result.push(place);ids.add(place.id);sameName.push(place);names.set(key,sameName);
  if(result.length>=1500)break;
 }
 return result;
}
export type SearchLocation={name:string;lat:number;lon:number};
export function searchLocations(data:unknown):SearchLocation[]{
 if(!Array.isArray(data))throw Error('Invalid search response');
 return data.flatMap(row=>{
  if(!row||typeof row!=='object'||typeof row.display_name!=='string'||!row.display_name.trim())return [];
  if(!['string','number'].includes(typeof row.lat)||!['string','number'].includes(typeof row.lon)||String(row.lat).trim()===''||String(row.lon).trim()==='')return [];
  const lat=Number(row.lat),lon=Number(row.lon);
  return Number.isFinite(lat)&&Math.abs(lat)<=90&&Number.isFinite(lon)&&Math.abs(lon)<=180?[{name:row.display_name.slice(0,500),lat,lon}]:[];
 }).slice(0,5);
}

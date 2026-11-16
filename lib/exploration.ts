import {samePlace,type Visit} from './adventures';
import type {Place} from './places';

/** Match both OSM and tile IDs without treating every neighbouring place as visited. */
export function visitedPlaceIds(places:Pick<Place,'id'|'name'|'lat'|'lon'>[],visits:Visit[]):Set<string>{
 const ids=new Set(visits.map(v=>v.id));
 const byName=new Map<string,Visit[]>();
 for(const visit of visits){const name=visit.name.trim().toLowerCase();byName.set(name,[...(byName.get(name)||[]),visit])}
 return new Set(places.filter(p=>ids.has(p.id)||(byName.get(p.name.trim().toLowerCase())||[]).some(v=>samePlace(v,p as Visit))).map(p=>p.id));
}
export type RevealPoint={id:string;x:number;y:number};
/** Cosmetic screen-space halos, not geographic coverage or verified travel. */
export function revealPoints(visits:Visit[],view:{width:number;height:number;longitude:number},project:(lon:number,lat:number)=>{x:number;y:number}):RevealPoint[]{
 const visible:RevealPoint[]=[];
 for(const visit of visits){
  const longitude=visit.lon+360*Math.round((view.longitude-visit.lon)/360);
  const point=project(longitude,visit.lat);
  if(Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=-72&&point.x<=view.width+72&&point.y>=-72&&point.y<=view.height+72)visible.push({id:visit.id,x:Math.round(point.x),y:Math.round(point.y)});
 }
 return visible.sort((a,b)=>Math.hypot(a.x-view.width/2,a.y-view.height/2)-Math.hypot(b.x-view.width/2,b.y-view.height/2)).slice(0,150);
}

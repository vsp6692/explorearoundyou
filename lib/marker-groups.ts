import type {Place} from './places';
export type MarkerGroup={anchor:Place;places:Place[];x:number;y:number};
// Keep screen-space anchors separated. A group opens a list, so co-located
// businesses remain selectable even when zooming cannot separate them.
export function groupMarkers(places:Place[],project:(p:Place)=>{x:number;y:number},width:number,height:number,gap=52):MarkerGroup[]{
 const groups:MarkerGroup[]=[];
 for(const p of places){
  const {x,y}=project(p);
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>width||y>height)continue;
  const near=groups.find(g=>Math.hypot(g.x-x,g.y-y)<gap);
  if(near)near.places.push(p);else groups.push({anchor:p,places:[p],x,y});
 }
 return groups;
}

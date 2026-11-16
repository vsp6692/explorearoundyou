'use client';
import {useEffect,useId,useState} from 'react';
import type {Map} from 'maplibre-gl';
import type {Visit} from '../lib/adventures';
import {revealPoints,type RevealPoint} from '../lib/exploration';

export default function ExplorationMist({map,visits}:{map:Map;visits:Visit[]}){
 const maskId=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const [view,setView]=useState<{width:number;height:number;points:RevealPoint[]}>({width:0,height:0,points:[]});
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;const element=map.getContainer();const next={width:element.clientWidth,height:element.clientHeight,points:revealPoints(visits,{width:element.clientWidth,height:element.clientHeight,longitude:map.getCenter().lng},(lon,lat)=>map.project([lon,lat]))};setView(old=>JSON.stringify(old)===JSON.stringify(next)?old:next)};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  schedule();map.on('move',schedule);map.on('resize',schedule);
  return()=>{cancelAnimationFrame(frame);map.off('move',schedule);map.off('resize',schedule)};
 },[map,visits]);
 if(!view.width||!view.height)return null;
 return <svg className="exploration-mist" viewBox={`0 0 ${view.width} ${view.height}`} aria-hidden="true" focusable="false"><defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={view.width} height={view.height} style={{maskType:'luminance'}}><rect width={view.width} height={view.height} fill="white"/>{view.points.map(p=><circle key={p.id} cx={p.x} cy={p.y} r="66" fill="black"/>)}</mask></defs><rect width={view.width} height={view.height} className="mist-wash" mask={`url(#${maskId})`}/></svg>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import {applyMapTheme} from '../lib/map-theme';
import {pixelIcon} from '../lib/pixel-icons';
import {mysteryIds,type Visit} from '../lib/adventures';
import {visitedPlaceIds} from '../lib/exploration';
import ExplorationMist from './ExplorationMist';
import {groupMarkers,nearestWorldLongitude} from '../lib/marker-groups';
import {mapPlaceFromFeature,normalizeLongitude,type Place} from '../lib/places';
function paintMarker(element:HTMLElement,category:string,pixel:boolean,mystery:boolean,fallback:string){
 element.replaceChildren();if(!pixel){element.textContent=fallback;return}
 const icon=document.createElement('img');icon.src=pixelIcon(category,mystery);icon.alt='';icon.width=24;icon.height=24;icon.setAttribute('aria-hidden','true');icon.className='pixel-sprite';icon.onerror=()=>{element.textContent=fallback};element.append(icon);
}
export type Destination={name:string;lat:number;lon:number};
export default function WorldMap({destination,onError,places,onSelect,onGroup,pixel,onVisiblePlaces,mystery,revealed,flat,dark,onViewportChange,mist,visits}:{destination:Destination;onError:(message:string)=>void;places:Place[];onSelect:(place:Place)=>void;onGroup:(places:Place[])=>void;pixel:boolean;mist:boolean;visits:Visit[];flat:boolean;dark:boolean;onViewportChange:(center:Destination)=>void;mystery:boolean;revealed:string[];onVisiblePlaces:(places:Place[])=>void}){
 const [attempt,setAttempt]=useState(0);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const settings=useRef({dark,flat,pixel});settings.current={dark,flat,pixel};
 const container=useRef<HTMLDivElement>(null); const map=useRef<maplibregl.Map|null>(null);const marker=useRef<maplibregl.Marker|null>(null);
 useEffect(()=>{if(!container.current)return;setStatus('loading');let instance:maplibregl.Map|null=null;let observer:ResizeObserver|null=null;const timer=setTimeout(()=>setStatus(current=>current==='ready'?current:'error'),20000);try{maplibregl.setWorkerUrl(new URL("/maplibre-gl-worker.mjs", window.location.origin).href);const m=new maplibregl.Map({container:container.current,style:process.env.NEXT_PUBLIC_MAP_STYLE||'https://tiles.openfreemap.org/styles/liberty',center:[80.2707,13.0827],zoom:15,pitch:settings.current.flat?0:30,bearing:0,maxPitch:60,attributionControl:{compact:true}});instance=m;map.current=m;m.dragRotate.disable();m.touchZoomRotate.disableRotation();m.touchPitch.disable();m.once('load',()=>{clearTimeout(timer);applyMapTheme(m,settings.current.dark,settings.current.pixel);for(const layer of m.getStyle().layers||[]){if(layer.type==='symbol'&&'source-layer' in layer&&layer['source-layer']==='poi'){/* Preserve source usage: visibility:none can stop POI-only tiles loading. */m.setPaintProperty(layer.id,'icon-opacity',0);m.setPaintProperty(layer.id,'text-opacity',0);m.setLayoutProperty(layer.id,'icon-ignore-placement',true);m.setLayoutProperty(layer.id,'text-ignore-placement',true)}}setStatus('ready')});m.on('moveend',()=>{const c=m.getCenter();onViewportChange({lat:c.lat,lon:normalizeLongitude(c.lng),name:'This map area'})});m.on('idle',()=>{const sources=[...new Set((m.getStyle().layers||[]).filter(l=>'source-layer' in l&&l['source-layer']==='poi').map(l=>'source' in l?String(l.source):''))].filter(Boolean);const features=sources.flatMap(source=>m.querySourceFeatures(source,{sourceLayer:'poi'})).filter(f=>f.geometry.type==='Point'&&m.getBounds().contains([nearestWorldLongitude(f.geometry.coordinates[0],m.getCenter().lng),f.geometry.coordinates[1]]));if(container.current){container.current.dataset.mapFeatures=String(m.queryRenderedFeatures().length);container.current.dataset.mapZoom=String(m.getZoom());container.current.dataset.poiFeatures=String(features.length)}const seen=new Set<string>();const visible:Place[]=[];for(const f of features){const place=mapPlaceFromFeature(f);if(!place||seen.has(place.id))continue;seen.add(place.id);visible.push(place)}onVisiblePlaces(visible)});observer=new ResizeObserver(()=>m.resize());observer.observe(container.current);m.addControl(new maplibregl.NavigationControl(),'bottom-right');m.on('error',(event)=>{if(container.current)container.current.dataset.mapError=event.error?.message||'Map data error';/* Individual tile failures need not block a usable basemap. The load timer handles fatal failures. */});}catch{clearTimeout(timer);setStatus('error');onError('Your browser could not start the map. Please enable WebGL or try another browser.')}return()=>{clearTimeout(timer);observer?.disconnect();marker.current?.remove();marker.current=null;instance?.remove();map.current=null}},[onError,attempt,onVisiblePlaces,onViewportChange]);
 useEffect(()=>{const m=map.current;if(m&&status==='ready')applyMapTheme(m,dark,pixel)},[dark,pixel,status]);
 useEffect(()=>{const m=map.current;if(!m||status!=='ready')return;m.easeTo({pitch:flat?0:30,bearing:0,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:650})},[flat,status]);
 useEffect(()=>{const m=map.current;if(!m)return;m.flyTo({center:[destination.lon,destination.lat],zoom:15,essential:false});marker.current?.remove();const el=document.createElement('div');el.className='destination-pin';el.textContent='✦';el.setAttribute('role','img');el.setAttribute('aria-label',destination.name);marker.current=new maplibregl.Marker({element:el}).setLngLat([destination.lon,destination.lat]).addTo(m)},[destination,attempt]);
 useEffect(()=>{const element=marker.current?.getElement();if(element)paintMarker(element,'Everything',pixel,false,'✦')},[pixel,destination,attempt]);
 useEffect(()=>{
  const m=map.current;if(!m||status!=='ready')return;
  const icons:Record<string,string>={Food:'🍜',Stays:'🛏️',Beaches:'🏖️',Parks:'🌳',Attractions:'🎡',Shopping:'🛍️',Fun:'🎨'};
  const visited=visitedPlaceIds(places,visits);
  const hidden=new Set(mystery?mysteryIds(places.filter(p=>!visited.has(p.id))).filter(id=>!revealed.includes(id)):[]);
  let pins:maplibregl.Marker[]=[];
  const render=()=>{
   pins.forEach(pin=>pin.remove());
   const groups=groupMarkers(places,p=>m.project([nearestWorldLongitude(p.lon,m.getCenter().lng),p.lat]),m.getContainer().clientWidth,m.getContainer().clientHeight);
   pins=groups.map(group=>{
    const p=group.anchor,multiple=group.places.length>1,el=document.createElement('button');
    el.className='place-pin nature-pin '+(pixel?'pixel-pin ':'')+(multiple?'group-pin':'');
    paintMarker(el,p.category,pixel,!multiple&&hidden.has(p.id),multiple?String(group.places.length):hidden.has(p.id)?'?':icons[p.category]||'✦');
    if(multiple)el.textContent=String(group.places.length);
    if(!multiple&&hidden.has(p.id))el.classList.add('mystery-pin');
    if(!multiple&&visited.has(p.id))el.classList.add('visited-pin');else if(mist)el.classList.add('unvisited-pin');
    const label=multiple?`Browse ${group.places.length} nearby places`:hidden.has(p.id)?`Reveal a mystery ${p.category.toLowerCase()} place`:`${p.name}${visited.has(p.id)?' — marked visited':''}`;
    el.setAttribute('aria-label',label);el.title=label;el.onclick=()=>multiple?onGroup(group.places):onSelect(p);
    return new maplibregl.Marker({element:el}).setLngLat([nearestWorldLongitude(p.lon,m.getCenter().lng),p.lat]).addTo(m);
   });
  };
  render();m.on('moveend',render);m.on('resize',render);
  return()=>{m.off('moveend',render);m.off('resize',render);pins.forEach(pin=>pin.remove())};
 },[places,onSelect,onGroup,pixel,status,attempt,mystery,revealed,mist,visits]);

 return <><div ref={container} className="map" data-map-status={status} aria-label="Interactive world map"/>{mist&&status==='ready'&&map.current&&<ExplorationMist key={attempt} map={map.current} visits={visits}/>}{status!=='ready'&&<div className="map-status" role="status"><strong>{status==='loading'?'Unfolding your world…':'The map hasn’t loaded'}</strong><span>{status==='loading'?'Loading map tiles. You can still search for a city.':'Check your internet connection, then retry. Search and saved places remain available.'}</span>{status==='error'&&<button onClick={()=>setAttempt(n=>n+1)}>Retry map</button>}</div>}</>;
}

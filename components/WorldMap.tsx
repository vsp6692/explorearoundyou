'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import {applyMapTheme} from '../lib/map-theme';
import {prepareMapStyle} from '../lib/prepare-map-style';
import {pixelIcon} from '../lib/pixel-icons';
import {mysteryIds,type Visit} from '../lib/adventures';
import {visitedPlaceIds} from '../lib/exploration';
import {groupMarkers,nearestWorldLongitude} from '../lib/marker-groups';
import {mapPlaceFromFeature,normalizeLongitude,type Place} from '../lib/places';
import type {CommonsPhoto} from '../lib/photos';
import ExplorationMist from './ExplorationMist';
export type Destination={name:string;lat:number;lon:number};
type Props={destination:Destination;onError:(message:string)=>void;places:Place[];photos:Record<string,CommonsPhoto>;onSelect:(place:Place)=>void;onGroup:(places:Place[])=>void;pixel:boolean;mist:boolean;visits:Visit[];flat:boolean;dark:boolean;onViewportChange:(center:Destination)=>void;mystery:boolean;revealed:string[];onVisiblePlaces:(places:Place[])=>void;selectedId?:string;selectedPlace?:Place|null;itinerary?:Place[];itineraryVersion?:number};
const NO_STOPS:Place[]=[];
const glyphs:Record<string,string>={Food:'🍜',Stays:'🛏️',Beaches:'🏖️',Parks:'🌳',Attractions:'✦',Shopping:'🛍️',Fun:'🎨'};
function paint(element:HTMLElement,category:string,pixel:boolean,mystery:boolean,text:string){
 element.replaceChildren();if(!pixel){element.textContent=text;return}
 const image=document.createElement('img');image.src=pixelIcon(category,mystery);image.alt='';image.width=24;image.height=24;image.className='pixel-sprite';image.onerror=()=>{element.textContent=text};element.append(image);
}
export default function WorldMap({destination,onError,places,photos,onSelect,onGroup,pixel,onVisiblePlaces,mystery,revealed,flat,dark,onViewportChange,mist,visits,selectedId,selectedPlace,itinerary=NO_STOPS,itineraryVersion=0}:Props){
 const [attempt,setAttempt]=useState(0),[status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const container=useRef<HTMLDivElement>(null),map=useRef<maplibregl.Map|null>(null),destinationPin=useRef<maplibregl.Marker|null>(null);
 const settings=useRef({dark,flat,pixel});settings.current={dark,flat,pixel};
 const callbacks=useRef({onSelect,onGroup});callbacks.current={onSelect,onGroup};
 const pins=useRef(new Map<string,{marker:maplibregl.Marker;element:HTMLButtonElement;signature:string}>());
 useEffect(()=>{
  if(!container.current)return;
  setStatus('loading');let instance:maplibregl.Map|undefined,observer:ResizeObserver|undefined;
  const timer=setTimeout(()=>setStatus(s=>s==='ready'?s:'error'),20000);
  try{
   maplibregl.setWorkerUrl(new URL('/maplibre-gl-worker.mjs',location.origin).href);
   const m=new maplibregl.Map({container:container.current,style:process.env.NEXT_PUBLIC_MAP_STYLE||'https://tiles.openfreemap.org/styles/liberty',transformStyle:(_previous,next)=>prepareMapStyle(next),center:[80.2707,13.0827],zoom:15,pitch:settings.current.flat?0:30,bearing:0,maxPitch:60,attributionControl:{compact:true}});
   instance=m;map.current=m;m.dragRotate.disable();m.touchZoomRotate.disableRotation();m.touchPitch.disable();
   m.once('load',()=>{
    clearTimeout(timer);applyMapTheme(m,settings.current.dark,settings.current.pixel);
    setStatus('ready');
   });
   m.on('moveend',()=>{const c=m.getCenter();onViewportChange({lat:c.lat,lon:normalizeLongitude(c.lng),name:'This map area'})});
   m.on('idle',()=>{
    const sources=[...new Set((m.getStyle().layers||[]).filter(l=>'source-layer' in l&&l['source-layer']==='poi').map(l=>'source' in l?String(l.source):''))].filter(Boolean);
    const features=sources.flatMap(source=>m.querySourceFeatures(source,{sourceLayer:'poi'})).filter(f=>f.geometry.type==='Point'&&m.getBounds().contains([nearestWorldLongitude(f.geometry.coordinates[0],m.getCenter().lng),f.geometry.coordinates[1]]));
    if(container.current){container.current.dataset.mapFeatures=String(m.queryRenderedFeatures().length);container.current.dataset.mapZoom=String(m.getZoom());container.current.dataset.poiFeatures=String(features.length)}
    const seen=new Set<string>(),visible:Place[]=[];for(const feature of features){const place=mapPlaceFromFeature(feature);if(place&&!seen.has(place.id)){seen.add(place.id);visible.push(place)}}onVisiblePlaces(visible);
   });
   observer=new ResizeObserver(entries=>{if(entries[0]?.contentRect.width>0&&entries[0]?.contentRect.height>0)m.resize()});observer.observe(container.current);
   m.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
   m.on('error',event=>{if(container.current)container.current.dataset.mapError=event.error?.message||'Map data error'});
  }catch{clearTimeout(timer);setStatus('error');onError('The map could not start. Search and saved places are still available.')}
  return()=>{clearTimeout(timer);observer?.disconnect();for(const entry of pins.current.values())entry.marker.remove();pins.current.clear();destinationPin.current?.remove();destinationPin.current=null;instance?.remove();map.current=null};
 },[attempt,onError,onVisiblePlaces,onViewportChange]);
 useEffect(()=>{if(map.current&&status==='ready')applyMapTheme(map.current,dark,pixel)},[dark,pixel,status]);
 useEffect(()=>{map.current?.easeTo({pitch:flat?0:30,bearing:0,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:450})},[flat,status]);
 useEffect(()=>{
  const m=map.current;if(!m)return;
  m.flyTo({center:[destination.lon,destination.lat],zoom:15,essential:false});destinationPin.current?.remove();
  const el=document.createElement('div');el.className='destination-pin';el.textContent='✦';el.setAttribute('aria-label',destination.name);
  destinationPin.current=new maplibregl.Marker({element:el}).setLngLat([destination.lon,destination.lat]).addTo(m);
 },[destination,attempt]);
 useEffect(()=>{
  const m=map.current;if(!m||status!=='ready'||!itinerary.length)return;
  const bounds=new maplibregl.LngLatBounds();for(const place of itinerary)bounds.extend([nearestWorldLongitude(place.lon,itinerary[0].lon),place.lat]);
  const width=m.getContainer().clientWidth,height=m.getContainer().clientHeight;
  m.fitBounds(bounds,{padding:{top:Math.min(40,height*.1),right:Math.min(65,width*.12),bottom:Math.min(170,height*.4),left:Math.min(45,width*.12)},maxZoom:15,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:550});
 },[itineraryVersion,status]);
 useEffect(()=>{
  const m=map.current;if(!m||status!=='ready')return;
  const candidates=[...places];if(selectedPlace&&!candidates.some(p=>p.id===selectedPlace.id))candidates.push(selectedPlace);for(const p of itinerary)if(!candidates.some(item=>item.id===p.id))candidates.push(p);
  const visited=visitedPlaceIds(candidates,visits),hidden=new Set(mystery?mysteryIds(candidates.filter(p=>!visited.has(p.id))).filter(id=>!revealed.includes(id)):[]);
  function render(){
   const sorted=[...candidates].sort((a,b)=>Number(b.id===selectedId)-Number(a.id===selectedId)||Number(!!photos[b.id])-Number(!!photos[a.id]));
   const stopIds=new Set(itinerary.map(p=>p.id));
   const groups=[...itinerary.map(p=>({anchor:p,places:[p]})),...groupMarkers(sorted.filter(p=>!stopIds.has(p.id)),p=>m!.project([nearestWorldLongitude(p.lon,m!.getCenter().lng),p.lat]),m!.getContainer().clientWidth,m!.getContainer().clientHeight,Object.keys(photos).length?78:52)];
   const keep=new Set<string>();
   for(const group of groups){
    const p=group.anchor,key=p.id,multiple=group.places.length>1,secret=hidden.has(p.id),photo=!secret?photos[p.id]:undefined,direct=!!photo||!multiple||p.id===selectedId;
    keep.add(key);let entry=pins.current.get(key);
    if(!entry){const element=document.createElement('button');element.type='button';entry={element,marker:new maplibregl.Marker({element}).setLngLat([p.lon,p.lat]).addTo(m!),signature:''};pins.current.set(key,entry)}
    const {element}=entry,selected=p.id===selectedId,stop=itinerary.findIndex(item=>item.id===p.id);
    const signature=JSON.stringify([p.name,p.category,pixel,secret,photo?.src,photo?.author,group.places.length,visited.has(p.id),mist,selected,stop]);
    if(signature!==entry.signature){
     const mapClasses=[...element.classList].filter(name=>name.startsWith('maplibregl-')).join(' ');
     element.className=`${mapClasses} place-pin nature-pin category-${p.category.toLowerCase()} ${pixel?'pixel-pin':''} ${selected?'selected-pin':''}`;
     paint(element,p.category,pixel,secret,multiple&&!direct?String(group.places.length):secret?'?':glyphs[p.category]||'✦');
     if(multiple&&!direct)element.classList.add('group-pin');
     if(photo){element.replaceChildren();element.classList.add('photo-map-pin');const image=document.createElement('img');image.src=photo.src;image.alt='';image.referrerPolicy='no-referrer';image.onerror=()=>{element.classList.remove('photo-map-pin');paint(element,p.category,pixel,false,glyphs[p.category]||'✦')};const label=document.createElement('span');label.textContent=p.name;element.append(image,label)}
     if(secret)element.classList.add('mystery-pin');if(visited.has(p.id))element.classList.add('visited-pin');else if(mist)element.classList.add('unvisited-pin');
     if(stop>=0){const number=document.createElement('b');number.className='itinerary-pin-number';number.textContent=String(stop+1);element.append(number)}
     element.setAttribute('aria-label',secret?`Reveal a mystery place`:direct?p.name:`Browse ${group.places.length} nearby places`);element.setAttribute('aria-pressed',String(selected));element.title=photo?`${p.name} · ${photo.author}, ${photo.license}`:p.name;entry.signature=signature;
    }
    element.onclick=()=>direct?callbacks.current.onSelect(p):callbacks.current.onGroup(group.places);
    entry.marker.setLngLat([nearestWorldLongitude(p.lon,m!.getCenter().lng),p.lat]);
   }
   for(const [key,entry] of pins.current)if(!keep.has(key)){if(document.activeElement===entry.element)m!.getCanvas().focus({preventScroll:true});entry.marker.remove();pins.current.delete(key)}
  }
  render();m.on('moveend',render);m.on('resize',render);return()=>{m.off('moveend',render);m.off('resize',render)};
 },[places,photos,selectedId,selectedPlace,pixel,status,attempt,mystery,revealed,mist,visits,itinerary]);
 return <><div ref={container} className="map" data-map-status={status} aria-label="Interactive world map"/>{mist&&status==='ready'&&map.current&&<ExplorationMist key={attempt} map={map.current} visits={visits}/>} {status!=='ready'&&<div className="map-status" role="status"><strong>{status==='loading'?'Opening your world…':'The map hasn’t loaded'}</strong><span>{status==='loading'?'Nearby places are still available below.':'You can still browse discoveries, search or open saved places.'}</span>{status==='error'&&<button onClick={()=>setAttempt(n=>n+1)}>Retry map</button>}</div>}</>;
}

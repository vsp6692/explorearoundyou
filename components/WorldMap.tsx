'use client';
import {useEffect,useRef} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Place} from '../lib/places';
export type Destination={name:string;lat:number;lon:number};
export default function WorldMap({destination,onError,places,onSelect,pixel}:{destination:Destination;onError:(message:string)=>void;places:Place[];onSelect:(place:Place)=>void;pixel:boolean}){
 const container=useRef<HTMLDivElement>(null); const map=useRef<maplibregl.Map|null>(null);const marker=useRef<maplibregl.Marker|null>(null);
 useEffect(()=>{if(!container.current)return;try{maplibregl.setWorkerUrl(new URL("/maplibre-gl-worker.mjs", window.location.origin).href);const m=new maplibregl.Map({container:container.current,style:process.env.NEXT_PUBLIC_MAP_STYLE||'https://tiles.openfreemap.org/styles/liberty',center:[80.2707,13.0827],zoom:12,attributionControl:{compact:true}});map.current=m;m.addControl(new maplibregl.NavigationControl(),'bottom-right');m.on('error',()=>onError('The map could not load some data. Check your connection and try again.'));return()=>{m.remove();map.current=null}}catch{onError('Your browser could not start the map. Please enable WebGL or try another browser.')}},[onError]);
 useEffect(()=>{const m=map.current;if(!m)return;m.flyTo({center:[destination.lon,destination.lat],zoom:13,essential:false});marker.current?.remove();const el=document.createElement('div');el.className='destination-pin';el.textContent='✦';el.setAttribute('aria-label',destination.name);marker.current=new maplibregl.Marker({element:el}).setLngLat([destination.lon,destination.lat]).addTo(m)},[destination]);
 useEffect(()=>{const m=map.current;if(!m)return;const icons:Record<string,string>={Food:'🍜',Stays:'🛏️',Beaches:'🏖️',Parks:'🌳',Attractions:'🎡',Shopping:'🛍️',Fun:'🎨'};const pins=places.map(p=>{const el=document.createElement('button');el.className='place-pin '+(pixel?'pixel-pin':'');el.textContent=icons[p.category]||'✦';el.setAttribute('aria-label',p.name);el.title=p.name;el.onclick=()=>onSelect(p);return new maplibregl.Marker({element:el}).setLngLat([p.lon,p.lat]).addTo(m)});return()=>pins.forEach(p=>p.remove())},[places,onSelect,pixel]);
 return <div ref={container} className="map" aria-label="Interactive world map"/>;
}

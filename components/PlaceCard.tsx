'use client';
import {useEffect,useState} from 'react';
import {distanceKm,type Place} from '../lib/places';
import {loadPlaceDetails} from '../lib/place-details';
import {cuisineNames} from '../lib/cuisines';
import {safeWebsite} from '../lib/search-intent';
import PlacePhoto from './PlacePhoto';
import SharePlace from './SharePlace';
export default function PlaceCard({place,center,surprise,saved,visited,onClose,onSave,onVisit}:{place:Place;center:{lat:number;lon:number};surprise:boolean;saved:boolean;visited:boolean;onClose:()=>void;onSave:(place:Place)=>void;onVisit:(place:Place)=>void}){
 const [detail,setDetail]=useState(place),[status,setStatus]=useState('Finding mapped details…'),[retry,setRetry]=useState(0),[busy,setBusy]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  const timer=setTimeout(()=>controller.abort(),14000);
  setBusy(true);setStatus('Finding mapped details…');
  void loadPlaceDetails(place,controller.signal,retry>0).then(value=>{if(active){setDetail(value);setStatus('')}}).catch(()=>{if(active)setStatus('Extra details are unavailable right now. You can still save this place or get directions.')}).finally(()=>{clearTimeout(timer);if(active)setBusy(false)});
  return()=>{active=false;clearTimeout(timer);controller.abort()};
 },[place.id,place.lat,place.lon,retry]);
 const source=detail.osmRef||detail.id;
 const osm=/^(node|way|relation)\/\d+$/.test(source)?`https://www.openstreetmap.org/${source}`:`https://www.openstreetmap.org/?mlat=${detail.lat}&mlon=${detail.lon}#map=17/${detail.lat}/${detail.lon}`;
 return <aside className={`place-card detail-card ${surprise?'treasure-reveal':''}`} aria-label={`About ${detail.name}`}>
  <button className="close-card" aria-label="Close place" onClick={onClose}>×</button>
  <div className="eyebrow">{surprise?'🎁 YOUR SURPRISE':'A LITTLE DISCOVERY'}</div>
  <h2>{detail.name}</h2>
  <p className="place-subtitle">{detail.kind} · {distanceKm(center.lat,center.lon,detail.lat,detail.lon).toFixed(1)} km away</p>
  <PlacePhoto key={detail.photoTitle||'no-photo'} title={detail.photoTitle} name={detail.name}/>
  <div className="place-actions"><button onClick={()=>onSave(detail)}>{saved?'♥ Saved':'♡ Save place'}</button><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${detail.lat},${detail.lon}`}>Directions ↗</a></div>
  <h3>About this place</h3>
  <p>{detail.description||`Listed as ${detail.kind} on the map. A description hasn’t been added to the available data.`}</p>
  {detail.descriptionSource&&<a className="osm-link" href={detail.descriptionSource} target="_blank" rel="noreferrer">Description from Wikidata ↗</a>}
  {detail.address&&<p>📍 {detail.address}</p>}
  {detail.category==='Food'&&<p><strong>Cuisine</strong><br/>{detail.cuisine?cuisineNames(detail.cuisine).join(' · '):'Not listed by the map contributor.'}</p>}
  {detail.openingHours&&<p><strong>Mapped hours</strong><br/>{detail.openingHours}<br/><small>Confirm with the venue before visiting.</small></p>}
  {safeWebsite(detail.website)&&<a className="venue-website" href={safeWebsite(detail.website)} target="_blank" rel="noreferrer">Visit official website ↗</a>}
  {status&&<div className="detail-status" role="status"><p>{status}</p>{!busy&&<button onClick={()=>setRetry(n=>n+1)}>Retry details</button>}</div>}
  {!busy&&!status&&(!detail.description||!detail.photoTitle)&&<button className="refresh-details" onClick={()=>setRetry(n=>n+1)}>Check for more details</button>}
  <SharePlace place={detail}/>
  <button className="visit-button" aria-pressed={visited} onClick={()=>onVisit(detail)}>{visited?'✓ Marked visited · Undo':'👣 I visited this place'}</button>
  <p className="data-note">{detail.kind==='shared location'?'Shared name and location supplied by the sender.':'Community-contributed information may be incomplete or outdated.'} Prices and opening status are not verified.</p>
  <a className="osm-link" href={osm} target="_blank" rel="noreferrer">View OpenStreetMap details ↗</a>
 </aside>;
}

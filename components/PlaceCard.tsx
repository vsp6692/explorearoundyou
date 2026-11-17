'use client';
import {useEffect,useState} from 'react';
import {distanceKm,type Place} from '../lib/places';
import {loadPlaceDetails} from '../lib/place-details';
import {cuisineNames} from '../lib/cuisines';
import {placeSource,placeWebsite} from '../lib/place-sources';
import type {CommonsPhoto} from '../lib/photos';
import PlacePhoto from './PlacePhoto';
import SharePlace from './SharePlace';
import AppIcon from './AppIcon';
import {Button,IconButton} from './ui';
type Props={place:Place;center:{lat:number;lon:number};surprise:boolean;saved:boolean;visited:boolean;onClose:()=>void;onSave:(place:Place)=>void;onVisit:(place:Place)=>void;onAddToTrip?:(place:Place)=>void;photo?:CommonsPhoto;onPhoto?:(photo:CommonsPhoto)=>void;onExpand?:(expanded:boolean)=>void;distanceLabel?:string;reason?:string};
export default function PlaceCard({place,center,surprise,saved,visited,onClose,onSave,onVisit,onAddToTrip,photo,onPhoto,onExpand,distanceLabel='from map area',reason}:Props){
 const [detail,setDetail]=useState(place),[status,setStatus]=useState('Finding mapped details…'),[retry,setRetry]=useState(0),[busy,setBusy]=useState(true),[expanded,setExpanded]=useState(false),[previewPhoto,setPreviewPhoto]=useState(photo);
 useEffect(()=>{if(photo)setPreviewPhoto(photo)},[photo]);
 useEffect(()=>{
  const controller=new AbortController();let active=true;const timer=setTimeout(()=>controller.abort(),14000);setBusy(true);setStatus('Finding mapped details…');
  void loadPlaceDetails(place,controller.signal,retry>0).then(value=>{if(active){setDetail(value);setStatus('')}}).catch(()=>{if(active)setStatus('Extra details are unavailable. Save and directions still work.')}).finally(()=>{clearTimeout(timer);if(active)setBusy(false)});
  return()=>{active=false;clearTimeout(timer);controller.abort()};
 },[place.id,place.lat,place.lon,retry]);
 function toggle(){const next=!expanded;setExpanded(next);onExpand?.(next)}
 const website=placeWebsite(detail.website),descriptionSource=placeSource(detail.descriptionSource);
 const source=detail.osmRef||detail.id,osm=/^(node|way|relation)\/\d+$/.test(source)?`https://www.openstreetmap.org/${source}`:`https://www.openstreetmap.org/?mlat=${detail.lat}&mlon=${detail.lon}#map=17/${detail.lat}/${detail.lon}`;
 return <aside className={`place-card detail-card ${expanded?'is-expanded':''} ${surprise?'treasure-reveal':''}`} aria-label={`About ${detail.name}`}>
  <div className="place-summary"><div className="preview-thumbnail">{previewPhoto?<img src={previewPhoto.src} alt={detail.name} width={72} height={72} referrerPolicy="no-referrer" onError={()=>setPreviewPhoto(undefined)}/>:<AppIcon name={detail.category==='Food'?'food':detail.category==='Stays'?'stay':'pin'} size={28}/>}</div><div className="place-summary-copy">{surprise&&<span className="surprise-label">Your little surprise</span>}<h2>{detail.name}</h2><p>{detail.category} · {distanceKm(center.lat,center.lon,detail.lat,detail.lon).toFixed(1)} km {distanceLabel}</p></div><IconButton icon="close" label="Close place" className="close-card" onClick={onClose}/></div>
  <div className="preview-actions"><Button onClick={()=>onSave(detail)} aria-pressed={saved}><AppIcon name="bookmark" size={18}/>{saved?'Saved':'Save'}</Button><a className="ui-button ui-button-primary" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${detail.lat},${detail.lon}`}>Directions <AppIcon name="arrow" size={17}/></a><Button variant="quiet" className="expand-place" onClick={toggle} aria-expanded={expanded}>{expanded?'Less':surprise?'Explore':'Details'}<AppIcon name={expanded?'close':'plus'} size={17}/></Button></div>
  <div className="detail-more">
   <PlacePhoto key={detail.photoTitle||'no-photo'} title={detail.photoTitle} name={detail.name} initialPhoto={previewPhoto} onPhoto={value=>{setPreviewPhoto(value);onPhoto?.(value)}}/>
   {reason&&<p className="surprise-reason"><AppIcon name="sparkles" size={17}/>{reason}</p>}
   <h3>About this place</h3><p>{detail.description||`Mapped as ${detail.kind}. A description hasn’t been added yet.`}</p>
   {descriptionSource&&<a className="source-link" href={descriptionSource} target="_blank" rel="noreferrer">Description source ↗</a>}
   {detail.address&&<p className="place-fact"><AppIcon name="pin" size={18}/>{detail.address}</p>}
   {detail.category==='Food'&&<p><strong>Cuisine</strong><br/>{detail.cuisine?cuisineNames(detail.cuisine).join(' · '):'Not listed in the available data.'}</p>}
   {detail.openingHours&&<p><strong>Mapped hours</strong><br/>{detail.openingHours}<br/><small>Confirm with the venue before visiting.</small></p>}
   {website&&website.url!==descriptionSource&&<a className="venue-website source-link" href={website.url} target="_blank" rel="noreferrer">{website.label} ↗</a>}
   {onAddToTrip&&<Button className="add-trip-button" onClick={()=>onAddToTrip(detail)}><AppIcon name="plus" size={18}/> Add to My Trips</Button>}
   {status&&<div className="detail-status" role="status"><p>{status}</p>{!busy&&<Button variant="quiet" onClick={()=>setRetry(n=>n+1)}>Retry details</Button>}</div>}
   {!busy&&!status&&(!detail.description||!detail.photoTitle)&&<Button variant="quiet" onClick={()=>setRetry(n=>n+1)}>Check for more details</Button>}
   <SharePlace place={detail}/><Button className="visit-button" aria-pressed={visited} onClick={()=>onVisit(detail)}><AppIcon name="check" size={18}/>{visited?'Marked visited · Undo':'I visited this place'}</Button>
   <p className="data-note">{detail.kind==='shared location'?'Name and category supplied by the sender.':'Community information may be incomplete or outdated.'} Prices and opening status are not verified.</p><a className="source-link" href={osm} target="_blank" rel="noreferrer">OpenStreetMap details ↗</a>
  </div>
  {!expanded&&previewPhoto&&<a className="preview-photo-credit" href={previewPhoto.page} target="_blank" rel="noreferrer">Photo: {previewPhoto.author} · {previewPhoto.license}</a>}
 </aside>;
}

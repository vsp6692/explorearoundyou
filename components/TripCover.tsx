'use client';
import {appPath} from '../lib/app-path';
import {useEffect,useRef,useState} from 'react';
import type {Trip} from '../lib/trips';
import {commonsTitle,loadCommonsPhoto,type CommonsPhoto} from '../lib/photos';
import credits from '../public/images/credits.json';

/** Only photos explicitly linked to a stop can replace the labelled inspiration cover. */
export default function TripCover({trip,onOpen,label='Open trip'}:{trip:Pick<Trip,'places'|'cover'>;onOpen?:()=>void;label?:string}){
 const container=useRef<HTMLDivElement>(null);
 const stop=trip.places.find(place=>commonsTitle(place.photoTitle));
 const title=commonsTitle(stop?.photoTitle);
 const [loaded,setLoaded]=useState<{title:string;photo:CommonsPhoto}|null>(null);
 const photo=loaded && title && loaded.title===title?loaded.photo:null;
 useEffect(()=>{
  setLoaded(null);if(!title||!container.current)return;
  const controller=new AbortController();let active=true,started=false;let timer:ReturnType<typeof setTimeout>|undefined;
  const load=()=>{if(started)return;started=true;timer=setTimeout(()=>controller.abort(),12000);void loadCommonsPhoto(title,controller.signal).then(value=>{if(active)setLoaded({title,photo:value})}).catch(()=>{}).finally(()=>clearTimeout(timer))};
  const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer?.disconnect();load()}},{rootMargin:'120px'}):null;
  if(observer)observer.observe(container.current);else load();
  return()=>{active=false;observer?.disconnect();clearTimeout(timer);controller.abort()};
 },[title]);
 const credit=credits.find(item=>item.id===trip.cover)||credits[0];
 const image=<img src={photo?.src||appPath(credit.file)} alt={photo&&stop?stop.name:'Decorative travel inspiration'} width={640} height={360} loading="lazy" referrerPolicy="no-referrer" onError={()=>{if(photo)setLoaded(null)}}/>;
 return <div ref={container} className="trip-cover-media"><div className="trip-cover-visual">{onOpen?<button className="trip-cover-open" aria-label={label} onClick={onOpen}>{image}</button>:image}<span className="trip-cover-caption">{photo&&stop?`Photo of ${stop.name}`:'Inspiration cover'}</span></div><p className="trip-cover-credit">{photo?<><a href={photo.page} target="_blank" rel="noreferrer">{photo.title}</a> · {photo.author}. {photo.credit} <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></>:<><a href={credit.source} target="_blank" rel="noreferrer">{credit.title}</a> · {credit.author} · <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a></>} · Cropped.</p></div>;
}

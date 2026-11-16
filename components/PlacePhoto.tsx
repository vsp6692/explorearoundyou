'use client';
import {useEffect,useState} from 'react';
import {commonsTitle,loadCommonsPhoto,type CommonsPhoto} from '../lib/photos';
export default function PlacePhoto({title,name}:{title?:string;name:string}){
 const [photo,setPhoto]=useState<CommonsPhoto|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{
  setPhoto(null);setError('');if(!commonsTitle(title))return;
  const controller=new AbortController();let active=true;const timer=setTimeout(()=>controller.abort(),12000);setBusy(true);
  void loadCommonsPhoto(title!,controller.signal).then(result=>{if(active)setPhoto(result)}).catch(()=>{if(active)setError('This photo is unavailable. Try again in a moment.')}).finally(()=>{clearTimeout(timer);if(active)setBusy(false)});
  return()=>{active=false;clearTimeout(timer);controller.abort()};
 },[title,retry]);
 return <div className="place-photo">{photo?<figure><img src={photo.src} alt={`Community-mapped photo for ${name}`} width={640} height={420} loading="lazy" referrerPolicy="no-referrer" onError={()=>{setPhoto(null);setError('The image could not load. Please retry.')}}/><figcaption><a href={photo.page} target="_blank" rel="noreferrer">{photo.title}</a> · {photo.author}. {photo.credit} <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> · Wikimedia Commons. Displayed at reduced size.</figcaption></figure>:<div className="photo-placeholder"><span aria-hidden="true">🖼️</span><p role="status">{busy?'Loading the place photo…':error||'No licensed place photo is available yet.'}</p>{error&&<button onClick={()=>setRetry(n=>n+1)}>Retry photo</button>}</div>}</div>;
}

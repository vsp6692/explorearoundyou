'use client';
import {useEffect,useRef,useState} from 'react';
import {commonsTitle,loadCommonsPhoto,type CommonsPhoto} from '../lib/photos';
export default function PlacePhoto({title,name}:{title?:string;name:string}){
 const [photo,setPhoto]=useState<CommonsPhoto|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef<AbortController|null>(null);
 useEffect(()=>()=>{request.current?.abort();request.current=null},[]);
 async function load(){if(!title||busy)return;const controller=new AbortController();request.current=controller;const timer=setTimeout(()=>controller.abort(),12000);setBusy(true);setError('');try{const result=await loadCommonsPhoto(title,controller.signal);if(request.current===controller)setPhoto(result)}catch(err){if(request.current===controller)setError(controller.signal.aborted?'Photo request timed out. You can retry.':err instanceof Error?err.message:'Photo unavailable.')}finally{clearTimeout(timer);if(request.current===controller)setBusy(false)}}
 if(!commonsTitle(title))return <p className="data-note">No supported Wikimedia photo is mapped for this place.</p>;
 return <div className="place-photo">{photo?<figure><img src={photo.src} alt={`Community-mapped photo for ${name}`} width={640} height={420} loading="lazy" referrerPolicy="no-referrer" onError={()=>{setPhoto(null);setError('The image could not load. Please retry.')}}/><figcaption><a href={photo.page} target="_blank" rel="noreferrer">{photo.title}</a> · {photo.author}. {photo.credit} <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a> · Wikimedia Commons. Displayed at reduced size.</figcaption></figure>:<><button disabled={busy} onClick={load}>{busy?'Loading photo…':'Load mapped photo'}</button><p className="data-note">Loads from Wikimedia Commons when you tap. The OSM photo association may be outdated.</p></>}{error&&<p role="status">{error}</p>}</div>;
}

'use client';
import {useEffect,useRef,useState} from 'react';
import PlacePhoto from './PlacePhoto';
import {Skeleton} from './ui';
export default function DeferredPlacePhoto({title,name}:{title?:string;name:string}){
 const container=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{if(!container.current)return;if(typeof IntersectionObserver==='undefined'){setVisible(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'160px'});observer.observe(container.current);return()=>observer.disconnect()},[]);
 return <div ref={container}>{visible?<PlacePhoto title={title} name={name}/>:<Skeleton className="saved-photo-wait"/>}</div>;
}

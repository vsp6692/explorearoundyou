'use client';
import {useState} from 'react';
import AppIcon from './AppIcon';
import {IconButton,Skeleton} from './ui';
import {samePlace} from '../lib/adventures';
import type {Place} from '../lib/places';
import type {CommonsPhoto} from '../lib/photos';
type Props={places:Place[];photos:Record<string,CommonsPhoto>;busy:boolean;category:string;onSelect:(p:Place)=>void;onBrowse:()=>void;onClear:()=>void;resetLabel?:string;expanded?:boolean;saved?:Place[];onSave?:(p:Place)=>void;distanceLabel?:string};
export default function DiscoveryCards({places,photos,busy,category,onSelect,onBrowse,onClear,resetLabel='Show all places',expanded=false,saved=[],onSave,distanceLabel='from map area'}:Props){
 const [failed,setFailed]=useState<Record<string,string>>({});
 // The caller owns relevance ordering. Photo availability never overrides interests.
 const shown=places.slice(0,expanded?180:12);
 return <section className={`discovery-cards ${expanded?'discovery-cards-expanded':''}`} aria-label="Places to explore">
  <div className="discovery-cards-heading"><div><span className="overline">A LITTLE LOOK AROUND</span><h2>{category==='Everything'?'Pick your next little adventure':`${category} around you`}</h2></div><button onClick={onBrowse}>See all <AppIcon name="arrow" size={17}/></button></div>
  <div className="discovery-card-track">{shown.map(p=>{
   const photo=photos[p.id],hasPhoto=photo&&failed[p.id]!==photo.src,isSaved=saved.some(s=>samePlace(s,p));
   const categoryLabel=p.kind==='area overview'?'Area overview':p.id.startsWith('wiki:')?'Landmark':p.category;
   return <article key={p.id} className={`discovery-photo-card ${hasPhoto?'has-photo':'no-photo'}`}>
    <button className="discovery-card-select" onClick={()=>onSelect(p)} aria-label={`Explore ${p.name}`}>
     <div className="discovery-card-image">{hasPhoto?<img src={photo.src} alt={p.name} width={320} height={200} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(old=>({...old,[p.id]:photo.src}))}/>:<div className={`discovery-card-placeholder category-${p.category.toLowerCase()}`}><AppIcon name={p.category==='Food'?'food':p.category==='Stays'?'stay':p.category==='Beaches'?'beach':p.category==='Parks'?'nature':'pin'} size={28}/><span>Photo unavailable</span></div>}</div>
     <div className="discovery-card-copy"><h3>{p.name}</h3><span>{categoryLabel} · {p.distance<1?`${Math.round(p.distance*1000)} m`:`${p.distance.toFixed(1)} km`}</span><small className="discovery-distance-note">{distanceLabel}</small>{p.description&&<p className="discovery-description">{p.description}</p>}</div>
    </button>
    {onSave&&<IconButton className="discovery-save" icon="bookmark" label={`${isSaved?'Unsave':'Save'} ${p.name}`} aria-pressed={isSaved} onClick={()=>onSave(p)}/>}
    {hasPhoto&&<p className="discovery-card-credit"><a href={photo.page} target="_blank" rel="noreferrer">{photo.author}</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></p>}
   </article>;
  })}
  {!shown.length&&busy&&[0,1,2].map(i=><div className="photo-card-skeleton" key={i}><Skeleton/><span>Finding nearby places…</span></div>)}
  {!shown.length&&!busy&&<div className="visual-discovery-empty"><AppIcon name="compass" size={30}/><div><strong>No mapped matches here yet.</strong><p>Try all places, a wider distance, or another area.</p></div><button onClick={onClear}>{resetLabel}</button></div>}
  </div>
 </section>;
}

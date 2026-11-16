'use client';
import {useState} from 'react';
import type {Place} from '../lib/places';
import {placeShareUrl} from '../lib/sharing';
export default function SharePlace({place}:{place:Place}){
 const [message,setMessage]=useState(''),[manual,setManual]=useState('');
 async function share(){const url=placeShareUrl(window.location.origin,place);setMessage('');setManual('');
  if(navigator.share){try{await navigator.share({title:place.name,text:'A little discovery on Explore Around You',url});return}catch(error){if(error instanceof Error&&error.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(url);setMessage('Place link copied.')}catch{setManual(url);setMessage('Copy this link to share the place.')}
 }
 return <div className="share-place"><button onClick={share}>↗ Share this place</button>{message&&<p role="status">{message}</p>}{manual&&<input aria-label="Place link to copy" readOnly value={manual} onFocus={e=>e.target.select()}/>}</div>;
}

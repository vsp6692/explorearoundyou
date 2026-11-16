'use client';
import {useState} from 'react';
import {parseSearchIntent, type SearchIntent} from '../lib/search-intent';

export default function AdventureSearch({onApply}:{onApply:(intent:SearchIntent)=>void}) {
 const [open,setOpen]=useState(false);
 const [text,setText]=useState('');
 const [error,setError]=useState('');
 return <div className="adventure-search"><button className="list-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>✧ Search by mood or words</button>{open&&<form onSubmit={e=>{e.preventDefault();try{onApply(parseSearchIntent(text));setError('');setOpen(false)}catch(err){setError(err instanceof Error?err.message:'Try another phrase.')}}}><label htmlFor="adventure-words">Around your selected location</label><input id="adventure-words" value={text} onChange={e=>setText(e.target.value)} placeholder="Quiet cafés within 3 km" maxLength={200}/><div className="word-examples">{['Cafés within 3 km','Peaceful nature','Fun for kids'].map(example=><button key={example} type="button" onClick={()=>setText(example)}>{example}</button>)}</div><button className="apply-words" disabled={!text.trim()}>Apply and explore map places</button>{error&&<p role="alert">{error}</p>}</form>}</div>;
}

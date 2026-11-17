'use client';
import {useState} from 'react';
import AppIcon from './AppIcon';
import {Button,EmptyState} from './ui';
import type {Trip} from '../lib/trips';
import type {Visit} from '../lib/adventures';
import type {Place} from '../lib/places';
type Props={trips:Trip[];visits:Visit[];onTrip:(id:string,section:'Journal')=>void;onExplore:()=>void;onCreate:()=>void;onPlace:(place:Place)=>void};
export default function JournalScreen({trips,visits,onTrip,onExplore,onCreate,onPlace}:Props){
 const [view,setView]=useState<'memories'|'visited'>('memories');
 const notes=trips.flatMap(trip=>trip.memories.map(note=>({...note,trip}))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 const marks=[...visits].sort((a,b)=>(b.visitedAt||'').localeCompare(a.visitedAt||''));
 return <section className="app-content journal-screen"><div className="screen-heading"><div><h1>Your Journal</h1><p>The places you went. The little things you kept.</p></div><AppIcon name="journal" size={28}/></div>
  <div className="journal-tabs" aria-label="Journal views"><Button aria-pressed={view==='memories'} onClick={()=>setView('memories')}>Memories <span>{notes.length}</span></Button><Button aria-pressed={view==='visited'} onClick={()=>setView('visited')}>Visited places <span>{visits.length}</span></Button></div>
  {view==='memories'&&(notes.length?<div className="journal-note-grid">{notes.map(note=><article className="journal-entry" key={`${note.trip.id}-${note.id}`}><small>Note added {new Date(note.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</small><p>{note.text}</p><button className="journal-trip-link" onClick={()=>onTrip(note.trip.id,'Journal')}><AppIcon name="trips" size={18}/><span>{note.trip.name}<small>{note.trip.destination}</small></span><AppIcon name="arrow" size={18}/></button></article>)}</div>:<EmptyState icon="journal" title="Make room for a little memory." action={<Button variant="primary" onClick={trips.length?()=>onTrip(trips[0].id,'Journal'):onCreate}>{trips.length?'Write your first memory':'Start a trip'}<AppIcon name="plus" size={18}/></Button>}><p>Keep a note about a favourite meal, a surprising view, or a day you want to remember. Notes stay on this device.</p></EmptyState>)}
  {view==='visited'&&(marks.length?<div className="journal-visited-list">{marks.map(visit=><button key={visit.id} onClick={()=>onPlace({...visit,distance:0})}><span className="journal-visit-icon"><AppIcon name="check" size={22}/></span><span><strong>{visit.name}</strong><small>{visit.category} · {visit.visitedAt?`Marked ${new Date(visit.visitedAt).toLocaleDateString()}`:'Date not recorded'}</small></span><AppIcon name="arrow" size={18}/></button>)}</div>:<EmptyState icon="pin" title="Every adventure begins somewhere." action={<Button variant="primary" onClick={onExplore}>Explore nearby <AppIcon name="arrow" size={18}/></Button>}><p>Open a place and mark it visited to keep it here. You choose what to record.</p></EmptyState>)}
 </section>;
}

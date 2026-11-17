'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import AppIcon from './AppIcon';
import PlacePhoto from './PlacePhoto';
import TripCover from './TripCover';
import {Button,EmptyState,IconButton,Skeleton} from './ui';
import type {useTrips} from './useTrips';
import {samePlace} from '../lib/adventures';
import {tripDates,tripStatus,type Trip,type TripCover as TripCoverKind} from '../lib/trips';
import type {Place} from '../lib/places';

type Section='Itinerary'|'Journal'|'Photos';
type Props={controller:ReturnType<typeof useTrips>;creating:boolean;initialPlace?:Place|null;onCreated:(trip?:Trip)=>void;onCancelCreate?:()=>void;onCreate:()=>void;onExplore:()=>void;onSelectPlace:(place:Place)=>void;onShowTripMap?:(trip:Trip)=>void;saved:Place[];requestedTripId?:string;requestedSection?:Section};

function StopPhoto({place}:{place:Place}){
 const marker=useRef<HTMLSpanElement>(null);const [visible,setVisible]=useState(false);
 useEffect(()=>{if(!marker.current)return;if(typeof IntersectionObserver==='undefined'){setVisible(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'120px'});observer.observe(marker.current);return()=>observer.disconnect()},[]);
 return <div className="stop-thumbnail">{visible?<PlacePhoto title={place.photoTitle} name={place.name}/>:<span ref={marker} className="stop-thumb-wait" aria-label="Place photo"><AppIcon name="image" size={25}/></span>}</div>;
}

export default function TripScreens({controller,creating,initialPlace,onCreated,onCancelCreate,onCreate,onExplore,onSelectPlace,onShowTripMap,saved,requestedTripId,requestedSection='Itinerary'}:Props){
 const [selected,setSelected]=useState<string|null>(null),[filter,setFilter]=useState('All Trips'),[query,setQuery]=useState(''),[tab,setTab]=useState<Section>('Itinerary');
 const [editing,setEditing]=useState(false),[confirm,setConfirm]=useState(false),[memory,setMemory]=useState(''),[adding,setAdding]=useState(false),[formError,setFormError]=useState(''),[notice,setNotice]=useState('');
 const [startDate,setStartDate]=useState(''),[endDate,setEndDate]=useState(''),[cover,setCover]=useState<TripCoverKind>('mountains');
 const trip=controller.trips.find(item=>item.id===selected);
 useEffect(()=>{if(requestedTripId){setSelected(requestedTripId);setEditing(false);setTab(requestedSection);setAdding(false);setConfirm(false);setMemory('')}},[requestedTripId,requestedSection]);
 useEffect(()=>{if(creating){setSelected(null);setEditing(false);setConfirm(false);setFormError('');setStartDate('');setEndDate('');setCover('mountains')}},[creating,initialPlace?.id]);
 useEffect(()=>{document.querySelector('.app-page-scroll')?.scrollTo({top:0})},[selected,creating,editing]);
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setFormError('');const fields=new FormData(event.currentTarget);
  const input={name:String(fields.get('name')||''),destination:String(fields.get('destination')||''),startDate,endDate,travellers:Number(fields.get('travellers')),cover};
  if(editing&&trip){const next={...trip,...input};if(controller.update(next)){setEditing(false);onCreated(next)}else setFormError('Check your trip details. Your previous trip is still saved.');return}
  const result=controller.create(input,initialPlace?[initialPlace]:[]);
  if(result){setSelected(result.id);setTab('Itinerary');setEditing(false);onCreated(result)}else setFormError('Check your trip details. The trip has not been created.');
 }
 function cancelForm(){setEditing(false);setFormError('');if(creating){if(onCancelCreate)onCancelCreate();else onCreated()}}
 function openTrip(item:Trip){setSelected(item.id);setTab('Itinerary');setFormError('');setConfirm(false);setAdding(false);setMemory('');setNotice('')}
 function moveStop(index:number,offset:number){if(!trip||index+offset<0||index+offset>=trip.places.length)return;const places=[...trip.places];[places[index],places[index+offset]]=[places[index+offset],places[index]];if(controller.update({...trip,places}))setNotice(`${trip.places[index].name} moved ${offset<0?'up':'down'}.`)}
 function setStopDay(place:Place,day:string){if(!trip)return;const stopDays={...trip.stopDays};if(day)stopDays[place.id]=day;else delete stopDays[place.id];controller.update({...trip,stopDays})}
 const error=controller.error||formError;

 if(creating||editing){
  const preview=editing&&trip?{...trip,cover}:{cover,places:initialPlace?[initialPlace]:[]};
  return <section className="trip-screen trip-polish create-trip app-content">
   <IconButton icon="back" label="Back from trip form" onClick={cancelForm}/>
   <div className="screen-heading"><div><h1>{editing?'Edit trip':'New trip'}</h1><p>Make a little room for adventure.</p></div><AppIcon name="sparkles" size={30}/></div>
   <form onSubmit={submit} key={editing?trip?.id:`new-${initialPlace?.id||''}`}>
    <div className="trip-form-cover"><TripCover trip={preview}/></div>
    {!editing&&initialPlace&&<p className="pending-trip-place"><AppIcon name="pin" size={20}/><span><strong>{initialPlace.name}</strong> will be your first stop.</span></p>}
    <label>Trip name<input name="name" placeholder="My little escape" defaultValue={editing?trip?.name:initialPlace?`${initialPlace.name} escape`.slice(0,80):''} maxLength={80} required autoComplete="off"/></label>
    <label>Destination<input name="destination" placeholder="A city, a country, or somewhere nearby" defaultValue={editing?trip?.destination:(initialPlace?.address||initialPlace?.name||'').slice(0,160)} maxLength={160} required autoComplete="off"/></label>
    <div className="date-fields"><label>Start date<input type="date" name="startDate" value={startDate} max={endDate||undefined} onChange={event=>setStartDate(event.target.value)}/></label><label>End date<input type="date" name="endDate" value={endDate} min={startDate||undefined} onChange={event=>setEndDate(event.target.value)}/></label></div>
    <p className="app-note">Dates are optional. Leave both empty to keep a trip for later.</p>
    <label>Travellers<input type="number" min={1} max={20} name="travellers" defaultValue={editing?trip?.travellers:1} required/></label>
    <fieldset className="cover-choices"><legend>Inspiration cover</legend>{(['coast','mountains','city'] as const).map(choice=><label key={choice}><input type="radio" name="cover" value={choice} checked={cover===choice} onChange={()=>setCover(choice)}/><img src={`/images/journey-${choice}.jpg`} alt="" loading="lazy"/><span>{choice}</span></label>)}</fieldset>
    <p className="app-note">A mapped stop photo is used when available. Inspiration covers are decorative. Trips and memories stay in this browser.</p>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <Button variant="primary" className="trip-submit" type="submit" disabled={!controller.ready}>{editing?'Save changes':'Create trip'}<AppIcon name="arrow" size={19}/></Button>
   </form>
  </section>;
 }
 if(trip){
  const available=saved.filter(place=>!trip.places.some(stop=>samePlace(stop,place)));
  return <section className="trip-screen trip-polish trip-detail app-content">
   <div className="trip-detail-cover"><TripCover trip={trip}/><div className="trip-cover-actions"><IconButton icon="back" label="Back to my trips" onClick={()=>{setSelected(null);setConfirm(false);setAdding(false);setNotice('')}}/><IconButton icon="edit" label="Edit this trip" onClick={()=>{setEditing(true);setFormError('');setStartDate(trip.startDate);setEndDate(trip.endDate);setCover(trip.cover)}}/></div></div>
   <div className="trip-detail-body">
    <header className="trip-title-panel"><span className="status-badge"><i/>{tripStatus(trip)}</span><h1>{trip.name}</h1><p>{trip.destination}</p><div className="trip-meta"><span><AppIcon name="calendar" size={17}/>{tripDates(trip)}</span><span><AppIcon name="profile" size={17}/>{trip.travellers} {trip.travellers===1?'traveller':'travellers'}</span></div></header>
    <nav className="detail-tabs" aria-label="Trip sections">{(['Itinerary','Journal','Photos'] as const).map((section,index)=><button key={section} aria-pressed={tab===section} onClick={()=>{setTab(section);setNotice('')}}><AppIcon name={index===0?'calendar':index===1?'journal':'image'} size={21}/>{section}</button>)}<button onClick={()=>onShowTripMap?onShowTripMap(trip):trip.places[0]?onSelectPlace(trip.places[0]):onExplore()}><AppIcon name="map" size={21}/>Map</button></nav>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <p className="trip-feedback" role="status" aria-live="polite">{notice}</p>
    {tab==='Itinerary'&&<>
     <div className="section-heading"><h2>Your itinerary</h2><Button variant="quiet" onClick={()=>setAdding(!adding)} aria-expanded={adding}><AppIcon name="plus" size={18}/>Add place</Button></div>
     {adding&&<div className="add-stops"><h3>From your saved places</h3>{available.map(place=><button key={place.id} disabled={trip.places.length>=100} onClick={()=>{if(controller.update({...trip,places:[...trip.places,place]}))setNotice(`${place.name} added to your trip.`)}}><AppIcon name="pin" size={18}/><span>{place.name}<small>{place.category}</small></span><AppIcon name="plus" size={18}/></button>)}{!available.length&&<p>Save a place on the map and it will be ready to add here.</p>}<Button variant="quiet" onClick={onExplore}>Discover more places<AppIcon name="arrow" size={18}/></Button></div>}
     {trip.places.length?<ol className="itinerary-list">{trip.places.map((place,index)=><li key={place.id} className="itinerary-stop">
      <div className="stop-main">{place.photoTitle?<StopPhoto place={place}/>:<span className="stop-category-icon"><AppIcon name={place.category==='Food'?'food':place.category==='Stays'?'stay':place.category==='Parks'?'nature':place.category==='Beaches'?'beach':'pin'} size={25}/></span>}<button className="itinerary-place" onClick={()=>onSelectPlace(place)}><strong>{place.name}</strong><small>{place.category} · View place</small></button><span className="stop-number" aria-label={`Stop ${index+1}`}>{index+1}</span></div>
      <div className="stop-arrange" role="group" aria-label={`Organize ${place.name}`}><Button variant="quiet" disabled={index===0} aria-label={`Move ${place.name} up`} onClick={()=>moveStop(index,-1)}><AppIcon name="up" size={17}/>Up</Button><Button variant="quiet" disabled={index===trip.places.length-1} aria-label={`Move ${place.name} down`} onClick={()=>moveStop(index,1)}><AppIcon name="down" size={17}/>Down</Button><IconButton icon="trash" label={`Remove ${place.name} from trip`} onClick={()=>{if(controller.update({...trip,places:trip.places.filter(stop=>stop.id!==place.id)}))setNotice(`${place.name} removed from this trip.`)}}/></div>
      {trip.startDate&&trip.endDate&&<label className="stop-day"><span>Plan for</span><input type="date" aria-label={`Planned date for ${place.name}`} min={trip.startDate} max={trip.endDate} value={trip.stopDays?.[place.id]||''} onChange={event=>setStopDay(place,event.target.value)}/><small>Optional</small></label>}
     </li>)}</ol>:<EmptyState title="The best part is still ahead." action={<Button variant="primary" onClick={()=>setAdding(true)}><AppIcon name="plus" size={18}/>Add your first stop</Button>}><p>A favourite café, a beach, or that place you’ve been meaning to visit. Your itinerary starts with one good idea.</p></EmptyState>}
     {!!trip.places.length&&!trip.startDate&&<p className="app-note">Add travel dates in Edit trip to plan stops by day.</p>}
     <p className="app-note">Your order of places is a plan, not a verified route. Check access and opening times before you go.</p>
    </>}
    {tab==='Journal'&&<>
     <div className="section-heading"><h2>Little moments, kept.</h2><span>{trip.memories.length} {trip.memories.length===1?'note':'notes'}</span></div>
     {!trip.memories.length&&<div className="journal-welcome"><AppIcon name="journal" size={26}/><div><strong>Keep the details you don’t want to forget.</strong><p>The first bite, a quiet corner, a conversation. A few words are enough.</p></div></div>}
     <form className="memory-form" onSubmit={event=>{event.preventDefault();if(!memory.trim())return;if(controller.update({...trip,memories:[{id:crypto.randomUUID(),text:memory.trim(),createdAt:new Date().toISOString()},...trip.memories]})){setMemory('');setNotice('Your memory is saved.')}}}><label htmlFor="memory-text">What would you like to remember?</label><textarea id="memory-text" placeholder="A little moment from this trip…" maxLength={2000} value={memory} onChange={event=>setMemory(event.target.value)}/><Button variant="primary" type="submit" disabled={!memory.trim()||trip.memories.length>=100}><AppIcon name="plus" size={18}/>Save memory</Button>{trip.memories.length>=100&&<p className="app-note">This trip has 100 notes. Remove an older note to make room.</p>}</form>
     {trip.memories.map(note=><article className="memory-note" key={note.id}><small>Note added <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</time></small><p>{note.text}</p><Button variant="quiet" onClick={()=>{if(controller.update({...trip,memories:trip.memories.filter(item=>item.id!==note.id)}))setNotice('Note removed.')}}>Remove note</Button></article>)}
    </>}
    {tab==='Photos'&&<>
     <div className="section-heading"><div><h2>Places in your trip</h2><p>Licensed community photos of mapped stops.</p></div></div>
     {trip.places.some(place=>place.photoTitle)?<div className="trip-photo-grid">{trip.places.filter(place=>place.photoTitle).slice(0,12).map(place=><article key={place.id}><PlacePhoto title={place.photoTitle} name={place.name}/><Button variant="quiet" onClick={()=>onSelectPlace(place)}>{place.name}<AppIcon name="arrow" size={17}/></Button></article>)}</div>:<EmptyState icon="image" title="A window into your trip."><p>Add places with mapped photos to see them here. You can discover and save places from the map.</p></EmptyState>}
    </>}
    <div className="trip-bottom-actions"><Button variant="quiet" onClick={()=>{setTab('Journal');setAdding(false)}}><AppIcon name="plus" size={18}/>Add a memory</Button><Button variant="quiet" className="danger" onClick={()=>setConfirm(!confirm)} aria-expanded={confirm}>Delete trip</Button></div>
    {confirm&&<div className="delete-confirm" role="alert"><p>Delete “{trip.name}” and its local notes? Your saved map places will stay.</p><Button onClick={()=>{if(controller.remove(trip.id)){setSelected(null);setConfirm(false)}}}>Delete this trip</Button><Button onClick={()=>setConfirm(false)}>Keep trip</Button></div>}
   </div>
  </section>;
 }
 const filtered=controller.trips.filter(item=>(filter==='All Trips'||tripStatus(item)===filter)&&`${item.name} ${item.destination}`.toLowerCase().includes(query.toLowerCase()));
 return <section className="trip-screen trip-polish app-content">
  <div className="screen-heading"><div><h1>My Trips</h1><p>A place for your plans and little escapes.</p></div><IconButton icon="plus" label="Start a new trip" onClick={onCreate}/></div>
  <label className="trip-search"><AppIcon name="search" size={20}/><input aria-label="Search your trips" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a trip…"/></label>
  <nav className="trip-filters" aria-label="Trip status">{['All Trips','Ongoing','Upcoming','Completed','Draft'].map(status=><button key={status} aria-pressed={filter===status} onClick={()=>setFilter(status)}>{status}</button>)}</nav>
  {error&&<p className="form-error" role="alert">{error}</p>}
  {!controller.ready?<div className="trip-grid" aria-label="Loading your trips">{[0,1,2].map(index=><Skeleton key={index} className="trip-loading-card"/>)}</div>:<div className="trip-grid">{filtered.map(item=><article className="trip-tile" key={item.id}>
   <TripCover trip={item} label={`Open ${item.name}`} onOpen={()=>openTrip(item)}/>
   <button className="trip-tile-open" onClick={()=>openTrip(item)}><div className="trip-tile-copy"><span className="trip-tile-status">{tripStatus(item)}</span><h2>{item.name}</h2><p>{item.destination}</p><small><AppIcon name="calendar" size={16}/>{tripDates(item)}</small><small><AppIcon name="pin" size={16}/>{item.places.length} places · {item.memories.length} notes</small></div></button>
   <button className={`tile-bookmark ${item.bookmarked?'is-saved':''}`} aria-label={`${item.bookmarked?'Unbookmark':'Bookmark'} ${item.name}`} aria-pressed={item.bookmarked} onClick={()=>controller.update({...item,bookmarked:!item.bookmarked})}><AppIcon name="bookmark" size={21}/></button>
  </article>)}</div>}
  {controller.ready&&!filtered.length&&<EmptyState icon="trips" title={controller.trips.length?'No trips in this view.':'Your next chapter starts here.'}><p>{controller.trips.length?'Try another filter or search.':'A weekend nearby or a faraway dream. Give it a name, then collect places you’d love to visit.'}</p></EmptyState>}
  <button className="new-trip-card" onClick={onCreate}><span><AppIcon name="plus"/></span><strong>Start a new trip</strong><small>A little home for your next adventure.</small></button>
 </section>;
}

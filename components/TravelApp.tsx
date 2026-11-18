'use client';
import {useEffect,useRef,useState} from 'react';
import Explorer from './Explorer';
import HomeScreen from './HomeScreen';
import TripScreens from './TripScreens';
import JournalScreen from './JournalScreen';
import AccountPanel from './AccountPanel';
import DeferredPlacePhoto from './DeferredPlacePhoto';
import AppIcon from './AppIcon';
import {Button,IconButton,EmptyState} from './ui';
import {useTrips} from './useTrips';
import {useAccount} from './useAccount';
import {readBookmarks} from '../lib/bookmarks';
import {readVisits,samePlace,type Visit} from '../lib/adventures';
import {readSharedPlace} from '../lib/sharing';
import type {Trip} from '../lib/trips';
import type {Place} from '../lib/places';
import photoCredits from '../public/images/credits.json';
type Tab='explore'|'map'|'trips'|'journal'|'profile'|'home'|'saved';
const tabs:Tab[]=['explore','map','trips','journal','profile','home','saved'];
export default function TravelApp(){
 const account=useAccount(),controller=useTrips();
 const [tab,setTab]=useState<Tab>('explore'),[creating,setCreating]=useState(false),[place,setPlace]=useState<Place|null>(null),[category,setCategory]=useState('Everything'),[requestVersion,setRequestVersion]=useState(0);
 const [tripId,setTripId]=useState<string>(),[tripSection,setTripSection]=useState<'Itinerary'|'Journal'|'Photos'>('Itinerary'),[tripNavigation,setTripNavigation]=useState(0);
 const [saved,setSaved]=useState<Place[]>([]),[visits,setVisits]=useState<Visit[]>([]),[dark,setDark]=useState(false),[addingPlace,setAddingPlace]=useState<Place|null>(null),[pendingPlace,setPendingPlace]=useState<Place|null>(null),[notice,setNotice]=useState('');
 const [itinerary,setItinerary]=useState<Place[]>([]),[itineraryName,setItineraryName]=useState(''),[itineraryVersion,setItineraryVersion]=useState(0);
 const heading=useRef<HTMLDivElement>(null),dialog=useRef<HTMLElement>(null),mapActive=tab==='explore'||tab==='map';
 useEffect(()=>{
  try{setSaved(readBookmarks(localStorage.getItem('explorearoundyou-saved')));setVisits(readVisits(localStorage.getItem('explorearoundyou-visits')));setDark(localStorage.getItem('explorearoundyou-theme')==='dark')}catch{}
  function restore(){const view=new URLSearchParams(window.location.search).get('view');setTab(readSharedPlace(window.location.search)?'map':tabs.includes(view as Tab)?view as Tab:'explore');setCreating(false);setPendingPlace(null);setAddingPlace(null)}
  restore();window.addEventListener('popstate',restore);
  const sync=(e:StorageEvent)=>{if(e.key==='explorearoundyou-saved')setSaved(readBookmarks(e.newValue));if(e.key==='explorearoundyou-visits')setVisits(readVisits(e.newValue))};window.addEventListener('storage',sync);
  return()=>{window.removeEventListener('popstate',restore);window.removeEventListener('storage',sync)};
 },[]);
 useEffect(()=>{heading.current?.scrollTo({top:0});const frame=requestAnimationFrame(()=>{if(!mapActive){const title=heading.current?.querySelector<HTMLElement>('h1');if(title){title.tabIndex=-1;title.focus({preventScroll:true})}}});return()=>cancelAnimationFrame(frame)},[tab,creating]);
 useEffect(()=>{
  if(!addingPlace)return;const previous=document.activeElement,el=dialog.current;el?.querySelector<HTMLElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setAddingPlace(null)}if(e.key==='Tab'&&el){const buttons=[...el.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})};
 },[addingPlace]);
 function navigate(next:Tab){
  setTab(next);setCreating(false);setPendingPlace(null);setAddingPlace(null);
  const url=new URL(window.location.href);url.searchParams.set('view',next);for(const key of ['place','lat','lon','category'])url.searchParams.delete(key);window.history.pushState({view:next},'',url);
 }
 function clearItinerary(){setItinerary([]);setItineraryName('')}
 function openMap(p?:Place){clearItinerary();setPlace(p||null);setCategory('Everything');setRequestVersion(v=>v+1);navigate('explore')}
 function create(initialPlace?:Place){navigate('trips');setTripId(undefined);setPendingPlace(initialPlace||null);setCreating(true)}
 function openTrip(id:string,section:'Itinerary'|'Journal'|'Photos'='Itinerary'){navigate('trips');setTripId(id);setTripSection(section);setTripNavigation(v=>v+1)}
 function showTripMap(trip:Trip){navigate('map');setPlace(null);setCategory('Everything');setRequestVersion(v=>v+1);setItinerary(trip.places);setItineraryName(trip.name);setItineraryVersion(v=>v+1)}
 function toggleTheme(){setDark(!dark);try{localStorage.setItem('explorearoundyou-theme',dark?'light':'dark')}catch{}}
 function unsave(p:Place){const next=saved.filter(item=>!samePlace(item,p));try{localStorage.setItem('explorearoundyou-saved',JSON.stringify(next));setSaved(next);setNotice('Place removed from saved.')}catch{setNotice('Your browser could not update saved places. Please try again.')}}
 return <div className={`travel-app ${dark?'app-dark':''} ${mapActive?'map-active':''}`}>
  <header className="app-topbar"><button onClick={()=>navigate('explore')} className="app-wordmark"><span><AppIcon name="compass" size={25}/></span>explore<span>aroundyou</span></button><span className="desktop-tagline">A little curiosity. A new adventure.</span><div><IconButton icon={dark?'sun':'moon'} label={dark?'Use light theme':'Use dark theme'} onClick={toggleTheme}/><IconButton icon="profile" label="Open profile" onClick={()=>navigate('profile')}/></div></header>
  <main id="app-content" className="app-page-scroll" ref={heading} hidden={mapActive}>
   {tab==='home'&&<HomeScreen name={account.name} trips={controller.trips} saved={saved} visits={visits} onMap={()=>openMap()} onTrips={()=>{setTripId(undefined);setTripNavigation(v=>v+1);navigate('trips')}} onCreate={()=>create()} onSaved={()=>navigate('saved')} onProfile={()=>navigate('profile')} onTrip={openTrip} onJournal={()=>navigate('journal')} onCategory={c=>{clearItinerary();setPlace(null);setCategory(c);setRequestVersion(v=>v+1);navigate('explore')}}/>}
   {tab==='trips'&&<TripScreens key={`${tripId||'all'}-${tripNavigation}`} controller={controller} creating={creating} initialPlace={pendingPlace} onCreated={trip=>{setCreating(false);setPendingPlace(null);if(trip)setNotice(`${creating?'Created':'Updated'} ${trip.name}${creating&&trip.places.length?' with your first place':''}.`)}} onCancelCreate={()=>{setCreating(false);setPendingPlace(null)}} onCreate={()=>create()} onExplore={()=>openMap()} onSelectPlace={p=>openMap(p)} onShowTripMap={showTripMap} saved={saved} requestedTripId={tripId} requestedSection={tripSection}/>}
   {tab==='journal'&&<JournalScreen trips={controller.trips} visits={visits} onTrip={openTrip} onExplore={()=>openMap()} onCreate={()=>create()} onPlace={p=>openMap(p)}/>}
   {tab==='saved'&&<section className="app-content saved-screen"><div className="screen-heading"><div><h1>Places to go</h1><p>Your collection of someday.</p></div><IconButton icon="plus" label="Find more places" onClick={()=>openMap()}/></div>{saved.length?<div className="saved-grid">{saved.map(p=><article className="saved-visual-card" key={p.id}><div className="saved-image"><DeferredPlacePhoto title={p.photoTitle} name={p.name}/></div><button className="saved-open" onClick={()=>openMap(p)}><span><strong>{p.name}</strong><small>{p.category} · Open on map</small></span></button><IconButton icon="bookmark" label={`Unsave ${p.name}`} aria-pressed="true" onClick={()=>unsave(p)}/></article>)}</div>:<EmptyState icon="bookmark" title="Keep a little something for later." action={<Button variant="primary" onClick={()=>openMap()}>Explore nearby <AppIcon name="arrow" size={18}/></Button>}><p>Open a place and tap Save. Your favourites will be waiting here.</p></EmptyState>}</section>}
   {tab==='profile'&&<section className="app-content profile-page"><div className="screen-heading"><div><h1>Your little world</h1><p>Places, preferences, and the way you wander.</p></div><IconButton icon={dark?'sun':'moon'} label={dark?'Use light theme':'Use dark theme'} onClick={toggleTheme}/></div><div className="profile-stats"><button onClick={()=>navigate('saved')}><strong>{saved.length}</strong><span>Saved places</span></button><button onClick={()=>{setTripId(undefined);navigate('trips')}}><strong>{controller.trips.length}</strong><span>Trips</span></button><button onClick={()=>navigate('journal')}><strong>{visits.length}</strong><span>Visit marks</span></button></div><AccountPanel account={account} onClose={()=>navigate('explore')}/><Button className="travel-corner" onClick={()=>navigate('home')}><AppIcon name="folder" size={20}/> Your collections &amp; memories <AppIcon name="arrow" size={18}/></Button><div className="profile-device-note"><AppIcon name="heart" size={22}/><div><strong>Yours, right here.</strong><p>Your trips, memories, saved places and visit marks live in this browser. Configured cloud sign-in saves profile interests and consented search history.</p></div></div><details className="photo-credits"><summary>Photo credits</summary><p>Trip covers marked Inspiration are decorative, not photographs of your chosen destination.</p>{photoCredits.map(c=><p key={c.id}><a href={c.source} target="_blank" rel="noreferrer">{c.title}</a> — {c.author} · <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a>.</p>)}</details></section>}
  </main>
  <div className="app-map-panel" hidden={!mapActive}><Explorer account={account} requestedPlace={place} requestedCategory={category} requestVersion={requestVersion} onSavedChange={setSaved} savedPlaces={saved} onVisitsChange={setVisits} visitMarks={visits} onAddToTrip={setAddingPlace} onProfileRequest={()=>navigate('profile')} darkTheme={dark} viewMode={tab==='map'?'map':'explore'} itinerary={itinerary} itineraryName={itineraryName} itineraryVersion={itineraryVersion} onClearItinerary={clearItinerary}/></div>
  {addingPlace&&<div className="app-modal-backdrop" onClick={()=>setAddingPlace(null)}><section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="add-to-trip-heading" className="add-to-trip-modal" onClick={e=>e.stopPropagation()}><IconButton icon="close" label="Close trip picker" className="modal-close" onClick={()=>setAddingPlace(null)}/><span className="overline">KEEP THE GOOD PLACES</span><h2 id="add-to-trip-heading">Add to My Trips</h2><p>{addingPlace.name}</p>{controller.trips.map(t=>{const included=t.places.some(p=>samePlace(p,addingPlace));return <button className="trip-picker-row" key={t.id} disabled={included||t.places.length>=100} onClick={()=>{if(controller.update({...t,places:[...t.places,addingPlace]})){setNotice(`Added to ${t.name}.`);setAddingPlace(null)}}}><span>{t.name}<small>{included?'Already added':t.destination}</small></span><AppIcon name={included?'check':'plus'} size={21}/></button>})}{!controller.trips.length&&<p>Give your adventure a name. This place will be your first stop.</p>}{controller.error&&<p role="alert">{controller.error}</p>}<Button variant="primary" onClick={()=>create(addingPlace)}>Create a new trip <AppIcon name="arrow" size={18}/></Button></section></div>}
  {notice&&<div className="app-notice" role="status"><span>{notice}</span><IconButton icon="close" label="Dismiss message" onClick={()=>setNotice('')}/></div>}
  <nav className="app-bottom-nav" aria-label="Main navigation">{([{id:'explore',label:'Explore',icon:'compass'},{id:'map',label:'Map',icon:'map'},{id:'trips',label:'My Trips',icon:'trips'},{id:'journal',label:'Journal',icon:'journal'},{id:'profile',label:'Profile',icon:'profile'}] as const).map(item=><button key={item.id} aria-current={tab===item.id||item.id==='profile'&&['home','saved'].includes(tab)?'page':undefined} onClick={()=>{if(item.id==='trips'){setTripId(undefined);setTripNavigation(v=>v+1)}navigate(item.id)}}><AppIcon name={item.icon} size={22}/><span>{item.label}</span></button>)}</nav>
 </div>;
}

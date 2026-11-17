'use client';
import dynamic from 'next/dynamic';
import {useState,useCallback,useRef,useEffect} from 'react';
import {discover, distanceKm, type Place} from '../lib/places';
import AccountPanel from './AccountPanel';
import PlaceCard from './PlaceCard';
import {CUISINES} from '../lib/cuisines';
import {geocodeJson} from '../lib/geocoding';
import {discoveryPool,searchLocations} from '../lib/discovery-pool';
import {readBookmarks} from '../lib/bookmarks';
import {readSharedPlace} from '../lib/sharing';
import {pixelIcon} from '../lib/pixel-icons';
import {visitedPlaceIds} from '../lib/exploration';
import {selectDiscoveries} from '../lib/interests';
import type {useAccount} from './useAccount';
import AppIcon from './AppIcon';
import {Button,IconButton} from './ui';
import {DISCOVERY_CATEGORIES,matchesDiscoveryCategory,type DiscoveryCategoryId} from '../lib/discovery-categories';
import DiscoveryCards from './DiscoveryCards';
import {discoverPhotoPlaces,loadMappedPhotoPlaces,type NearbyPhotoPlace} from '../lib/nearby-photos';
import {type CommonsPhoto} from '../lib/photos';
import {defaultPhotoPlaces} from '../lib/default-photo-places';
import JourneyPanel from './JourneyPanel';
import {readVisits,samePlace,type Visit} from '../lib/adventures';
import AdventureSearch from './AdventureSearch';
import {type SearchIntent} from '../lib/search-intent';
import type {Destination} from './WorldMap';
const WorldMap=dynamic(()=>import('./WorldMap'),{ssr:false,loading:()=> <div className="map-loading">Unfolding your world…</div>});

export default function Explorer({account,requestedPlace,requestedCategory,requestVersion,onSavedChange,onVisitsChange,onAddToTrip,onProfileRequest,darkTheme,viewMode='explore',itinerary=[],itineraryVersion=0}:{account:ReturnType<typeof useAccount>;requestedPlace?:Place|null;requestedCategory?:string;requestVersion?:number;onSavedChange:(places:Place[])=>void;onVisitsChange:(visits:Visit[])=>void;onAddToTrip:(place:Place)=>void;onProfileRequest:()=>void;darkTheme:boolean;viewMode?:'explore'|'map';itinerary?:Place[];itineraryVersion?:number}){
 const [profileOpen,setProfileOpen]=useState(false),[categoryId,setCategoryId]=useState<DiscoveryCategoryId>('Everything'),[searchOpen,setSearchOpen]=useState(false),[optionsOpen,setOptionsOpen]=useState(false),[detailExpanded,setDetailExpanded]=useState(false),[gpsOrigin,setGpsOrigin]=useState<{lat:number;lon:number}|null>(null);
 const [flat,setFlat]=useState(true);const [cuisine,setCuisine]=useState('all');const [group,setGroup]=useState<Place[]|null>(null);const [preferredOnly,setPreferredOnly]=useState(false);const [resultOrigin,setResultOrigin]=useState<'map'|'network'>('map');
 const [mapCenter,setMapCenter]=useState<Destination>({name:'This map area',lat:13.0827,lon:80.2707});const receiveViewport=useCallback((value:Destination)=>setMapCenter(value),[]);
 const [mist,setMist]=useState(false);
 useEffect(()=>{try{setMist(localStorage.getItem('explorearoundyou-mist')==='on')}catch{}},[]);
 function toggleMist(){const next=!mist;setMist(next);try{localStorage.setItem('explorearoundyou-mist',next?'on':'off')}catch{setMessage('Mist mode is changed for this session; your browser could not save the setting.')}}
 const [mystery,setMystery]=useState(false);const [revealed,setRevealed]=useState<string[]>([]);
 const [journal,setJournal]=useState(false);const [visits,setVisits]=useState<Visit[]>([]);
 useEffect(()=>{try{setVisits(readVisits(localStorage.getItem('explorearoundyou-visits')))}catch{}},[]);
 function updateVisits(next:Visit[]){setVisits(next);onVisitsChange(next);try{localStorage.setItem('explorearoundyou-visits',JSON.stringify(next))}catch{setMessage('Progress could not be saved in this browser; it will last for this visit only.')}}
 function toggleVisit(p:Place){updateVisits(visits.some(v=>samePlace(v,p))?visits.filter(v=>!samePlace(v,p)):[...visits,{id:p.id,name:p.name,lat:p.lat,lon:p.lon,category:p.category,kind:p.kind}])}
 const [intent,setIntent]=useState<SearchIntent|null>(null);
 const [mapVersion,setMapVersion]=useState(0);const visiblePlaces=useRef<Place[]>([]);const receiveVisiblePlaces=useCallback((p:Place[])=>{const signature=(items:Place[])=>items.map(v=>v.id).sort().join('|');if(signature(p)!==signature(visiblePlaces.current)){visiblePlaces.current=p;setMapVersion(v=>v+1)}},[]);
 const [center,setCenter]=useState<Destination>({name:'Chennai, India',lat:13.0827,lon:80.2707});const [listOpen,setListOpen]=useState(false);
 const [photoPlaces,setPhotoPlaces]=useState<NearbyPhotoPlace[]>(()=>defaultPhotoPlaces(13.0827,80.2707,5)),[photoBusy,setPhotoBusy]=useState(true),[cuisinePending,setCuisinePending]=useState(false),[placePhotos,setPlacePhotos]=useState<Record<string,CommonsPhoto>>(()=>Object.fromEntries(defaultPhotoPlaces(13.0827,80.2707,5).map(item=>[item.place.id,item.photo])));
 const [widerPlaces,setWiderPlaces]=useState<Place[]>([]);const [discoveryError,setDiscoveryError]=useState('');
 const [places,setPlaces]=useState<Place[]>([]);const [selected,setSelected]=useState<Place|null>(null);const [radius,setRadius]=useState(5);const [finding,setFinding]=useState(false);const [pixel,setPixel]=useState(false);const [saved,setSaved]=useState<Place[]>([]);const [collection,setCollection]=useState(false);const [surprise,setSurprise]=useState(false);const request=useRef<AbortController|null>(null);const searchRequest=useRef<AbortController|null>(null);const discoveryCooldown=useRef(0);
 const selectPlace=useCallback((p:Place)=>{setRevealed(ids=>ids.includes(p.id)?ids:[...ids,p.id].slice(-1000));setProfileOpen(false);setJournal(false);setCollection(false);setListOpen(false);setSelected(p);setDetailExpanded(false);setGroup(null);setSurprise(false)},[]);
 useEffect(()=>{try{setSaved(readBookmarks(localStorage.getItem('explorearoundyou-saved')));setPixel(localStorage.getItem('explorearoundyou-style')==='pixel')}catch{}return()=>{request.current?.abort();searchRequest.current?.abort()}},[]);
 function bookmark(p:Place){const next=saved.some(x=>x.id===p.id)?saved.filter(x=>x.id!==p.id):[...saved,p];setSaved(next);onSavedChange(next);try{localStorage.setItem('explorearoundyou-saved',JSON.stringify(next))}catch{setMessage('Your browser could not save this collection. It will last for this visit only.')}}
 function useVisiblePlaces(random=false){
  const found=selectDiscoveries(discoveryPool(discoveryPool(visiblePlaces.current,photoPlaces.map(p=>p.place)),widerPlaces),center,radius,category,intent,account.interests,preferredOnly,cuisine).filter(p=>matchesDiscoveryCategory(p,categoryId));
  setGroup(null);setPlaces(found);setSelected(null);setProfileOpen(false);setJournal(false);setCollection(false);setListOpen(!random||!found.length);
  if(found.length){
   if(random){const preferred=category==='Everything'?found.filter(p=>account.interests.includes(p.category)):[];const source=preferred.length?preferred:found;const others=source.filter(p=>p.id!==selected?.id);const pool=others.length?others:source;const pick=pool[Math.floor(Math.random()*pool.length)];selectPlace(pick);setDestination(pick);setSurprise(true)}
   setMessage('');
  }else setMessage('');
  return found.length;
 }
 async function nearby(random=false,network=false,quiet=false){
  if(!network){request.current?.abort();request.current=null;setFinding(false);useVisiblePlaces(random);return}
  if(finding)return;
  if(Date.now()-discoveryCooldown.current<5000){setDiscoveryError('Please wait a few seconds before another online search.');return}
  discoveryCooldown.current=Date.now();
  request.current?.abort();const controller=new AbortController();request.current=controller;const timer=setTimeout(()=>controller.abort(),20000);
  setFinding(true);setDiscoveryError('');setMessage(quiet?'':'Searching the wider area…');if(!quiet){setGroup(null);setProfileOpen(false);setJournal(false);setSelected(null);setCollection(false)};
  try{
   const returned=await discover(center.lat,center.lon,radius,category,controller.signal,cuisine);
   const found=selectDiscoveries(returned,center,radius,category,intent,account.interests,preferredOnly,cuisine).filter(p=>matchesDiscoveryCategory(p,categoryId));
   if(request.current!==controller)return;
   if(returned.length)setWiderPlaces(previous=>discoveryPool(previous,returned));
   if(!quiet)setListOpen(true);setMessage('');
   if(found.length)setDiscoveryError('');
   else setDiscoveryError('No new matches returned. Previously loaded discoveries remain available. Try another cuisine, distance or area.');
  }catch(error){if(request.current===controller){setMessage('');setDiscoveryError(controller.signal.aborted?'The online search timed out. Loaded discoveries are still available.':error instanceof Error?error.message:'Online discovery is unavailable. Loaded map places still work.');if(!quiet)setListOpen(true)}}
  finally{clearTimeout(timer);if(request.current===controller){setFinding(false);request.current=null}}
 }
 const [destination,setDestination]=useState<Destination>({name:'Chennai, India',lat:13.0827,lon:80.2707});const [query,setQuery]=useState('');const [results,setResults]=useState<Destination[]>([]);const [category,setCategory]=useState('Everything');const [dark,setDark]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const error=useCallback((m:string)=>setMessage(m),[]);
 useEffect(()=>{request.current?.abort();request.current=null;setFinding(false);setDiscoveryError('');setGroup(null)},[center.lat,center.lon,radius,category,cuisine,intent,preferredOnly,account.interests]);
 useEffect(()=>{setWiderPlaces([])},[center.lat,center.lon]);
 useEffect(()=>{setPlaces(selectDiscoveries(discoveryPool(discoveryPool(visiblePlaces.current,photoPlaces.map(p=>p.place)),widerPlaces),center,radius,category,intent,account.interests,preferredOnly,cuisine).filter(p=>matchesDiscoveryCategory(p,categoryId)));setResultOrigin(widerPlaces.length?'network':'map')},[mapVersion,center.lat,center.lon,radius,category,intent,account.interests,preferredOnly,cuisine,widerPlaces,photoPlaces,categoryId]);
 useEffect(()=>{const controller=new AbortController();let active=true;const timer=setTimeout(()=>controller.abort(),18000);setPhotoBusy(true);const initial=defaultPhotoPlaces(center.lat,center.lon,radius);setPhotoPlaces(initial);setPlacePhotos(old=>({...old,...Object.fromEntries(initial.map(item=>[item.place.id,item.photo]))}));void discoverPhotoPlaces(center.lat,center.lon,radius,controller.signal).then(items=>{if(!controller.signal.aborted){const merged=[...initial,...items.filter(item=>!initial.some(p=>p.place.id===item.place.id))];setPhotoPlaces(merged);setPlacePhotos(old=>Object.fromEntries(Object.entries({...old,...Object.fromEntries(merged.map(item=>[item.place.id,item.photo]))}).slice(-200)))}}).catch(()=>{}).finally(()=>{clearTimeout(timer);if(active)setPhotoBusy(false)});return()=>{active=false;clearTimeout(timer);controller.abort()}},[center.lat,center.lon,radius]);
  useEffect(()=>{if(selected||distanceKm(center.lat,center.lon,mapCenter.lat,mapCenter.lon)<.65)return;const timer=setTimeout(()=>setCenter(mapCenter),1200);return()=>clearTimeout(timer)},[mapCenter.lat,mapCenter.lon,center.lat,center.lon,selected?.id]);
 const attemptedPhotos=useRef(new Set<string>());const mappedPhotoKey=places.filter(p=>(p.photoTitle||p.wikidata)&&!placePhotos[p.id]&&!attemptedPhotos.current.has(p.id)).slice(0,8).map(p=>p.id);const mappedPhotoKeyJson=JSON.stringify(mappedPhotoKey);
 useEffect(()=>{if(!mappedPhotoKey.length)return;const wanted=places.filter(p=>mappedPhotoKey.includes(p.id));const controller=new AbortController();let active=true;const timer=setTimeout(()=>controller.abort(),12000);void loadMappedPhotoPlaces(wanted,controller.signal).then(items=>{if(active)setPlacePhotos(old=>({...old,...Object.fromEntries(items.map(item=>[item.place.id,item.photo]))}))}).catch(()=>{}).finally(()=>{clearTimeout(timer);if(active)for(const p of wanted)attemptedPhotos.current.add(p.id)});return()=>{active=false;clearTimeout(timer);controller.abort()}},[mappedPhotoKeyJson]);
  useEffect(()=>{if(!account.interests.length)setPreferredOnly(false)},[account.interests]);
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setProfileOpen(false);setJournal(false);setSelected(null);setCollection(false);setListOpen(false);setResults([]);setMessage('')}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[]);
 useEffect(()=>{try{setDark(localStorage.getItem('explorearoundyou-theme')==='dark')}catch{}},[]);
 useEffect(()=>{const place=readSharedPlace(window.location.search);if(place){setCenter(place);setDestination(place);setSelected(place);setMessage('A shared location. Its name and category were provided by the sender.')}},[]);
 useEffect(()=>{if(!profileOpen&&!journal&&!collection&&!listOpen&&!selected)return;const previous=document.activeElement;const frame=requestAnimationFrame(()=>{const panel=document.querySelector<HTMLElement>('.place-card');if(panel){panel.tabIndex=-1;panel.focus({preventScroll:true})}});return()=>{cancelAnimationFrame(frame);if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})}},[profileOpen,journal,collection,listOpen,selected?.id]);

 useEffect(()=>{setDark(darkTheme)},[darkTheme]);
 useEffect(()=>{if(requestVersion===undefined)return;setCategory(requestedCategory||'Everything');setCategoryId(DISCOVERY_CATEGORIES.some(c=>c.id===requestedCategory)?requestedCategory as DiscoveryCategoryId:'Everything');setCuisine('all');setIntent(null);setListOpen(false);setCollection(false);setJournal(false);setSelected(requestedPlace||null);if(requestedPlace)setDestination(requestedPlace)},[requestVersion,requestedPlace,requestedCategory]);
  const selectGroup=useCallback((items:Place[])=>{setGroup(items);setListOpen(true);setSelected(null);setProfileOpen(false);setCollection(false);setJournal(false)},[]);
 useEffect(()=>{if(!['Food','Stays'].includes(category)){setCuisinePending(false);return}setCuisinePending(true);const wait=Math.max(450,5000-(Date.now()-discoveryCooldown.current));const timer=setTimeout(()=>{setCuisinePending(false);void nearby(false,true,true)},wait);return()=>clearTimeout(timer)},[category,cuisine,center.lat,center.lon,radius]);
 function chooseCard(p:Place){selectPlace(p);setDestination(p)}
  async function search(e:React.FormEvent){
  e.preventDefault();const q=query.trim();if(!q||busy)return;void account.record(q);
  setSelected(null);setProfileOpen(false);setCollection(false);setJournal(false);setListOpen(false);
  searchRequest.current?.abort();const controller=new AbortController();searchRequest.current=controller;
  const timer=setTimeout(()=>controller.abort(),12000);setBusy(true);setResults([]);setMessage('');
  try{const url=new URL(process.env.NEXT_PUBLIC_GEOCODER_URL||'https://nominatim.openstreetmap.org/search');url.search=new URLSearchParams({q,format:'json',limit:'5'}).toString();
   const found=searchLocations(await geocodeJson(url,controller.signal));if(searchRequest.current!==controller)return;
   setResults(found);if(!found.length)setMessage('No places found. Try a nearby town or a different spelling.');
  }catch{if(searchRequest.current===controller)setMessage(controller.signal.aborted?'Location search timed out. You can retry or explore the map.':'Location search is unavailable right now. You can retry or explore the map.')}
  finally{clearTimeout(timer);if(searchRequest.current===controller){searchRequest.current=null;setBusy(false)}}
 }
 function cancelSearch(){searchRequest.current?.abort();searchRequest.current=null;setBusy(false);setResults([]);setMessage('Location search cancelled.')}
 function cancelDiscovery(){request.current?.abort();request.current=null;setFinding(false);setMessage('');setDiscoveryError('Online search cancelled. Loaded discoveries are still available.')}
 function clearFilters(){setSelected(null);setCategoryId('Everything');setCuisine('all');setCategory('Everything');setIntent(null);setPreferredOnly(false);setDiscoveryError('');setGroup(null)}

 function locate(){if(!window.isSecureContext){setMessage('Location needs a secure HTTPS link. You can search for a city here instead.');return}if(!navigator.geolocation){setMessage('Location is unavailable in this browser. Search a place instead.');return}setMessage('Finding your location…');navigator.geolocation.getCurrentPosition(p=>{const here={name:'Your neighborhood',lat:p.coords.latitude,lon:p.coords.longitude};setGpsOrigin({lat:here.lat,lon:here.lon});setSelected(null);setCenter(here);setDestination(here);setMessage('You’re here! Drag the map to start exploring.')},()=>setMessage('Location was unavailable or permission was declined. You can still search any place.'),{timeout:10000,maximumAge:60000})}
 function chooseCategory(id:DiscoveryCategoryId){const option=DISCOVERY_CATEGORIES.find(c=>c.id===id)!;setCategoryId(id);setCategory(option.base);setCuisine(id==='Cafes'?'cafe':'all');setIntent(null);setSelected(null);setDetailExpanded(false);setListOpen(false)}
 const areaName=center.name==='This map area'?'This map area':center.name.split(',').slice(0,2).join(',');
 const distanceLabel=gpsOrigin&&distanceKm(center.lat,center.lon,gpsOrigin.lat,gpsOrigin.lon)<.05?'from you':'from map area';
 const panelOpen=!!selected||listOpen||collection||journal||profileOpen;
 const discoveryTitle=DISCOVERY_CATEGORIES.find(c=>c.id===categoryId)?.label||'Nearby places';
 return <main className={`explorer discovery premium-explorer mode-${viewMode} ${dark?'dark':''} ${pixel?'pixel-world':''} ${panelOpen?'panel-open':''} ${detailExpanded?'detail-expanded':''}`}>
  <section className="canvas">
   <div className="explore-top">
    <header className="explore-header"><div className="explore-location"><span>EXPLORE AROUND YOU</span><h1>{areaName}</h1><small>{distanceLabel==='from you'?'Near your location':'Exploring this map area'}</small></div><div className="explore-header-actions"><IconButton icon="search" label={searchOpen?'Close search':'Search a destination'} onClick={()=>setSearchOpen(!searchOpen)} aria-expanded={searchOpen}/><IconButton icon="profile" label="Preferences and profile" onClick={onProfileRequest}/></div></header>
    {searchOpen&&<form onSubmit={search} className="search"><AppIcon name="search" size={20}/><input autoFocus aria-label="Search for a city, town or place" placeholder="Where would you like to explore?" maxLength={200} value={query} onChange={e=>setQuery(e.target.value)}/><Button variant="primary" disabled={busy||!query.trim()}>{busy?'Finding…':'Find'}</Button>{busy&&<Button variant="quiet" type="button" onClick={cancelSearch}>Cancel</Button>}</form>}
    {results.length>0&&<div className="results">{results.map((r,i)=><button key={i} onClick={()=>{setSelected(null);setCenter(r);setDestination(r);setResults([]);setSearchOpen(false);setMessage('')}}><AppIcon name="pin" size={18}/>{r.name}</button>)}<Button variant="quiet" onClick={()=>setResults([])}>Close results</Button></div>}
    <nav className="categories" aria-label="Explore categories">{DISCOVERY_CATEGORIES.map(option=><button key={option.id} className={categoryId===option.id?'active':''} aria-pressed={categoryId===option.id} onClick={()=>chooseCategory(option.id)}><AppIcon name={option.icon} size={18}/>{option.label}</button>)}</nav>
    {categoryId==='Food'&&<div className="cuisine-picker simple-cuisines" aria-label="Choose a cuisine"><div>{CUISINES.filter(c=>['all','south_indian','chinese','pizza','cafe'].includes(c.id)).map(c=><button key={c.id} aria-pressed={cuisine===c.id} onClick={()=>{setSelected(null);setCuisine(c.id);setListOpen(false)}}>{c.label}</button>)}</div>{(finding||cuisinePending)&&<span className="cuisine-loading" role="status">Finding food spots…</span>}</div>}
   </div>
   <div className="explore-workspace">
    <div className="map-pane"><WorldMap destination={destination} onError={error} places={places} photos={placePhotos} selectedId={selected?.id} selectedPlace={selected} onSelect={selectPlace} onGroup={selectGroup} pixel={pixel} onVisiblePlaces={receiveVisiblePlaces} mystery={mystery} revealed={revealed} flat={flat} dark={dark} onViewportChange={receiveViewport} mist={mist} visits={visits} itinerary={itinerary} itineraryVersion={itineraryVersion}/>
     <div className="map-action-bar"><Button variant="primary" onClick={()=>nearby(true)}><AppIcon name="sparkles" size={17}/>Surprise me</Button><IconButton icon="settings" label="Map options" aria-expanded={optionsOpen} onClick={()=>setOptionsOpen(!optionsOpen)}/></div>
     <div className="map-location-control"><IconButton icon="compass" label="Find my location" onClick={locate}/></div>
     {optionsOpen&&<aside className="map-options-panel" aria-label="Map options"><div className="options-heading"><h2>Make it your kind of map</h2><IconButton icon="close" label="Close map options" onClick={()=>setOptionsOpen(false)}/></div><label>Search distance<select value={radius} onChange={e=>{setSelected(null);setRadius(Number(e.target.value))}}>{![1,3,5,10].includes(radius)&&<option value={radius}>{radius} km</option>}{[1,3,5,10].map(n=><option key={n} value={n}>{n} km</option>)}</select></label><div className="option-buttons"><Button aria-pressed={!flat} onClick={()=>setFlat(!flat)}>{flat?'Use 3D buildings':'Use flat map'}</Button><Button aria-pressed={pixel} onClick={()=>{setPixel(!pixel);try{localStorage.setItem('explorearoundyou-style',pixel?'classic':'pixel')}catch{}}}>{pixel?'Pixel World':'Nature Explorer'}</Button><Button disabled={!account.interests.length} aria-pressed={preferredOnly} onClick={()=>setPreferredOnly(!preferredOnly)}>For you {preferredOnly?'on':'off'}</Button><Button onClick={onProfileRequest}>Choose interests</Button></div><details className="optional-adventures"><summary>More ways to explore</summary><Button aria-pressed={mist} onClick={toggleMist}>Exploration mist {mist?'on':'off'}</Button><Button aria-pressed={mystery} onClick={()=>setMystery(!mystery)}>Mystery pins {mystery?'on':'off'}</Button><Button onClick={()=>{setJournal(true);setSelected(null);setOptionsOpen(false)}}>Three-stop ideas &amp; badges</Button><AdventureSearch onApply={parsed=>{void account.record(`${parsed.category} within ${parsed.radius??radius} km`,parsed.category);setCategory(parsed.category);setCategoryId(parsed.kind==='cafe'?'Cafes':parsed.category as DiscoveryCategoryId);setCuisine(parsed.kind==='cafe'?'cafe':'all');if(parsed.radius!==undefined)setRadius(parsed.radius);setIntent(parsed);setSelected(null);setOptionsOpen(false)}}/></details>{finding?<Button onClick={cancelDiscovery}>Cancel online search</Button>:<Button onClick={()=>nearby(false,true)}>Search a wider area</Button>}{discoveryError&&<p className="discovery-error" role="status">{discoveryError}</p>}</aside>}
    </div>
    <div className={`discovery-panel ${listOpen||journal||collection||detailExpanded?'panel-expanded':''} ${selected?'has-selection':''}`}>
     {selected&&!listOpen&&!journal&&!collection&&<PlaceCard key={selected.id} place={selected} center={center} surprise={surprise} saved={saved.some(p=>p.id===selected.id)} visited={visits.some(v=>samePlace(v,selected))} onClose={()=>{setSelected(null);setDetailExpanded(false)}} onSave={bookmark} onVisit={toggleVisit} onAddToTrip={onAddToTrip} photo={placePhotos[selected.id]} onPhoto={photo=>setPlacePhotos(old=>({...old,[selected.id]:photo}))} onExpand={setDetailExpanded} distanceLabel={distanceLabel}/>}
     {journal&&<JourneyPanel places={places.length?places:visiblePlaces.current} center={center} radius={radius} visits={visits} onSelect={p=>{selectPlace(p);setDestination(p)}} onClose={()=>setJournal(false)} mist={mist} onToggleMist={toggleMist} onReset={()=>{updateVisits([]);setRevealed([]);setMessage('Visit progress cleared. Saved places are kept.')}}/>}
     {collection&&<aside className="place-card"><IconButton icon="close" label="Close saved places" onClick={()=>setCollection(false)}/><h2>Places worth keeping</h2><DiscoveryCards expanded places={saved} photos={placePhotos} busy={false} category="Saved places" onSelect={chooseCard} onBrowse={()=>{}} onClear={clearFilters}/></aside>}
     {!selected&&!journal&&!collection&&<><div className="panel-handle"/><div className="discovery-panel-heading"><div><h2>{listOpen?'Places to explore':viewMode==='map'?'Around this area':discoveryTitle==='All places'?'A little inspiration nearby':discoveryTitle}</h2><p>{places.length} discoveries · {distanceLabel}</p></div><Button variant="quiet" aria-expanded={listOpen} onClick={()=>{setGroup(null);setListOpen(!listOpen)}}>{listOpen?'Less':'See all'}<AppIcon name={listOpen?'close':'arrow'} size={17}/></Button></div>{finding&&listOpen&&<div className="discovery-progress" role="status">Finding more places…<Button variant="quiet" onClick={cancelDiscovery}>Cancel</Button></div>}<DiscoveryCards expanded={listOpen} places={group||places} photos={placePhotos} busy={photoBusy||finding||cuisinePending} category={discoveryTitle} onSelect={chooseCard} onBrowse={()=>setListOpen(true)} onClear={category==='Food'&&cuisine!=='all'?()=>setCuisine('all'):clearFilters} resetLabel={category==='Food'&&cuisine!=='all'?'Show all food':'Show all places'}/>{discoveryError&&listOpen&&<p className="discovery-error" role="status">{discoveryError}</p>}</>}
    </div>
   </div>
   {message&&<div className="toast" role="status"><span>{message}</span><IconButton icon="close" label="Dismiss notification" onClick={()=>setMessage('')}/></div>}
  </section>
 </main>;
}

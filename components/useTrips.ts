'use client';
import {useEffect,useRef,useState} from 'react';
import {initialTripPlaces,readTrips,sanitizeStopDays,TRIPS_KEY,validateTrip,type Trip,type TripInput} from '../lib/trips';
import type {Place} from '../lib/places';
export function useTrips(){
 const [trips,setTrips]=useState<Trip[]>([]),[ready,setReady]=useState(false),[error,setError]=useState('');const current=useRef<Trip[]>([]),available=useRef(false);
 useEffect(()=>{try{const stored=readTrips(localStorage.getItem(TRIPS_KEY));current.current=stored;setTrips(stored);available.current=true}catch{setError('Trip storage is unavailable in this browser. Try a regular browser window.')}setReady(true);const sync=(e:StorageEvent)=>{if(e.key!==TRIPS_KEY)return;const next=readTrips(e.newValue);current.current=next;setTrips(next)};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 function persist(next:Trip[]){if(!available.current){setError('Trip storage is unavailable in this browser.');return false}try{localStorage.setItem(TRIPS_KEY,JSON.stringify(next));current.current=next;setTrips(next);setError('');return true}catch{setError('Your changes could not be saved. Browser storage may be full. Your previous trips are kept.');return false}}
 function create(input:TripInput,initialPlaces:Place[]=[]){try{if(current.current.length>=100)throw Error('You have reached 100 trips. Remove an old trip before creating another.');const trip:Trip={...validateTrip(input),id:crypto.randomUUID(),createdAt:new Date().toISOString(),places:initialTripPlaces(initialPlaces),memories:[],bookmarked:false};return persist([trip,...current.current])?trip:null}catch(e){setError(e instanceof Error?e.message:'Trip could not be created.');return null}}
 function update(trip:Trip){try{const input=validateTrip(trip);if(trip.places.length>100||trip.memories.length>100)throw Error('Each trip supports up to 100 places and 100 memories.');if(!current.current.some(p=>p.id===trip.id))throw Error('This trip is no longer saved.');const next={...trip,...input,stopDays:sanitizeStopDays(trip.stopDays,trip.places,input.startDate,input.endDate)};return persist(current.current.map(p=>p.id===trip.id?next:p))}catch(e){setError(e instanceof Error?e.message:'Trip could not be saved.');return false}}
 function remove(id:string){return persist(current.current.filter(p=>p.id!==id))}
 return {trips,ready,error,create,update,remove};
}

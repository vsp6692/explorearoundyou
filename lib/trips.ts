import type {Place} from './places';
import {readBookmarks} from './bookmarks';
import {samePlace} from './adventures';
export type TripCover='coast'|'mountains'|'city';
export type TripInput={name:string;destination:string;startDate:string;endDate:string;travellers:number;cover:TripCover};
export type Trip=TripInput&{id:string;places:Place[];stopDays?:Record<string,string>;memories:{id:string;text:string;createdAt:string}[];createdAt:string;bookmarked:boolean};
export const TRIPS_KEY='explorearoundyou-trips';
export function validDate(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value}
export function validateTrip(input:TripInput){
 if(!input.name.trim()||input.name.trim().length>80)throw Error('Give your trip a name, up to 80 characters.');
 if(!input.destination.trim()||input.destination.trim().length>160)throw Error('Add a destination, up to 160 characters.');
 if((input.startDate||input.endDate)&&(!validDate(input.startDate)||!validDate(input.endDate)||input.endDate<input.startDate))throw Error('Choose valid start and end dates, with the end after the start.');
 if(!Number.isInteger(input.travellers)||input.travellers<1||input.travellers>20)throw Error('Choose between 1 and 20 travellers.');
 if(!['coast','mountains','city'].includes(input.cover))throw Error('Choose a cover.');
 return {name:input.name.trim(),destination:input.destination.trim(),startDate:input.startDate,endDate:input.endDate,travellers:input.travellers,cover:input.cover};
}
export function tripStatus(trip:Pick<Trip,'startDate'|'endDate'>,today=new Date()){const local=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);return !trip.startDate||!trip.endDate?'Draft':trip.startDate>local?'Upcoming':trip.endDate<local?'Completed':'Ongoing'}
export function tripDates(trip:Pick<Trip,'startDate'|'endDate'>){if(!trip.startDate)return 'Dates to dream about';const format=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});return `${format(trip.startDate)} – ${format(trip.endDate)}`}
/** A stop's day is optional; changing dates or removing stops drops stale assignments. */
export function sanitizeStopDays(value:unknown,places:Pick<Place,'id'>[],startDate:string,endDate:string):Record<string,string>|undefined{
 if(!value||typeof value!=='object'||Array.isArray(value)||!validDate(startDate)||!validDate(endDate)||endDate<startDate)return undefined;
 const entries=places.slice(0,100).flatMap(place=>{
  if(!Object.prototype.hasOwnProperty.call(value,place.id))return [];
  const day=(value as Record<string,unknown>)[place.id];
  return validDate(day)&&day>=startDate&&day<=endDate?[[place.id,day] as [string,string]]:[];
 });
 return entries.length?Object.fromEntries(entries):undefined;
}
/** Validated initial stops are included in the first storage write of a new trip. */
export function initialTripPlaces(input:Place[]=[]):Place[]{
 const places:Place[]=[];
 for(const place of readBookmarks(JSON.stringify(input))){
  if(places.some(existing=>samePlace(existing,place)))continue;
  if(places.length===100)throw Error('Each trip supports up to 100 places.');
  places.push(place);
 }
 return places;
}
export function readTrips(raw:string|null):Trip[]{
 try{const rows:unknown=JSON.parse(raw||'[]');if(!Array.isArray(rows))return [];const seen=new Set<string>();return rows.slice(0,100).flatMap(row=>{
  if(!row||typeof row!=='object')return [];const p=row as Trip;
  if(typeof p.id!=='string'||!p.id||seen.has(p.id)||typeof p.name!=='string'||typeof p.destination!=='string'||typeof p.startDate!=='string'||typeof p.endDate!=='string'||typeof p.createdAt!=='string'||!Number.isFinite(Date.parse(p.createdAt)))return [];
  let input:TripInput;try{input=validateTrip(p)}catch{return []}
  const memoryIds=new Set<string>();const memories=Array.isArray(p.memories)?p.memories.slice(0,100).flatMap(m=>{if(!m||typeof m.id!=='string'||memoryIds.has(m.id)||typeof m.text!=='string'||!m.text.trim()||typeof m.createdAt!=='string'||!Number.isFinite(Date.parse(m.createdAt)))return [];memoryIds.add(m.id);return [{id:m.id,text:m.text.slice(0,2000),createdAt:m.createdAt}]}):[];
  const places=readBookmarks(JSON.stringify(p.places||[])).slice(0,100),stopDays=sanitizeStopDays(p.stopDays,places,input.startDate,input.endDate);
  seen.add(p.id);return [{...input,id:p.id,createdAt:p.createdAt,bookmarked:p.bookmarked===true,places,...(stopDays?{stopDays}:{}),memories}];
 })}catch{return []}
}

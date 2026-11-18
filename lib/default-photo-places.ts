import {appPath} from './app-path';
import records from '../public/data/chennai-photo-places.json';
import {distanceKm} from './places';
import type {NearbyPhotoPlace} from './nearby-photos';
// A small attributed snapshot of real Chennai landmarks loads immediately. It
// is never reused for another area or presented as a live venue directory.
export function defaultPhotoPlaces(lat:number,lon:number,radius:number):NearbyPhotoPlace[]{
 if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180||!Number.isFinite(radius)||radius<.1||radius>10)return [];
 return (records as NearbyPhotoPlace[]).map(item=>({...item,photo:{...item.photo,src:appPath(item.photo.src)},place:{...item.place,distance:distanceKm(lat,lon,item.place.lat,item.place.lon)}})).filter(item=>item.place.distance<=radius);
}

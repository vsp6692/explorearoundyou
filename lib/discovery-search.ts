import {parseSearchIntent} from './search-intent';
import {CUISINES} from './cuisines';
/** Only unambiguous category phrases bypass worldwide name/location search. */
export type DiscoveryRequest={category:string;categoryId:string;cuisine:string;radius?:number;destination?:string};
export function discoverySearch(input:string):DiscoveryRequest|null{
 const text=input.trim().toLowerCase().replace(/\s+/g,' ');
 const area=text.match(/^(.+?)\s+in\s+(.+)$/);
 if(area){const filter=discoverySearch(area[1]);if(filter)return {...filter,destination:area[2]}}
 const cuisine=CUISINES.find(c=>c.id!=='all'&&text.replace(/\s+(?:food|restaurants?)\b/,'').replace(/\s+(near me|nearby)$/,'')===c.label.toLowerCase());
 if(cuisine)return {category:'Food',categoryId:cuisine.id==='cafe'?'Cafes':'Food',cuisine:cuisine.id,radius:undefined as number|undefined};
 if(!/^(caf[eé]s?|coffee shops?|restaurants?|food|hotels?|hostels?|stays|parks?|nature|beach(?:es)?|museums?|attractions?|shopping|shops?|activities|fun)(?:\s+(?:near me|nearby))?(?:\s+within\s+\d+(?:\.\d+)?\s*(?:km|m))?$/.test(text))return null;
 const parsed=parseSearchIntent(text.replace('coffee shops','cafes').replace('activities','fun'));
 return {category:parsed.category,categoryId:parsed.kind==='cafe'?'Cafes':parsed.category==='Fun'?'Activities':parsed.category,cuisine:parsed.kind==='cafe'?'cafe':'all',radius:parsed.radius};
}

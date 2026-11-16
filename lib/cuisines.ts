import type {Place} from './places';
export const CUISINES=[
 {id:'all',label:'All food',icon:'🍽️',tags:[]},
 {id:'south_indian',label:'South Indian',icon:'🥞',tags:['south_indian','tamil','dosa','idli']},
 {id:'indian',label:'Indian',icon:'🍛',tags:['indian','north_indian','south_indian']},
 {id:'chinese',label:'Chinese',icon:'🥡',tags:['chinese']},
 {id:'pizza',label:'Pizza & Italian',icon:'🍕',tags:['pizza','italian']},
 {id:'burgers',label:'Burgers',icon:'🍔',tags:['burger']},
 {id:'japanese',label:'Japanese',icon:'🍣',tags:['japanese','sushi']},
 {id:'cafe',label:'Cafés',icon:'☕',tags:['coffee_shop']},
] as const;
export function cuisineTags(value?:string){return (value||'').toLowerCase().split(/[;,]/).map(v=>v.trim().replaceAll(' ','_')).filter(Boolean)}
export function cuisineNames(value?:string){return cuisineTags(value).map(v=>v.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()))}
export function matchesCuisine(place:Place,id:string){if(id==='all')return true;const choice=CUISINES.find(c=>c.id===id);if(!choice)return false;if(id==='cafe'&&/^(cafe|coffee shop)$/i.test(place.kind))return true;return cuisineTags(place.cuisine).some(tag=>(choice.tags as readonly string[]).includes(tag))}
export function cuisineSelector(id:string){const choice=CUISINES.find(c=>c.id===id);if(!choice)throw Error('Unknown cuisine');if(id==='all')return '';if(id==='cafe')return '[amenity="cafe"]';return `[cuisine~"(^|[;,])[ ]*(${choice.tags.join('|')})[ ]*([;,]|$)" ,i]`}

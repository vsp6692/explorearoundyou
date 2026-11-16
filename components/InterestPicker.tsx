'use client';
import {HISTORY_CATEGORIES} from '../lib/history';
const icons:Record<string,string>={Food:'🍜',Stays:'🛏️',Beaches:'🏖️',Parks:'🌿',Attractions:'🎡',Shopping:'🛍️',Fun:'🎨'};
export default function InterestPicker({value,onChange,disabled=false}:{value:string[];onChange:(next:string[])=>void;disabled?:boolean}){
 return <fieldset className="interest-picker" disabled={disabled}><legend>What do you love exploring?</legend><p>Pick a few favourites. We’ll suggest matching places first.</p><div>{HISTORY_CATEGORIES.map(category=><button type="button" key={category} aria-pressed={value.includes(category)} onClick={()=>onChange(value.includes(category)?value.filter(v=>v!==category):[...value,category])}><span aria-hidden="true">{icons[category]}</span> {category}{value.includes(category)?' ✓':''}</button>)}</div></fieldset>;
}

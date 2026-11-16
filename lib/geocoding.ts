// One shared queue for submitted city searches and selected-place lookups.
let tail:Promise<unknown>=Promise.resolve(),lastStart=0;
const cache=new Map<string,{at:number;data:unknown}>();
export function geocodeJson(url:URL,signal:AbortSignal):Promise<unknown>{
 const key=url.href,old=cache.get(key);if(old&&Date.now()-old.at<900000&&!signal.aborted)return Promise.resolve(old.data);
 const task=tail.catch(()=>{}).then(async()=>{
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  const wait=1100-(Date.now()-lastStart);if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));
  if(signal.aborted)throw new DOMException('Aborted','AbortError');lastStart=Date.now();
  const response=await fetch(url,{signal});if(!response.ok)throw Error('Place information is temporarily unavailable.');
  const data:unknown=await response.json();cache.set(key,{at:Date.now(),data});if(cache.size>50)cache.delete(cache.keys().next().value!);return data;
 });tail=task;return task;
}

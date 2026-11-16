// Submitted searches and selected-place lookups share one rate-limited queue.
let tail:Promise<unknown>=Promise.resolve(),lastStart=0;
const cache=new Map<string,{at:number;data:unknown}>();
const aborted=()=>new DOMException('Aborted','AbortError');
function untilAbort<T>(promise:Promise<T>,signal:AbortSignal):Promise<T>{
 if(signal.aborted)return Promise.reject(aborted());
 return new Promise((resolve,reject)=>{
  const onAbort=()=>{signal.removeEventListener('abort',onAbort);reject(aborted())};
  signal.addEventListener('abort',onAbort,{once:true});
  promise.then(value=>{signal.removeEventListener('abort',onAbort);resolve(value)},error=>{signal.removeEventListener('abort',onAbort);reject(error)});
 });
}
function delay(ms:number,signal:AbortSignal){
 return new Promise<void>((resolve,reject)=>{
  if(signal.aborted){reject(aborted());return}
  const timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve()},ms);
  const onAbort=()=>{clearTimeout(timer);signal.removeEventListener('abort',onAbort);reject(aborted())};
  signal.addEventListener('abort',onAbort,{once:true});
 });
}
export function geocodeJson(url:URL,signal:AbortSignal,refresh=false):Promise<unknown>{
 if(signal.aborted)return Promise.reject(aborted());
 const key=url.href;
 const cached=()=>{const old=cache.get(key);return !refresh&&old&&Date.now()-old.at<900000?old:undefined};
 const old=cached();if(old)return Promise.resolve(old.data);
 const task=tail.catch(()=>{}).then(async()=>{
  if(signal.aborted)throw aborted();
  const old=cached();if(old)return old.data;
  const wait=1100-(Date.now()-lastStart);if(wait>0)await delay(wait,signal);
  if(signal.aborted)throw aborted();lastStart=Date.now();
  const response=await fetch(key,{signal});if(!response.ok)throw Error('Place information is temporarily unavailable.');
  const data:unknown=await response.json();if(signal.aborted)throw aborted();
  cache.set(key,{at:Date.now(),data});if(cache.size>50)cache.delete(cache.keys().next().value!);return data;
 });
 tail=task;
 // The caller can leave immediately while a different queued lookup finishes.
 return untilAbort(task,signal);
}

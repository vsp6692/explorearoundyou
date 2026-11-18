export type LocationFix={lat:number;lon:number;accuracy:number;timestamp:number};
export type LocationResult={status:'located';fix:LocationFix}|{status:'denied'|'timeout'|'unavailable'|'cancelled';message:string};
export const INITIAL_AREA={name:'Choose an area',lat:20,lon:0};
export const FALLBACK_AREA={name:'Chennai · example area',lat:13.0827,lon:80.2707};
export function validLocation(position:GeolocationPosition,now=Date.now()):LocationFix|null{
 const {latitude:lat,longitude:lon,accuracy}=position.coords;
 const timestamp=position.timestamp;
 if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180||!Number.isFinite(accuracy)||accuracy<0||!Number.isFinite(timestamp)||now-timestamp>120000||timestamp-now>60000)return null;
 return {lat,lon,accuracy,timestamp};
}
/** A newer request or explicit destination always supersedes older GPS callbacks. */
export function createLocationRequest(){
 let cancelCurrent:(()=>void)|undefined;
 function cancel(){cancelCurrent?.();cancelCurrent=undefined}
 function request(geo:Pick<Geolocation,'getCurrentPosition'>|undefined,timeoutMs=10000):Promise<LocationResult>{
  cancel();
  if(!geo)return Promise.resolve({status:'unavailable',message:'Location is unavailable. Search for a city or choose an area.'});
  return new Promise(resolve=>{
   let done=false;
   const finish=(result:LocationResult)=>{if(done)return;done=true;clearTimeout(timer);if(cancelCurrent===stop)cancelCurrent=undefined;resolve(result)};
   const stop=()=>finish({status:'cancelled',message:''});
   const timer=setTimeout(()=>finish({status:'timeout',message:'Location timed out. Retry or search for a city.'}),timeoutMs);
   cancelCurrent=stop;
   try{geo.getCurrentPosition(position=>{
    const fix=validLocation(position);
    finish(fix?{status:'located',fix}:{status:'unavailable',message:'Your location was stale or invalid. Retry or search for a city.'});
   },error=>finish(error.code===1?{status:'denied',message:'Location permission was declined. You can enable it in browser settings or search for a city.'}:error.code===3?{status:'timeout',message:'Location timed out. Retry or search for a city.'}:{status:'unavailable',message:'Your location could not be found. Retry or search for a city.'}),{timeout:timeoutMs,maximumAge:30000,enableHighAccuracy:true})}
   catch{finish({status:'unavailable',message:'Location is unavailable. Search for a city.'})}
  });
 }
 return {request,cancel};
}

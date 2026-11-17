import {safeWebsite} from './search-intent';

// Preserve only the source URLs this app actually creates. Metadata is not HTML.
export function placeSource(value?:string):string|undefined{
 if(!value||value.length>2000)return;
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.hash)return;
  if(url.hostname==='www.wikidata.org'&&/^\/wiki\/Q\d+$/.test(url.pathname)&&!url.search)return url.href;
  if(url.hostname==='www.openstreetmap.org'&&/^\/(node|way|relation)\/\d+$/.test(url.pathname)&&!url.search)return url.href;
  if(url.hostname==='en.wikipedia.org'&&url.pathname==='/'&&/^\?curid=[1-9]\d*$/.test(url.search))return url.href;
 }catch{}
}
export function placeWebsite(value?:string):{url:string;label:string}|undefined{
 const url=safeWebsite(value);if(!url)return;
 const host=new URL(url).hostname;
 return {url,label:host==='en.wikipedia.org'?'Read on Wikipedia':host==='www.wikidata.org'?'Read on Wikidata':'Venue website (mapped)'};
}

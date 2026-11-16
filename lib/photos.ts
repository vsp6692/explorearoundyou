export type CommonsPhoto={src:string;page:string;title:string;author:string;credit:string;license:string;licenseUrl:string};
const record=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'?value as Record<string,unknown>:{};
function httpsHost(value:unknown,host:string){try{const u=new URL(String(value));return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password?u.href:undefined}catch{return undefined}}
export function commonsTitle(value:unknown):string|undefined{
 if(typeof value!=='string')return;
 let title=value.trim();
 if(title.startsWith('https://')){const safe=httpsHost(title,'commons.wikimedia.org');if(!safe)return;const url=new URL(safe);if(!url.pathname.startsWith('/wiki/'))return;try{title=decodeURIComponent(url.pathname.slice(6))}catch{return}}
 if(title.length>255||/[\x00-\x1f|]/.test(title)||!/^File:.+\.(jpe?g|png|webp)$/i.test(title))return;
 return 'File:'+title.slice(5).replaceAll('_',' ');
}
// Metadata is HTML; display text only, never inject it into the document.
function plain(value:unknown){return typeof value==='string'?value.replace(/<\/(?:p|li|div)>/gi,'; ').replace(/<[^>]*>/g,'').replace(/&(?:amp|lt|gt|quot|apos|#39);/g,v=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}[v]!)).trim():''}
export function parseCommonsPhoto(payload:unknown):CommonsPhoto|undefined{
 const pages=record(record(payload).query).pages;if(!Array.isArray(pages))return;
 const page=record(pages[0]),info=record(Array.isArray(page.imageinfo)?page.imageinfo[0]:null),metadata=record(info.extmetadata);
 const text=(key:string)=>plain(record(metadata[key]).value);
 const license=text('LicenseShortName');
 const match=license.match(/^CC BY(-SA)? (1\.0|2\.0|2\.5|3\.0|4\.0)$/);
 const licenseUrl=match?`https://creativecommons.org/licenses/by${match[1]?'-sa':''}/${match[2]}/`:license==='CC0'?'https://creativecommons.org/publicdomain/zero/1.0/':undefined;
 const src=httpsHost(info.thumburl,'upload.wikimedia.org')||httpsHost(info.thumburl,'thumb.wikimedia.org'),link=httpsHost(info.descriptionurl,'commons.wikimedia.org'),title=commonsTitle(page.title),author=text('Artist'),credit=text('Attribution')||text('Credit');
 if(!src||!link||!title||!author||!licenseUrl||author.length>2000||credit.length>4000||!['image/jpeg','image/png','image/webp'].includes(String(info.mime)))return;
 // Reject a contradictory license URL rather than guessing at a file's terms.
 const advertised=String(record(metadata.LicenseUrl).value||'').replace(/^http:/,'https:').replace(/\/$/,'');
 if(advertised&&advertised!==licenseUrl.replace(/\/$/,''))return;
 return {src,page:link,title:title.slice(5),author,credit,license,licenseUrl};
}
const cache=new Map<string,CommonsPhoto>();
export async function loadCommonsPhoto(title:string,signal:AbortSignal):Promise<CommonsPhoto>{
 const normalized=commonsTitle(title);if(!normalized)throw Error('No supported Wikimedia photo reference is mapped here.');
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const cached=cache.get(normalized);if(cached)return cached;
 const url=new URL('https://commons.wikimedia.org/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',prop:'imageinfo',titles:normalized,iiprop:'url|mime|extmetadata',iiurlwidth:'640'}).toString();
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Wikimedia is unavailable. Try again later.');
 const photo=parseCommonsPhoto(await response.json());if(!photo)throw Error('A supported photo with complete attribution is not available.');
 cache.set(normalized,photo);if(cache.size>30)cache.delete(cache.keys().next().value!);return photo;
}

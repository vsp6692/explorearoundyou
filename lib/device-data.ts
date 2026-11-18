import {readTrips,type Trip} from './trips';
import {readBookmarks} from './bookmarks';
import {readVisits,samePlace,type Visit} from './adventures';
import {fallbackThemes,restoreThemePreferences,themePreferenceRecord} from './preference-themes';
import {cleanInterests} from './interests';
import type {Place} from './places';
export const DATA_EVENT='explorearoundyou-data-change';
export const TRANSACTION_KEY='explorearoundyou-storage-transaction';
export const MAX_BACKUP_BYTES=10*1024*1024;
export const DEVICE_KEYS=['explorearoundyou-trips','explorearoundyou-saved','explorearoundyou-visits','explorearoundyou-interests','explorearoundyou-theme','explorearoundyou-style','explorearoundyou-mist','explorearoundyou-welcome','explorearoundyou-interest-themes:guest'] as const;
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type DeviceBackup={format:'explorearoundyou-backup';version:1;exportedAt:string;data:{trips:Trip[];saved:Place[];visits:Visit[];interests:string[];preferences:Record<string,string>}};
function allowed(key:string){return (DEVICE_KEYS as readonly string[]).includes(key)||key.startsWith('explorearoundyou-interest-themes:')&&key.length<250}
function restore(store:Store,before:Record<string,string|null>){for(const key of Object.keys(before).reverse()){const value=before[key];if(value===null)store.removeItem(key);else store.setItem(key,value)}}
/** Recovery rolls an interrupted multi-key operation back before reading device data. */
export function recoverDeviceStorage(store:Store){
 const raw=store.getItem(TRANSACTION_KEY);if(!raw)return;
 const journal=JSON.parse(raw);
 if(journal?.version!==1||!journal.before||typeof journal.before!=='object'||Array.isArray(journal.before)||Object.keys(journal.before).length>200||Object.entries(journal.before).some(([k,v])=>!allowed(k)||(v!==null&&typeof v!=='string')))throw Error('A storage recovery record is unreadable. Download a recovery file before making changes.');
 if(typeof journal.startedAt==='number'&&Date.now()-journal.startedAt<10000)throw Error('A device update is finishing. Wait a moment and retry.');
 restore(store,journal.before);store.removeItem(TRANSACTION_KEY);
}
export function applyDeviceChanges(store:Store,changes:Record<string,string|null>,expected?:Record<string,string|null>){
 recoverDeviceStorage(store);
 const keys=Object.keys(changes);if(keys.some(k=>!allowed(k)))throw Error('Unsupported device data key.');
 const before=Object.fromEntries(keys.map(k=>[k,store.getItem(k)]));
 if(expected&&Object.entries(expected).some(([k,v])=>store.getItem(k)!==v))throw Error('Your device data changed. Preview the import again.');
 // If the safety record does not fit, fail before changing any user data.
 store.setItem(TRANSACTION_KEY,JSON.stringify({version:1,startedAt:Date.now(),before}));
 try{for(const key of keys){const value=changes[key];if(value===null)store.removeItem(key);else store.setItem(key,value)}store.removeItem(TRANSACTION_KEY)}
 catch(error){try{restore(store,before);store.removeItem(TRANSACTION_KEY)}catch{throw Error('Storage recovery is pending. Keep this browser open and download a recovery file.')}throw error}
}
function validateData(data:unknown):DeviceBackup['data']{
 if(!data||typeof data!=='object')throw Error('The backup has no device data.');
 const d=data as DeviceBackup['data'];
 if(!Array.isArray(d.trips)||d.trips.length>100||!Array.isArray(d.saved)||d.saved.length>2000||!Array.isArray(d.visits)||d.visits.length>2000||!Array.isArray(d.interests)||d.interests.length>7)throw Error('The backup contains invalid collections or exceeds supported limits.');
 for(const t of d.trips)if(!t||!Array.isArray(t.places)||t.places.length>100||!Array.isArray(t.memories)||t.memories.length>100)throw Error('A trip exceeds the supported place or note limit.');
 const trips=readTrips(JSON.stringify(d.trips)),saved=readBookmarks(JSON.stringify(d.saved)),visits=readVisits(JSON.stringify(d.visits)),interests=cleanInterests(d.interests);
 if(trips.length!==d.trips.length||saved.length!==d.saved.length||visits.length!==d.visits.length||interests.length!==d.interests.length||trips.some((t,i)=>t.places.length!==d.trips[i].places.length||t.memories.length!==d.trips[i].memories.length))throw Error('The backup contains invalid or duplicate records. Nothing has been imported.');
 const preferences:Record<string,string>={};
 const values:Record<string,string[]>={'explorearoundyou-theme':['light','dark'],'explorearoundyou-style':['classic','pixel'],'explorearoundyou-mist':['on','off'],'explorearoundyou-welcome':['dismissed']};
 if(d.preferences&&typeof d.preferences==='object'&&!Array.isArray(d.preferences))for(const [k,v] of Object.entries(d.preferences))if(Object.hasOwn(values,k)&&values[k].includes(v))preferences[k]=v;
 const themeKey=DEVICE_KEYS[8];
 if(typeof d.preferences?.[themeKey]==='string'){const ids=restoreThemePreferences(d.preferences[themeKey],interests);if(ids)preferences[themeKey]=JSON.stringify(themePreferenceRecord(ids))}
 return {trips,saved,visits,interests,preferences};
}
export function parseDeviceBackup(raw:string):DeviceBackup{
 if(new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES)throw Error('This backup is too large (maximum 10 MB).');
 let b:unknown;try{b=JSON.parse(raw)}catch{throw Error('Choose a valid Explore Around You JSON backup.');}
 const backup=b as DeviceBackup;
 if(backup?.format!=='explorearoundyou-backup'||backup.version!==1)throw Error('This backup format/version is not supported. Your existing data is unchanged.');
 if(typeof backup.exportedAt!=='string'||!Number.isFinite(Date.parse(backup.exportedAt)))throw Error('The backup date is invalid.');
 return {format:'explorearoundyou-backup',version:1,exportedAt:backup.exportedAt,data:validateData(backup.data)};
}
export function deviceSnapshot(store:Store){return Object.fromEntries(DEVICE_KEYS.map(k=>[k,store.getItem(k)]))}
export function createDeviceBackup(store:Store):DeviceBackup{
 recoverDeviceStorage(store);
 const parse=(key:string,fallback:unknown)=>{const raw=store.getItem(key);if(raw===null)return fallback;try{return JSON.parse(raw)}catch{throw Error('Some local data is unreadable. Download a recovery file instead.')}};
 const data=validateData({trips:parse(DEVICE_KEYS[0],[]),saved:parse(DEVICE_KEYS[1],[]),visits:parse(DEVICE_KEYS[2],[]),interests:parse(DEVICE_KEYS[3],[]),preferences:Object.fromEntries(DEVICE_KEYS.slice(4).flatMap(k=>{const v=store.getItem(k);return v===null?[]:[[k,v]]}))});
 return {format:'explorearoundyou-backup',version:1,exportedAt:new Date().toISOString(),data};
}
export function recoveryFile(store:Store){
 // Never include Supabase sessions, cloud history, or unrelated origin storage.
 return {format:'explorearoundyou-recovery',version:1,exportedAt:new Date().toISOString(),raw:deviceSnapshot(store),pendingTransaction:store.getItem(TRANSACTION_KEY)};
}
export function mergeDeviceBackup(current:DeviceBackup,incoming:DeviceBackup){
 const data=current.data,other=incoming.data;
 const trips=[...data.trips];let existingVersions=0;
 for(const t of other.trips){const old=trips.find(p=>p.id===t.id);if(!old){trips.push(t);continue}existingVersions++;
  const places=[...old.places,...t.places.filter(p=>!old.places.some(s=>samePlace(s,p)))];
  const memories=[...old.memories,...t.memories.filter(n=>!old.memories.some(s=>s.id===n.id))];
  if(places.length>100||memories.length>100)throw Error('Merging would exceed a trip’s 100-place or 100-note limit. No data has changed.');
  const merged=readTrips(JSON.stringify([{...old,places,memories,stopDays:{...t.stopDays,...old.stopDays}}]))[0];trips[trips.indexOf(old)]=merged;
 }
 const saved=[...data.saved,...other.saved.filter(p=>!data.saved.some(s=>samePlace(s,p)))];
 const visits=[...data.visits,...other.visits.filter(p=>!data.visits.some(s=>samePlace(s,p)))];
 if(trips.length>100||saved.length>2000||visits.length>2000)throw Error('Merging would exceed device collection limits. No data has changed.');
 const preferences={...other.preferences,...data.preferences},themeKey=DEVICE_KEYS[8];
 if(preferences[themeKey]){const selected=(d:DeviceBackup['data'])=>restoreThemePreferences(d.preferences[themeKey]||null,d.interests)??fallbackThemes(d.interests);preferences[themeKey]=JSON.stringify(themePreferenceRecord([...selected(data),...selected(other)]))}
 const merged={...current,data:{trips,saved,visits,interests:[...new Set([...data.interests,...other.interests])],preferences}};
 return {backup:parseDeviceBackup(JSON.stringify(merged)),existingVersions};
}
export function backupChanges(backup:DeviceBackup){return {[DEVICE_KEYS[0]]:JSON.stringify(backup.data.trips),[DEVICE_KEYS[1]]:JSON.stringify(backup.data.saved),[DEVICE_KEYS[2]]:JSON.stringify(backup.data.visits),[DEVICE_KEYS[3]]:JSON.stringify(backup.data.interests),...backup.data.preferences}}

export function writeDeviceCollection(store:Store,key:'explorearoundyou-saved'|'explorearoundyou-visits',value:Place[]|Visit[]){
 recoverDeviceStorage(store);
 const raw=store.getItem(key);
 if(raw!==null){let rows:unknown;try{rows=JSON.parse(raw)}catch{throw Error('Stored data is unreadable. Download a recovery file from Profile before changing it.')}
 const clean=key==='explorearoundyou-saved'?readBookmarks(raw):readVisits(raw);
 if(!Array.isArray(rows)||clean.length!==rows.length)throw Error('Some stored records need recovery. Download a recovery file from Profile; no data was overwritten.');}
 store.setItem(key,JSON.stringify(value));
}

/** Reject partially damaged trips before a later edit could overwrite raw records. */
export function readDeviceTrips(store:Store){
 recoverDeviceStorage(store);
 let trips:unknown;try{trips=JSON.parse(store.getItem(DEVICE_KEYS[0])||'[]')}catch{throw Error('Trip data needs recovery. Download a recovery file from Profile before changing it.')}
 return validateData({trips,saved:[],visits:[],interests:[],preferences:{}}).trips;
}

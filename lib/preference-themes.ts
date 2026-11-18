import {HISTORY_CATEGORIES} from './history';

// Themes are optional UI choices; account storage keeps its existing categories.
export const PREFERENCE_THEMES=[
 {id:'food',label:'Food',icon:'food',tone:'peach',categories:['Food']},
 {id:'nature',label:'Nature',icon:'nature',tone:'sage',categories:['Parks']},
 {id:'beaches',label:'Beaches',icon:'beach',tone:'sage',categories:['Beaches']},
 {id:'history',label:'History',icon:'trips',tone:'lilac',categories:['Attractions']},
 {id:'adventure',label:'Adventure',icon:'compass',tone:'peach',categories:['Fun']},
 {id:'photography',label:'Photography',icon:'image',tone:'lilac',categories:['Attractions','Parks','Beaches']},
 {id:'shopping',label:'Shopping',icon:'bookmark',tone:'peach',categories:['Shopping']},
 {id:'relaxation',label:'Relaxation',icon:'sun',tone:'sage',categories:['Parks','Beaches']},
 {id:'culture',label:'Culture',icon:'globe',tone:'lilac',categories:['Attractions']},
 {id:'stays',label:'Hotels & stays',icon:'stay',tone:'lilac',categories:['Stays']},
] as const;
export type PreferenceThemeId=typeof PREFERENCE_THEMES[number]['id'];
const themeIds=new Set<string>(PREFERENCE_THEMES.map(theme=>theme.id));
const fallback:Record<string,PreferenceThemeId>={Food:'food',Stays:'stays',Beaches:'beaches',Parks:'nature',Attractions:'culture',Shopping:'shopping',Fun:'adventure'};
const canonical=(value:readonly string[])=>HISTORY_CATEGORIES.filter(category=>value.includes(category));
const equal=(a:readonly string[],b:readonly string[])=>a.length===b.length&&a.every((value,index)=>value===b[index]);
export function themesToCategories(ids:readonly string[]):string[]{
 const categories=PREFERENCE_THEMES.filter(theme=>ids.includes(theme.id)).flatMap(theme=>[...theme.categories]);
 return canonical(categories);
}
export function fallbackThemes(categories:readonly string[]):PreferenceThemeId[]{return canonical(categories).map(category=>fallback[category])}
export function themePreferenceStorageKey(ownerKey:string){return `explorearoundyou-interest-themes:${encodeURIComponent(ownerKey||'guest')}`}
export function themePreferenceRecord(ids:readonly string[]){
 const selected=PREFERENCE_THEMES.filter(theme=>ids.includes(theme.id)).map(theme=>theme.id);
 return {themeIds:selected,categories:themesToCategories(selected)};
}
/** UI labels are restored only when they describe the current saved interests. */
export function restoreThemePreferences(raw:string|null,currentCategories:readonly string[]):PreferenceThemeId[]|null{
 try{
  const value:unknown=JSON.parse(raw||'null');
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const record=value as Record<string,unknown>;
  if(!Array.isArray(record.themeIds)||!Array.isArray(record.categories)||record.themeIds.length>PREFERENCE_THEMES.length||record.categories.length>HISTORY_CATEGORIES.length)return null;
  if(record.themeIds.some(id=>typeof id!=='string'||!themeIds.has(id))||new Set(record.themeIds).size!==record.themeIds.length)return null;
  if(record.categories.some(category=>typeof category!=='string'||!HISTORY_CATEGORIES.includes(category))||new Set(record.categories).size!==record.categories.length)return null;
  const ids=record.themeIds as PreferenceThemeId[],saved=canonical(record.categories as string[]),projection=themesToCategories(ids);
  if(!equal(saved,projection)||!equal(projection,canonical(currentCategories)))return null;
  return PREFERENCE_THEMES.filter(theme=>ids.includes(theme.id)).map(theme=>theme.id);
 }catch{return null}
}

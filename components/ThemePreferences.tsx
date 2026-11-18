'use client';
import {useEffect,useRef,useState} from 'react';
import AppIcon from './AppIcon';
import {Button} from './ui';
import {PREFERENCE_THEMES,fallbackThemes,restoreThemePreferences,themePreferenceRecord,themePreferenceStorageKey,themesToCategories,type PreferenceThemeId} from '../lib/preference-themes';
type Props={value:string[];ownerKey:string;disabled?:boolean;onSave:(categories:string[])=>Promise<boolean>};
export default function ThemePreferences({value,ownerKey,disabled=false,onSave}:Props){
 const [selection,setSelection]=useState<{owner:string;ids:PreferenceThemeId[]}>(()=>({owner:ownerKey,ids:fallbackThemes(value)}));
 const [saving,setSaving]=useState(false),[status,setStatus]=useState('');
 const owner=useRef(ownerKey);owner.current=ownerKey;
 const pending=useRef<{owner:string;ids:PreferenceThemeId[]}|null>(null);
 const categoriesKey=[...value].sort().join('|');
 const selected=selection.owner===ownerKey?selection.ids:fallbackThemes(value);
 useEffect(()=>{
  let ids:PreferenceThemeId[]|null=null;
  if(pending.current?.owner===ownerKey&&JSON.stringify(themesToCategories(pending.current.ids))===JSON.stringify(themesToCategories(fallbackThemes(value))))ids=pending.current.ids;
  if(!ids)try{ids=restoreThemePreferences(localStorage.getItem(themePreferenceStorageKey(ownerKey)),value)}catch{}
  setSelection({owner:ownerKey,ids:ids||fallbackThemes(value)});setStatus('');
  if(pending.current?.owner!==ownerKey){pending.current=null;setSaving(false)}
 },[ownerKey,categoriesKey]);
 async function save(){
  if(saving||disabled)return;
  const snapshot={owner:ownerKey,ids:[...selected]};pending.current=snapshot;
  setSaving(true);setStatus('');
  try{
   const ok=await onSave(themesToCategories(snapshot.ids));
   if(owner.current!==snapshot.owner)return;
   if(!ok){setStatus('Couldn’t save yet. Your choices are kept here to try again.');return}
   try{localStorage.setItem(themePreferenceStorageKey(snapshot.owner),JSON.stringify(themePreferenceRecord(snapshot.ids)));setStatus('Your interests are saved.')}catch{setStatus('Interests saved. This browser couldn’t remember the theme choices.')}
  }catch{if(owner.current===snapshot.owner)setStatus('Couldn’t save yet. Your choices are kept here to try again.')}
  finally{if(owner.current===snapshot.owner){pending.current=null;setSaving(false)}}
 }
 return <section className="theme-preferences" aria-label="Exploration interests"><fieldset disabled={disabled||saving}><legend>Your kind of exploring</legend><p>Choose what catches your eye. You can change these anytime.</p><div className="preference-theme-grid">{PREFERENCE_THEMES.map(theme=>{const active=selected.includes(theme.id);return <button type="button" className={`preference-theme tone-${theme.tone}`} aria-pressed={active} key={theme.id} onClick={()=>{setStatus('');setSelection({owner:ownerKey,ids:active?selected.filter(id=>id!==theme.id):[...selected,theme.id]})}}><span className="preference-theme-icon"><AppIcon name={theme.icon} size={22}/></span><span>{theme.label}</span><span className="preference-theme-check">{active&&<AppIcon name="check" size={16}/>}</span></button>})}</div></fieldset><p className="preference-explanation">Suggestions match broad place categories. Check place details before you go.</p><Button variant="primary" disabled={disabled||saving} onClick={save}>{saving?'Saving…':'Save my interests'}</Button>{status&&<p className="preference-status" role="status">{status}</p>}</section>;
}

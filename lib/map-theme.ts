import type {Map} from 'maplibre-gl';

// Both themes colour the same real geography; source data and building heights stay intact.
export function applyMapTheme(map:Map,dark:boolean,pixel=false){
 const palette=pixel?(dark?{
  land:'#25364a',water:'#315d99',park:'#41694c',wood:'#30503e',sand:'#a18a55',building:'#977459',extrusion:'#b18565',river:'#4b86b9',text:'#f7e9ae',halo:'#25364a',road:'#a4946e',edge:'#675d50',rail:'#7a8998'
 }:{
  land:'#cce39a',water:'#68b3df',park:'#9dcd69',wood:'#6ba563',sand:'#f4d781',building:'#e3b47b',extrusion:'#ce9268',river:'#529ac8',text:'#284c45',halo:'#f8efc5',road:'#fff0bb',edge:'#bd9b68',rail:'#7d8d76'
 }):(dark?{
  land:'#172f2b',water:'#24535b',park:'#294e3b',wood:'#294e3b',sand:'#675f3d',building:'#45645a',extrusion:'#547467',river:'#38777c',text:'#e1eddb',halo:'#1e352d',road:'#637365',edge:'#3f4e43',rail:'#829084'
 }:{
  land:'#edf3df',water:'#92d3ce',park:'#b5d39b',wood:'#88b98a',sand:'#f3dfab',building:'#d4d9b9',extrusion:'#c7d0b1',river:'#7ebfbc',text:'#3f6150',halo:'#f6f7eb',road:'#f9f4df',edge:'#d4c9ad',rail:'#929b88'
 });
 for(const layer of map.getStyle().layers||[]){
  const source='source-layer' in layer?layer['source-layer']:'';
  if(layer.type==='background')map.setPaintProperty(layer.id,'background-color',palette.land);
  if(layer.type==='fill'){
   let color:string|undefined;
   if(source==='water')color=palette.water;
   if(source==='park'||/wood|grass/.test(layer.id))color=/wood/.test(layer.id)?palette.wood:palette.park;
   if(/sand/.test(layer.id))color=palette.sand;
   if(source==='building')color=palette.building;
   if(color){map.setPaintProperty(layer.id,'fill-color',color);map.setPaintProperty(layer.id,'fill-antialias',!pixel)}
  }
  if(layer.type==='fill-extrusion'){
   map.setPaintProperty(layer.id,'fill-extrusion-color',palette.extrusion);
   map.setPaintProperty(layer.id,'fill-extrusion-opacity',0.88);
   map.setPaintProperty(layer.id,'fill-extrusion-vertical-gradient',!pixel);
  }
  if(layer.type==='line'&&source==='waterway')map.setPaintProperty(layer.id,'line-color',palette.river);
  if(layer.type==='line'&&source==='transportation')map.setPaintProperty(layer.id,'line-color',/rail/.test(layer.id)?palette.rail:/casing|outline|tunnel/.test(layer.id)?palette.edge:palette.road);
  if(layer.type==='symbol'&&layer.layout?.['text-field']){
   map.setPaintProperty(layer.id,'text-color',palette.text);
   map.setPaintProperty(layer.id,'text-halo-color',palette.halo);
  }
 }
}
export function applyNatureTheme(map:Map,dark:boolean){applyMapTheme(map,dark,false)}

import type {Map} from 'maplibre-gl';

/** Recolour actual mapped geography; keep source attribution, labels and building heights. */
export function applyNatureTheme(map:Map,dark:boolean){
 for(const layer of map.getStyle().layers||[]){
  const source='source-layer' in layer?layer['source-layer']:'';
  if(layer.type==='background')map.setPaintProperty(layer.id,'background-color',dark?'#172f2b':'#edf3df');
  if(layer.type==='fill'){
   let color:string|undefined;
   if(source==='water')color=dark?'#24535b':'#92d3ce';
   if(source==='park'||/wood|grass/.test(layer.id))color=dark?'#294e3b':/wood/.test(layer.id)?'#88b98a':'#b5d39b';
   if(/sand/.test(layer.id))color=dark?'#675f3d':'#f3dfab';
   if(source==='building')color=dark?'#45645a':'#d4d9b9';
   if(color)map.setPaintProperty(layer.id,'fill-color',color);
  }
  if(layer.type==='fill-extrusion'){
   map.setPaintProperty(layer.id,'fill-extrusion-color',dark?'#547467':'#c7d0b1');
   map.setPaintProperty(layer.id,'fill-extrusion-opacity',0.88);
  }
  if(layer.type==='line'&&source==='waterway')map.setPaintProperty(layer.id,'line-color',dark?'#38777c':'#7ebfbc');
  if(layer.type==='symbol'&&layer.layout?.['text-field']){
   map.setPaintProperty(layer.id,'text-color',dark?'#e1eddb':'#3f6150');
   map.setPaintProperty(layer.id,'text-halo-color',dark?'#1e352d':'#f6f7eb');
  }
 }
}

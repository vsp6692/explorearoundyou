import type {FilterSpecification,StyleSpecification} from 'maplibre-gl';

const shieldLayers=new Set(['highway-shield-non-us','highway-shield-us-interstate','road_shield_us']);

/** Prepare incoming provider styles before MapLibre resolves any symbols. */
export function prepareMapStyle(style:StyleSpecification):StyleSpecification{
 return {...style,layers:style.layers.map(layer=>{
  if(layer.type==='symbol'&&layer['source-layer']==='poi'){
   // Hidden symbols still keep POI tiles active for querySourceFeatures.
   // visibility:none would stop those source tiles being used by the map.
   return {...layer,layout:{...layer.layout,'icon-image':'','icon-ignore-placement':true,'text-ignore-placement':true},paint:{...layer.paint,'icon-opacity':0,'text-opacity':0}};
  }
  if(layer.type==='symbol'&&layer['source-layer']==='transportation_name'&&shieldLayers.has(layer.id)){
   const filter=layer.filter;
   // Liberty's exact ref_length comparison throws on features without a ref.
   // A type guard preserves valid numeric comparisons and rejects missing/string
   // values, matching the provider's original false fallback without warnings.
   if(Array.isArray(filter)&&filter[0]==='all'){
    let changed=false;
    const guarded=filter.map((predicate,index)=>{
     if(index===0||!Array.isArray(predicate)||predicate.length!==3||predicate[0]!=='<='||predicate[2]!==6)return predicate;
     const field=predicate[1];
     if(!Array.isArray(field)||field.length!==2||field[0]!=='get'||field[1]!=='ref_length')return predicate;
     changed=true;
     return ['case',['==',['typeof',['get','ref_length']],'number'],['<=',['number',['get','ref_length']],6],false];
    });
    if(changed)return {...layer,filter:guarded as FilterSpecification};
   }
  }
  return layer;
 })};
}

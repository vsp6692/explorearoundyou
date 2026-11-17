import type {Place} from './places';
export const DISCOVERY_CATEGORIES=[
 {id:'Everything',label:'All places',base:'Everything',icon:'globe'},
 {id:'Food',label:'Food',base:'Food',icon:'food'},
 {id:'Cafes',label:'Cafés',base:'Food',icon:'food'},
 {id:'Stays',label:'Hotels & stays',base:'Stays',icon:'stay'},
 {id:'Beaches',label:'Beaches',base:'Beaches',icon:'beach'},
 {id:'Parks',label:'Parks',base:'Parks',icon:'nature'},
 {id:'Attractions',label:'Attractions',base:'Attractions',icon:'pin'},
 {id:'Nature',label:'Nature',base:'Everything',icon:'nature'},
 {id:'Adventure',label:'Adventure',base:'Fun',icon:'compass'},
 {id:'Shopping',label:'Shopping',base:'Shopping',icon:'bookmark'},
 {id:'Activities',label:'Activities',base:'Fun',icon:'sparkles'},
] as const;
export type DiscoveryCategoryId=typeof DISCOVERY_CATEGORIES[number]['id'];
export function matchesDiscoveryCategory(place:Place,id:string){
 const kind=place.kind.toLowerCase().replaceAll(' ','_');
 if(id==='Cafes')return place.category==='Food'&&['cafe','coffee_shop'].includes(kind);
 if(id==='Nature')return place.category==='Parks'||place.category==='Beaches'||['nature_reserve','forest','wood','viewpoint'].includes(kind);
 if(id==='Adventure')return ['water_park','adventure_park','climbing','hiking','via_ferrata'].includes(kind);
 return true;
}

import {appPath} from '../lib/app-path';
import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function manifest():MetadataRoute.Manifest{return {id:appPath('/'),name:'Explore Around You',short_name:'Explore Around',description:'Little escapes, lovely places, and memories worth keeping.',start_url:appPath('/'),scope:appPath('/'),display:'standalone',background_color:'#fcf7f4',theme_color:'#fcf7f4',icons:[{src:appPath('/app-icon-192.png'),sizes:'192x192',type:'image/png',purpose:'any'},{src:appPath('/app-icon-512.png'),sizes:'512x512',type:'image/png',purpose:'any'}]}}

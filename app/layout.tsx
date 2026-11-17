import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './trips.css';
import './app-design.css';
import './foundation.css';
import './explore.css';
import './shell.css';
import './trip-polish.css';
import type {Metadata,Viewport} from 'next';
export const metadata:Metadata={title:'Explore Around You — Every place has a story.',description:'Find little adventures, plan a trip, and keep the moments that matter.',applicationName:'Explore Around You',manifest:'/manifest.webmanifest',icons:{icon:'/app-icon.svg',apple:'/apple-touch-icon.png'},appleWebApp:{capable:true,title:'Explore Around You',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#fcf7f4'};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }

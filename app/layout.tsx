import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
export const metadata = { title: 'explorearoundyou — A little curiosity. A new adventure.', description: 'A free, playful map for discovering the world around you.' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }

'use client';
import {appPath} from '../lib/app-path';
export default function ErrorPage({retry}:{error:unknown;retry:()=>void}){
 return <main className="standalone-recovery"><h1>This view couldn’t load.</h1><p>Try again, or open Profile to back up your local adventures. Your data has not been cleared.</p><button onClick={retry}>Try again</button><a href={appPath('/?view=profile')}>Open Profile &amp; backups</a><a href={appPath('/')}>Explore</a></main>;
}

import type {CSSProperties} from 'react';
const paths={
 journal:'M4 3h14a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3Zm0 14h16M8 7h8M8 11h6',up:'m6 15 6-6 6 6',down:'m6 9 6 6 6-6',
 home:'m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
 trips:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16',
 plus:'M12 5v14M5 12h14',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16',
 profile:'M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 search:'m21 21-5-5M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15',arrow:'M4 12h16m-6-6 6 6-6 6',back:'M20 12H4m6-6-6 6 6 6',
 bookmark:'M6 3h12v18l-6-4-6 4Z',image:'M3 3h18v18H3Zm0 14 5-5 5 5 3-3 5 5M8 7h.01',calendar:'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01',
 pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',close:'m6 6 12 12M18 6 6 18',settings:'M4 7h16M4 17h16M8 4v6m8 4v6',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
 moon:'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4',compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4 6-2 6-6 2 2-6Z',folder:'M3 6h7l2 2h9v12H3Zm0 0V4h7l2 2h7',check:'m5 12 4 4L19 6',
 food:'M4 3v6a3 3 0 0 0 6 0V3M7 3v18m13 0V3c-5 4-5 10 0 10',nature:'M12 3c-9 0-10 12-4 14 6 2 13-5 13-14ZM4 21l12-12',stay:'M3 18V8m18 10V8M3 14h18M6 10h4v4m4-4h4v4M3 18v3m18-3v3',
 beach:'M3 14a9 9 0 0 1 18 0H3Zm9-9v16m-4 0h8M5 19h.01M19 19h.01',share:'M12 16V3m-4 4 4-4 4 4M5 12H3v9h18v-9h-2',trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',edit:'m15 4 5 5M3 21l5-1L21 7l-5-5L3 15Z',globe:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c6 6 6 14 0 20-6-6-6-14 0-20ZM2 12h20'
} as const;
export type IconName=keyof typeof paths;
export default function AppIcon({name,size=24,strokeWidth=1.8,className,style}:{name:IconName;size?:number;strokeWidth?:number;className?:string;style?:CSSProperties}){return <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}

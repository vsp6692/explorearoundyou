/** The static host prefix is fixed at build time; local development stays at /. */
export function appPath(path:string){
 const base=process.env.NEXT_PUBLIC_BASE_PATH||'';
 if(base&&!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(base))throw Error('Invalid NEXT_PUBLIC_BASE_PATH');
 if(!path.startsWith('/')||path.startsWith('//'))throw Error('Expected an app-relative path');
 return `${base}${path}`;
}

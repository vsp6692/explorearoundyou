// Isolated PostgreSQL test cluster; never connects to the user's running databases.
// Requires PostgreSQL tools on PATH. Auth schema below simulates Supabase JWT identity.
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const sql=`
 create role anon nologin; create role authenticated nologin;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated;
 grant execute on function auth.uid() to anon,authenticated;
 insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
 ${readFileSync(new URL('../supabase/schema.sql',import.meta.url),'utf8')}
 ${readFileSync(new URL('../supabase/migrations/002_profile_interests.sql',import.meta.url),'utf8')}
 ${readFileSync(new URL('../supabase/migrations/002_profile_interests.sql',import.meta.url),'utf8')}
 ${readFileSync(new URL('./auth-schema.sql',import.meta.url),'utf8')}
 `;
if(process.argv[2]==='--pglite'){
 const {PGlite}=await import(pathToFileURL(process.argv[3]).href);const db=new PGlite();
 try{await db.exec(sql);console.log('PASS: PostgreSQL WASM RLS, user isolation, consent, bounds, expiry and deletion')}finally{await db.close()}
 process.exit(0);
}
const root=mkdtempSync(join(tmpdir(),'explorer-auth-'));
const database=join(root,'db');
function run(bin,args,input){const r=spawnSync(bin,args,{input,encoding:'utf8'});if(r.error||r.status!==0)throw Error(r.error?.message||`${bin}: ${r.stderr}\n${r.stdout}`);return r.stdout}
let started=false;
try{
 run('initdb',['-D',database,'-A','trust','--no-locale','-E','UTF8','-U','postgres']);
 run('pg_ctl',['-D',database,'-l',join(root,'postgres.log'),'-o',`-k ${root} -c listen_addresses=''`,'-w','start']);started=true;

 run('psql',['-h',root,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-X'],sql);
 console.log('PASS: real PostgreSQL RLS, two-user isolation, opt-in enforcement, bounded history, expiry and deletion');
}finally{
 if(started)run('pg_ctl',['-D',database,'-m','immediate','-w','stop']);
 rmSync(root,{recursive:true,force:true});
}

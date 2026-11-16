# Google and Facebook accounts with Supabase

Status: implementation prepared, cloud project and OAuth providers not connected. Guest mode works without these settings. No login credentials are bundled. The public deployment currently shows an honest “not connected” message.

## 1. Create and configure your project

Create a Supabase project in your own account. Apply `supabase/schema.sql` once using its SQL editor. The migration creates profiles, search history, row-level security and the consent-enforcing `record_explorer_search` function. Do not disable RLS to fix a failed request.

Set Auth's Site URL to `https://explorearoundyou.lyric-6185.chatgpt.site/`. Add that exact URL and `http://localhost:3001/` to the redirect allowlist. Add other local ports only when used. The static client returns to `/`; Supabase handles the provider callback and the SDK exchanges the PKCE code in the original browser.

Existing installations: apply `supabase/migrations/002_profile_interests.sql` to add the validated interests array. New `schema.sql` installations already include it. Interests are chosen explicitly and saved independently of history consent. Guest interests remain in browser storage; signing in does not upload them.

## 2. Enable both providers

- Google: create an OAuth web application, copy the callback URL shown in Supabase's Google provider settings into Google's authorized redirect URIs, then put the client ID and secret into Supabase. Enable Google. Configure consent/testing users before testing, and complete Google's release requirements before opening login to the public. [Official guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
- Facebook: create a Meta developer application with Facebook Login. Copy Supabase's Facebook callback URL into Valid OAuth Redirect URIs. Configure `email` and `public_profile` permissions, then enter the App ID and secret in Supabase and enable Facebook. Complete Meta's applicable testing/live-mode, privacy-policy and data-deletion requirements before public release. [Official guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook).

Provider secrets belong in Supabase settings, never `NEXT_PUBLIC_*` variables, source control or chat. This app requests identity information, not social posts, friends or publishing permissions. Google/Facebook identity data and email may be retained by Supabase Auth. The application profile stores only the user ID, chosen display name and history preference.

## 3. Configure the static build

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your project's Connect/API settings. Use only a browser publishable key, never a service-role or secret key.

Run `npm test`, `npm run build`, then `npm run preview`. These values are embedded at build time; updating hosting runtime variables alone does not change the static export. Rebuild and publish after changing them. `.env.local` is ignored by Git and must be excluded from deployment-source synchronization.

## 4. History behavior and retention

Saving starts disabled. A signed-in user explicitly enables it in Profile and saves settings. Only future submitted city/place searches and normalized adventure category/radius searches are stored; previous guest activity is never uploaded. Automatic GPS coordinates are not written to this history, but typed text can itself contain personal information. Bookmarks, visited places and badges remain local to the browser.

The database function checks current consent, derives ownership from the authenticated identity, and retains at most 100 entries per account. Interest counts reflect explicitly searched categories only. Reads hide history older than 90 days. Every new saved search removes expired entries for that user.

For inactive accounts, enable Supabase Cron and schedule this SQL daily, for example at `0 3 * * *`:

```sql
delete from public.explorer_searches
where created_at <= now() - interval '90 days';
```

Without this job, expired inactive records remain physically stored even though the app cannot display them. [Cron documentation](https://supabase.com/docs/guides/cron). Stopping history saving does not delete existing history. “Delete search history” removes saved searches and their interest counts. Sign-out clears the local account session but does not delete cloud data or local guest bookmarks.

Before enabling public login, publish an accurate privacy policy and a reachable operator contact/deletion process. Full self-service deletion of the Supabase Auth identity is not implemented. An authorized operator can delete a requested user through Supabase Auth; application profiles/history cascade on deletion. Do not request identity details in public GitHub issues. Backups/provider logs follow their separately configured retention.

## 5. Verification before activation

`npm test` covers discovery, parser, adventures and history normalization. `npm run test:db` starts and removes its own disposable local PostgreSQL cluster (requires `initdb`, `pg_ctl`, `psql` on PATH). It never connects to existing databases. Its Supabase auth/JWT schema is simulated, so it validates SQL authorization rather than real OAuth.

The same SQL checks can run in PGlite without adding a production dependency:

```sh
npm install --prefix /tmp/explorer-auth-tools @electric-sql/pglite
node tests/auth-schema.mjs --pglite /tmp/explorer-auth-tools/node_modules/@electric-sql/pglite/dist/index.js
```

After connection, verify Google and Facebook success/cancellation, refresh, sign-out and reopening on mobile. Use two separate accounts: enable saving for only one, submit a search, confirm the other cannot see it, then test pause/delete. Verify profile persistence across devices and no previous guest history upload. Test database/network failures and the scheduled deletion job. Provider login and real-device checks cannot be completed before project configuration.

References: [redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

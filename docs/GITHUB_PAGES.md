# Permanent web hosting

Owner decision (18 November 2026): **GitHub Pages**, public support via **GitHub issues**.

- Target: https://vsp6692.github.io/explorearoundyou/
- Public support/general privacy questions: https://github.com/vsp6692/explorearoundyou/issues
- Do not post private notes, location history, backup files, account identifiers or credentials in issues.
- The previous Sites project returns “project not found”. Its `.openai/hosting.json` identity is preserved for history, not used by this workflow.

## Deployment status

Deployment run [44280081242](https://github.com/vsp6692/explorearoundyou/actions/runs/44280081242) succeeded on 18 November 2026. The permanent URL and checked worker/manifest/photo/information routes return HTTP 200; deployed mobile Chromium map smoke check passed. The setup notes below are retained for future recovery.

## One-time repository setting

In https://github.com/vsp6692/explorearoundyou/settings/pages choose **Build and deployment → Source → GitHub Actions**. This requires a repository administrator. The public API reported `has_pages: false` and the target returned 404 on 18 November 2026. SSH push access alone cannot change this setting. No private credentials are needed in source code or chat.

The `Verify and publish GitHub Pages` workflow validates pull requests and builds main pushes with the `/explorearoundyou` base path. It publishes the `out` artifact using GitHub's official Pages actions. If Pages was not enabled before the first push, select the source above and re-run the workflow from Actions. Deployment is complete only when the workflow succeeds and the permanent URL passes browser checks; a local build is not deployment proof.

## Exact local export check

```sh
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH=/explorearoundyou npm run build
NEXT_PUBLIC_BASE_PATH=/explorearoundyou npm run test:export
NEXT_PUBLIC_BASE_PATH=/explorearoundyou PORT=3002 npm run preview
```

Open http://localhost:3002/explorearoundyou/. The same environment variable must be present at **build** and preview time. Local `npm run dev` defaults to `/`. Asset URLs, MapLibre worker, photo files, recovery links, shared place links, OAuth redirect and install manifest use the build prefix. `trailingSlash` emits actual directory indexes for information pages on static hosting. This is a web manifest, not an offline service worker or a native app.

## Optional connected accounts

Guest mode needs no Supabase configuration. To activate real accounts after completing `AUTH_SETUP.md`, add repository **Actions variables** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These browser-public values are embedded during build; never use service-role or provider secret keys. Set Supabase's Site URL and allowed redirect to https://vsp6692.github.io/explorearoundyou/ (including project path). Provider secrets belong in Supabase. Verify database RLS, history retention, identity deletion procedure and both OAuth providers before enabling public login.

GitHub Pages is a static host. It does not solve aggregate public-provider rate limits, provide a places backend, or sync device trips. It does not offer this application custom HTTP response headers through Next server config. A future proxy/managed data provider needs separate hosting and configuration.

## Moving saved data

Browser storage is isolated by origin. Old temporary tunnel/Sites data cannot be read by the GitHub Pages site. Download a backup from Profile on the old origin while it is available, then use Import backup on the permanent URL. Review the merge before applying it. Recovery files preserve raw local app values for troubleshooting and are deliberately not standard import backups. Account sessions and cloud history are not exported.

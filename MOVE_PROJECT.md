# Project relocation — completed

Previous: `/Users/satheesh/Work/profile-builder/explorearoundyou`

Current: `/Users/satheesh/Work/explorearoundyou`

This folder is already a standalone npm project with its own Git repository. No files from the parent portfolio are needed. The move was completed on 2026-11-16. The commands below are retained as a record; do not repeat the move.

1. Stop dev servers launched from this project using Ctrl+C in their terminals. Do not kill unrelated Node applications.
2. In Terminal, run this guarded move. It refuses to overwrite an existing destination:

```sh
if [ -e /Users/satheesh/Work/explorearoundyou ]; then
  echo 'Destination already exists. Inspect it before moving anything.'
else
  mv /Users/satheesh/Work/profile-builder/explorearoundyou /Users/satheesh/Work/explorearoundyou
fi
```

3. Open `/Users/satheesh/Work/explorearoundyou` as the new workspace. Moving the whole folder preserves `.git`, `.openai`, the lockfile and these handoff documents.
4. From the new root, regenerate dependencies/build state:

```sh
cd /Users/satheesh/Work/explorearoundyou
npm ci
npm test
npm run build
npm run dev -- --hostname 0.0.0.0 --port 3001
```

If Next reports stale build state, remove only this project's generated `.next` folder and restart. No absolute source paths require edits. Use Node compatible with the lockfile; Node 20.20.2 was used in the previous session.

For LAN access, get the current Mac Wi-Fi address using `ipconfig getifaddr en0`, then open `http://THAT_ADDRESS:3001` on the same Wi-Fi. LAN HTTP does not support normal mobile geolocation. Public HTTPS hosting is separate from the local process and survives the folder move.

Read `PROJECT_CONTEXT.md` before continuing implementation. It contains user requirements, known defects, verification limits and the existing deployment identity. Do not publish merely because the folder moved; relocation does not repair runtime defects.

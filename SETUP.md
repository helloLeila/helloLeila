# Setup

## What this folder contains

- `README.md`: use this as the profile README inside your GitHub `<username>/<username>` repo.
- `index.html`, `styles.css`, `script.js`: GitHub Pages homepage with the interactive control deck treatment.
- `theme-data.js`: shared bilingual theme data for the homepage stage.
- `assets/orbit-banner.svg`: animated banner for the README hero.
- `assets/previews/homepage-preview.png`: browser screenshot preview for GitHub display.
- `preview-local.sh`: start a local preview server for the interactive homepage.
- `capture-preview.sh`: regenerate the preview screenshot locally.
- `check-github.sh`: diagnose GitHub pull/push issues such as DNS, proxy, or fetch failures.

## Local preview

Interactive homepage preview:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
./preview-local.sh
```

Then open this URL in your browser:

```bash
http://127.0.0.1:8000/index.html
```

If you want the script to open the browser automatically on macOS:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
./preview-local.sh --open
```

If port `8000` is occupied, choose another one:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
PORT=8010 ./preview-local.sh --open
```

To stop the local preview server:

```bash
Ctrl+C
```

README local file preview:

```bash
open '/Users/leila/Documents/Playground 3/github-profile-home/README.md'
```

Homepage checks:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
node --test tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs
```

## Publish flow

1. Create a repository named exactly as your GitHub username.
2. Copy these files into that repo root.
3. Make any optional edits you want:
   - `Leila` if you want a different display name
   - `Asia / Remote` if you want a different location line
   - the contact slot if you want email / Telegram / X links
4. Commit and push.
5. In repository settings, enable GitHub Pages from the root branch.
6. Your Pages URL for this repo should be:

```bash
https://helloleila.github.io/helloLeila/
```

## Why local preview and GitHub look different

- `index.html` is the interactive page used by local preview and GitHub Pages.
- `theme-data.js` holds the shared stage content and layout data for the 4 homepage modes.
- `README.md` is the static page shown on your GitHub profile repository homepage.
- GitHub profile README does not run custom JavaScript, so animation, panel switching, and pointer effects only exist in `index.html`.
- To keep them visually aligned:
  - keep `README.md` compact and skill-first
  - keep `index.html` as the motion-rich version for local preview and Pages

If you changed files locally but GitHub still looks old, you usually only need to push again:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
git add README.md index.html styles.css script.js assets/previews/homepage-preview.png
git commit -m "refactor: align README and interactive homepage"
git push origin main
```

If `Mission Deck` opens a `404` page after upload, check this first:

1. GitHub repo `Settings`
2. `Pages`
3. `Deploy from a branch`
4. Branch: `main`
5. Folder: `/ (root)`
6. Wait 1-2 minutes for deployment

Important:

- Your current repo is `helloLeila/helloLeila`
- That means it is a project Pages site, not a user-site repo
- So the correct URL is:

```bash
https://helloleila.github.io/helloLeila/
```

- `https://helloleila.github.io/` only works as the root site if you create a separate repo named exactly:

```bash
helloLeila.github.io
```

## Refresh the screenshot preview

Run this from the repo root:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
./capture-preview.sh
```

This starts a temporary local server, opens the page in headless Chrome, and rewrites `assets/previews/homepage-preview.png`.

## Diagnose GitHub pull/push issues

If `git pull` or `git push` suddenly fails, run:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
./check-github.sh
```

This script checks:

- current repo and branch tracking
- DNS resolution for `github.com`
- basic HTTP access to GitHub
- proxy environment variables
- git-specific proxy config
- `git fetch --dry-run origin`

If the checks all pass, retry:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
git pull --ff-only
```

## Important constraint

GitHub profile `README.md` does not run custom JavaScript, so the real 3D interaction lives in `index.html` via GitHub Pages. The README carries the visual identity with the animated SVG banner and links out to the interactive page.

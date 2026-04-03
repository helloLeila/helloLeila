# Setup

## What this folder contains

- `README.md`: use this as the profile README inside your GitHub `<username>/<username>` repo.
- `index.html`, `styles.css`, `script.js`: GitHub Pages homepage with the 3D-style treatment.
- `assets/orbit-banner.svg`: animated banner for the README hero.
- `assets/previews/homepage-preview.png`: browser screenshot preview for GitHub display.
- `preview-local.sh`: start a local preview server for the interactive homepage.
- `capture-preview.sh`: regenerate the preview screenshot locally.

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

## Publish flow

1. Create a repository named exactly as your GitHub username.
2. Copy these files into that repo root.
3. Make any optional edits you want:
   - `Leila` if you want a different display name
   - `Asia / Remote` if you want a different location line
   - the contact slot if you want email / Telegram / X links
4. Commit and push.
5. In repository settings, enable GitHub Pages from the root branch.

## Refresh the screenshot preview

Run this from the repo root:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home'
./capture-preview.sh
```

This starts a temporary local server, opens the page in headless Chrome, and rewrites `assets/previews/homepage-preview.png`.

## Important constraint

GitHub profile `README.md` does not run custom JavaScript, so the real 3D interaction lives in `index.html` via GitHub Pages. The README carries the visual identity with the animated SVG banner and links out to the interactive page.

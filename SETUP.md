# Setup

## What this folder contains

- `README.md`: use this as the profile README inside your GitHub `<username>/<username>` repo.
- `index.html` + `src/`: React + Vite homepage source.
- `package.json` + `vite.config.js`: local development and production build setup.
- `assets/orbit-banner.svg`: animated banner for the README hero.
- `assets/previews/homepage-preview.png`: browser screenshot preview for GitHub display.
- `preview-local.sh`: start a local preview server for the interactive homepage.
- `capture-preview.sh`: regenerate the preview screenshot locally.
- `check-github.sh`: diagnose GitHub pull/push issues such as DNS, proxy, or fetch failures.

## Local preview

Interactive homepage preview:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
./preview-local.sh
```

Then open this URL in your browser:

```bash
http://127.0.0.1:4173/
```

If you want the script to open the browser automatically on macOS:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
./preview-local.sh --open
```

If port `8000` is occupied, choose another one:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
PORT=4273 ./preview-local.sh --open
```

To stop the local preview server:

```bash
Ctrl+C
```

Run tests:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
npm test
```

Build production bundle:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
npm run build
```

## AI daily brief source

The live panel uses Codex daily JSON as the primary source when available.

Supported inputs, set one at a time:

Local JSON file:

```bash
AI_DAILY_JSON_PATH=ai-daily/latest.json
```

Remote JSON URL:

```bash
AI_DAILY_JSON_URL=<public-json-url>
```

If both are set, `AI_DAILY_JSON_URL` takes precedence.

Expected JSON shape:

```json
{
  "updatedAt": "2026-07-07T07:00:00+08:00",
  "news": [
    {
      "title": "Original title",
      "url": "https://www.oschina.net/news/471539",
      "source": "Codex Daily",
      "summaryZh": "一句中文摘要。",
      "summaryEn": "One English summary.",
      "whyItMattersZh": "为什么值得关注。",
      "tags": ["AI", "Workflow"]
    }
  ]
}
```

News items should be Chinese-facing technology news with URLs pointing to the original public article, not placeholder or aggregator-only links.

That original-article requirement is an upstream Codex automation content contract. The website script validates URLs syntactically as public HTTP(S) URLs and rejects local, private, malformed, or deceptive host forms; it does not fetch and prove every redirect target.

The site accepts the Codex JSON only when at least five valid items are present. The generated `public/live-panel.json` contains exactly five news records. If the file is missing, invalid, or too short, `scripts/fetch_live_panel.py` falls back to the built-in public news crawler.

When updating the Codex Feishu automation prompt, ask it to generate both:

- `ai-daily/YYYY-MM-DD-ai-daily.md` for Feishu and Server 酱.
- `ai-daily/latest.json` for the personal website.

The Markdown remains the notification artifact. The JSON is the website artifact.

## Publish flow

1. Push the source code branch.
2. In repository settings, set Pages source to `GitHub Actions`.
3. The workflow in `.github/workflows/pages.yml` will build and publish the Vite app.
4. Your Pages URL for this repo should be:

```bash
https://helloleila.github.io/helloLeila/
```

## Why local preview and GitHub look different

- `index.html` and `src/` are the React source for local preview and production build.
- `README.md` is the static page shown on your GitHub profile repository homepage.
- GitHub profile README does not run custom JavaScript, so animation, panel switching, and pointer effects only exist in `index.html`.
- To keep them visually aligned:
  - keep `README.md` compact and skill-first
  - keep `index.html` as the motion-rich version for local preview and Pages

If you changed files locally but GitHub still looks old, you usually need to rebuild and let the Pages workflow redeploy:

```bash
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
git add .
git commit -m "feat: update react homepage"
git push origin main
```

If the page opens but assets are missing, check:

1. GitHub repo `Settings`
2. `Pages`
3. `Build and deployment`
4. Source: `GitHub Actions`
5. Wait 1-2 minutes for deployment

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
cd '/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage'
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

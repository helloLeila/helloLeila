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

The live panel stores two news streams in `public/live-panel.json`:

- `codexNews`: Codex automation output for the left-side global AI brief.
- `news`: public Chinese-source crawler output for the right-side current five.

If `codexNews` is empty or invalid, the left pane is hidden and the public news pane remains visible.

Supported inputs, set one at a time:

Local JSON file:

```bash
AI_DAILY_JSON_PATH=ai-daily/latest.json npm run refresh:live-panel
```

Remote JSON URL:

```bash
AI_DAILY_JSON_URL=<public-json-url> npm run refresh:live-panel
```

If both are set, `AI_DAILY_JSON_URL` takes precedence.

Expected JSON shape:

```json
{
  "updatedAt": "2026-07-08T07:00:00+08:00",
  "news": [
    {
      "title": "Original global AI title",
      "url": "https://github.blog/changelog/2026-07-07-github-copilot-app-available-to-all/",
      "source": "GitHub Blog",
      "summaryZh": "一句中文摘要。",
      "summaryEn": "One English summary.",
      "whyItMattersZh": "为什么值得关注。",
      "tags": ["AI", "Workflow"]
    }
  ]
}
```

Codex items can come from global AI sources, but they should be Chinese-facing summaries with URLs pointing to the original public article, not placeholder or aggregator-only links.

Required sidecar fields are `title`, `url`, `summaryZh`, `summaryEn`, and `whyItMattersZh`. `source` is optional and defaults to `Codex Daily`; `tags` is optional and normalized to at most four labels.

That original-article requirement is an upstream Codex automation content contract. The website script validates URLs syntactically as public HTTP(S) URLs and rejects local, private, malformed, or deceptive host forms; it does not fetch and prove every redirect target.

The site accepts the Codex JSON only when at least five valid items are present. When the Codex path succeeds, the generated `public/live-panel.json` writes the first five validated records to `codexNews`. The script still runs the built-in public Chinese-source crawler for `news`, capped at five displayable records. If the Codex file is missing, invalid, or too short, `codexNews` becomes an empty array and the left pane is hidden.

When updating the Codex Feishu automation prompt, ask it to generate both:

- `ai-daily/YYYY-MM-DD-ai-daily.md` for Feishu and Server 酱.
- `ai-daily/latest.json` for the personal website.

The Markdown remains the notification artifact. The JSON is the website artifact.

## Weather and typhoon warning source

`npm run refresh:live-panel` writes weather and warning data into `public/live-panel.json`.

- Weather forecast: Open-Meteo forecast API for Shenzhen coordinates.
- Warning source: 中央气象台台风网, read through its public warning JSONP endpoint.
- Typhoon activity: 中央气象台台风网 active typhoon list.

The warning data is filtered to Shenzhen entries. If a Shenzhen typhoon warning is active, the site shows that warning title and links to the original notice. If Shenzhen has no typhoon warning but has other active warnings, the site says so explicitly, for example `暂无深圳台风预警；现有：雷雨大风黄色预警信号`. If the warning endpoint fails, the script reuses the previous saved warning payload and marks it as fallback; if no saved payload exists, it shows `台风预警源暂不可用`.

This keeps the static GitHub Pages site honest: Open-Meteo remains the weather source, while typhoon and local warning status come from a China Meteorological Administration source. A commercial API such as QWeather can still be added later if you want SLA-style stability or wider city coverage, but it usually needs account credentials or a configured API host. The current implementation avoids secrets and still gives clickable original warning links.

## Public WeChat event radar

The activity page is published at:

```text
https://helloleila.github.io/helloLeila/events/
```

The source catalog lives in `data/wechat-event-sources.json`. Every name in that file is preserved even when its public feed address has not been discovered yet. A source with only a name stays `discoveryStatus: "pending"`; it is not deleted or treated as invalid. When an official public article URL is known, add it to `confirmedArticleUrls` until a stable RSS/Atom address is available.

The catalog intentionally does not contain a personal WeChat login, Cookie, QR session, or private API credential. The collector only uses public RSS/Atom addresses and manually confirmed public article URLs. It runs once per day, limits each source to ten recent entries, serializes requests, and stops on login pages, challenges, or access errors.

### Name-based discovery

For a source that has a name but no `feedUrl`, the daily script runs a public Bing RSS search for:

```text
"公众号名称" 微信公众号 活动
```

It scores candidates by public WeChat host, exact name/snippet match, and公众号 signals, then writes the top candidates to that source's `discoveryCandidates` field in `wechat-events.json`. A candidate is never silently bound when the name is ambiguous; it remains `needs-confirmation` until an article URL is added to `confirmedArticleUrls`. This is why every name stays in the catalog even when discovery is incomplete.

The generated file also contains `sourceStats.discoveryHits`, `sourceStats.discoveryNeedsConfirmation`, `sourceStats.discoveryUnavailable`, and `sourceStats.wechatArticles`. The public list is a strict whitelist: `sourceArticleUrl` must be an exact `https://mp.weixin.qq.com/s/...` URL, and the fetched page must expose a public title without a login or anti-bot challenge. Search results, Baidu百科 pages, company sites, and ordinary news pages are retained only as rejected audit input and are never published as events.

If no article can be fetched and verified during a run, the page intentionally shows zero activities and says so. This is preferable to displaying a plausible but unverified date or event.

Local refresh:

```bash
npm run refresh:wechat-events
```

### Edit source names locally

The `/events/` page has a **来源配置** button. Run the Vite development server on the loopback address, open the local events page, edit only the公众号名称, and click **保存到项目 JSON**:

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

Open `http://127.0.0.1:4174/events/`. The save operation writes directly to:

```text
data/wechat-event-sources.json
```

The local API is available only in Vite `serve` mode and only to `127.0.0.1`, `::1`, or `::ffff:127.0.0.1`. It accepts a list of `id`/`name` pairs, preserves source categories, feed addresses, enabled flags, discovery state, confirmed article URLs, and other project fields, and refuses to remove any original source. It also refuses blank or duplicate names.

After reviewing the change, commit and push the JSON yourself so the next GitHub Actions refresh can use it:

```bash
git diff -- data/wechat-event-sources.json
git add data/wechat-event-sources.json
git commit -m "chore: update event source names"
git push
```

The deployed GitHub Pages page is read-only. It does not contain a write API, does not receive WeChat login state, and cannot edit the repository from a visitor's browser.

The command writes `public/wechat-events.json`. With no configured feed URLs or `OPENAI_API_KEY`, it still produces a valid honest payload and keeps prior published events when available. New article candidates become `needs-review` and are hidden from the public list until structured extraction confirms a title and start date.

Optional GitHub Actions configuration:

- Repository Secret: `OPENAI_API_KEY`
- Repository Variable: `OPENAI_MODEL`

The model receives only public article metadata and excerpt text. The browser never receives the API key. The Pages workflow runs the event refresh, then `npm test`, then the production build. A source failure produces `partial` or `stale` data while preserving the last valid event list.

When a source name cannot be uniquely matched to a public account, keep the name in the catalog and ask for one article URL or a screenshot of the account details. Do not silently remove it.

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

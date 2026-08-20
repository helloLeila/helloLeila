# WeChat Event Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/events/` page and a daily GitHub Actions pipeline that turns low-frequency public RSS/Atom and manual article inputs into validated, persistent event data without using a personal WeChat login.

**Architecture:** A focused Python standard-library module owns source validation, feed parsing, article screening, optional OpenAI Responses API extraction, previous-deployment merging, and JSON output. A separate Vite page reads that static JSON and provides client-side filtering. The existing Pages workflow runs both data refresh jobs, tests, and a multi-page production build.

**Tech Stack:** Python 3 standard library, OpenAI Responses API with JSON Schema structured output, React 18, Vite 7, Node test runner, GitHub Actions, GitHub Pages

---

## File Structure

### Create

- `data/wechat-event-sources.json`: non-secret source registry, initially empty until real feeds are supplied.
- `scripts/wechat_event_radar.py`: pure parsing, validation, screening, extraction, merge, and output functions.
- `scripts/fetch_wechat_events.py`: executable orchestration entry point.
- `public/wechat-events.json`: valid empty production snapshot.
- `tests/fixtures/wechat-events/feed-rss.xml`: RSS fixture with activity and non-activity articles.
- `tests/fixtures/wechat-events/feed-atom.xml`: Atom fixture for alternate feed parsing.
- `tests/fixtures/wechat-events/previous-events.json`: prior deployment merge fixture.
- `tests/test_wechat_event_radar.py`: Python behavioral tests.
- `events/index.html`: Vite multi-page HTML entry.
- `src/events/main.jsx`: event page React entry.
- `src/events/EventsApp.jsx`: loading, filters, summary, event list, empty/error states.
- `src/events/eventData.js`: pure normalization, sorting, filtering, and statistic helpers.
- `src/events/events.css`: event page responsive styles.
- `tests/events.test.mjs`: frontend data and structure tests.

### Modify

- `vite.config.js`: add explicit root and events Rollup inputs.
- `package.json`: add event refresh, Python test, and frontend test commands.
- `.github/workflows/pages.yml`: set up Python, refresh events, pass optional secret/variable, run tests before build.
- `src/components/WorkLinks.jsx`: add a discoverable activity radar link without changing homepage assembly.
- `SETUP.md`: document source configuration, local refresh, GitHub secret, public-data boundary, and failure behavior.

---

### Task 1: Define The Data Pipeline Contract

**Files:**
- Create: `tests/fixtures/wechat-events/feed-rss.xml`
- Create: `tests/fixtures/wechat-events/feed-atom.xml`
- Create: `tests/fixtures/wechat-events/previous-events.json`
- Create: `tests/test_wechat_event_radar.py`
- Create: `data/wechat-event-sources.json`
- Create: `public/wechat-events.json`

- [ ] Write failing tests for public URL validation, RSS/Atom parsing, activity screening, OpenAI response parsing, previous-event merging, expiry, and invalid output rejection.
- [ ] Run `python3 -m unittest tests.test_wechat_event_radar` and confirm failure because `scripts/wechat_event_radar.py` does not exist.
- [ ] Add valid empty configuration and production JSON fixtures so local builds remain honest before real sources are supplied.

### Task 2: Implement Deterministic Collection And Persistence

**Files:**
- Create: `scripts/wechat_event_radar.py`
- Create: `scripts/fetch_wechat_events.py`
- Modify: `package.json`

- [ ] Implement `is_public_http_url`, `parse_feed`, `screen_article`, `normalize_event`, `merge_events`, `expire_events`, and `validate_output` with Python standard-library APIs.
- [ ] Implement source orchestration with per-source isolation, ten-item caps, two-second same-host spacing, 20-second timeout, and no cookies or login state.
- [ ] Implement prior-data lookup from deployed JSON, then local snapshot, then empty state.
- [ ] Run the Python tests and confirm all data-pipeline tests pass.
- [ ] Add `refresh:wechat-events` and the Python test module to `npm test`.

### Task 3: Add Optional Structured AI Extraction

**Files:**
- Modify: `scripts/wechat_event_radar.py`
- Modify: `scripts/fetch_wechat_events.py`
- Test: `tests/test_wechat_event_radar.py`

- [ ] Add a failing test proving the raw Responses API payload uses `text.format.type = json_schema`, a strict event schema, and article-only input.
- [ ] Add failing tests for extracting `output_text`, refusal/invalid output, missing API key, and retryable transport errors.
- [ ] Implement the official Responses API request at `https://api.openai.com/v1/responses`, configured by `OPENAI_API_KEY` and required `OPENAI_MODEL`.
- [ ] Validate every returned event independently and publish only confidence `>= 0.75` with a title and parseable start date; keep other candidates as `needs-review`.
- [ ] Run the targeted Python suite and confirm the red-green cycle is complete.

### Task 4: Build The Public Events Page

**Files:**
- Create: `events/index.html`
- Create: `src/events/main.jsx`
- Create: `src/events/EventsApp.jsx`
- Create: `src/events/eventData.js`
- Create: `src/events/events.css`
- Create: `tests/events.test.mjs`
- Modify: `vite.config.js`

- [ ] Write failing Node tests for JSON URL construction, published-only normalization, chronological sorting, combined text/city/format/tag filters, and Vite multi-page input.
- [ ] Run `node --test tests/events.test.mjs` and confirm it fails because the event modules and page do not exist.
- [ ] Implement pure event-data helpers and make those tests pass.
- [ ] Implement a compact operational page with brand header, freshness/status row, four filter controls, summary counts, list rows, accessible external links, empty state, stale/error state, and mobile-safe layout.
- [ ] Re-run the frontend tests and confirm they pass.

### Task 5: Connect Homepage And Pages Deployment

**Files:**
- Modify: `src/components/WorkLinks.jsx`
- Modify: `.github/workflows/pages.yml`
- Modify: `package.json`
- Modify: `SETUP.md`
- Test: `tests/events.test.mjs`
- Test: `tests/live-panel-workflow.test.mjs`

- [ ] Add failing source-level tests for a homepage event link, the daily event refresh step, optional OpenAI environment wiring, test-before-build order, and event setup documentation.
- [ ] Add the homepage link using `import.meta.env.BASE_URL`, keeping the existing marquee behavior intact.
- [ ] Add Python setup, event refresh, optional `OPENAI_API_KEY`/`OPENAI_MODEL`, and `npm test` before the existing production build.
- [ ] Document how to enter real feed URLs, add manual public article URLs, run locally, configure Secrets/Variables, and interpret `ok`/`partial`/`stale`.
- [ ] Run targeted workflow and structure tests.

### Task 6: Full Verification And Visual QA

**Files:**
- Modify only files revealed by verification defects.

- [ ] Run `npm test` and confirm zero failures.
- [ ] Run `npm run refresh:wechat-events` without secrets and confirm a valid honest empty/previous-data JSON result.
- [ ] Run `npm run build` and confirm both `dist/index.html` and `dist/events/index.html` plus `dist/wechat-events.json` exist.
- [ ] Start a local Vite preview on an available port.
- [ ] Use Playwright at desktop and mobile viewports to inspect `/helloLeila/events/`, test filters with a temporary fixture override, capture screenshots, and verify no overflow or overlap.
- [ ] Run `git diff --check` and review the final diff for unrelated changes or leaked credentials.

## Plan Self-Review

- Spec coverage: source safety, daily schedule, static persistence, optional AI, public-only content, event filtering, fallback behavior, testing, and visual QA are each assigned to a task.
- Placeholder scan: the plan contains no deferred implementation placeholders. Real source URLs remain intentionally user-supplied data rather than implementation work.
- Type consistency: `wechat-events.json` uses `events`, event `status`, `sourceAccount`, `sourceArticleUrl`, `startTime`, `isOnline`, and `tags` consistently across pipeline and frontend tasks.

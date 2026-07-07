# AI Daily News Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the personal site use Codex-generated AI daily JSON as the primary source for five public news picks, while keeping the existing crawler as the fallback path.

**Architecture:** `scripts/fetch_live_panel.py` remains the single writer for `public/live-panel.json`. It first tries to import a validated Codex daily sidecar JSON from `AI_DAILY_JSON_PATH`, `AI_DAILY_JSON_URL`, or `ai-daily/latest.json`; if that fails, it runs the current deterministic RSS/HTML crawler and emits fallback news. The React hook and utility panel become tolerant of enriched AI fields while preserving title-link rendering for old data.

**Tech Stack:** Python 3 standard library, Node.js test runner, React 18, Vite, GitHub Actions, static JSON on GitHub Pages

---

## File Structure

### Create

- `tests/fixtures/ai-daily-latest.json`
  - Stable Codex sidecar fixture with more than five enriched news items.
- `tests/test_live_panel_sources.py`
  - Python unit tests for Codex daily JSON normalization and fallback rejection.

### Modify

- `scripts/fetch_live_panel.py`
  - Add Codex sidecar import, validation, news status, and fallback orchestration.
- `public/live-panel.json`
  - Update fixture shape with `aiStatus` and enriched news fields.
- `src/hooks/useWeatherNews.js`
  - Normalize old and enriched news records into a single frontend shape.
- `src/components/UtilitiesPanel.jsx`
  - Render source, tags, summary, and reason when present.
- `src/styles/app.css`
  - Add compact styles for enriched daily brief metadata.
- `tests/live-panel.test.mjs`
  - Use the current workspace path and assert the enriched data contract.
- `tests/live-panel-workflow.test.mjs`
  - Use the current workspace path and assert Codex sidecar fallback behavior is present.
- `package.json`
  - Include the new Python unit test in `npm test`.
- `SETUP.md`
  - Document `AI_DAILY_JSON_PATH`, `AI_DAILY_JSON_URL`, and the Codex automation output contract.

---

### Task 1: Add Codex Daily JSON Contract Tests

**Files:**
- Create: `tests/fixtures/ai-daily-latest.json`
- Create: `tests/test_live_panel_sources.py`
- Modify: `package.json`

- [ ] **Step 1: Create the Codex sidecar fixture**

Create `tests/fixtures/ai-daily-latest.json` with this exact structure:

```json
{
  "updatedAt": "2026-07-07T07:00:00+08:00",
  "news": [
    {
      "title": "OpenAI releases new agent workflow guidance",
      "url": "https://example.com/openai-agent-workflow",
      "source": "Codex Daily",
      "summaryZh": "OpenAI 更新了智能体工作流相关实践。",
      "summaryEn": "OpenAI updated practical guidance for agent workflows.",
      "whyItMattersZh": "这类变化会影响个人站关注的 AI 工程化与智能体编排方向。",
      "tags": ["AI", "Agent", "Workflow"]
    },
    {
      "title": "Frontend teams adopt structured AI review loops",
      "url": "https://example.com/frontend-ai-review",
      "source": "Codex Daily",
      "summaryZh": "前端团队开始把 AI 审查纳入工程流程。",
      "summaryEn": "Frontend teams are folding AI review into engineering loops.",
      "whyItMattersZh": "它和个人站展示的前端系统、AI 工作流能力直接相关。",
      "tags": ["Frontend", "Review", "AI"]
    },
    {
      "title": "Data visualization tooling adds narrative dashboards",
      "url": "https://example.com/dataviz-narrative-dashboard",
      "source": "Codex Daily",
      "summaryZh": "数据可视化工具继续强化叙事型仪表盘能力。",
      "summaryEn": "Data visualization tools are adding stronger narrative dashboard features.",
      "whyItMattersZh": "这能支撑个人站里数据表达和可视化模块的长期方向。",
      "tags": ["DataViz", "Dashboard"]
    },
    {
      "title": "Research agents improve literature triage workflows",
      "url": "https://example.com/research-agent-triage",
      "source": "Codex Daily",
      "summaryZh": "研究型智能体在文献筛选流程中继续落地。",
      "summaryEn": "Research agents are becoming more useful in literature triage workflows.",
      "whyItMattersZh": "这契合个人站对学术方法和工程工具链结合的定位。",
      "tags": ["Research", "Agent"]
    },
    {
      "title": "Developer productivity tools expose workflow metrics",
      "url": "https://example.com/dev-productivity-metrics",
      "source": "Codex Daily",
      "summaryZh": "开发者工具开始暴露更细的工作流指标。",
      "summaryEn": "Developer tools are exposing more granular workflow metrics.",
      "whyItMattersZh": "它有助于解释 AI 工作流如何被度量和持续改进。",
      "tags": ["Engineering", "Metrics"]
    },
    {
      "title": "Extra item should not appear on the homepage",
      "url": "https://example.com/extra-item",
      "source": "Codex Daily",
      "summaryZh": "第六条用于验证截断。",
      "summaryEn": "The sixth item verifies truncation.",
      "whyItMattersZh": "页面只展示前五条。",
      "tags": ["Fixture"]
    }
  ]
}
```

- [ ] **Step 2: Write failing Python unit tests**

Create `tests/test_live_panel_sources.py`:

```python
import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "fetch_live_panel.py"
FIXTURE_PATH = ROOT / "tests" / "fixtures" / "ai-daily-latest.json"


def load_module():
    spec = importlib.util.spec_from_file_location("fetch_live_panel", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class LivePanelSourceTests(unittest.TestCase):
    def setUp(self):
        self.module = load_module()

    def test_codex_daily_json_normalizes_first_five_items(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        items = self.module.normalize_codex_daily_news(payload, limit=5)

        self.assertEqual(len(items), 5)
        self.assertEqual(items[0]["title"], "OpenAI releases new agent workflow guidance")
        self.assertEqual(items[0]["source"], "Codex Daily")
        self.assertEqual(items[0]["summaryZh"], "OpenAI 更新了智能体工作流相关实践。")
        self.assertEqual(items[0]["summaryEn"], "OpenAI updated practical guidance for agent workflows.")
        self.assertEqual(items[0]["whyItMattersZh"], "这类变化会影响个人站关注的 AI 工程化与智能体编排方向。")
        self.assertEqual(items[0]["tags"], ["AI", "Agent", "Workflow"])
        self.assertNotIn("Extra item should not appear on the homepage", [item["title"] for item in items])

    def test_codex_daily_json_rejects_incomplete_payloads(self):
        payload = {
            "news": [
                {
                    "title": "Only one item",
                    "url": "https://example.com/one",
                    "source": "Codex Daily",
                    "summaryZh": "只有一条。",
                    "summaryEn": "Only one item.",
                    "whyItMattersZh": "不足五条不能成为主链路。",
                    "tags": ["AI"]
                }
            ]
        }

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])

    def test_codex_daily_json_rejects_entries_without_http_urls(self):
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["news"][0]["url"] = "javascript:alert(1)"

        self.assertEqual(self.module.normalize_codex_daily_news(payload, limit=5), [])


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: Run the new test to verify it fails**

Run:

```bash
python3 -m unittest tests.test_live_panel_sources
```

Expected: FAIL with `AttributeError` mentioning `normalize_codex_daily_news`, because the function does not exist yet.

- [ ] **Step 4: Add the Python unit test to `npm test`**

In `package.json`, change the `test` script to:

```json
"test": "node --test tests/site-content.test.mjs tests/live-panel.test.mjs tests/live-panel-workflow.test.mjs tests/hooks.test.mjs tests/sections.test.mjs tests/signal-cloud.test.mjs && python3 -m unittest tests.test_live_panel_sources"
```

- [ ] **Step 5: Commit the failing contract tests**

Run:

```bash
git add package.json tests/fixtures/ai-daily-latest.json tests/test_live_panel_sources.py
git commit -m "test: define codex daily news contract"
```

---

### Task 2: Make `fetch_live_panel.py` Prefer Codex Daily JSON

**Files:**
- Modify: `scripts/fetch_live_panel.py`
- Test: `tests/test_live_panel_sources.py`

- [ ] **Step 1: Add imports and constants**

In `scripts/fetch_live_panel.py`, add `import os` near the other imports, then add these constants after `HEADERS`:

```python
AI_DAILY_DEFAULT_PATH = Path(__file__).resolve().parents[1] / "ai-daily" / "latest.json"
AI_NEWS_REQUIRED_FIELDS = ("title", "url", "summaryZh", "summaryEn", "whyItMattersZh")
AI_NEWS_MAX_TITLE = 160
AI_NEWS_MAX_SUMMARY_ZH = 120
AI_NEWS_MAX_SUMMARY_EN = 180
AI_NEWS_MAX_REASON_ZH = 160
AI_NEWS_MAX_TAGS = 4
```

- [ ] **Step 2: Add text truncation and URL validation helpers**

Add these functions after `clean_title`:

```python
def truncate_text(value: object, max_length: int) -> str:
    text = clean_title(str(value or ""))
    return text[:max_length].strip()


def is_public_http_url(value: object) -> bool:
    text = str(value or "").strip()
    return text.startswith("https://") or text.startswith("http://")
```

- [ ] **Step 3: Add Codex daily normalization**

Add this function after the helpers from Step 2:

```python
def normalize_codex_daily_news(payload: object, limit: int = 5) -> list[dict]:
    if not isinstance(payload, dict):
        return []

    raw_items = payload.get("news") or payload.get("items")
    if not isinstance(raw_items, list):
        return []

    normalized = []
    seen_urls = set()

    for item in raw_items:
        if not isinstance(item, dict):
            return []
        if any(not item.get(field) for field in AI_NEWS_REQUIRED_FIELDS):
            return []

        url = str(item.get("url", "")).strip()
        if not is_public_http_url(url) or url in seen_urls:
            return []

        tags = item.get("tags", [])
        if not isinstance(tags, list):
            tags = []
        clean_tags = [truncate_text(tag, 24) for tag in tags if truncate_text(tag, 24)]

        normalized.append(
            {
                "title": truncate_text(item.get("title"), AI_NEWS_MAX_TITLE),
                "url": url,
                "source": truncate_text(item.get("source") or "Codex Daily", 40),
                "summaryZh": truncate_text(item.get("summaryZh"), AI_NEWS_MAX_SUMMARY_ZH),
                "summaryEn": truncate_text(item.get("summaryEn"), AI_NEWS_MAX_SUMMARY_EN),
                "whyItMattersZh": truncate_text(item.get("whyItMattersZh"), AI_NEWS_MAX_REASON_ZH),
                "tags": clean_tags[:AI_NEWS_MAX_TAGS],
            }
        )
        seen_urls.add(url)

    if len(normalized) < limit:
        return []

    return normalized[:limit]
```

- [ ] **Step 4: Add Codex source loading**

Add this function after `normalize_codex_daily_news`:

```python
def load_codex_daily_payload() -> object:
    source_url = os.getenv("AI_DAILY_JSON_URL", "").strip()
    source_path = os.getenv("AI_DAILY_JSON_PATH", "").strip()

    if source_url:
        return fetch_json(source_url)

    candidates = []
    if source_path:
        candidates.append(Path(source_path).expanduser())
    candidates.append(AI_DAILY_DEFAULT_PATH)

    for candidate in candidates:
        if candidate.exists():
            return json.loads(candidate.read_text(encoding="utf-8"))

    return {}
```

- [ ] **Step 5: Add news orchestration with status**

Rename the current `fetch_news(previous_panel: dict, limit: int = 5) -> list[dict]` function to `fetch_fallback_news(previous_panel: dict, limit: int = 5) -> list[dict]`, then add:

```python
def build_news(previous_panel: dict, limit: int = 5) -> tuple[str, list[dict]]:
    try:
        codex_news = normalize_codex_daily_news(load_codex_daily_payload(), limit=limit)
        if codex_news:
            return "codex", codex_news
    except (HTTPError, URLError, TimeoutError, ValueError, OSError, json.JSONDecodeError):
        pass

    return "fallback", fetch_fallback_news(previous_panel, limit=limit)
```

- [ ] **Step 6: Emit `aiStatus` from `build_panel`**

Replace `build_panel` with:

```python
def build_panel() -> dict:
    previous_panel = load_previous_panel()
    now = datetime.now(ZoneInfo(TIMEZONE)).replace(second=0, microsecond=0)
    ai_status, news = build_news(previous_panel, limit=5)
    return {
        "updatedAt": now.isoformat(),
        "aiStatus": ai_status,
        "weather": fetch_weather(previous_panel),
        "news": news,
    }
```

- [ ] **Step 7: Run the Python unit tests**

Run:

```bash
python3 -m unittest tests.test_live_panel_sources
```

Expected: PASS with `Ran 3 tests`.

- [ ] **Step 8: Commit the Codex import implementation**

Run:

```bash
git add scripts/fetch_live_panel.py tests/test_live_panel_sources.py
git commit -m "feat: import codex daily news for live panel"
```

---

### Task 3: Refresh the Live Panel Fixture and Data Tests

**Files:**
- Modify: `public/live-panel.json`
- Modify: `tests/live-panel.test.mjs`
- Modify: `tests/live-panel-workflow.test.mjs`

- [ ] **Step 1: Update `public/live-panel.json` with enriched news**

Keep the existing weather shape. Add top-level `aiStatus` and replace `news` with five enriched records using the fixture-style contract:

```json
"aiStatus": "codex",
"news": [
  {
    "title": "OpenAI releases new agent workflow guidance",
    "url": "https://example.com/openai-agent-workflow",
    "source": "Codex Daily",
    "summaryZh": "OpenAI 更新了智能体工作流相关实践。",
    "summaryEn": "OpenAI updated practical guidance for agent workflows.",
    "whyItMattersZh": "这类变化会影响个人站关注的 AI 工程化与智能体编排方向。",
    "tags": ["AI", "Agent", "Workflow"]
  }
]
```

Repeat the same field set for all five records from `tests/fixtures/ai-daily-latest.json`.

- [ ] **Step 2: Replace hard-coded paths in `tests/live-panel.test.mjs`**

Use this top section:

```javascript
// 实时面板数据测试，用于约束每日生成的数据文件结构。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const livePanelPath = path.resolve(root, "public/live-panel.json");
```

- [ ] **Step 3: Assert the enriched news contract**

In the second test in `tests/live-panel.test.mjs`, replace the final two assertions with:

```javascript
  assert.equal(data.aiStatus, "codex");
  assert.equal(data.news.length, 5);
  for (const item of data.news) {
    assert.equal(typeof item.title, "string");
    assert.match(item.url, /^https?:\/\//);
    assert.equal(typeof item.source, "string");
    assert.equal(typeof item.summaryZh, "string");
    assert.equal(typeof item.summaryEn, "string");
    assert.equal(typeof item.whyItMattersZh, "string");
    assert.ok(Array.isArray(item.tags));
  }
```

- [ ] **Step 4: Replace hard-coded paths in `tests/live-panel-workflow.test.mjs`**

Use this top section:

```javascript
// 实时面板工作流测试，约束抓取脚本语言、每日刷新时间与 Codex 日报主链路。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(root, "package.json"), "utf8")
);

const workflowSource = fs.readFileSync(
  path.resolve(root, ".github/workflows/pages.yml"),
  "utf8"
);
const fetchScriptSource = fs.readFileSync(
  path.resolve(root, "scripts/fetch_live_panel.py"),
  "utf8"
);
```

- [ ] **Step 5: Add workflow source assertions for the primary path**

Append this test to `tests/live-panel-workflow.test.mjs`:

```javascript
// 验证 Codex 日报 JSON 是主链路，公开新闻源抓取是兜底链路。
test("live panel prefers codex daily json before crawler fallback", () => {
  assert.match(fetchScriptSource, /AI_DAILY_JSON_PATH/);
  assert.match(fetchScriptSource, /AI_DAILY_JSON_URL/);
  assert.match(fetchScriptSource, /normalize_codex_daily_news/);
  assert.match(fetchScriptSource, /fetch_fallback_news/);
  assert.match(fetchScriptSource, /"codex"/);
  assert.match(fetchScriptSource, /"fallback"/);
});
```

- [ ] **Step 6: Run data and workflow tests**

Run:

```bash
node --test tests/live-panel.test.mjs tests/live-panel-workflow.test.mjs
```

Expected: PASS with both files reporting no failures.

- [ ] **Step 7: Commit fixture and tests**

Run:

```bash
git add public/live-panel.json tests/live-panel.test.mjs tests/live-panel-workflow.test.mjs
git commit -m "test: cover enriched live panel news"
```

---

### Task 4: Normalize Enriched News in React

**Files:**
- Modify: `src/hooks/useWeatherNews.js`
- Modify: `tests/hooks.test.mjs`

- [ ] **Step 1: Add a news normalizer to the hook**

In `src/hooks/useWeatherNews.js`, add this helper after `buildFallbackDailyForecast`:

```javascript
function normalizeNewsItem(item, lang) {
  const title = item?.title || (lang === "zh" ? "每日快讯" : "Daily brief");
  const summary = lang === "zh" ? item?.summaryZh : item?.summaryEn;

  return {
    title,
    url: item?.url || "#",
    source: item?.source || "",
    summary: summary || item?.summaryZh || item?.summaryEn || "",
    whyItMatters: item?.whyItMattersZh || "",
    tags: Array.isArray(item?.tags) ? item.tags.slice(0, 4) : [],
  };
}
```

- [ ] **Step 2: Use the normalizer for remote news**

Replace:

```javascript
        setNews((data.news || siteContent.newsFallback).slice(0, 5));
```

with:

```javascript
        setNews((data.news || siteContent.newsFallback).slice(0, 5).map((item) => normalizeNewsItem(item, lang)));
```

- [ ] **Step 3: Use the normalizer for fallback news**

Replace:

```javascript
          setNews(siteContent.newsFallback.slice(0, 5));
```

with:

```javascript
          setNews(siteContent.newsFallback.slice(0, 5).map((item) => normalizeNewsItem(item, lang)));
```

- [ ] **Step 4: Extend the hook smoke test source assertions**

Append to `tests/hooks.test.mjs`:

```javascript
import fs from "node:fs";
import path from "node:path";

test("useWeatherNews normalizes enriched news fields", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "src/hooks/useWeatherNews.js"), "utf8");

  assert.match(source, /function normalizeNewsItem/);
  assert.match(source, /summaryZh/);
  assert.match(source, /summaryEn/);
  assert.match(source, /whyItMattersZh/);
  assert.match(source, /tags\.slice\(0,\s*4\)/);
});
```

- [ ] **Step 5: Run hook tests**

Run:

```bash
node --test tests/hooks.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit hook normalization**

Run:

```bash
git add src/hooks/useWeatherNews.js tests/hooks.test.mjs
git commit -m "feat: normalize enriched live panel news"
```

---

### Task 5: Render the Daily Brief Fields

**Files:**
- Modify: `src/components/UtilitiesPanel.jsx`
- Modify: `src/styles/app.css`
- Modify: `tests/sections.test.mjs`

- [ ] **Step 1: Update the news panel title**

In `src/components/UtilitiesPanel.jsx`, replace:

```jsx
          <h2>5 live links / 5 条链接（python接入 未完成）</h2>
```

with:

```jsx
          <h2>AI daily brief / AI 每日精选</h2>
```

- [ ] **Step 2: Replace the news list item markup**

Replace the current `news.slice(0, 5).map` body with:

```jsx
          {news.slice(0, 5).map((item) => (
            <li key={item.url}>
              <div className="news-row-head">
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                {item.source ? <span>{item.source}</span> : null}
              </div>
              {item.summary ? <p>{item.summary}</p> : null}
              {item.whyItMatters ? <small>{item.whyItMatters}</small> : null}
              {item.tags?.length ? (
                <div className="news-tags" aria-label={lang === "zh" ? "新闻标签" : "News tags"}>
                  {item.tags.map((tag) => (
                    <span key={`${item.url}-${tag}`}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
```

- [ ] **Step 3: Add compact styles**

Append to `src/styles/app.css` near the existing `.news-list` rules:

```css
.news-row-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.news-row-head span {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 0.76rem;
}

.news-list p {
  margin: 6px 0 0;
  color: var(--text-soft);
  font-size: 0.9rem;
  line-height: 1.55;
}

.news-list small {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.45;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.news-tags span {
  border: 1px solid rgba(66, 94, 122, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  color: var(--text-soft);
  font-size: 0.72rem;
  line-height: 1;
  padding: 5px 8px;
}
```

- [ ] **Step 4: Add source assertions to `tests/sections.test.mjs`**

Add this test:

```javascript
test("utilities panel renders enriched ai daily brief fields", () => {
  const utilitiesSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/UtilitiesPanel.jsx"),
    "utf8"
  );

  assert.match(utilitiesSource, /AI daily brief \/ AI 每日精选/);
  assert.match(utilitiesSource, /news-row-head/);
  assert.match(utilitiesSource, /item\.summary/);
  assert.match(utilitiesSource, /item\.whyItMatters/);
  assert.match(utilitiesSource, /news-tags/);
});
```

- [ ] **Step 5: Run section tests**

Run:

```bash
node --test tests/sections.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit UI rendering**

Run:

```bash
git add src/components/UtilitiesPanel.jsx src/styles/app.css tests/sections.test.mjs
git commit -m "feat: render ai daily brief metadata"
```

---

### Task 6: Document the Primary and Fallback Paths

**Files:**
- Modify: `SETUP.md`
- Modify: `docs/superpowers/specs/2026-07-07-ai-daily-news-brief-design.md`

- [ ] **Step 1: Add setup documentation**

In `SETUP.md`, add a section titled `AI daily brief source`:

````markdown
## AI daily brief source

The live panel uses Codex daily JSON as the primary source when available.

Supported inputs:

```bash
AI_DAILY_JSON_PATH=ai-daily/latest.json
AI_DAILY_JSON_URL=https://example.com/ai-daily/latest.json
```

Expected JSON shape:

```json
{
  "updatedAt": "2026-07-07T07:00:00+08:00",
  "news": [
    {
      "title": "Original title",
      "url": "https://example.com/story",
      "source": "Codex Daily",
      "summaryZh": "一句中文摘要。",
      "summaryEn": "One English summary.",
      "whyItMattersZh": "为什么值得关注。",
      "tags": ["AI", "Workflow"]
    }
  ]
}
```

The site accepts the Codex JSON only when at least five valid HTTP links are present. If the file is missing, invalid, or too short, `scripts/fetch_live_panel.py` falls back to the built-in public news crawler.
````

- [ ] **Step 2: Add the Codex automation prompt requirement**

In the same section, add:

```markdown
When updating the Codex Feishu automation prompt, ask it to generate both:

- `ai-daily/YYYY-MM-DD-ai-daily.md` for Feishu and Server 酱.
- `ai-daily/latest.json` for the personal website.

The Markdown remains the notification artifact. The JSON is the website artifact.
```

- [ ] **Step 3: Update the spec to match the final decision**

In `docs/superpowers/specs/2026-07-07-ai-daily-news-brief-design.md`, ensure the wording says Codex sidecar JSON is primary and the current site crawler is fallback. The exact sentence to include:

```markdown
最终决策：`ai-daily/latest.json` 是个人站新闻主链路；如果 Codex 自动化没有输出、输出少于五条或结构校验失败，`scripts/fetch_live_panel.py` 再运行当前公开来源抓取作为兜底。
```

- [ ] **Step 4: Commit documentation**

Run:

```bash
git add SETUP.md docs/superpowers/specs/2026-07-07-ai-daily-news-brief-design.md
git commit -m "docs: describe codex daily brief fallback"
```

---

### Task 7: Full Verification

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run the Python unit tests**

Run:

```bash
python3 -m unittest tests.test_live_panel_sources
```

Expected: PASS with `Ran 3 tests`.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS with no failing Node or Python tests.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS and Vite writes `dist`.

- [ ] **Step 4: Generate the live panel from the Codex fixture**

Run:

```bash
AI_DAILY_JSON_PATH=tests/fixtures/ai-daily-latest.json npm run refresh:live-panel
```

Expected: `public/live-panel.json` contains `"aiStatus": "codex"` and five enriched news records.

- [ ] **Step 5: Confirm fallback still works when Codex JSON is absent**

Run:

```bash
AI_DAILY_JSON_PATH=/tmp/missing-ai-daily.json npm run refresh:live-panel
```

Expected: `public/live-panel.json` contains `"aiStatus": "fallback"` and five news records from the existing public-source fallback path or previous panel fallback.

- [ ] **Step 6: Inspect the final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files named in this plan changed.

- [ ] **Step 7: Commit final generated fixture state if needed**

If `public/live-panel.json` changed during verification, restore it to the intended enriched fixture state from Task 3, then commit any remaining verification-safe changes:

```bash
git add public/live-panel.json
git commit -m "chore: refresh live panel fixture"
```

---

## Self-Review Checklist

- Spec coverage: The plan implements Codex sidecar JSON as primary, fallback crawler as secondary, enriched front-end fields, GitHub Pages static JSON output, validation, docs, and tests.
- Placeholder scan: The plan contains no deferred implementation markers.
- Type consistency: The news fields are consistently `title`, `url`, `source`, `summaryZh`, `summaryEn`, `whyItMattersZh`, and `tags`; the frontend normalized shape is consistently `title`, `url`, `source`, `summary`, `whyItMatters`, and `tags`.
- Scope: The plan only changes the personal site repo. Changes to `codex-feishu-automation-kit` can be a separate follow-up if that automation does not yet emit `ai-daily/latest.json`.

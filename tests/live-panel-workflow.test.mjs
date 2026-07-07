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

// 验证实时面板刷新改用 Python 抓取脚本。
test("live panel refresh script runs through python", () => {
  assert.match(packageJson.scripts["refresh:live-panel"], /^python3\s+scripts\/fetch_live_panel\.py$/);
});

// 验证 Pages 工作流在北京时间 07:00 触发，对应 UTC 23:00。
test("pages workflow refreshes at 7am Asia Shanghai time", () => {
  assert.match(workflowSource, /cron:\s*"0 23 \* \* \*"/);
});

// 验证抓取脚本使用用户指定的新闻源，并把结果收敛到五条。
test("live panel crawler targets the requested news sources with five final items", () => {
  assert.match(fetchScriptSource, /36kr\.com\/feed/);
  assert.match(fetchScriptSource, /juejin\.cn/);
  assert.match(fetchScriptSource, /theverge\.com\/rss\/index\.xml/);
  assert.match(fetchScriptSource, /oschina\.net\/news/);
  assert.match(fetchScriptSource, /limit:\s*int\s*=\s*5/);
});

// 验证 Codex 日报 JSON 是主链路，公开新闻源抓取是兜底链路。
test("live panel prefers codex daily json before crawler fallback", () => {
  assert.match(fetchScriptSource, /AI_DAILY_JSON_PATH/);
  assert.match(fetchScriptSource, /AI_DAILY_JSON_URL/);
  assert.match(fetchScriptSource, /normalize_codex_daily_news/);
  assert.match(fetchScriptSource, /fetch_fallback_news/);
  assert.match(fetchScriptSource, /"codex"/);
  assert.match(fetchScriptSource, /"fallback"/);
});

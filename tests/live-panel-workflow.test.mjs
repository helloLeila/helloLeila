// 实时面板工作流测试，约束抓取脚本语言与每日刷新时间。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  fs.readFileSync(
    path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/package.json"),
    "utf8"
  )
);

const workflowSource = fs.readFileSync(
  path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/.github/workflows/pages.yml"),
  "utf8"
);
const fetchScriptSource = fs.readFileSync(
  path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/scripts/fetch_live_panel.py"),
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

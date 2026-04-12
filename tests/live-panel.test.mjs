// 实时面板数据测试，用于约束每日生成的数据文件结构。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const livePanelPath = path.resolve(
  "/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/public/live-panel.json"
);

// 验证实时面板数据文件已经被生成。
test("daily live panel fixture exists", () => {
  assert.ok(fs.existsSync(livePanelPath));
});

// 验证实时面板文件里同时包含七天天气摘要和五条指定来源新闻。
test("daily live panel fixture exposes seven-day weather and five source-driven news items", () => {
  const data = JSON.parse(fs.readFileSync(livePanelPath, "utf8"));

  assert.ok(data.weather);
  assert.equal(typeof data.weather.temperature, "number");
  assert.equal(typeof data.weather.humidity, "number");
  assert.ok(Array.isArray(data.weather.daily));
  assert.equal(data.weather.daily.length, 7);
  assert.equal(typeof data.weather.daily[0].morningTemperature, "number");
  assert.equal(typeof data.weather.daily[0].eveningTemperature, "number");
  assert.equal(typeof data.weather.daily[0].swing, "number");
  assert.equal(data.news.length, 5);
  assert.match(data.news.map((item) => item.url).join(","), /36kr|juejin|theverge|oschina/i);
});

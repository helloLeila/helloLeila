// 实时面板数据测试，用于约束每日生成的数据文件结构。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const livePanelPath = path.resolve(root, "public/live-panel.json");

// 验证实时面板数据文件已经被生成。
test("daily live panel fixture exists", () => {
  assert.ok(fs.existsSync(livePanelPath));
});

// 验证实时面板文件里同时包含七天天气摘要、Codex 日报与公开来源五条新闻。
test("daily live panel fixture exposes weather, codex global brief, and public news items", () => {
  const data = JSON.parse(fs.readFileSync(livePanelPath, "utf8"));

  assert.ok(data.weather);
  assert.equal(typeof data.weather.temperature, "number");
  assert.equal(typeof data.weather.humidity, "number");
  assert.equal(data.weather.source, "Open-Meteo");
  assert.match(data.weather.sourceUrl, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);
  assert.equal(typeof data.weather.observedAt, "string");
  assert.equal(typeof data.weather.isFallback, "boolean");
  assert.ok(data.weather.typhoonEta);
  assert.equal(typeof data.weather.typhoonEta.zh, "string");
  assert.equal(typeof data.weather.typhoonEta.en, "string");
  assert.ok(data.weather.typhoonAlert);
  assert.equal(data.weather.typhoonAlert.source, "中央气象台台风网");
  assert.match(data.weather.typhoonAlert.sourceUrl, /^https:\/\/typhoon\.nmc\.cn\/web\.html/);
  assert.equal(typeof data.weather.typhoonAlert.status, "string");
  assert.equal(typeof data.weather.typhoonAlert.alertUrl, "string");
  assert.equal(typeof data.weather.typhoonAlert.isFallback, "boolean");
  assert.ok(Array.isArray(data.weather.typhoonAlert.activeAlerts));
  assert.ok(Array.isArray(data.weather.typhoonAlert.activeTyphoons));
  assert.ok(Array.isArray(data.weather.daily));
  assert.equal(data.weather.daily.length, 7);
  assert.equal(typeof data.weather.daily[0].morningTemperature, "number");
  assert.equal(typeof data.weather.daily[0].eveningTemperature, "number");
  assert.equal(typeof data.weather.daily[0].swing, "number");
  assert.equal(data.aiStatus, "codex");

  assert.equal(data.codexNews.length, 5);
  for (const item of data.codexNews) {
    assert.equal(typeof item.title, "string");
    assert.match(item.url, /^https?:\/\//);
    assert.equal(typeof item.source, "string");
    assert.equal(typeof item.summaryZh, "string");
    assert.equal(typeof item.summaryEn, "string");
    assert.equal(typeof item.whyItMattersZh, "string");
    assert.ok(Array.isArray(item.tags));
  }

  assert.equal(data.news.length, 5);
  for (const item of data.news) {
    assert.equal(typeof item.title, "string");
    assert.match(item.url, /^https?:\/\//);
  }

  const codexUrls = data.codexNews.map((item) => item.url);
  const publicUrls = data.news.map((item) => item.url);
  assert.ok(codexUrls.every((url) => !url.includes("example.com")));
  assert.ok(publicUrls.every((url) => !url.includes("example.com")));
  assert.ok(codexUrls.some((url) => /^https:\/\/github\.blog\/changelog\//.test(url)));
  assert.ok(codexUrls.some((url) => /^https:\/\/www\.axios\.com\//.test(url)));
  const allowedPublicSources = [
    /^https:\/\/36kr\.com\//,
    /^https:\/\/juejin\.cn\/post\//,
    /^https:\/\/www\.oschina\.net\/news(?:\/|$)/,
    /^https:\/\/my\.oschina\.net\/u\/\d+\/blog\/\d+/,
  ];
  assert.ok(publicUrls.every((url) => allowedPublicSources.some((pattern) => pattern.test(url))));
  assert.ok(publicUrls.some((url) => /^https:\/\/36kr\.com\//.test(url)));
  assert.ok(publicUrls.some((url) => /^https:\/\/www\.oschina\.net\/news(?:\/|$)/.test(url)));
});

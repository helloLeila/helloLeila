// Hook 冒烟测试，用于确认实时面板 Hook 在服务端渲染路径中不会直接抛错。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { useWeatherNews } from "../src/hooks/useWeatherNews.js";

// 最小测试组件，用于触发 Hook 执行。
function HookSmoke() {
  useWeatherNews("zh");
  return React.createElement("div", null, "ok");
}

// 验证 Hook 在渲染阶段不会因为副作用或作用域问题报错。
test("useWeatherNews does not throw during render", () => {
  assert.doesNotThrow(() => {
    renderToString(React.createElement(HookSmoke));
  });
});

test("useWeatherNews normalizes enriched news fields", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "src/hooks/useWeatherNews.js"), "utf8");

  assert.match(source, /function normalizeNewsItem/);
  assert.match(source, /summaryZh/);
  assert.match(source, /summaryEn/);
  assert.match(source, /whyItMattersZh/);
  assert.match(source, /tags\.slice\(0,\s*4\)/);
});

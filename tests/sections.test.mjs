// 区块结构测试，用于确保关键模块保持当前的组件结构和单语切换方式。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const coverageSource = fs.readFileSync(
  path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/src/components/CoverageField.jsx"),
  "utf8"
);
const milestoneSource = fs.readFileSync(
  path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/src/components/AnnualMilestones.jsx"),
  "utf8"
);
const appStyleSource = fs.readFileSync(
  path.resolve("/Users/leila/Documents/Playground 3/github-profile-home/.worktrees/react-antv-homepage/src/styles/app.css"),
  "utf8"
);

// 验证地图模块标题走语言切换，并保留摘要栅格结构。
test("coverage field uses lang-specific heading and summary grid structure", () => {
  assert.match(coverageSource, /textByLang\(lang,\s*siteContent\.coverage\.titleEn,\s*siteContent\.coverage\.titleZh\)/);
  assert.doesNotMatch(coverageSource, /siteContent\.coverage\.titleEn} \/ {siteContent\.coverage\.titleZh/);
  assert.match(coverageSource, /coverage-card/);
  assert.match(coverageSource, /coverage-layout/);
  assert.match(coverageSource, /coverage-copy/);
  assert.match(coverageSource, /weather-panel/);
  assert.match(coverageSource, /WeatherTrendChart/);
  assert.match(coverageSource, /coverage-summary-grid/);
});

// 验证地图示例被封装成真正的 React 组件，而不是直接把 demo 源码铺在模块顶层。
test("coverage field wraps the l7 scene inside the CoverageField react component", () => {
  assert.match(coverageSource, /export function CoverageField\(\{\s*lang,\s*weather\s*\}\)/);
  assert.doesNotMatch(coverageSource, /export function SignalCloud/);
  assert.match(coverageSource, /useEffect\(\(\)\s*=>\s*\{/);
  assert.match(coverageSource, /new Scene\(\{/);
});

// 验证深圳地图主层改为 L7 三维柱体与弧线，而不是平面弱网格背景。
test("coverage field uses 3d antv map layers for the shenzhen scene", () => {
  assert.match(coverageSource, /ThreeLayer/);
  assert.match(coverageSource, /ThreeRender/);
  assert.match(coverageSource, /scene\.registerRenderService\(ThreeRender\)/);
  assert.match(coverageSource, /const barLayer = new PointLayer/);
  assert.match(coverageSource, /\.shape\("cylinder"\)/);
  assert.match(coverageSource, /const airLineLayer = new LineLayer/);
  assert.match(coverageSource, /\.shape\("arc3d"\)/);
});

// 验证地图数据已经从长沙示例切到深圳 / 大湾区场景。
test("coverage field uses shenzhen and greater bay area coordinates instead of changsha sample data", () => {
  assert.match(coverageSource, /\[114\.0579,\s*22\.5431\]/);
  assert.match(coverageSource, /深圳宝安国际机场/);
  assert.match(coverageSource, /香港国际机场/);
  assert.match(coverageSource, /珠海金湾机场/);
  assert.match(coverageSource, /南山区/);
  assert.match(coverageSource, /宝安区/);
  assert.match(coverageSource, /textAllowOverlap:\s*true/);
  assert.match(coverageSource, /textOffset:/);
  assert.match(coverageSource, /textAnchor:/);
  assert.match(coverageSource, /rotation:\s*0/);
  assert.doesNotMatch(coverageSource, /长沙黄花国际机场/);
  assert.doesNotMatch(coverageSource, /常德桃花源机场/);
});

// 验证里程碑模块标题走语言切换，并保留统一的趋势承载容器。
test("annual milestones use lang-specific heading inside roadmap surface", () => {
  assert.match(milestoneSource, /textByLang\(lang,\s*siteContent\.roadmap\.titleEn,\s*siteContent\.roadmap\.titleZh\)/);
  assert.doesNotMatch(milestoneSource, /siteContent\.roadmap\.titleEn} \/ {siteContent\.roadmap\.titleZh/);
  assert.match(milestoneSource, /roadmap-surface/);
});

// 验证年度里程碑的台阶使用固定高度，避免文案把逐年升高的节奏撑乱。
test("annual milestones use fixed step heights for a stable upward staircase", () => {
  assert.match(milestoneSource, /const heights = \[[\d,\s]+\]/);
  assert.match(appStyleSource, /\.road-step\s*\{[\s\S]*height:\s*var\(--step-height\)/);
  assert.doesNotMatch(appStyleSource, /\.road-step\s*\{[\s\S]*min-height:\s*var\(--step-height\)/);
});

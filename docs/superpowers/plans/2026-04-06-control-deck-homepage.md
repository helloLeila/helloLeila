# Control Deck Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重建 GitHub Pages 本地首页为一个双语、顺滑、可切换 4 个主题的控制甲板式交互页，并恢复 `index.html`、`styles.css`、`script.js` 的结构一致性。

**Architecture:** 页面以单主舞台为核心，顶部保留紧凑品牌信息，首屏由 4 个主题按钮驱动整块舞台联动变化。主题内容单独收敛到一个数据模块中，脚本负责把数据映射到舞台、浮动标签、层叠卡片和背景状态上，样式表只服务于这一套确定的 DOM 结构。

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), Node.js built-in test runner, GitHub Pages

---

## 文件结构

### 新增文件

- `docs/superpowers/plans/2026-04-06-control-deck-homepage.md`
  - 当前实现计划
- `tests/homepage-structure.test.mjs`
  - 校验首页结构是否包含主舞台、4 个主题按钮和关键数据挂载点
- `tests/homepage-theme-data.test.mjs`
  - 校验主题数据是否完整包含双语文案和舞台字段
- `theme-data.js`
  - 首页 4 个主题的数据源，供浏览器脚本和测试同时使用

### 修改文件

- `index.html`
  - 重建页面结构，恢复一致的语义化 DOM
- `styles.css`
  - 重建整页视觉和交互样式
- `script.js`
  - 重建舞台联动、按钮磁吸、层卡重排和背景动效
- `SETUP.md`
  - 如有需要，补充本地校验命令

---

### Task 1: 建立失败中的结构测试和主题数据测试

**Files:**
- Create: `tests/homepage-structure.test.mjs`
- Create: `tests/homepage-theme-data.test.mjs`
- Create: `theme-data.js`
- Test: `tests/homepage-structure.test.mjs`
- Test: `tests/homepage-theme-data.test.mjs`

- [ ] **Step 1: 写首页结构失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("homepage has a hero stage shell", () => {
  assert.match(html, /class="hero-stage"/);
  assert.match(html, /id="themeControls"/);
  assert.match(html, /id="stagePanel"/);
});

test("homepage exposes four theme buttons", () => {
  const matches = [...html.matchAll(/data-theme="/g)];
  assert.equal(matches.length, 4);
});
```

- [ ] **Step 2: 运行结构测试，确认当前失败**

Run: `node --test tests/homepage-structure.test.mjs`

Expected: FAIL，因为当前 `index.html` 已被删除，或者不包含新的舞台结构。

- [ ] **Step 3: 写主题数据失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { themeData } from "../theme-data.js";

test("theme data contains four stage themes", () => {
  assert.equal(themeData.length, 4);
});

test("each theme contains bilingual title and summaries", () => {
  for (const item of themeData) {
    assert.ok(item.titleEn);
    assert.ok(item.titleZh);
    assert.ok(item.summaryEn);
    assert.ok(item.summaryZh);
    assert.equal(item.tags.length, 3);
    assert.equal(item.cards.length, 3);
  }
});
```

- [ ] **Step 4: 建立最小主题数据文件以支撑失败测试**

```js
export const themeData = [];
```

- [ ] **Step 5: 运行主题数据测试，确认当前失败**

Run: `node --test tests/homepage-theme-data.test.mjs`

Expected: FAIL，提示主题数量或字段不满足要求。

- [ ] **Step 6: Commit**

```bash
git add tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs theme-data.js
git commit -m "test: add failing homepage structure and theme data checks"
```

---

### Task 2: 重建首页 HTML 骨架并让结构测试通过

**Files:**
- Modify: `index.html`
- Test: `tests/homepage-structure.test.mjs`

- [ ] **Step 1: 写新的首页语义骨架**

```html
<main class="page-shell">
  <section class="hero-stage" id="heroStage">
    <div class="hero-copy">
      <p class="eyebrow">CONTROL DECK</p>
      <h1 class="hero-title" id="heroTitleEn">Systems that feel operational.</h1>
      <p class="hero-title-zh" id="heroTitleZh">兼具工程秩序与研究表达的交互首页。</p>
      <div class="hero-summary">
        <p id="heroSummaryEn">A bilingual stage for engineering delivery and academic clarity.</p>
        <p id="heroSummaryZh">一个强调工程落地与学术清晰度的双语互动舞台。</p>
      </div>
      <nav class="theme-controls" id="themeControls">
        <button class="theme-control is-active" data-theme="fullstack">Full-stack Engineering</button>
        <button class="theme-control" data-theme="frontend">Frontend Systems</button>
        <button class="theme-control" data-theme="dataviz">Data Visualization</button>
        <button class="theme-control" data-theme="academic">Academic Research</button>
      </nav>
    </div>
    <div class="stage-panel" id="stagePanel"></div>
  </section>
</main>
```

- [ ] **Step 2: 补齐舞台内部的关键 DOM 挂点**

```html
<div class="stage-status" id="stageStatus"></div>
<div class="stage-tags">
  <span class="float-tag" id="floatTagA"></span>
  <span class="float-tag" id="floatTagB"></span>
  <span class="float-tag" id="floatTagC"></span>
</div>
<div class="stage-cards">
  <article class="stack-card" id="stackCardA"></article>
  <article class="stack-card" id="stackCardB"></article>
  <article class="stack-card" id="stackCardC"></article>
</div>
```

- [ ] **Step 3: 运行结构测试，确认转绿**

Run: `node --test tests/homepage-structure.test.mjs`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: rebuild homepage html structure"
```

---

### Task 3: 完成主题数据模块并让数据测试通过

**Files:**
- Modify: `theme-data.js`
- Test: `tests/homepage-theme-data.test.mjs`

- [ ] **Step 1: 写完整的四组主题数据**

```js
export const themeData = [
  {
    key: "fullstack",
    buttonEn: "Full-stack Engineering",
    buttonZh: "全栈工程",
    titleEn: "Full-stack systems with reliable delivery.",
    titleZh: "强调稳定交付与系统协同的全栈工程能力。",
    summaryEn: "From interface behavior to service coordination, the stage stays coherent under real constraints.",
    summaryZh: "从界面行为到服务协同，面向真实约束下的稳定实现与整体一致性。",
    points: [
      "Frontend and backend collaboration",
      "Operational delivery under product constraints",
      "Clear boundaries across interfaces and services",
    ],
    tags: ["Java", "Docker", "MySQL"],
    cards: [
      { kicker: "Delivery", title: "System Flow", text: "Stable coordination across client and service layers." },
      { kicker: "Runtime", title: "Operations", text: "Deployment-aware implementation instead of static demos." },
      { kicker: "Structure", title: "Contracts", text: "Clear interfaces between modules and responsibilities." },
    ],
  },
];
```

- [ ] **Step 2: 补齐其余三个主题**

```js
{
  key: "frontend",
  buttonEn: "Frontend Systems",
  buttonZh: "前端系统",
  titleEn: "Product-facing interfaces with strong internal order.",
  titleZh: "兼顾产品表现力与内部秩序感的前端系统。",
  ...
}
```

```js
{
  key: "dataviz",
  buttonEn: "Data Visualization",
  buttonZh: "数据可视化",
  titleEn: "Readable visual systems, not decorative charts.",
  titleZh: "强调信息可读性而不是堆图表的数据表达。",
  ...
}
```

```js
{
  key: "academic",
  buttonEn: "Academic Research",
  buttonZh: "学术研究",
  titleEn: "Research framing, structured analysis, and reproducible thinking.",
  titleZh: "面向研究问题建模、结构化分析与可复用的方法表达。",
  ...
}
```

- [ ] **Step 3: 运行主题数据测试，确认转绿**

Run: `node --test tests/homepage-theme-data.test.mjs`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add theme-data.js tests/homepage-theme-data.test.mjs
git commit -m "feat: add bilingual control deck theme data"
```

---

### Task 4: 重建脚本，让整块舞台联动切换

**Files:**
- Modify: `script.js`
- Modify: `index.html`
- Modify: `theme-data.js`
- Test: `tests/homepage-structure.test.mjs`
- Test: `tests/homepage-theme-data.test.mjs`

- [ ] **Step 1: 将脚本改为 ES module，并从数据模块加载主题配置**

```html
<script type="module" src="./script.js"></script>
```

```js
import { themeData } from "./theme-data.js";

const state = {
  activeKey: "fullstack",
};
```

- [ ] **Step 2: 建立主题切换渲染函数**

```js
function renderTheme(theme) {
  heroTitleEn.textContent = theme.titleEn;
  heroTitleZh.textContent = theme.titleZh;
  heroSummaryEn.textContent = theme.summaryEn;
  heroSummaryZh.textContent = theme.summaryZh;
  stageStatus.textContent = theme.status;
}
```

- [ ] **Step 3: 建立浮动标签和层卡重排函数**

```js
function renderTags(theme) {
  [floatTagA, floatTagB, floatTagC].forEach((node, index) => {
    node.textContent = theme.tags[index];
    node.style.transform = `translate(${theme.tagLayout[index].x}px, ${theme.tagLayout[index].y}px) rotate(${theme.tagLayout[index].r}deg)`;
  });
}

function renderCards(theme) {
  [stackCardA, stackCardB, stackCardC].forEach((card, index) => {
    const item = theme.cards[index];
    card.querySelector(".stack-kicker").textContent = item.kicker;
    card.querySelector(".stack-title").textContent = item.title;
    card.querySelector(".stack-text").textContent = item.text;
  });
}
```

- [ ] **Step 4: 加入按钮磁吸、按压和舞台扫光逻辑**

```js
function bindControlMotion(button) {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    button.style.setProperty("--mx", `${dx * 0.12}px`);
    button.style.setProperty("--my", `${dy * 0.12}px`);
  });

  button.addEventListener("pointerleave", () => {
    button.style.setProperty("--mx", "0px");
    button.style.setProperty("--my", "0px");
  });
}
```

- [ ] **Step 5: 给主舞台加入 pointer parallax**

```js
heroStage.addEventListener("pointermove", (event) => {
  const rect = heroStage.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - 0.5;
  const py = (event.clientY - rect.top) / rect.height - 0.5;
  stagePanel.style.transform = `rotateX(${py * -4}deg) rotateY(${px * 6}deg)`;
});
```

- [ ] **Step 6: 运行测试确认基本结构未被破坏**

Run: `node --test tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add script.js index.html theme-data.js tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs
git commit -m "feat: add control deck stage interactions"
```

---

### Task 5: 重建样式，让首屏像一个浅色控制舞台

**Files:**
- Modify: `styles.css`
- Modify: `index.html`

- [ ] **Step 1: 重建全局浅色背景与层次变量**

```css
:root {
  --bg: #fff8ef;
  --bg-2: #eef6ff;
  --text: #112345;
  --muted: rgba(17, 35, 69, 0.72);
  --line: rgba(67, 110, 206, 0.18);
  --accent-a: #3d6fff;
  --accent-b: #16c1ac;
  --accent-c: #ffaf77;
  --panel: rgba(255, 255, 255, 0.74);
  --panel-strong: rgba(255, 255, 255, 0.88);
}
```

- [ ] **Step 2: 重建首屏舞台布局**

```css
.hero-stage {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(460px, 1.08fr);
  gap: clamp(18px, 2vw, 30px);
  min-height: min(92vh, 860px);
}
```

- [ ] **Step 3: 让主题按钮具备 Wan 风格反馈**

```css
.theme-control {
  transform: translate(var(--mx, 0), var(--my, 0));
  transition:
    transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1),
    border-color 180ms ease,
    box-shadow 220ms ease,
    background 220ms ease;
}

.theme-control:active {
  transform: translate(var(--mx, 0), var(--my, 0)) scale(0.97);
}

.theme-control.is-active {
  box-shadow: 0 18px 40px rgba(62, 111, 255, 0.16);
}
```

- [ ] **Step 4: 完成舞台面板、浮动标签和层卡样式**

```css
.stage-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255,255,255,0.82), rgba(241,247,255,0.76));
  backdrop-filter: blur(18px);
}

.float-tag,
.stack-card {
  transition:
    transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 280ms ease,
    background 320ms ease;
}
```

- [ ] **Step 5: 补齐响应式规则，防止首屏空白和溢出**

```css
@media (max-width: 960px) {
  .hero-stage {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add styles.css index.html
git commit -m "feat: rebuild control deck visual system"
```

---

### Task 6: 本地验证、截图更新和文档收尾

**Files:**
- Modify: `SETUP.md`
- Modify: `assets/previews/homepage-preview.png`

- [ ] **Step 1: 运行 Node 测试**

Run: `node --test tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs`

Expected: PASS

- [ ] **Step 2: 本地启动页面检查**

Run: `./preview-local.sh`

Expected: 在 `http://127.0.0.1:8000/index.html` 看到新的双语控制舞台首页。

- [ ] **Step 3: 重新生成预览截图**

Run: `./capture-preview.sh`

Expected: `assets/previews/homepage-preview.png` 被更新为新的首屏截图。

- [ ] **Step 4: 如果本地预览命令或页面结构说明有变化，更新说明**

```md
- `theme-data.js`: 首页主题数据源
- `node --test tests/homepage-structure.test.mjs tests/homepage-theme-data.test.mjs`
```

- [ ] **Step 5: Commit**

```bash
git add SETUP.md assets/previews/homepage-preview.png
git commit -m "docs: refresh homepage preview and setup notes"
```

---

## 自检

### 规格覆盖

- 单主舞台：Task 2 + Task 5
- 4 个主题按钮：Task 2 + Task 3 + Task 4
- 点击后整块舞台联动：Task 4
- 双语表达：Task 3 + Task 4
- 标签式技能地图：Task 2 + Task 5
- 浅色工程 + 学术风格：Task 5
- 本地预览与截图一致：Task 6

### 占位符检查

- 无 `TODO`、`TBD`、`后续补充`
- 所有任务都给出精确文件路径
- 每个任务都给出具体命令和预期结果

### 一致性检查

- 主题 key 在 HTML、测试和数据模块中统一为：
  - `fullstack`
  - `frontend`
  - `dataviz`
  - `academic`
- 关键 DOM id 在 HTML 和脚本中统一为：
  - `themeControls`
  - `stagePanel`
  - `stageStatus`
  - `floatTagA/B/C`
  - `stackCardA/B/C`

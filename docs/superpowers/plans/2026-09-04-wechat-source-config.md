# 公众号来源配置 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在活动雷达页面增加右侧来源配置抽屉，让用户只填写公众号名称，并通过本地 Vite API 将名称真实写回 `data/wechat-event-sources.json`，供后续 GitHub Actions 刷新使用。

**Architecture:** 前端 `SourceConfigDrawer` 管理 37 个来源的名称编辑和状态展示；`sourceConfig.js` 提供纯函数完成名称规范化、去重和搜索词预览；Vite 开发服务器挂载仅本机可用的 `/__events/source-config` API，由 `scripts/source-config-store.mjs` 负责校验、保留原字段和原子写入项目 JSON。GitHub Pages 生产构建不包含写入接口，公开页面只读。

**Tech Stack:** React 18, Vite 7, Node.js ESM, Node `node:test`, plain CSS, JSON file persistence

---

## 文件结构

### 新增文件

- `src/events/SourceConfigDrawer.jsx`
  - 右侧抽屉、名称编辑、新增自定义来源、键盘和移动端行为
- `src/events/sourceConfig.js`
  - 名称规范化、重复检查、搜索词生成和前端 API helpers
- `scripts/source-config-store.mjs`
  - 项目 JSON 读取、请求体校验、字段保留、原子写入和本机请求判断
- `tests/source-config.test.mjs`
  - 前端纯函数、项目 JSON 更新和本地 API 边界测试

### 修改文件

- `src/events/EventsApp.jsx`
  - 添加“来源配置”按钮、来源状态合并和抽屉挂载
- `src/events/events.css`
  - 添加抽屉、遮罩、来源行、状态标记、滚动和窄屏样式
- `vite.config.js`
  - 仅在 `serve` 命令注册 `/__events/source-config` 本地中间件
- `tests/events.test.mjs`
  - 校验入口按钮和抽屉挂载
- `package.json`
  - 将 `tests/source-config.test.mjs` 纳入 `npm test`
- `SETUP.md`
  - 说明本地配置、JSON 写入位置和生产页只读边界

## Task 1: 写来源配置纯函数和 JSON 更新的失败测试

**Files:**
- Create: `tests/source-config.test.mjs`

- [ ] **Step 1: 写名称处理和搜索词失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";

test("source config normalizes names and creates the public search query", async () => {
  const { normalizeSourceName, buildSourceSearchQuery } = await import("../src/events/sourceConfig.js");
  assert.equal(normalizeSourceName("  量子位   "), "量子位");
  assert.equal(buildSourceSearchQuery("量子位"), '"量子位" 微信公众号 活动');
  assert.throws(() => normalizeSourceName("   "), /name/i);
});
```

- [ ] **Step 2: 写“不能删除原始来源”和重复名称失败测试**

```js
test("source config keeps every original id and rejects duplicate names", async () => {
  const { mergeSourceNames } = await import("../scripts/source-config-store.mjs");
  const current = {
    sources: [
      { id: "qbitai", name: "量子位", category: "ai", feedUrl: "", enabled: false },
      { id: "openbuild", name: "OpenBuild", category: "open-source", feedUrl: "", enabled: false },
    ],
    manualArticleUrls: [],
  };

  assert.throws(
    () => mergeSourceNames(current, { sources: [{ id: "qbitai", name: "OpenBuild" }] }),
    /original source/i,
  );
  assert.throws(
    () => mergeSourceNames(current, { sources: [{ id: "qbitai", name: "新的名字" }, { id: "openbuild", name: "新的名字" }] }),
    /duplicate/i,
  );
});
```

- [ ] **Step 3: 运行失败测试**

Run:

```bash
node --test tests/source-config.test.mjs
```

Expected: FAIL，因为 `sourceConfig.js` 和 `source-config-store.mjs` 尚未创建。

## Task 2: 实现名称纯函数和项目 JSON 更新器

**Files:**
- Create: `src/events/sourceConfig.js`
- Create: `scripts/source-config-store.mjs`

- [ ] **Step 1: 实现前端纯函数**

实现以下导出：

```js
export const SOURCE_CONFIG_PATH = "/__events/source-config";

export function normalizeSourceName(value) {
  const name = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!name) throw new Error("source name is required");
  return name;
}

export function buildSourceSearchQuery(name) {
  return `"${normalizeSourceName(name)}" 微信公众号 活动`;
}

export function filterSourceNames(sources, query) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (!needle) return sources;
  return sources.filter((source) => source.name.toLowerCase().includes(needle));
}

export function sourceStatusLabel(source) {
  if (source.status === "ok") return "已接入";
  if (source.status === "failed") return "读取失败";
  if (source.discoveryStatus === "confirmed") return "已确认";
  if (source.discoveryStatus === "unavailable") return "暂不可用";
  return "待确认";
}

export async function readProjectSourceConfig() {
  const response = await fetch(SOURCE_CONFIG_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error("local source config API unavailable");
  return response.json();
}

export async function writeProjectSourceConfig(sources) {
  const response = await fetch(SOURCE_CONFIG_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources }),
  });
  if (!response.ok) throw new Error("project source config could not be saved");
  return response.json();
}
```

- [ ] **Step 2: 实现服务端合并和原子写入**

`mergeSourceNames(current, incoming)` 必须：

- 要求 `current.sources` 为数组。
- 要求 incoming 包含 current 的每个原始 `id`，缺少任何一个都抛出 `original source cannot be deleted`。
- 规范化所有名称，拒绝空名称。
- 按不区分大小写的名称拒绝重复。
- 对原始 ID 只更新 `name`，保留 `category`、`feedUrl`、`enabled`、`discoveryStatus` 和其他字段。
- 允许 `custom: true` 的新增来源，补齐 `category: "other"`、`feedUrl: ""` 和 `enabled: false`。
- 始终保留 `manualArticleUrls` 和项目 JSON 的其他顶层字段。

`writeSourceConfig(filePath, payload)` 使用同目录临时文件写入 JSON，成功后 `rename` 替换原文件；失败时删除临时文件并保留原文件。

- [ ] **Step 3: 实现本机请求判断和 HTTP 中间件**

`createSourceConfigMiddleware({ filePath })` 处理：

- `GET /__events/source-config`：返回当前 JSON。
- `PUT /__events/source-config`：读取不超过 1 MB 的 JSON 请求体，调用 `mergeSourceNames`，写入后返回新 JSON。
- 非 `127.0.0.1`、`::1` 或 `::ffff:127.0.0.1` 请求返回 `403`。
- 其他路径调用 `next()`。
- 方法不匹配返回 `405`。
- 校验失败返回 `400`，文件读取或写入失败返回 `500`。

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
node --test tests/source-config.test.mjs
```

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/events/sourceConfig.js scripts/source-config-store.mjs tests/source-config.test.mjs
git commit -m "feat: add source config storage helpers"
```

## Task 3: 挂载 Vite 本地配置 API

**Files:**
- Modify: `vite.config.js`
- Modify: `tests/events.test.mjs`

- [ ] **Step 1: 写 Vite 配置失败测试**

在 `tests/events.test.mjs` 增加断言：

```js
assert.match(viteSource, /createSourceConfigMiddleware/);
assert.match(viteSource, /command === "serve"/);
assert.match(viteSource, /data.*wechat-event-sources\.json/);
```

- [ ] **Step 2: 在 Vite `serve` 模式注册中间件**

在 `vite.config.js` 中导入 `createSourceConfigMiddleware`，并仅在 `command === "serve"` 时通过 `configureServer(server)` 注册：

```js
configureServer(server) {
  server.middlewares.use(createSourceConfigMiddleware({
    filePath: path.resolve(rootDir, "data/wechat-event-sources.json"),
  }));
},
```

生产 `vite build` 不注册该接口。

- [ ] **Step 3: 运行相关测试**

Run:

```bash
node --test tests/events.test.mjs tests/source-config.test.mjs
```

Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add vite.config.js tests/events.test.mjs
git commit -m "feat: expose local source config api in vite"
```

## Task 4: 实现右侧来源配置抽屉

**Files:**
- Create: `src/events/SourceConfigDrawer.jsx`
- Modify: `src/events/EventsApp.jsx`
- Modify: `src/events/events.css`

- [ ] **Step 1: 写组件结构失败测试**

在 `tests/events.test.mjs` 增加静态结构断言：

```js
const drawerSource = fs.readFileSync(path.resolve(root, "src/events/SourceConfigDrawer.jsx"), "utf8");
assert.match(source, /来源配置/);
assert.match(source, /aria-haspopup="dialog"/);
assert.match(drawerSource, /保存到项目 JSON/);
assert.match(drawerSource, /添加名称/);
assert.doesNotMatch(drawerSource, /文章地址|RSS|公众号 ID/);
```

- [ ] **Step 2: 实现抽屉状态和数据加载**

组件行为：

- `open` 为 false 时不渲染。
- 打开时调用 `readProjectSourceConfig()` 读取项目 JSON；失败时保留 payload 中的 37 个来源并显示只读提示。
- 以来源 ID 合并 `payload.sources` 的状态。
- 顶部显示来源总数、已确认、待确认、暂不可用数量。
- 名称搜索只过滤当前抽屉列表。

- [ ] **Step 3: 实现名称编辑和保存**

- 每个原始来源保留输入框和状态标签，不显示删除按钮。
- 新增名称创建 `custom: true` 的本地来源。
- 修改名称时即时更新草稿，不立即写文件。
- 保存前检查空名称和重复名称。
- 点击“保存到项目 JSON”调用 `writeProjectSourceConfig`，成功后重新读取项目 JSON，显示保存时间。
- 点击“恢复当前 JSON”丢弃未保存草稿。

- [ ] **Step 4: 实现键盘与响应式行为**

- 抽屉使用 `role="dialog"`、`aria-modal="true"` 和标题关联。
- 打开后焦点进入名称搜索框。
- `Esc`、关闭按钮和遮罩关闭抽屉，焦点返回入口按钮。
- 打开时锁定 body 滚动。
- 桌面端固定右侧约 420px，窄屏端全屏。

- [ ] **Step 5: 在 EventsApp 添加入口**

页头增加：

```jsx
<button type="button" className="events-config-button" aria-haspopup="dialog" onClick={() => setConfigOpen(true)}>
  <span aria-hidden="true">⚙</span> 来源配置
</button>
```

将 `payload?.sources` 传给抽屉，不改动现有活动筛选和活动列表逻辑。

- [ ] **Step 6: 添加抽屉 CSS**

使用现有 `--events-*` 变量，增加：

- `.source-config-backdrop`
- `.source-config-drawer`
- `.source-config-header`
- `.source-config-list`
- `.source-config-row`
- `.source-config-status`
- `.source-config-query`
- `.source-config-actions`

避免嵌套卡片，保持输入和按钮在窄屏不溢出。

- [ ] **Step 7: 运行测试和构建**

Run:

```bash
npm test
npm run build
```

Expected: PASS and `dist/events/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add src/events/SourceConfigDrawer.jsx src/events/EventsApp.jsx src/events/events.css tests/events.test.mjs package.json
git commit -m "feat: add source config drawer"
```

## Task 5: 更新本地使用说明和端到端验证

**Files:**
- Modify: `SETUP.md`

- [ ] **Step 1: 更新说明**

明确写出：

```text
npm run dev -- --host 127.0.0.1 --port 4174
```

然后打开 `/events/`，点击“来源配置”，名称保存位置为：

```text
data/wechat-event-sources.json
```

说明保存后仍需 `git diff`、`git commit` 和 `git push`，公开 GitHub Pages 不提供写接口。

- [ ] **Step 2: 启动本地服务并验证 API**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 4174
```

通过浏览器验证：

- 页面能打开并显示活动数据
- 点击“来源配置”打开右侧抽屉
- 抽屉显示 37 个来源
- 新增一个名称后保存
- `git diff -- data/wechat-event-sources.json` 能看到真实 JSON 变更
- 刷新页面后名称仍来自项目 JSON
- 删除入口不存在，37 个原始来源仍在
- 窄屏抽屉不横向溢出

- [ ] **Step 3: 最终检查**

Run:

```bash
npm test
npm run build
git diff --check
git status --short --branch
```

- [ ] **Step 4: Commit**

```bash
git add SETUP.md
git commit -m "docs: explain project source config workflow"
```

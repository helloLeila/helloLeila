# React AntV Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前静态个人网站原型迁移为一个可运行的 `React + AntV` 版本，并同步落首屏压缩、逐项技能标签链接、词云/快讯/天气/里程碑等真实模块。

**Architecture:** 页面保持单页结构，但改为 `Vite + React` 驱动。静态原型拆成 `layout shell + hero blocks + analytics modules + utilities modules` 四层，页面数据统一放在本地配置文件中，动态图表由 `AntV` 渲染，实时数据通过轻量 fetch 在客户端拉取。

**Tech Stack:** React 18, Vite, plain CSS, AntV (@ant-design/plots / G2 family), native fetch

---

## 文件结构

### 新增文件

- `package.json`
  - React/Vite/AntV 依赖与脚本
- `vite.config.js`
  - Vite 构建配置
- `src/main.jsx`
  - React 挂载入口
- `src/App.jsx`
  - 页面总装配
- `src/styles/app.css`
  - React 版本页面样式
- `src/data/siteContent.js`
  - 页面静态文案、技能标签链接、里程碑、工作入口、默认新闻回退数据
- `src/components/HeroStage.jsx`
  - 首屏大画布
- `src/components/StatsRow.jsx`
  - 顶部四张事实卡
- `src/components/ProofDeck.jsx`
  - `Problems Solved` 与 `AI Agent Knowledge`
- `src/components/SkillGroups.jsx`
  - 四组技能卡与逐 tag 超链接
- `src/components/WorkflowCanvas.jsx`
  - 企业级工作流设计区域占位
- `src/components/SignalCloud.jsx`
  - AntV 词云组件
- `src/components/AnnualMilestones.jsx`
  - 年度里程碑台阶
- `src/components/CoverageField.jsx`
  - 深圳相关个人阵地模块
- `src/components/UtilitiesPanel.jsx`
  - 天气、时间、快讯、底部入口与回到顶部
- `src/hooks/useWeatherNews.js`
  - 实时天气/新闻抓取
- `src/utils/timezones.js`
  - 北京/纽约/欧洲时间格式化
- `tests/site-content.test.mjs`
  - 内容结构测试

### 修改文件

- `README.md`
  - 如有需要，补充 React 本地运行方式
- `SETUP.md`
  - 增加 React 开发/构建命令
- `preview-local.sh`
  - 改为启动 Vite 预览或给出新的本地预览方式

---

### Task 1: 建立 React 工程骨架与失败测试

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `tests/site-content.test.mjs`

- [ ] **Step 1: 写内容结构失败测试**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL，因为 `siteContent.js` 还不存在。

- [ ] **Step 2: 创建最小 React/Vite 入口**

包含：
- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`

- [ ] **Step 3: 创建最小挂载代码**

让页面先能渲染 `App`。

- [ ] **Step 4: Commit**

```bash
git add package.json vite.config.js src/main.jsx src/App.jsx tests/site-content.test.mjs
git commit -m "chore: bootstrap react homepage app"
```

---

### Task 2: 迁移首屏结构并保留当前原型布局

**Files:**
- Create: `src/components/HeroStage.jsx`
- Create: `src/components/StatsRow.jsx`
- Create: `src/components/ProofDeck.jsx`
- Create: `src/components/SkillGroups.jsx`
- Create: `src/styles/app.css`
- Create: `src/data/siteContent.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: 把首屏拆成 React 组件**

包含：
- 顶部欢迎条与语言切换
- 标题区
- 四张 stats 卡
- summary card
- 右侧两张 proof card
- 四组技能卡

- [ ] **Step 2: 修正当前用户指定的布局点**

必须直接带上：
- 顶部四张 stats 卡尺寸统一
- 与最右侧卡片尺寸表现一致
- `Frontend / 前端` 前增加约 `20px` 起始间距
- 技能卡每个小 tag 独立超链接，整卡不跳转

- [ ] **Step 3: 让首屏在桌面端尽量收进一屏**

---

### Task 3: 用 AntV 接管词云与图表模块

**Files:**
- Create: `src/components/SignalCloud.jsx`
- Create: `src/components/CoverageField.jsx`
- Modify: `src/data/siteContent.js`

- [ ] **Step 1: 用 AntV 实现能力词云**

要求：
- 整体视觉比原先放大约 `30%`
- 尽量铺满容器
- 词项来自你的真实技术栈与业务表达

- [ ] **Step 2: 保留深圳模块，但改成更适合个人网站的命名**

不再使用：
- `Based in Shenzhen, shipping across 31 provinces`

改成更个人语气的模块标题，并保留真实覆盖事实。

---

### Task 4: 实现企业级工作流设计区与年度里程碑

**Files:**
- Create: `src/components/WorkflowCanvas.jsx`
- Create: `src/components/AnnualMilestones.jsx`
- Modify: `src/data/siteContent.js`

- [ ] **Step 1: 将 `What I actually built / 具体做了什么` 改成承载企业级工作流设计的区域**

先以结构占位和模块化画布实现，后续方便继续填真实流程。

- [ ] **Step 2: 压缩年度里程碑底部留白**

要求：
- 保留台阶形式
- 进一步减少底部空白
- 年份和说明更贴合台阶顶部

---

### Task 5: 实时模块与底部入口

**Files:**
- Create: `src/components/UtilitiesPanel.jsx`
- Create: `src/hooks/useWeatherNews.js`
- Create: `src/utils/timezones.js`
- Modify: `src/data/siteContent.js`

- [ ] **Step 1: 天气与快讯布局**

要求：
- 天气占 `1/3`
- 快讯占 `2/3`
- 今日技术快讯固定 `5` 条

- [ ] **Step 2: 时间与底部入口**

保留：
- 北京时间
- 纽约时间
- 欧洲时间

底部入口保持独立链接区，不并入四大技能维度。

---

### Task 6: 验证、预览与文档

**Files:**
- Modify: `SETUP.md`
- Modify: `preview-local.sh`
- Modify: `README.md`

- [ ] **Step 1: 运行内容测试与构建**

Run:
- `node --test tests/site-content.test.mjs`
- `npm run build`

- [ ] **Step 2: 更新本地预览方式说明**

确保用户可以直接启动 React 版本预览。

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: rebuild homepage as react antv app"
```

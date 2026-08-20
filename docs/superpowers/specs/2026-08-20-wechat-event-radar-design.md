# 公众号活动雷达设计

## 概述

在现有 React + Vite 个人网站中增加一个公开的活动采集页面。系统每天由 GitHub Actions 运行一次，从人工维护的 20 到 30 个公众号订阅源和少量手工文章链接中发现新文章，筛出活动信息，生成静态 JSON，并随 GitHub Pages 一起发布。

第一版不登录个人微信，不读取微信 Cookie，不模拟微信客户端，也不尝试自动读取关注列表。采集入口仅限 RSS/Atom、第三方公开订阅地址和人工提供的公开文章 URL。这个边界降低个人微信账号风控风险，也让采集失败表现为数据源不可用，而不是账号异常。

## 目标

- 每天北京时间 07:00 自动检查已配置的数据源。
- 发现新文章后，判断其是否描述可报名、可参加或有明确时间安排的活动。
- 从活动文章中提取标题、时间、地点、形式、报名链接、来源和短摘要。
- 在个人网站的 `/events/` 页面公开展示即将开始的活动。
- 支持按日期状态、城市、线上/线下和标签进行前端筛选。
- 保留仍未开始的历史发现结果，不因每日重新构建而丢失。
- 单个数据源、AI 服务或旧数据读取失败时，页面仍然可以构建和访问。

## 非目标

- 不自动读取个人微信关注列表。
- 不使用个人微信登录态、Cookie、扫码登录或桌面自动化。
- 不绕过验证码、频控、登录限制或其他访问控制。
- 不复制公众号全文到公开网站。
- 不建设用户注册、好友账号、收藏同步或多租户系统。
- 不追求分钟级实时更新。
- 不保证每个公众号都能通过公开订阅源覆盖。
- 不让模型猜测文章中没有明确出现的时间、地点或报名地址。

## 方案选择

### 方案 A：GitHub Actions + 静态 JSON，推荐

`公开订阅源 -> Python 采集与活动抽取 -> wechat-events.json -> Vite 构建 -> GitHub Pages`

优点是与现有仓库和部署方式完全一致，不需要常驻服务器或数据库；缺点是数据公开、更新频率受 GitHub Actions 调度影响，采集源可用性需要降级处理。

### 方案 B：GitHub Pages + Serverless API

使用 Cloudflare Workers 或 Vercel Functions 保存数据和执行采集。它可以提供更强的访问控制和动态接口，但会引入第二套部署、数据库和运行费用。当前规模不需要。

### 方案 C：轻量服务器 + SQLite

使用 FastAPI、SQLite 和 Cron。它最适合后台审核与长期数据积累，但维护成本明显高于实际需求。待活动数量、人工审核需求或访问控制要求增长后再考虑。

最终采用方案 A。

## 总体架构

```text
data/wechat-event-sources.json
              |
              v
      RSS/Atom 与公开文章链接
              |
              v
 scripts/fetch_wechat_events.py
     |        |          |
     |        |          +-- 读取上一版公开 JSON
     |        +------------- 规则初筛与结构校验
     +---------------------- 可选 AI 结构化抽取
              |
              v
 public/wechat-events.json
              |
              v
       Vite 多页面构建
              |
              v
 /helloLeila/events/
```

采集脚本是活动数据的唯一写入者。前端只读取生成后的 JSON，不直接请求公众号页面，不接触 API 密钥。

## 数据源设计

### 公众号配置

新增 `data/wechat-event-sources.json`：

```json
{
  "sources": [
    {
      "id": "example-tech-community",
      "name": "示例技术社区",
      "category": "technology",
      "feedUrl": "https://feeds.example.org/example.xml",
      "enabled": true
    }
  ],
  "manualArticleUrls": []
}
```

约束：

- `id` 必须稳定且唯一，用于去重和错误报告。
- `feedUrl` 只接受公开 HTTP(S) 地址。
- `manualArticleUrls` 用于少量无法订阅但需要纳入检查的公开文章。
- 配置不包含账号、Cookie 或私密凭证，可以进入 Git。
- 第三方订阅服务的密钥若存在，只能从 GitHub Secrets 注入，不能写入配置。

### 采集适配器

第一版提供两个边界清晰的适配器：

1. RSS/Atom 适配器：解析标题、原文链接、发布时间、摘要和可选正文。
2. 手工 URL 适配器：读取公开文章页面的标题与可见正文，用于补充无法订阅的少量来源。

不实现微信公众号历史列表抓取。对于 RSS 条目正文不足的情况，脚本可以低频访问条目给出的公开原文链接，但不得携带登录态。单次 workflow 对同一主机串行请求，请求间隔至少 2 秒，单页超时 20 秒，每个源每次最多读取 10 条最新记录。

### 数据源健康状态

生成数据中记录每个源的本次状态：

```json
{
  "id": "example-tech-community",
  "name": "示例技术社区",
  "status": "ok",
  "checkedAt": "2026-08-20T07:00:00+08:00",
  "newArticleCount": 2,
  "error": ""
}
```

`status` 可为 `ok`、`partial`、`failed` 或 `disabled`。公开页面只显示总体更新时间和必要的降级提示，不展示内部异常堆栈。

## 文章处理流程

### 1. 规范化与去重

每篇候选文章规范化为：

```json
{
  "sourceId": "example-tech-community",
  "sourceName": "示例技术社区",
  "title": "AI Agent 技术沙龙开放报名",
  "url": "https://mp.weixin.qq.com/s/example",
  "publishedAt": "2026-08-20T06:30:00+08:00",
  "excerpt": "文章中的公开摘要",
  "contentHash": "sha256..."
}
```

去重依次使用：规范化 URL、`sourceId + title`、正文哈希。脚本默认只对没有处理过的新文章执行 AI 抽取，已有文章沿用上一版结果。

### 2. 确定性初筛

只有命中活动信号的文章进入模型阶段。正向信号包括：

- 报名、活动、会议、峰会、论坛、沙龙、讲座、公开课、培训、直播、展会、路演、招募、参会、门票、签到、日程。
- 具体日期、星期、时刻、地址、线上会议、报名截止或票价。

明显的新闻复盘、产品发布、招聘职位、纯营销推广和已经结束的活动回顾降权或排除。规则的作用是减少模型调用，不独立决定最终活动。

### 3. AI 结构化抽取

模型仅根据输入的标题、摘要和公开正文输出严格 JSON。API 密钥通过 `OPENAI_API_KEY` GitHub Secret 注入，模型名通过 `OPENAI_MODEL` 仓库变量配置，不在代码中绑定具体模型版本。

每个结果包含：

```json
{
  "isEvent": true,
  "confidence": 0.93,
  "title": "AI Agent 技术沙龙",
  "organizer": "示例技术社区",
  "eventType": "meetup",
  "startTime": "2026-08-29T14:00:00+08:00",
  "endTime": null,
  "timezone": "Asia/Shanghai",
  "city": "深圳",
  "location": "深圳市南山区",
  "isOnline": false,
  "registrationUrl": "https://example.org/register",
  "registrationDeadline": null,
  "priceText": "免费",
  "summary": "面向 AI 工程师的线下技术交流活动。",
  "tags": ["AI", "Agent", "深圳"]
}
```

校验规则：

- 未在文章中明确出现的字段必须为 `null` 或空字符串。
- URL 必须是公开 HTTP(S) 地址。
- 时间必须可解析，并保留原文时区；中国大陆活动默认 `Asia/Shanghai`。
- `confidence >= 0.75` 且有明确活动标题与开始日期时，状态为 `published`。
- 其他疑似活动标记为 `needs-review`，不进入默认活动列表。
- 模型输出无法解析时，保留候选和错误状态，不发布臆测内容。

### 4. 无 AI 密钥时的行为

没有 `OPENAI_API_KEY` 时，workflow 仍能成功：采集、去重和规则初筛照常运行；新候选记录为 `needs-review`，不自动发布。已有已发布活动继续展示。这样本地开发、Fork 和临时密钥故障不会清空页面。

## 活动数据契约

`public/wechat-events.json` 的顶层结构：

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-20T07:05:00+08:00",
  "status": "ok",
  "sourceStats": {
    "configured": 25,
    "succeeded": 23,
    "failed": 2
  },
  "sources": [],
  "events": []
}
```

每个活动额外保存：

- 稳定 `id`。
- `sourceAccount` 与 `sourceArticleUrl`。
- 首次发现时间 `discoveredAt`。
- 最近确认时间 `verifiedAt`。
- `status`：`published`、`needs-review`、`expired` 或 `cancelled`。
- 只用于去重的 `articleHash`，不保存或公开全文。

公开 JSON 不包含原始正文、Prompt、API 响应、Cookie、密钥或内部堆栈。

## 轻量持久化

GitHub Pages 构建是无状态的，因此每天运行时按以下优先级读取上一版数据：

1. 已部署的 `https://helloleila.github.io/helloLeila/wechat-events.json`。
2. 仓库中的 `public/wechat-events.json` 初始快照。
3. 空数据结构。

脚本将新结果与旧结果合并，而不是覆盖全部历史：

- 未开始的 `published` 活动继续保留。
- 结束时间过去 24 小时，或只有开始时间且已过去 24 小时的活动转为 `expired`。
- 默认公开 JSON 保留最近 90 天的过期活动，超过窗口后删除。
- 通过活动标题、开始时间、城市和来源文章进行跨文章去重。

已部署 JSON 拉取失败不会让构建失败，但会在顶层 `status` 标记 `partial`。

## 前端页面设计

### 路由与构建

现有项目没有 React Router。为保证 GitHub Pages 可以直接访问干净地址，使用 Vite 多页面构建：

- 首页：`/helloLeila/`，继续由根目录 `index.html` 构建。
- 活动页：`/helloLeila/events/`，由 `events/index.html` 和独立 React 入口构建。

活动页复用现有颜色、排版变量和内容宽度，但保持工具型信息布局，不改首页组件结构。首页在合适位置增加一个清晰的活动页链接。

### 页面内容

首屏直接是可用的活动浏览器，不做营销式 Hero。结构包括：

1. 紧凑页头：页面名称、数据更新时间、返回首页。
2. 状态摘要：即将开始、七日内、线上活动和数据源状态。
3. 筛选栏：状态、城市、线上/线下、标签和文本搜索。
4. 活动列表：按开始时间升序，无法确定时间的项目排在后面并明确标记。
5. 空状态与降级状态：区分“当前没有活动”和“本次数据更新失败”。

每张活动项显示：

- 活动标题。
- 日期、时间、城市和详细地点。
- 线上/线下、免费/付费、标签。
- 一段短摘要。
- 主按钮“查看原文”以及存在时的“立即报名”。
- 来源公众号名称与首次发现时间。

移动端筛选控件换行，按钮和长链接不得挤出容器。页面不显示低置信度 `needs-review` 项。

## GitHub Actions 工作流

沿用 `.github/workflows/pages.yml` 的北京时间 07:00 调度，在 Vite 构建前增加：

```text
Checkout
Setup Node / Python
Install dependencies
Refresh live panel
Fetch WeChat event sources
Validate event JSON
Run tests
Build Vite pages
Upload Pages artifact
Deploy
```

Actions 使用：

- Secret：`OPENAI_API_KEY`，可选。
- Variable：`OPENAI_MODEL`，仅在启用 AI 时需要。
- 默认 `contents: read`，不把每日 JSON 自动提交回 Git。
- `pages: write` 与 `id-token: write` 仅用于 Pages 部署。

## 错误处理

- 单个 RSS 源失败：记录失败并继续处理其他源。
- 所有源失败：沿用上一版未过期活动，顶层状态为 `stale`。
- 原文页面拒绝访问：只使用 RSS 已提供的标题与摘要；信息不足则不发布。
- AI 超时或限流：最多重试两次，之后把候选标记为 `needs-review`。
- AI 返回非法 JSON：拒绝该结果，不允许以自由文本混入公开数据。
- 上一版 JSON 不可用：从仓库快照开始，并标记 `partial`。
- 输出 JSON 校验失败：workflow 失败，不发布损坏数据。
- 前端请求失败：显示本地空状态与明确的更新时间异常，不白屏。

## 风控与内容边界

- 不存在“公开 GitHub Pages 导致微信封号”的直接链路；账号风险主要来自携带个人登录态的自动操作，本设计排除该路径。
- 每个数据源每日一次，每源最多十篇，串行低频访问。
- 尊重公开源的可用性；遇到验证码、登录页或访问拒绝即停止，不做绕过。
- 页面只发布结构化事实、短摘要和原文回链，不镜像正文、图片或附件。
- 第三方 RSS 服务可能失效，因此数据源状态和手工 URL 兜底是产品能力的一部分。
- 无法承诺零风险或零漏报；可以明确承诺代码不使用个人微信登录态。

## 测试策略

### Python 数据管道

- RSS 与 Atom fixture 均能规范化。
- 非 HTTP(S)、私有网络和欺骗性 URL 被拒绝。
- 文章 URL、标题和正文哈希去重正确。
- 活动关键词初筛覆盖正向与负向样例。
- AI 合法、缺字段、非法 JSON、超时和无密钥路径均有测试。
- 旧活动合并、跨文章去重、过期和 90 天清理正确。
- 单源失败不会丢失其他源或上一版活动。

### 前端

- 活动 JSON 加载成功、空数据和失败状态可以渲染。
- 状态、城市、形式、标签和文本筛选可组合。
- 活动按开始时间排序。
- `needs-review` 不出现在公开列表。
- GitHub Pages 基路径下的 JSON 地址和 `/events/` 构建入口正确。

### 端到端与视觉验证

- 运行完整 `npm test` 与 `npm run build`。
- 使用本地 Pages 基路径预览活动页。
- 使用 Playwright 检查桌面和手机视口。
- 验证无文字溢出、无控件重叠、外链可访问、数据更新时间明确。

## 实施顺序

1. 定义配置、事件 JSON Schema 和测试 fixtures。
2. 实现 RSS/Atom、手工 URL、URL 校验、去重和旧数据合并。
3. 实现规则初筛与可选 AI 结构化抽取。
4. 创建静态 JSON 初始快照和命令行刷新入口。
5. 创建 `/events/` 多页面入口、数据 Hook、筛选器和活动列表。
6. 将采集、校验、测试和构建接入 Pages workflow。
7. 补充配置与 GitHub Secrets 文档。
8. 完整测试、构建和桌面/移动端视觉验证。

## 第一版验收标准

- 不使用微信登录态即可完成一次从 RSS fixture 到活动 JSON 的完整处理。
- 配置真实公开 feed 后，GitHub Actions 每天北京时间 07:00 尝试发现新文章。
- 有 AI Secret 时，新活动可被结构化提取；无 Secret 时构建仍成功且不发布未经确认的新候选。
- 已部署的未开始活动在下一次构建中继续存在。
- 单个源失败不阻塞网站部署。
- `/helloLeila/events/` 可直接打开并在桌面和移动端正常筛选。
- 页面只公开结构化活动信息、短摘要和外链，不公开正文、密钥或内部错误。
- 项目测试和生产构建通过。

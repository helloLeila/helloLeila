# AI 每日五条精选设计

## 概述

在个人网站的实时面板中加入“AI 摘要后的每日五条精选”。

当前站点已经具备合适的基础形态：GitHub Pages 静态部署、`public/live-panel.json` 数据文件、`scripts/fetch_live_panel.py` 抓取脚本，以及 `.github/workflows/pages.yml` 的每日定时部署。新功能应当沿用这条轻量链路，而不是新增常驻 Python 后端服务。

本设计的核心判断是：定时任务并不过时。对个人站来说，现代化的关键不是把 cron 换成后端服务，而是把每日工作流拆成可验证的阶段：确定性抓取、候选清洗、AI 加工、结构校验、静态发布。

## 目标

- 每天北京时间 07:00 自动生成一组 AI 精选新闻。
- 从多个公开来源抓取候选内容，去重后让 AI 选出最适合个人网站定位的 5 条。
- 为每条新闻生成中文摘要、英文摘要、推荐理由和标签。
- 保持前端仍然只读取 `live-panel.json`，不在浏览器端直接调用 AI API。
- 在 AI 调用失败、抓取失败或 JSON 校验失败时保留可展示的兜底数据。
- 保持系统低维护、低成本、适合 GitHub Pages。

## 非目标

- 不做常驻 FastAPI、数据库、消息队列或后台管理系统。
- 不做实时新闻产品，不追求分钟级刷新。
- 不让 AI 凭空搜索新闻或生成事实。
- 不抓取需要登录、反爬压力高、版权边界不清的全文内容。
- 不在前端暴露任何 AI API key。
- 不为第一版增加历史归档、搜索、订阅或用户个性化。

## 推荐架构

采用 GitHub Actions 定时工作流：

`抓取候选新闻 -> 去重清洗 -> AI 选择并摘要 -> JSON 校验 -> 写入 live-panel.json -> Vite build -> GitHub Pages deploy`

这条链路与现有仓库最贴合。它不需要服务器，不需要数据库，也不改变当前 React/Vite 前端的部署模型。AI API key 放在 GitHub Actions Secrets 中，只在构建任务里使用。

## 与 Codex 飞书自动化的关系

`codex-feishu-automation-kit` 不应被视为重复系统。它更像通知和 Markdown 渲染工具包，适合把 Codex 自动化生成的 AI 日报推送到飞书和 Server 酱。个人网站的实时面板则需要结构化、可校验、可静态发布的 JSON。

两者的差异是出口不同：

- Codex 自动化日报面向本人或团队通知，产物是 Markdown，重点是完整简报、飞书卡片和手机提醒。
- 个人网站实时面板面向公开访问者，产物是 `live-panel.json`，重点是稳定展示、五条精选和前端布局安全。

推荐不要让两边各自独立抓取和总结新闻。更好的边界是建立一个共同的 Daily Brief 数据产物：

`Daily Brief JSON -> Markdown 日报 -> 飞书 / Server 酱`

`Daily Brief JSON -> live-panel.json -> GitHub Pages`

第一版可以让 Codex 自动化在生成 Markdown 日报的同时，额外生成一个严格结构化的 JSON sidecar，例如 `ai-daily/latest.json`。飞书和 Server 酱继续使用 Markdown；个人网站从这个 JSON 中抽取前五条，生成 `public/live-panel.json`。如果 sidecar 不存在或校验失败，个人站再回退到本仓库的确定性抓取脚本。

不建议长期只从 Markdown 反向解析网站数据。Markdown 适合人读和通知渲染，但对前端来说过于脆弱。可以短期解析 `## 2. 热点新闻` 作为过渡，长期应让自动化直接输出 JSON。

## 组件设计

### 1. 候选采集器

继续由 `scripts/fetch_live_panel.py` 负责。它抓取 RSS、公开 API 或公开页面，输出一个候选池。

候选项至少包含：

- `title`
- `url`
- `source`
- `description`
- `publishedAt`

其中 `description` 可以来自 RSS 摘要、页面元信息或空字符串。没有正文时，后续 AI 只能做标题级解读，不能伪装成全文摘要。

### 2. 候选清洗器

在进入 AI 之前，脚本先做确定性处理：

- 按 URL 去重。
- 按规范化标题去重。
- 过滤标题过短、空 URL、明显广告或导航项。
- 为每个来源保留一定数量的头部候选，避免单一来源占满候选池。
- 控制进入 AI 的候选数量，第一版建议 20 到 40 条。

### 3. AI 精选器

AI 只处理候选池，不负责发现新闻。

输入是候选新闻数组和个人站定位提示。输出必须是严格 JSON，包含 5 条精选。选择标准偏向：

- AI 工程、智能体、工作流自动化。
- 前端系统、数据可视化、工程架构。
- 学术研究、工具链、开发者生产力。
- 对个人网站访客有解释价值，而不是单纯流量热度。

AI 需要为每条内容生成：

- 中文一句话摘要。
- 英文一句话摘要。
- 中文推荐理由。
- 2 到 4 个标签。

### 4. JSON 校验器

AI 输出必须经过脚本校验后才能写入 `live-panel.json`。

校验规则：

- `news` 必须正好 5 条。
- 每条必须包含 `title`、`url`、`source`、`summaryZh`、`summaryEn`、`whyItMattersZh`、`tags`。
- `url` 必须来自候选池，防止 AI 编造链接。
- `title` 以候选池原始标题为准，防止 AI 改写标题造成事实漂移。
- 摘要和推荐理由需要有最大长度限制，避免破坏前端布局。
- 校验失败时使用非 AI 候选前五条，并标记 AI 状态为失败。

### 5. 前端展示层

前端继续通过 `useWeatherNews` 读取 `live-panel.json`。第一版不需要改变数据加载方式，只需要兼容新增字段。

展示建议：

- 标题仍然是主要入口。
- 来源和标签用于快速扫描。
- 中文摘要作为主摘要。
- 英文摘要可以在英文语言模式下展示。
- `whyItMattersZh` 可以作为小号辅助说明，强调这条内容为什么被选中。

## 数据结构

`live-panel.json` 中的 `news` 建议升级为：

```json
{
  "updatedAt": "2026-07-07T07:00:00+08:00",
  "aiStatus": "ok",
  "weather": {},
  "news": [
    {
      "title": "原始新闻标题",
      "url": "https://example.com/story",
      "source": "36kr",
      "summaryZh": "一句中文摘要。",
      "summaryEn": "One-sentence English summary.",
      "whyItMattersZh": "说明它为什么值得个人站访客关注。",
      "tags": ["AI", "Workflow", "Frontend"]
    }
  ]
}
```

`aiStatus` 可取：

- `ok`：AI 精选和摘要成功。
- `fallback`：AI 不可用，使用确定性候选前五条。
- `previous`：抓取或生成失败，沿用上一次可用数据。

## 工作流设计

`.github/workflows/pages.yml` 保持为权威部署工作流。每日定时触发后执行：

1. Checkout 仓库。
2. 安装 Node 依赖。
3. 运行 `npm run refresh:live-panel`。
4. 脚本读取 GitHub Actions Secret 中的 AI API key。
5. 生成并校验 `public/live-panel.json`。
6. 运行 `npm run build`。
7. 部署到 GitHub Pages。

如果没有配置 AI API key，本地和 CI 都应能运行，只是进入 `fallback` 模式。

如果使用 Codex 自动化作为上游，工作流调整为：

1. Codex 自动化抓取并生成 `ai-daily/YYYY-MM-DD-ai-daily.md`。
2. Codex 自动化同时生成 `ai-daily/latest.json`。
3. 自动化调用 `codex-feishu-automation-kit` 的推送脚本，把 Markdown 推送到飞书和 Server 酱。
4. 个人站导入 `ai-daily/latest.json`，写入 `public/live-panel.json`。
5. GitHub Pages 部署读取同一份 JSON。

这会把“抓取和 AI 精选”收敛到一处，把“通知展示”和“网站展示”变成两个下游渲染器。

## 错误处理

失败场景按优先级处理：

- 某个新闻源失败：跳过该来源，继续使用其他来源。
- 所有新闻源失败：沿用上一次 `live-panel.json` 中的新闻。
- AI API 失败：使用清洗后的候选前五条，并生成基础字段。
- AI 返回非 JSON：丢弃本次 AI 输出，进入 `fallback`。
- AI 编造 URL：校验失败，进入 `fallback`。
- 写文件失败：让 workflow 失败，避免发布不完整构建。

前端永远不应该因为 AI 字段缺失而白屏。

## 安全与成本

- AI API key 只放在 GitHub Actions Secrets。
- 前端不接触任何 secret。
- 每天调用一次 AI，候选池限制在 20 到 40 条，成本可控。
- Prompt 中不放隐私数据。
- 只把公开新闻标题、链接、来源和公开摘要交给 AI。

## 测试策略

需要新增或调整测试：

- 抓取脚本可以在无 AI key 时生成合法 `live-panel.json`。
- AI 输出校验器会拒绝编造 URL。
- `news` 数组最终始终收敛到 5 条。
- 新字段缺失时前端仍然回退到标题链接展示。
- workflow 测试继续约束每日北京时间 07:00 触发。

## 推进顺序

第一步先增强数据管道，不重做 UI：

1. 扩展抓取脚本的数据模型和候选池。
2. 增加 AI 精选与摘要函数。
3. 增加严格 JSON 校验和 fallback。
4. 更新 `live-panel.json` fixture。
5. 更新前端 hook 兼容新增字段。
6. 更新测试覆盖。

第二步再优化 UI 展示，把摘要、来源和标签设计成更像“每日研究简报”的小面板。

## 验收标准

- 每日 workflow 可以在没有常驻后端的情况下刷新新闻。
- `public/live-panel.json` 始终包含 5 条可展示新闻。
- AI 成功时，每条新闻都有摘要、推荐理由和标签。
- AI 失败时，页面仍然展示确定性候选新闻。
- 前端不泄露 API key。
- 架构仍然保持 GitHub Pages 静态站的简单性。

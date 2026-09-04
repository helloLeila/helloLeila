# 微信公众号活动采集排查记录

记录日期：2026 年 9 月 4 日  
项目分支：`codex/wechat-source-config`  
仓库：`helloLeila/helloLeila`  
页面路径：`/events/`

## 1. 目标

从用户配置的 37 个微信公众号中，自动发现真实的微信公众号文章，只保留公开的 `mp.weixin.qq.com` 文章，并识别其中可参加的活动，最终通过 GitHub Pages 展示。

约束条件：

- 不伪造文章、日期、地点或报名链接；
- 不使用个人微信登录、微信读书账号、微信 Cookie 或二维码；
- 不购买搜索 API；
- 采集失败时必须保留失败原因，不能把失败显示成“没有活动”；
- 允许使用阿里云服务器运行采集程序，GitHub Pages 负责展示。

## 2. 已尝试的方案

### 2.1 Bing RSS

初始实现使用 Bing RSS 查询公众号名称和活动关键词。

查询形式示例：

```text
"量子位" 微信公众号 活动
```

结果：当前运行环境中 Bing RSS 返回不可用或非 RSS 内容，解析不到文章。

代码处理：增加了非 RSS 响应容错，不再因为 XML 解析失败而中断整个任务。

结论：Bing RSS 不能作为唯一数据源。

### 2.2 百度桌面端 HTML

尝试访问百度桌面搜索页面：

```text
https://www.baidu.com/s?wd=...
```

结果：返回百度安全验证页面，内容为“百度安全验证”或“网络不给力，请稍后重试”，不包含搜索结果。

结论：阿里云或当前 HTTP 请求环境下，百度桌面端不能稳定用于无头抓取。

### 2.3 搜狗微信搜索

尝试访问搜狗微信搜索页面：

```text
https://weixin.sogou.com/weixin?type=2&query=...
```

结果：页面可以返回搜索结果结构，但文章地址被包装为搜狗加密跳转链接，例如 `/link?url=...`。直接跟随跳转会进入验证页，无法稳定还原微信公众号文章地址。

结论：搜狗微信页面可作为发现入口，但不能在当前 HTTP 抓取方式下直接保证成功。

### 2.4 用户提供的微信公众号文章

用户提供过一篇文章：

```text
https://mp.weixin.qq.com/s/vyR8JJ3a8UHih6wPtt25vA
```

结果：请求返回微信“环境异常/访问频率限制/文章不可访问”类页面，文章正文和发布时间无法验证。

结论：即使文章地址是真实格式，当前环境也可能无法读取正文；未经正文验证的链接不能发布为活动。

### 2.5 WeWe RSS / 微信读书登录

曾考虑使用 WeWe RSS，将公众号转换为 RSS/JSON。

问题：该类方案通常需要微信读书账号或登录态来建立公众号订阅，不符合“个人微信号安全优先”和“不使用微信登录”的约束。WeWe RSS 原项目在 2026 年已归档，也不适合作为本项目的无条件长期依赖。

结论：不采用微信读书登录方案作为本项目主链路。

### 2.6 付费搜索 API

比较过 Serper、Brave Search API 和 SerpApi。

结果：它们可以提供结构化搜索结果，但需要 API Key，长期运行会产生费用；用户明确要求不花钱，因此没有接入。

结论：不采用付费搜索 API。

## 3. 新版浏览器试跑

### 3.1 Chrome 动态页面测试

使用本机 Chrome 无头模式打开百度移动端搜索页面：

```text
https://m.baidu.com/s?word=量子位 活动 报名
```

结果：浏览器可以拿到百度动态渲染后的搜索页面，说明“普通 HTTP 请求被拦截”与“浏览器页面可以加载”之间存在差异。

### 3.2 发现的关键地址格式

百度结果中出现了真实微信公众号文章的查询式地址：

```text
https://mp.weixin.qq.com/s?__biz=...&mid=...&idx=...&sn=...
```

旧代码只接受：

```text
https://mp.weixin.qq.com/s/文章标识
```

因此旧代码会把百度已经返回的查询式文章误判为无效。

### 3.3 已完成的代码修复

提交：`63d46fb fix: parse browser-discovered WeChat article URLs`

已修改：

- 支持 `mp.weixin.qq.com/s?__biz=...&mid=...&idx=...&sn=...`；
- 增加百度移动端和 Bing 中文 HTML 入口配置；
- 增加动态 HTML 中微信地址的解析；
- 增加可选的 Chromium 渲染函数；
- 增加浏览器超时和进程清理；
- 增加查询式微信地址回归测试。

## 4. GitHub Pages 部署问题

### 4.1 失败原因

GitHub Pages 环境只允许从 `codex/3d-feat` 部署，而工作流最初从 `codex/wechat-source-config` 发布。

GitHub 原始错误：

```text
Deployments are only allowed from codex/3d-feat
```

### 4.2 修复结果

通过保留当前代码树的合并提交，把活动雷达版本发布到允许部署的 `codex/3d-feat` 分支，并恢复标准 `github-pages` 环境。

相关提交：

- `a19a87b ci: use github pages deployment environment`
- `f5912f6 chore: publish event radar on allowed pages branch`

之后 GitHub Actions 的构建、测试和 Pages deploy 均成功。

### 4.3 线上页面问题

线上最初仍加载 `/src/events/main.jsx`，原因是 GitHub Pages 发布源仍配置为分支源码，而不是 GitHub Actions 构建产物。需要在仓库 Settings → Pages → Build and deployment 中选择 `GitHub Actions`。

## 5. 当前真实数据状态

最近一次生成的数据曾显示：

```json
{
  "cataloged": 37,
  "configured": 1,
  "succeeded": 0,
  "failed": 1,
  "verified": 0,
  "wechatArticles": 0,
  "discoveryHits": 0,
  "discoveryUnavailable": 36
}
```

这表示 37 个名称已经保存，但稳定可验证的文章入口尚未建立。`0` 是当前可验证数据数量，不代表 37 个公众号现实中没有活动。

## 6. 当前结论

### 已确认

1. 不登录微信也可以尝试从公开搜索结果发现文章；
2. 百度浏览器页面确实返回过真实微信公众号文章地址；
3. 微信文章存在两种常见公开地址格式，代码已经支持；
4. 文章地址被发现后，仍可能因为微信环境异常或访问频率限制无法读取正文；
5. GitHub Actions 的构建和部署链路已经可以成功运行。

### 尚未解决

1. 阿里云无头浏览器对百度的长期稳定访问；
2. 搜索结果跳转链接的稳定还原；
3. 微信正文在当前网络环境下的稳定读取；
4. 只给公众号名称时，公众号身份的自动确认。

### 明确不采用

- 虚构活动或日期；
- 把普通网页当作微信公众号文章；
- 使用微信个人登录态；
- 保存微信 Cookie 或二维码；
- 验证码绕过、代理池和账号轮换；
- 在没有正文证据时直接发布活动。

## 7. 后续实现方向

下一步应把浏览器抓取作为可选的云端 worker，部署在阿里云服务器，并保留普通 HTTP 作为备用。任务应按以下状态输出：

```text
已发现候选
已验证文章
文章不可访问
搜索入口被拦截
来源待确认
```

页面不应把所有失败压缩成“0 场活动”，而应同时展示来源状态、候选数量和最近错误类型。


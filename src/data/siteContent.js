// 页面静态内容数据源，集中维护文案、词云、里程碑和外链配置。
import { signalCloudKeywords } from "./signalCloudConfig.js";

export const siteContent = {
  welcome: {
    en: "Hello，welcome to Leila's site. Stay focused and stay curious.",
    zh: "hello，欢迎来到leila的小站👋！希望你保持继续专注，但也保持对世界的好奇心🥕:)",
  },
  hero: {
    eyebrow: "LEILA / PRODUCT SYSTEMS",
    titleEn:
      "Ground intelligent technologies in real scenarios through rigorous research,and implement practical outcomes with research-based discipline",
    titleZh: "以严谨的科研素养深耕真实场景，让智能技术落地为切实可行的成果",
    sublineEn:
      "Focused on process portals, approval flows, agent-facing interfaces, and delivery systems that are built to be reused and shipped.",
    // sublineZh: "聚焦流程门户、审批界面、智能体体验与真正可复用、可发布的交付系统。",
    topChips: ["Function Calling","智能体编排", "大模型微调", "harness Engineering", "多模态交互"],
  },
  stats: [
    {
      value: "31",
      en: "Process portals connected across 31 provincial branches",
      zh: "流程管理门户支撑 31 省分公司统一接入",
    },
    {
      value: "8",
      en: "Eight subsystems integrated under one platform framework",
      zh: "平台基础框架支撑 8 个子系统统一接入",
    },
    {
      value: "Top 5",
      en: "Recognized among the top five innovation cases and selected by CAICT",
      zh: "项目入选五大创新成果，并获中国信通院典型案例",
    },
    {
      valueEn: "1 System",
      valueZh: "1",
      en: "A complete personal workflow system shaped by real enterprise delivery work",
      zh: "一套完整的个人工作流系统",
    },
  ],
  summary: {
    en: "The strongest signal is repeated delivery under real constraints: rebuilding portal flows, building reusable foundations, connecting backend capabilities, and shipping business-facing interfaces that scale across teams.",
    zh: "你好，我叫leila。是一名全栈程序员、人工智能爱好者，我的工作主要涉及前端企业解决方案开发、后端开发与技术方案设计，目前关注并实践 AI Agent 及 RAG 相关技术，聚焦知识检索与智能应用体系构建，推进工程化落地与验证。通过搭建可视化系统、提供行业解决方案，为数字化项目提供技术支撑。",
  },
  domainLinks: [
    { labelEn: "Full-stack Engineering", labelZh: "全栈工程", href: "#section-workflow" },
    { labelEn: "Frontend Systems", labelZh: "前端系统", href: "#skills-frontend" },
    { labelEn: "Data Visualization", labelZh: "数据可视化", href: "#section-signal-cloud" },
    { labelEn: "AI Agents", labelZh: "agent开发", href: "#section-roadmap" },
  ],
  problemsSolved: [
     {
      en: "The Tongtong agent interface needed sceneCode-driven component routing, dynamic forms, parameter carry-over, result feedback, and multi-step state continuity within one interaction surface.",
      zh: "通通智能体---在同一交互面里完成 sceneCode 动态表单场景分发、动态表单渲染、参数带入、结果回显和多步骤状态连续。",
    },
    {
      en: "The process portal project had to rebuild the full frontend shell and content workflow while landing a new layout, dynamic routing, permission guards, rich-text forms, and micro-frontend integration.",
      zh: "流程治理业务---富文本表单、法治一体化流程中心办理链路闭环、知识收集、发帖回帖、点赞、评论、标签管理。"
    },
    {
      en: "The decision service project had to go from zero to one on a tight schedule while still landing layout, dynamic routing, permission guards, request interception, and release setup.",
      zh: "决策管理服务集业务---短周期内从 0 到 1 落地，同时补齐 layout、动态路由、权限守卫、请求拦截和发布链路。",
    },
   
    {
      en: "The MDOP platform had to connect multiple subsystems through one entry, which meant solving qiankun sub-app registration, activeRule routing, menu linkage, and permission binding together.",
      zh: "mdop 管理运营中台业务---把多个子系统接到统一入口下，因此要同时解决子应用注册、菜单联动和权限关联。",
    },
  ],
  aiKnowledge: [
    
    {
      en: "Agent development with the OpenAI agent framework, covering multi-step interaction, tool use, and state management.",
      zh: "agent 开发---基于 OpenAI 的 agent 框架，完成多步骤交互、工具使用和状态管理。",
    },
    {
      en: "Dynamic forms and business cards built with Ant Design components for flexible data collection and presentation in enterprise interfaces.",
      zh: "动态表单与业务卡片---基于 Ant Design 组件，实现企业界面中灵活的数据收集与展示。",
    },
    {
      en: "Prompt design for effective LLM interactions, focused on guiding models toward accurate and relevant responses.",
      zh: "提示词设计---为有效的 LLM 交互设计提示词，包括编写能够引导语言模型产生准确且相关响应的提示词。",
    }, 
    {
      en: "AI workflow interfaces that bring agent interaction, dynamic forms, and business logic into one cohesive user experience.",
      zh: "AI 工作流界面---把智能体交互、动态表单和业务逻辑整合到一个连贯的用户体验中。"
    },
  ],
  skillGroups: [
    {
      key: "frontend",
      titleEn: "Frontend",
      titleZh: "前端",
      highlightIndent: 8,
      tags: [
        { labelEn: "React 18", href: "https://react.dev/" },
        { labelEn: "Vue 3", href: "https://vuejs.org/" },
        { labelEn: "TypeScript", href: "https://www.typescriptlang.org/" },
        { labelEn: "JavaScript ES6+", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
        { labelEn: "Ant Design", href: "https://ant.design/" },
        { labelEn: "Quill", href: "https://quilljs.com/" },
        { labelEn: "React Router 6", href: "https://reactrouter.com/" },
        { labelEn: "Dynamic Routing", labelZh: "动态路由", href: "https://reactrouter.com/en/main/start/overview" }
      ],
    },
    {
      key: "backend",
      titleEn: "Backend",
      titleZh: "后端",
      highlightIndent: 8,
      tags: [
        { labelEn: "Java", href: "https://dev.java/" },
        { labelEn: "Spring Boot", href: "https://spring.io/projects/spring-boot" },
        { labelEn: "MyBatis", href: "https://mybatis.org/mybatis-3/" },
        { labelEn: "MySQL", href: "https://www.mysql.com/" },
        { labelEn: "Redis", href: "https://redis.io/" },
        { labelEn: "Tencent COS", href: "https://www.tencentcloud.com/products/cos" },
        { labelEn: "REST API", href: "https://developer.mozilla.org/en-US/docs/Glossary/REST" }
      ],
    },
    {
      key: "engineering",
      titleEn: "Engineering",
      titleZh: "工程化",
      highlightIndent: 8,
      tags: [
        { labelEn: "Umi 3", href: "https://v3.umijs.org/" },
        { labelEn: "Redux Toolkit", href: "https://redux-toolkit.js.org/" },
        { labelEn: "Dva", href: "https://dvajs.com/" },
        { labelEn: "Vite", href: "https://vite.dev/guide/" },
        { labelEn: "Webpack", href: "https://webpack.js.org/" },
        { labelEn: "qiankun", href: "https://qiankun.umijs.org/" },
        { labelEn: "Release Pipeline", labelZh: "打包发布", href: "https://vite.dev/guide/build.html" }
      ],
    },
    {
      key: "ai-research",
      titleEn: "AI & Research",
      titleZh: "AI 与研究",
      highlightIndent: 8,
      tags: [
        { labelEn: "Agent Development", href: "https://platform.openai.com/docs/guides/agents" },
        { labelEn: "Dynamic Forms", labelZh: "动态表单", href: "https://ant.design/components/form" },
        { labelEn: "Business Cards", labelZh: "业务卡片", href: "https://ant.design/components/card" },
        { labelEn: "Prompt Design", labelZh: "提示词设计", href: "https://www.promptingguide.ai/" },
      
      ],
    },
  ],
  workflowSection: {
    kickerEn: "Enterprise Workflow Design",
    kickerZh: "企业级工作流设计",
    titleEn: "What I actually built",
    titleZh: "具体做了什么（后续展示我的工作流）",
    descriptionEn: "This section focuses on the real workflow systems I built: portal shells, approval flows, dynamic routing, agent interaction, and release handoff inside one product system.",
    descriptionZh: "这里改成承载真实的企业级工作流设计内容：把门户壳层、审批流程、动态路由、智能体交互和发布交接放进同一套产品系统。",
    leftNodes: [
      { titleEn: "Process Portal", titleZh: "流程管理门户", subtitleEn: "Portal shell rebuild", subtitleZh: "门户重构" },
      { titleEn: "Decision Service", titleZh: "决策管理服务集", subtitleEn: "0→1 foundation", subtitleZh: "从 0 到 1 底座" },
      { titleEn: "Tongtong Agent", titleZh: "通通智能体", subtitleEn: "Agent-facing UI", subtitleZh: "智能体界面" },
      { titleEn: "DataV Screens", titleZh: "联通 DataV", subtitleEn: "Large-screen delivery", subtitleZh: "大屏交付" }
    ],
    rightNodes: [
      { titleEn: "Frontend Shell", titleZh: "前端壳层", subtitleEn: "React + TypeScript", subtitleZh: "React + TypeScript 壳层" },
      { titleEn: "Routing & Permission", titleZh: "路由与权限", subtitleEn: "Dynamic routing · guards", subtitleZh: "动态路由 · 守卫" },
      { titleEn: "Interaction & Forms", titleZh: "交互与表单", subtitleEn: "sceneCode · forms", subtitleZh: "sceneCode · 表单" },
      { titleEn: "Content & Rich Text", titleZh: "内容与富文本", subtitleEn: "Quill · upload", subtitleZh: "Quill · 上传" },
      { titleEn: "Service Interface", titleZh: "服务接口", subtitleEn: "Java APIs · MySQL", subtitleZh: "Java APIs · MySQL" },
      { titleEn: "Micro-frontends", titleZh: "微前端接入", subtitleEn: "qiankun · sub apps", subtitleZh: "qiankun · 子应用" },
      { titleEn: "Release Pipeline", titleZh: "发布链路", subtitleEn: "Build · env", subtitleZh: "构建 · 环境" },
      { titleEn: "Delivery Surface", titleZh: "发布与展示", subtitleEn: "DataV · Nginx · Docker", subtitleZh: "DataV · Nginx · Docker" }
    ],
  },
  signalCloud: signalCloudKeywords,
  roadmap: {
    titleEn: "Annual Milestones",
    titleZh: "年度里程碑",
    descriptionEn: "A path from platform modules to agent workflows and the current site build.",
    descriptionZh: "从平台模块、智能体工作流，到当前个人网站表达的能力路线。",
    focus: [
      {
        labelEn: "Foundation",
        labelZh: "起点",
        valueEn: "Platform modules",
        valueZh: "平台模块",
      },
      {
        labelEn: "Momentum",
        labelZh: "当前势能",
        valueEn: "Agent UI and workflows",
        valueZh: "智能体界面与工作流",
      },
      {
        labelEn: "Now",
        labelZh: "最近在做",
        valueEn: "AI workflows and site delivery",
        valueZh: "AI 工作流与个人站落地",
      },
    ],
    steps: [
      { year: "2021", en: "Platform modules", zh: "平台模块建设" },
      { year: "2022", en: "DataV screens", zh: "DataV 大屏交付" },
      { year: "2023", en: "Portal shell", zh: "门户壳层与内容链路" },
      { year: "2024", en: "Frontend foundation", zh: "从 0 到 1 前端底座" },
      { year: "2025", en: "Agent UI flows", zh: "智能体界面与工作流" },
      { year: "2026", en: "AI workflows & site", zh: "AI 工作流与个人网站" }
    ],
  },
  coverage: {
    kickerEn: "Current Base",
    kickerZh: "当前主要阵地",
    titleEn: "Current base: Shenzhen",
    titleZh: "当前主要工作地：深圳",
    descriptionEn: "Based in Shenzhen, with recent delivery work centered on enterprise portals, agent interfaces, and data-expression surfaces for multi-region organizations.",
    descriptionZh: "当前主要工作地在深圳，最近的交付重心仍然集中在企业门户、智能体界面，以及服务多区域组织的数据表达产品化。",
    facts: [
      { en: "Portal and process product delivery", zh: "门户与流程产品交付" },
      { en: "Agent-facing interfaces and workflow surfaces", zh: "智能体界面与工作流表层" },
      { en: "Data expression and visualization modules", zh: "数据表达与可视化模块" },
      { en: "Cross-team delivery and design review", zh: "跨团队交付与设计走查" }
    ],
    mapNotes: [
      { labelEn: "Working city", labelZh: "当前城市", valueEn: "Shenzhen", valueZh: "深圳" },
      { labelEn: "Delivery span", labelZh: "下次台风到达时间", valueEn: "31 days", valueZh: "31 天" },
      { labelEn: "Connected systems", labelZh: "体感温度", valueEn: "31°C", valueZh: "31°C" },
    ],
  },
  weather: {
    city: "Shenzhen",
    latitude: 22.5431,
    longitude: 114.0579,
  },
  newsFallback: [
    { title: "36Kr latest stories", url: "https://36kr.com/feed" },
    { title: "Juejin trending articles", url: "https://juejin.cn/hot/articles" },
    { title: "The Verge latest stories", url: "https://www.theverge.com/rss/index.xml" },
    { title: "OSChina latest news", url: "https://www.oschina.net/news" },
    { title: "36Kr tech snapshots", url: "https://36kr.com/" }
  ],
  workLinks: [
    { type: "framework", label: "React", href: "https://react.dev/" },
    { type: "visual", label: "G2 Examples", href: "https://g2.antv.antgroup.com/examples" },
    { type: "visual", label: "L7 Animate Grid", href: "https://l7.antv.antgroup.com/examples/gallery/animate/#grid" },
    { type: "chat", label: "ChatGPT", href: "https://chatgpt.com/?temporary-chat=true" },
    { type: "blog", label: "Juejin", href: "https://juejin.cn" },
    { type: "component", label: "Ant Design", href: "https://ant.design/" },
    { type: "skills", label: "Skills", href: "https://skills.sh" },
    { type: "api", label: "OpenAI Docs", href: "https://platform.openai.com/docs" },
    { type: "build", label: "Vite", href: "https://vite.dev/guide/" },
    { type: "language", label: "MoonBit", href: "https://docs.moonbitlang.com/zh-cn/latest/pilot/moonbit-pilot/getting-started.html#model-configuration" },
    { type: "community", label: "GitHub", href: "https://github.com/helloLeila" },
    { type: "writing", label: "Markdown Guide", href: "https://www.markdownguide.org/basic-syntax/" }
  ]
};

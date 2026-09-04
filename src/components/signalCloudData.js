// 能力轨道的数据关系：词云继续使用原始关键词，分类只负责解释真实工作关联。
export const signalCloudGroups = [
  {
    key: "frontend",
    titleEn: "Frontend",
    titleZh: "前端",
    descriptionEn: "Interfaces, components, routing, and interaction.",
    descriptionZh: "界面、组件、路由和交互。",
    color: "#20231f",
    projectsZh: "流程治理业务 · 通通智能体",
    detailZh: "富文本表单、流程中心办理链路、知识收集和内容互动，也对应智能体的动态表单界面。",
    words: ["React", "JavaScript", "TypeScript", "Ant Design", "AntV", "Vue 3", "G2", "L7", "React Router 6", "Quill", "Less", "Lodash", "DataV", "datav", "HTML5", "CSS3", "echarts"],
  },
  {
    key: "backend",
    titleEn: "Backend",
    titleZh: "后端",
    descriptionEn: "Services, data, and connections between systems.",
    descriptionZh: "服务接口、数据处理和企业系统之间的连接。",
    color: "#798b19",
    projectsZh: "决策管理服务集 · 流程治理业务",
    detailZh: "Java 服务、MySQL 数据和接口链路，支撑从 0 到 1 的底座与门户内容流程。",
    words: ["Java", "MySQL", "Spring Boot", "Maven", "MyBatis", "Redis", "Node.js", "Postman", "Swagger", "SSE", "Mock", "REST API", "Tencent COS", "springboot", "http", "https", "ERP"],
  },
  {
    key: "engineering",
    titleEn: "Engineering",
    titleZh: "工程化",
    descriptionEn: "Micro-frontends, builds, environments, and release paths.",
    descriptionZh: "微前端、构建、环境和发布链路。",
    color: "#657a45",
    projectsZh: "多子系统统一入口 · 决策管理服务集",
    detailZh: "用 qiankun、动态路由、权限守卫、构建和发布链路把多个系统接起来。",
    words: ["Vite", "Webpack", "qiankun", "Dva", "Umi 3", "Redux Toolkit", "Linux", "Hash", "iframe", "Nginx", "Docker", "GitHub", "npm", "skills"],
  },
  {
    key: "ai-research",
    titleEn: "AI & Research",
    titleZh: "AI 与研究",
    descriptionEn: "Agents, RAG, prompts, and workflow interfaces.",
    descriptionZh: "Agent、RAG、提示词和工作流界面。",
    color: "#8a4f67",
    projectsZh: "通通智能体 · AI 工作流界面",
    detailZh: "sceneCode 动态表单、工具调用、RAG 与多步骤状态连续，形成可执行的智能体体验。",
    words: ["Python", "Claude Code", "gpt", "AI agent", "RAG", "LLM", "openClaw", "langGraph", "AI Coding"],
  },
];

export const signalCloudGroupByWord = Object.fromEntries(
  signalCloudGroups.flatMap((group) => group.words.map((word) => [word, group.key]))
);

export const signalCloudGroupByKey = Object.fromEntries(
  signalCloudGroups.map((group) => [group.key, group])
);

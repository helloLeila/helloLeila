const stageThemes = [
  {
    key: "fullstack",
    buttonEn: "Full-stack Engineering",
    buttonZh: "全栈工程",
    badge: "Engineering Mode / 工程模式",
    titleEn: "Full-stack systems with reliable delivery.",
    titleZh: "强调稳定交付与系统协同的全栈工程能力。",
    summaryEn:
      "From interface behavior to service coordination, each layer is built to stay stable in real delivery flows.",
    summaryZh:
      "从界面行为到服务协同，每一层实现都围绕真实交付流程保持稳定与一致。",
    points: [
      "Frontend and backend collaboration / 前后端协同实现",
      "Operational delivery under product constraints / 面向业务约束的稳定交付",
      "Clear boundaries across interfaces and services / 界面与服务之间的清晰边界",
    ],
    status: "delivery systems / 稳定交付 · service coordination / 服务协同 · interface contracts / 接口约束",
    docLink: "https://www.java.com/",
    heroMeta: [
      "Linked skill map / 技能标签地图",
      "Interactive theme switching / 主题联动切换",
      "Engineering + research / 工程与研究并行",
    ],
    tags: ["Java", "Docker", "MySQL"],
    cards: [
      {
        kicker: "Delivery / 交付",
        title: "System Flow / 系统流程",
        text: "Stable coordination across client and service layers. / 客户端与服务端之间保持稳定协同。",
      },
      {
        kicker: "Runtime / 运行态",
        title: "Operations / 工程运行",
        text: "Deployment-aware implementation instead of static demos. / 关注部署与运行环境，而不是停留在静态演示。",
      },
      {
        kicker: "Structure / 结构",
        title: "Contracts / 契约边界",
        text: "Clear interfaces between modules and responsibilities. / 模块职责与接口边界保持清晰可维护。",
      },
    ],
    stageHue: "is-fullstack",
    tagLayout: [
      { x: 12, y: -18, r: -6 },
      { x: 118, y: 10, r: 4 },
      { x: -4, y: 112, r: -4 },
    ],
    cardLayout: [
      { x: 18, y: -10, r: -7 },
      { x: -26, y: 22, r: 8 },
      { x: 40, y: 120, r: -4 },
    ],
  },
  {
    key: "frontend",
    buttonEn: "Frontend Systems",
    buttonZh: "前端系统",
    badge: "Frontend Mode / 前端模式",
    titleEn: "Product-facing interfaces with strong internal order.",
    titleZh: "兼顾产品表现力与内部秩序感的前端系统。",
    summaryEn:
      "For interface layers that need composable structure, clear state boundaries, and reliable implementation rhythm.",
    summaryZh:
      "面向需要组件化结构、清晰状态边界与稳定实现节奏的前端系统设计。",
    points: [
      "Composable interface structure / 组件化界面结构",
      "Stateful product surfaces with clear boundaries / 具有清晰边界的状态型产品界面",
      "Interaction polish that supports readability / 以可读性为导向的交互动效",
    ],
    status: "component systems / 组件系统 · state boundaries / 状态边界 · motion discipline / 动效节奏",
    docLink: "https://react.dev/",
    heroMeta: [
      "Reusable components / 复用组件",
      "State boundaries / 状态边界",
      "Interaction polish / 交互打磨",
    ],
    tags: ["React 18", "TypeScript", "Ant Design"],
    cards: [
      {
        kicker: "System / 系统",
        title: "UI Order / 界面秩序",
        text: "A frontend surface should stay readable as complexity grows. / 复杂度上升时，前端界面依然需要保持清晰可读。",
      },
      {
        kicker: "Motion / 动效",
        title: "Interaction / 交互反馈",
        text: "Transitions should explain structure instead of adding noise. / 过渡动效应解释结构，而不是制造噪音。",
      },
      {
        kicker: "Delivery / 交付",
        title: "Reuse / 复用",
        text: "Shared components and patterns reduce repetition and drift. / 共享组件与模式可减少重复劳动和风格漂移。",
      },
    ],
    stageHue: "is-frontend",
    tagLayout: [
      { x: 8, y: -24, r: -5 },
      { x: 132, y: 18, r: 5 },
      { x: 18, y: 118, r: -3 },
    ],
    cardLayout: [
      { x: 28, y: -4, r: -4 },
      { x: -40, y: 34, r: 10 },
      { x: 56, y: 126, r: -6 },
    ],
  },
  {
    key: "dataviz",
    buttonEn: "Data Visualization",
    buttonZh: "数据可视化",
    badge: "Data Viz Mode / 可视化模式",
    titleEn: "Readable visual systems, not decorative charts.",
    titleZh: "强调信息可读性而不是堆图表的数据表达。",
    summaryEn:
      "Data views should reveal hierarchy, comparison, and rhythm instead of simply increasing chart count.",
    summaryZh:
      "数据界面应当强调层级、对比和节奏，而不是单纯增加图表数量。",
    points: [
      "Readable dashboard hierarchy / 清晰的大屏与看板层级",
      "Chart motion with clear scanning rhythm / 具有扫描节奏的图表动效",
      "Visualization integrated into the product system / 与产品系统一致的数据表达",
    ],
    status: "chart hierarchy / 图表层级 · scan rhythm / 扫描节奏 · dashboard consistency / 看板一致性",
    docLink: "https://echarts.apache.org/",
    heroMeta: [
      "Visual hierarchy / 视觉层级",
      "Readable charts / 可读图表",
      "Product dashboards / 产品看板",
    ],
    tags: ["ECharts", "Dashboard", "Signals"],
    cards: [
      {
        kicker: "Visual / 视觉",
        title: "Hierarchy / 层级",
        text: "Dense data still needs a calm reading order. / 高密度数据同样需要稳定清晰的阅读顺序。",
      },
      {
        kicker: "Motion / 动效",
        title: "Rhythm / 节奏",
        text: "Animation should help comparison and tracking. / 动效应服务于比较、跟踪与趋势识别。",
      },
      {
        kicker: "System / 系统",
        title: "Consistency / 一致性",
        text: "Charts should belong to the interface, not sit on top of it. / 图表应属于界面系统的一部分，而不是临时叠加。",
      },
    ],
    stageHue: "is-dataviz",
    tagLayout: [
      { x: -2, y: -20, r: -8 },
      { x: 140, y: 6, r: 6 },
      { x: 8, y: 124, r: -5 },
    ],
    cardLayout: [
      { x: 20, y: -22, r: -9 },
      { x: -44, y: 42, r: 9 },
      { x: 62, y: 132, r: -5 },
    ],
  },
  {
    key: "academic",
    buttonEn: "Academic Research",
    buttonZh: "学术研究",
    badge: "Research Mode / 研究模式",
    titleEn: "Research framing, structured analysis, and reproducible thinking.",
    titleZh: "面向研究问题建模、结构化分析与可复用的方法表达。",
    summaryEn:
      "Academic-facing work needs clearer questions, explicit methods, and outputs that can be understood and reused.",
    summaryZh:
      "学术导向内容需要更明确的问题定义、方法说明和可复用的分析输出。",
    points: [
      "Problem framing and scope definition / 研究问题定义与范围界定",
      "Structured comparison and evidence-based reasoning / 结构化比较与证据驱动推理",
      "Bilingual communication for technical and academic audiences / 面向技术与学术语境的双语表达",
    ],
    status: "problem framing / 问题建模 · method clarity / 方法清晰 · bilingual outputs / 双语输出",
    docLink: "https://scholar.google.com/",
    heroMeta: [
      "Question framing / 问题建模",
      "Method analysis / 方法分析",
      "Research writing / 研究写作",
    ],
    tags: ["Methods", "Analysis", "Writing"],
    cards: [
      {
        kicker: "Scope / 范围",
        title: "Questions / 研究问题",
        text: "Start from the research question, not from decorative output. / 从研究问题出发，而不是从装饰性的呈现形式出发。",
      },
      {
        kicker: "Method / 方法",
        title: "Reasoning / 推理过程",
        text: "Make assumptions, tradeoffs, and evidence explicit. / 将假设、取舍与证据明确写出，便于复查和复用。",
      },
      {
        kicker: "Output / 输出",
        title: "Clarity / 清晰度",
        text: "Results should be presentable, reviewable, and reusable. / 研究结果既要可展示，也要可复查与可复用。",
      },
    ],
    stageHue: "is-academic",
    tagLayout: [
      { x: 10, y: -16, r: -4 },
      { x: 134, y: 20, r: 5 },
      { x: 20, y: 118, r: -2 },
    ],
    cardLayout: [
      { x: 26, y: -12, r: -5 },
      { x: -38, y: 34, r: 8 },
      { x: 52, y: 126, r: -4 },
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = { themeData: stageThemes, stageThemes };
}

if (typeof window !== "undefined") {
  window.themeData = stageThemes;
}

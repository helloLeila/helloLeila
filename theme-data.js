const themeData = [
  {
    key: "fullstack",
    buttonEn: "Full-stack Engineering",
    buttonZh: "全栈工程",
    badge: "Engineering Mode",
    titleEn: "Full-stack systems with reliable delivery.",
    titleZh: "强调稳定交付与系统协同的全栈工程能力。",
    summaryEn:
      "From interface behavior to service coordination, the stage stays coherent under real constraints.",
    summaryZh:
      "从界面行为到服务协同，面向真实约束下的稳定实现与整体一致性。",
    points: [
      "Frontend and backend collaboration",
      "Operational delivery under product constraints",
      "Clear boundaries across interfaces and services",
    ],
    status: "delivery systems · service coordination · interface contracts",
    docLink: "https://www.java.com/",
    heroMeta: ["Java", "Docker", "MySQL"],
    tags: ["Java", "Docker", "MySQL"],
    cards: [
      {
        kicker: "Delivery",
        title: "System Flow",
        text: "Stable coordination across client and service layers.",
      },
      {
        kicker: "Runtime",
        title: "Operations",
        text: "Deployment-aware implementation instead of static demos.",
      },
      {
        kicker: "Structure",
        title: "Contracts",
        text: "Clear interfaces between modules and responsibilities.",
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
    badge: "Interface Mode",
    titleEn: "Product-facing interfaces with strong internal order.",
    titleZh: "兼顾产品表现力与内部秩序感的前端系统。",
    summaryEn:
      "For interface layers that need composable structure, clear state boundaries, and reliable implementation rhythm.",
    summaryZh:
      "面向需要组件化结构、清晰状态边界与稳定实现节奏的前端系统设计。",
    points: [
      "Composable interface structure",
      "Stateful product surfaces with clear boundaries",
      "Interaction polish that supports readability",
    ],
    status: "component systems · state boundaries · motion discipline",
    docLink: "https://react.dev/",
    heroMeta: ["React 18", "TypeScript", "Ant Design"],
    tags: ["React 18", "TypeScript", "Ant Design"],
    cards: [
      {
        kicker: "System",
        title: "UI Order",
        text: "A frontend surface should stay readable as complexity grows.",
      },
      {
        kicker: "Motion",
        title: "Interaction",
        text: "Transitions should explain structure instead of adding noise.",
      },
      {
        kicker: "Delivery",
        title: "Reuse",
        text: "Shared components and patterns reduce repetition and drift.",
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
    badge: "Signal Mode",
    titleEn: "Readable visual systems, not decorative charts.",
    titleZh: "强调信息可读性而不是堆图表的数据表达。",
    summaryEn:
      "Data views should reveal hierarchy, comparison, and rhythm instead of simply increasing chart count.",
    summaryZh:
      "数据界面应当强调层级、对比和节奏，而不是单纯增加图表数量。",
    points: [
      "Readable dashboard hierarchy",
      "Chart motion with clear scanning rhythm",
      "Visualization integrated into the product system",
    ],
    status: "chart hierarchy · scan rhythm · dashboard consistency",
    docLink: "https://echarts.apache.org/",
    heroMeta: ["ECharts", "Dashboard", "Signals"],
    tags: ["ECharts", "Dashboard", "Signals"],
    cards: [
      {
        kicker: "Visual",
        title: "Hierarchy",
        text: "Dense data still needs a calm reading order.",
      },
      {
        kicker: "Motion",
        title: "Rhythm",
        text: "Animation should help comparison and tracking.",
      },
      {
        kicker: "System",
        title: "Consistency",
        text: "Charts should belong to the interface, not sit on top of it.",
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
    badge: "Research Mode",
    titleEn: "Research framing, structured analysis, and reproducible thinking.",
    titleZh: "面向研究问题建模、结构化分析与可复用的方法表达。",
    summaryEn:
      "Academic-facing work needs clearer questions, explicit methods, and outputs that can be understood and reused.",
    summaryZh:
      "学术导向内容需要更明确的问题定义、方法说明和可复用的分析输出。",
    points: [
      "Problem framing and scope definition",
      "Structured comparison and evidence-based reasoning",
      "Bilingual communication for technical and academic audiences",
    ],
    status: "problem framing · method clarity · bilingual research outputs",
    docLink: "https://scholar.google.com/",
    heroMeta: ["Methods", "Analysis", "Writing"],
    tags: ["Methods", "Analysis", "Writing"],
    cards: [
      {
        kicker: "Scope",
        title: "Questions",
        text: "Start from the research question, not from decorative output.",
      },
      {
        kicker: "Method",
        title: "Reasoning",
        text: "Make assumptions, tradeoffs, and evidence explicit.",
      },
      {
        kicker: "Output",
        title: "Clarity",
        text: "Results should be presentable, reviewable, and reusable.",
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
  module.exports = { themeData };
}

if (typeof window !== "undefined") {
  window.themeData = themeData;
}

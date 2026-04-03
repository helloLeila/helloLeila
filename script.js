const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

const heroTitle = document.querySelector(".hero-title");
const heroLede = document.querySelector(".hero-lede");
const heroMeta = document.querySelector(".hero-meta-row");
const heroButtons = document.querySelectorAll(".cta-row .button");
const focusNodes = document.querySelectorAll(".focus-node");
const missionStage = document.getElementById("missionStage");
const stageFlash = document.getElementById("stageFlash");
const stagePanel = document.getElementById("stagePanel");
const stageStatus = document.querySelector(".stage-status");
const focusBadge = document.getElementById("focusBadge");
const focusTitle = document.getElementById("focusTitle");
const focusCopyEn = document.getElementById("focusCopyEn");
const focusCopyZh = document.getElementById("focusCopyZh");
const focusPoints = document.getElementById("focusPoints");
const focusStatus = document.getElementById("focusStatus");
const focusDocLink = document.getElementById("focusDocLink");
const floatLabels = [
  document.getElementById("floatLabelA"),
  document.getElementById("floatLabelB"),
  document.getElementById("floatLabelC"),
];
const stackCards = [
  {
    card: document.getElementById("stackCardA"),
    kicker: document.getElementById("stackKickerA"),
    title: document.getElementById("stackTitleA"),
    text: document.getElementById("stackTextA"),
  },
  {
    card: document.getElementById("stackCardB"),
    kicker: document.getElementById("stackKickerB"),
    title: document.getElementById("stackTitleB"),
    text: document.getElementById("stackTextB"),
  },
  {
    card: document.getElementById("stackCardC"),
    kicker: document.getElementById("stackKickerC"),
    title: document.getElementById("stackTitleC"),
    text: document.getElementById("stackTextC"),
  },
];
const skillGroups = document.querySelectorAll(".skill-group");
const skillPills = document.querySelectorAll(".skill-pill");
const orbs = document.querySelectorAll(".orb");
const projectRows = document.querySelectorAll(".project-row");
const terminal = document.querySelector(".terminal");

const focusMap = {
  react: {
    badge: "Frontend Anchor",
    title: "React 18",
    copyEn:
      "For interfaces that need composable screens, reusable state boundaries, and product motion that stays clear instead of noisy.",
    copyZh:
      "适合需要组件化界面、清晰状态边界，以及克制但有质感动效的前端产品界面。",
    points: [
      "Composable UI systems",
      "Clean stateful app shells",
      "Pairs well with TypeScript and Ant Design",
    ],
    status: "UI systems · state boundaries · polished product motion",
    link: "https://react.dev/",
    floats: ["Hooks", "App Shell", "Design System"],
    cards: [
      {
        kicker: "Primary",
        title: "UI Systems",
        text: "Reusable surfaces and dependable state composition.",
      },
      {
        kicker: "Flow",
        title: "Interaction",
        text: "Transitions that clarify structure instead of decorating it.",
      },
      {
        kicker: "Delivery",
        title: "Showcase",
        text: "GitHub-ready interfaces with operational polish.",
      },
    ],
    colors: [
      "rgba(62, 111, 255, 0.28)",
      "rgba(18, 191, 168, 0.2)",
      "rgba(129, 206, 255, 0.18)",
    ],
    layout: {
      panel: { x: 0, y: 0 },
      status: { x: 0, y: 0 },
      floats: [
        { x: 0, y: 0, rotate: -5 },
        { x: 0, y: 0, rotate: 4 },
        { x: 0, y: 0, rotate: -4 },
      ],
      cards: [
        { x: 0, y: 0, rotate: -8 },
        { x: 0, y: 0, rotate: 6 },
        { x: 0, y: 0, rotate: -2 },
      ],
    },
  },
  ts: {
    badge: "Typed UI",
    title: "TypeScript",
    copyEn:
      "I use it to keep complex product surfaces understandable, safer to extend, and easier to refactor under real delivery pressure.",
    copyZh:
      "我会用 TypeScript 维持复杂产品页面的可理解性，让扩展、重构和多人协作都更稳。",
    points: [
      "Predictable contracts for frontend systems",
      "Safer shared utilities and data models",
      "Improves long-lived codebase readability",
    ],
    status: "typed contracts · reusable models · lower refactor risk",
    link: "https://www.typescriptlang.org/",
    floats: ["Type Safety", "Shared Types", "Refactor"],
    cards: [
      {
        kicker: "Primary",
        title: "Contracts",
        text: "Stable interfaces between view logic, data, and tooling.",
      },
      {
        kicker: "Flow",
        title: "Refactorability",
        text: "Changes stay controlled even as the surface grows.",
      },
      {
        kicker: "Delivery",
        title: "Shared Models",
        text: "Cleaner collaboration across frontend engineering work.",
      },
    ],
    colors: [
      "rgba(75, 126, 255, 0.3)",
      "rgba(91, 167, 255, 0.18)",
      "rgba(18, 191, 168, 0.16)",
    ],
    layout: {
      panel: { x: 10, y: -4 },
      status: { x: 0, y: 0 },
      floats: [
        { x: 6, y: 26, rotate: -3 },
        { x: 8, y: -10, rotate: 5 },
        { x: -26, y: 16, rotate: -6 },
      ],
      cards: [
        { x: 20, y: -8, rotate: -2 },
        { x: -28, y: -12, rotate: 11 },
        { x: 6, y: 16, rotate: -8 },
      ],
    },
  },
  echarts: {
    badge: "Visual Data",
    title: "ECharts",
    copyEn:
      "Useful when dashboards need actual readability, not just more charts. I care about hierarchy, motion rhythm, and information density.",
    copyZh:
      "做大屏或数据面板时，我更看重层级、节奏和可读性，而不是单纯堆更多图表。",
    points: [
      "Readable dashboard composition",
      "Strong chart motion without visual clutter",
      "Fits well with frontend system design",
    ],
    status: "data hierarchy · motion rhythm · dashboard readability",
    link: "https://echarts.apache.org/",
    floats: ["Dashboard", "Signals", "Charts"],
    cards: [
      {
        kicker: "Primary",
        title: "Data Walls",
        text: "Clear spatial grouping for dense information surfaces.",
      },
      {
        kicker: "Flow",
        title: "Chart Motion",
        text: "Animated transitions that help scanning instead of distract.",
      },
      {
        kicker: "Delivery",
        title: "Visual Consistency",
        text: "Charts integrated into the product system, not glued on top.",
      },
    ],
    colors: [
      "rgba(18, 191, 168, 0.24)",
      "rgba(62, 111, 255, 0.18)",
      "rgba(255, 154, 98, 0.2)",
    ],
    layout: {
      panel: { x: -8, y: 10 },
      status: { x: 8, y: 4 },
      floats: [
        { x: -18, y: 42, rotate: -7 },
        { x: 12, y: -6, rotate: 6 },
        { x: -34, y: -8, rotate: -8 },
      ],
      cards: [
        { x: 4, y: -32, rotate: -13 },
        { x: -42, y: 8, rotate: 8 },
        { x: 16, y: 28, rotate: -4 },
      ],
    },
  },
  java: {
    badge: "Backend Logic",
    title: "Java",
    copyEn:
      "For service-side logic that needs stable structure, clear layering, and reliable support behind frontend-heavy products.",
    copyZh:
      "在服务端部分，我更重视清晰分层、稳定结构和对前端产品能力的可靠支撑。",
    points: [
      "Service-side logic and business flow handling",
      "Clearer contracts with data and storage layers",
      "Supports product surfaces that need dependable backend behavior",
    ],
    status: "service logic · layered structure · dependable support",
    link: "https://www.java.com/",
    floats: ["Service", "Logic", "Layering"],
    cards: [
      {
        kicker: "Primary",
        title: "Business Flow",
        text: "Stable handling for service-side process orchestration.",
      },
      {
        kicker: "Flow",
        title: "Structure",
        text: "Separation between data, service, and interface concerns.",
      },
      {
        kicker: "Delivery",
        title: "Support",
        text: "Reliable backend foundations behind frontend-heavy products.",
      },
    ],
    colors: [
      "rgba(255, 154, 98, 0.24)",
      "rgba(62, 111, 255, 0.16)",
      "rgba(18, 191, 168, 0.16)",
    ],
    layout: {
      panel: { x: 14, y: 6 },
      status: { x: 0, y: 0 },
      floats: [
        { x: -24, y: 14, rotate: -8 },
        { x: 4, y: 10, rotate: 3 },
        { x: -8, y: 34, rotate: -5 },
      ],
      cards: [
        { x: 24, y: -10, rotate: -4 },
        { x: -10, y: -18, rotate: 13 },
        { x: -18, y: 20, rotate: -10 },
      ],
    },
  },
  docker: {
    badge: "Ship Surface",
    title: "Docker",
    copyEn:
      "I use it where product handoff needs cleaner environments, repeatable local setup, and less friction between build and deployment.",
    copyZh:
      "当项目需要更稳定的环境交付、更可复现的本地搭建和更顺的部署链路时，我会用 Docker。",
    points: [
      "Repeatable environment setup",
      "Cleaner delivery between local and deploy",
      "Useful for multi-surface demos and workflows",
    ],
    status: "environment parity · cleaner handoff · smoother shipping",
    link: "https://www.docker.com/",
    floats: ["Container", "Deploy", "Parity"],
    cards: [
      {
        kicker: "Primary",
        title: "Environment",
        text: "Predictable setup across local, staging, and delivery steps.",
      },
      {
        kicker: "Flow",
        title: "Handoff",
        text: "Reduces friction when projects move between people or systems.",
      },
      {
        kicker: "Delivery",
        title: "Shipping",
        text: "Supports demo packaging and workflow reproducibility.",
      },
    ],
    colors: [
      "rgba(62, 111, 255, 0.28)",
      "rgba(84, 201, 245, 0.2)",
      "rgba(18, 191, 168, 0.16)",
    ],
    layout: {
      panel: { x: -10, y: -2 },
      status: { x: 6, y: 0 },
      floats: [
        { x: -6, y: -18, rotate: -3 },
        { x: 22, y: 20, rotate: 7 },
        { x: -22, y: 10, rotate: -9 },
      ],
      cards: [
        { x: -10, y: -12, rotate: -11 },
        { x: 10, y: 18, rotate: 3 },
        { x: 22, y: -4, rotate: -7 },
      ],
    },
  },
  qiankun: {
    badge: "Micro Frontend",
    title: "qiankun",
    copyEn:
      "Useful when a frontend system needs multiple sub-apps, independent iteration, and a more deliberate integration boundary.",
    copyZh:
      "当前端系统需要多个子应用、独立迭代能力，以及更清晰的集成边界时，qiankun 很合适。",
    points: [
      "Sub-app isolation with shared host control",
      "Supports gradual system growth",
      "Useful for large or multi-team frontend surfaces",
    ],
    status: "sub-app boundaries · gradual scaling · host control",
    link: "https://qiankun.umijs.org/",
    floats: ["Host App", "Sub Apps", "Isolation"],
    cards: [
      {
        kicker: "Primary",
        title: "Boundaries",
        text: "Keeps frontend responsibilities clearer as scope grows.",
      },
      {
        kicker: "Flow",
        title: "Composition",
        text: "Multiple surfaces can move independently without collapsing together.",
      },
      {
        kicker: "Delivery",
        title: "Scaling",
        text: "A path for larger systems that need more control than a single app.",
      },
    ],
    colors: [
      "rgba(18, 191, 168, 0.24)",
      "rgba(62, 111, 255, 0.2)",
      "rgba(160, 124, 255, 0.16)",
    ],
    layout: {
      panel: { x: 8, y: 2 },
      status: { x: -4, y: 0 },
      floats: [
        { x: 14, y: 30, rotate: -5 },
        { x: -18, y: 6, rotate: 8 },
        { x: 8, y: -20, rotate: -6 },
      ],
      cards: [
        { x: 26, y: -18, rotate: -14 },
        { x: -38, y: 12, rotate: 10 },
        { x: 8, y: 28, rotate: -3 },
      ],
    },
  },
};

const stars = [];
const STAR_COUNT = 120;
let width = 0;
let height = 0;
let activeFocus = "react";

function renderFocusTitle(text) {
  focusTitle.textContent = "";
  focusTitle.setAttribute("aria-label", text);

  const words = text.split(" ");

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "title-word";

    [...word].forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.className = "title-char";
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    });

    focusTitle.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      const gap = document.createElement("span");
      gap.className = "title-gap";
      gap.textContent = " ";
      focusTitle.appendChild(gap);
    }
  });
}

function animateFocusTitle() {
  if (!window.gsap) {
    return;
  }

  const { gsap } = window;
  const chars = focusTitle.querySelectorAll(".title-char");

  if (!chars.length) {
    return;
  }

  gsap.fromTo(
    chars,
    {
      opacity: 0,
      x: (index) => (index % 2 === 0 ? -18 : 18),
      y: 10,
      filter: "blur(8px)",
    },
    {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      duration: 0.46,
      stagger: 0.018,
      ease: "power3.out",
    },
  );
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function seedStars() {
  stars.length = 0;
  const palette = [
    [62, 111, 255],
    [18, 191, 168],
    [255, 138, 76],
  ];

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const tint = palette[Math.floor(Math.random() * palette.length)];
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.45 + 0.12,
      alpha: Math.random() * 0.7 + 0.15,
      tint,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed;
    if (star.y > height + 4) {
      star.y = -4;
      star.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(${star.tint[0]}, ${star.tint[1]}, ${star.tint[2]}, ${star.alpha * 0.7})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawStars);
}

function populateFocus(data) {
  focusBadge.textContent = data.badge;
  renderFocusTitle(data.title);
  focusCopyEn.textContent = data.copyEn;
  focusCopyZh.textContent = data.copyZh;
  focusStatus.textContent = data.status;
  focusDocLink.href = data.link;

  focusPoints.innerHTML = "";
  data.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    focusPoints.appendChild(item);
  });

  floatLabels.forEach((label, index) => {
    label.textContent = data.floats[index];
  });

  stackCards.forEach((slot, index) => {
    slot.kicker.textContent = data.cards[index].kicker;
    slot.title.textContent = data.cards[index].title;
    slot.text.textContent = data.cards[index].text;
  });

  missionStage.style.setProperty("--focus-a", data.colors[0]);
  missionStage.style.setProperty("--focus-b", data.colors[1]);
  missionStage.style.setProperty("--focus-c", data.colors[2]);
}

function applyStageLayout(data, immediate = false) {
  const layout = data.layout;

  if (!window.gsap || immediate) {
    stagePanel.style.transform = `translate(${layout.panel.x}px, ${layout.panel.y}px)`;
    stageStatus.style.transform = `translate(${layout.status.x}px, ${layout.status.y}px)`;

    floatLabels.forEach((label, index) => {
      const target = layout.floats[index];
      label.style.transform = `translate(${target.x}px, ${target.y}px) rotate(${target.rotate}deg)`;
    });

    stackCards.forEach((slot, index) => {
      const target = layout.cards[index];
      slot.card.style.transform = `translate(${target.x}px, ${target.y}px) rotate(${target.rotate}deg)`;
    });

    return;
  }

  const { gsap } = window;

  gsap.to(stagePanel, {
    x: layout.panel.x,
    y: layout.panel.y,
    duration: 0.62,
    ease: "power3.out",
  });

  gsap.to(stageStatus, {
    x: layout.status.x,
    y: layout.status.y,
    duration: 0.62,
    ease: "power3.out",
  });

  floatLabels.forEach((label, index) => {
    const target = layout.floats[index];
    gsap.to(label, {
      x: target.x,
      y: target.y,
      rotate: target.rotate,
      duration: 0.68,
      ease: "power3.out",
    });
  });

  stackCards.forEach((slot, index) => {
    const target = layout.cards[index];
    gsap.to(slot.card, {
      x: target.x,
      y: target.y,
      rotate: target.rotate,
      duration: 0.74,
      ease: "power3.out",
    });
  });
}

function triggerStageFlash() {
  if (!window.gsap || !stageFlash) {
    return;
  }

  const { gsap } = window;

  gsap.killTweensOf(stageFlash);
  gsap.set(stageFlash, {
    opacity: 0,
    xPercent: -125,
    rotate: 8,
  });

  gsap.timeline()
    .to(stageFlash, {
      opacity: 0.95,
      duration: 0.08,
      ease: "power1.out",
    })
    .to(stageFlash, {
      xPercent: 128,
      opacity: 0.16,
      duration: 0.62,
      ease: "power2.out",
    }, 0)
    .to(stageFlash, {
      opacity: 0,
      duration: 0.24,
      ease: "power1.out",
    }, 0.48);
}

function updateFocus(key, immediate = false) {
  const data = focusMap[key];
  if (!data || key === activeFocus && !immediate) {
    return;
  }

  activeFocus = key;

  focusNodes.forEach((node) => {
    const isActive = node.dataset.focus === key;
    node.classList.toggle("is-active", isActive);
    node.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (!window.gsap || immediate) {
    populateFocus(data);
    applyStageLayout(data, true);
    return;
  }

  const { gsap } = window;
  const animatedPieces = [
    stagePanel,
    focusBadge,
    focusDocLink,
    ...floatLabels,
    ...stackCards.map((slot) => slot.card),
  ];

  gsap.killTweensOf(animatedPieces);

  const timeline = gsap.timeline();
  timeline.to(animatedPieces, {
    opacity: 0,
    y: 10,
    duration: 0.18,
    stagger: 0.02,
    ease: "power2.in",
  });

  timeline.add(() => {
    populateFocus(data);
    triggerStageFlash();
  });

  timeline.fromTo(
    animatedPieces,
    { opacity: 0, y: 18, scale: 0.985 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.42,
      stagger: 0.03,
      ease: "power3.out",
    },
  );

  timeline.add(() => {
    applyStageLayout(data);
  }, 0.08);

  timeline.add(() => {
    animateFocusTitle();
  }, 0.12);

  timeline.fromTo(
    stackCards.map((slot) => slot.card),
    {
      rotationY: (index) => (index === 1 ? -20 : 20),
      rotationX: (index) => (index === 2 ? -14 : 10),
      z: 70,
    },
    {
      rotationY: 0,
      rotationX: 0,
      z: 0,
      duration: 0.76,
      stagger: 0.04,
      ease: "power3.out",
    },
    0.14,
  );

  timeline.fromTo(
    missionStage,
    { scale: 0.992 },
    {
      scale: 1,
      duration: 0.36,
      ease: "power2.out",
    },
    0.1,
  );
}

function initFocusNodes() {
  focusNodes.forEach((node) => {
    node.addEventListener("click", () => {
      updateFocus(node.dataset.focus);
    });
  });

  populateFocus(focusMap[activeFocus]);
  applyStageLayout(focusMap[activeFocus], true);
}

function initGsapEffects() {
  if (!window.gsap) {
    return;
  }

  const { gsap } = window;

  gsap.from([heroTitle, heroLede, heroMeta], {
    y: 24,
    opacity: 0,
    duration: 0.9,
    ease: "power2.out",
    stagger: 0.1,
  });

  gsap.from(heroButtons, {
    y: 18,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.08,
    delay: 0.18,
  });

  gsap.from(focusNodes, {
    y: 20,
    opacity: 0,
    duration: 0.74,
    ease: "power2.out",
    stagger: 0.05,
    delay: 0.26,
  });

  gsap.from(missionStage, {
    y: 32,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.2,
  });

  gsap.from(focusTitle.querySelectorAll(".title-char"), {
    opacity: 0,
    x: (index) => (index % 2 === 0 ? -14 : 14),
    y: 8,
    filter: "blur(6px)",
    duration: 0.46,
    stagger: 0.018,
    ease: "power3.out",
    delay: 0.42,
  });

  gsap.from(skillGroups, {
    y: 28,
    opacity: 0,
    duration: 0.9,
    ease: "power2.out",
    stagger: 0.08,
    delay: 0.24,
  });

  gsap.from(projectRows, {
    y: 22,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.08,
    delay: 0.3,
  });

  if (terminal) {
    gsap.from(terminal, {
      y: 22,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.34,
    });
  }

  orbs.forEach((orb, index) => {
    gsap.to(orb, {
      x: index % 2 === 0 ? 18 : -20,
      y: index === 1 ? 22 : -18,
      duration: 5 + index,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  floatLabels.forEach((label, index) => {
    gsap.to(label, {
      yPercent: index % 2 === 0 ? -14 : 14,
      xPercent: index === 1 ? -10 : 10,
      duration: 3 + index * 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  stackCards.forEach((slot, index) => {
    gsap.to(slot.card, {
      yPercent: index % 2 === 0 ? -8 : 7,
      duration: 3.4 + index * 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  focusNodes.forEach((node) => {
    node.addEventListener("pointerenter", () => {
      gsap.to(node, {
        y: -3,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    node.addEventListener("pointerleave", () => {
      gsap.to(node, {
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    });
  });

  skillGroups.forEach((group) => {
    group.addEventListener("pointerenter", () => {
      gsap.to(group, {
        y: -6,
        boxShadow: "0 24px 42px rgba(68, 92, 156, 0.16)",
        duration: 0.25,
        ease: "power2.out",
      });
    });

    group.addEventListener("pointerleave", () => {
      gsap.to(group, {
        y: 0,
        boxShadow: "0 22px 60px rgba(68, 92, 156, 0.12)",
        duration: 0.25,
        ease: "power2.out",
      });
    });
  });

  skillPills.forEach((pill) => {
    pill.addEventListener("pointerenter", () => {
      gsap.to(pill, {
        y: -4,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    pill.addEventListener("pointerleave", () => {
      gsap.to(pill, {
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    });
  });
}

function initStageTilt() {
  if (!missionStage || !window.gsap) {
    return;
  }

  const { gsap } = window;

  missionStage.addEventListener("pointermove", (event) => {
    const rect = missionStage.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(missionStage, {
      rotateY: offsetX * 8,
      rotateX: offsetY * -7,
      transformPerspective: 1200,
      transformOrigin: "center center",
      duration: 0.55,
      ease: "power3.out",
    });
  });

  missionStage.addEventListener("pointerleave", () => {
    gsap.to(missionStage, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  });
}

resizeCanvas();
seedStars();
drawStars();
initFocusNodes();
initGsapEffects();
initStageTilt();

window.addEventListener("resize", () => {
  resizeCanvas();
  seedStars();
});

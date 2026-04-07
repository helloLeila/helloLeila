const themeData = Array.isArray(window.themeData) ? window.themeData : [];

const heroStage = document.getElementById("heroStage");
const themeControls = [...document.querySelectorAll(".theme-control")];
const stagePanel = document.getElementById("stagePanel");
const stageFlash = document.getElementById("stageFlash");
const stageBadge = document.getElementById("stageBadge");
const stageDocLink = document.getElementById("stageDocLink");
const heroTitleEn = document.getElementById("heroTitleEn");
const heroTitleZh = document.getElementById("heroTitleZh");
const heroSummaryEn = document.getElementById("heroSummaryEn");
const heroSummaryZh = document.getElementById("heroSummaryZh");
const heroMetaNodes = [...document.querySelectorAll("#heroMetaRow span")];
const stageTitleEn = document.getElementById("stageTitleEn");
const stageTitleZh = document.getElementById("stageTitleZh");
const stageCopyEn = document.getElementById("stageCopyEn");
const stageCopyZh = document.getElementById("stageCopyZh");
const stagePoints = document.getElementById("stagePoints");
const stageStatus = document.getElementById("stageStatus");
const floatTags = [
  document.getElementById("floatTagA"),
  document.getElementById("floatTagB"),
  document.getElementById("floatTagC"),
];
const stackCards = [
  {
    root: document.getElementById("stackCardA"),
    kicker: document.getElementById("stackKickerA"),
    title: document.getElementById("stackTitleA"),
    text: document.getElementById("stackTextA"),
  },
  {
    root: document.getElementById("stackCardB"),
    kicker: document.getElementById("stackKickerB"),
    title: document.getElementById("stackTitleB"),
    text: document.getElementById("stackTextB"),
  },
  {
    root: document.getElementById("stackCardC"),
    kicker: document.getElementById("stackKickerC"),
    title: document.getElementById("stackTitleC"),
    text: document.getElementById("stackTextC"),
  },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = {
  activeKey: "fullstack",
};

function renderHeroMeta(theme) {
  heroMetaNodes.forEach((node, index) => {
    node.textContent = theme.heroMeta[index] || "";
  });
}

function renderPoints(theme) {
  stagePoints.innerHTML = "";
  theme.points.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    stagePoints.appendChild(li);
  });
}

function renderTags(theme) {
  floatTags.forEach((node, index) => {
    const tag = theme.tags[index];
    const layout = theme.tagLayout[index];
    node.textContent = tag;
    node.style.transform = `translate(${layout.x}px, ${layout.y}px) rotate(${layout.r}deg)`;
  });
}

function renderCards(theme) {
  stackCards.forEach((slot, index) => {
    const card = theme.cards[index];
    const layout = theme.cardLayout[index];
    slot.kicker.textContent = card.kicker;
    slot.title.textContent = card.title;
    slot.text.textContent = card.text;
    slot.root.style.transform = `translate(${layout.x}px, ${layout.y}px) rotate(${layout.r}deg)`;
  });
}

function flashStage() {
  if (reduceMotion) {
    return;
  }

  stageFlash.classList.remove("is-flashing");
  void stageFlash.offsetWidth;
  stageFlash.classList.add("is-flashing");
}

function setStageTheme(theme) {
  heroStage.classList.remove("is-fullstack", "is-frontend", "is-dataviz", "is-academic");
  heroStage.classList.add(theme.stageHue);

  heroTitleEn.textContent = theme.titleEn;
  heroTitleZh.textContent = theme.titleZh;
  heroSummaryEn.textContent = theme.summaryEn;
  heroSummaryZh.textContent = theme.summaryZh;

  stageBadge.textContent = `${theme.buttonEn} / ${theme.buttonZh}`;
  stageDocLink.href = theme.docLink;
  stageTitleEn.textContent = theme.titleEn;
  stageTitleZh.textContent = theme.titleZh;
  stageCopyEn.textContent = theme.summaryEn;
  stageCopyZh.textContent = theme.summaryZh;
  stageStatus.textContent = theme.status;

  renderHeroMeta(theme);
  renderPoints(theme);
  renderTags(theme);
  renderCards(theme);
  flashStage();
}

function activateTheme(key) {
  const theme = themeData.find((item) => item.key === key);
  if (!theme) {
    return;
  }

  state.activeKey = key;
  themeControls.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === key);
  });
  setStageTheme(theme);
}

function bindControlMotion(button) {
  button.addEventListener("pointermove", (event) => {
    if (reduceMotion) {
      return;
    }
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    button.style.setProperty("--mx", `${dx * 0.12}px`);
    button.style.setProperty("--my", `${dy * 0.12}px`);
  });

  button.addEventListener("pointerleave", () => {
    button.style.setProperty("--mx", "0px");
    button.style.setProperty("--my", "0px");
  });

  button.addEventListener("click", () => {
    activateTheme(button.dataset.theme);
  });
}

function bindStageParallax() {
  if (reduceMotion) {
    return;
  }

  heroStage.addEventListener("pointermove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    stagePanel.style.setProperty("--panel-rx", `${py * -4}deg`);
    stagePanel.style.setProperty("--panel-ry", `${px * 7}deg`);
  });

  heroStage.addEventListener("pointerleave", () => {
    stagePanel.style.setProperty("--panel-rx", "0deg");
    stagePanel.style.setProperty("--panel-ry", "0deg");
  });
}

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const stars = [];
  const density = reduceMotion ? 36 : 52;

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function buildStars() {
    stars.length = 0;
    const palette = [
      "rgba(61, 111, 255, 0.55)",
      "rgba(22, 193, 172, 0.44)",
      "rgba(255, 175, 119, 0.48)",
      "rgba(255, 255, 255, 0.75)",
    ];

    for (let index = 0; index < density; index += 1) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.8,
        color: palette[index % palette.length],
        speed: Math.random() * 0.18 + 0.04,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > window.innerHeight + 4) {
        star.y = -6;
        star.x = Math.random() * window.innerWidth;
      }

      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  resize();
  buildStars();
  draw();

  window.addEventListener("resize", () => {
    resize();
    buildStars();
  });
}

function init() {
  if (!themeData.length) {
    return;
  }

  themeControls.forEach(bindControlMotion);
  bindStageParallax();
  activateTheme(state.activeKey);
  initStarfield();
}

init();

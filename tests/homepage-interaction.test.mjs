import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import themeModule from "../theme-data.js";

const { themeData } = themeModule;
const scriptJs = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
  }

  add(...tokens) {
    tokens.forEach((token) => this.values.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.values.delete(token));
  }

  toggle(token, force) {
    if (force === true) {
      this.values.add(token);
      return true;
    }

    if (force === false) {
      this.values.delete(token);
      return false;
    }

    if (this.values.has(token)) {
      this.values.delete(token);
      return false;
    }

    this.values.add(token);
    return true;
  }

  contains(token) {
    return this.values.has(token);
  }
}

class FakeStyle {
  constructor() {
    this.props = new Map();
  }

  setProperty(name, value) {
    this.props.set(name, value);
  }
}

class FakeElement {
  constructor({ id = "", dataset = {}, classNames = [] } = {}) {
    this.id = id;
    this.dataset = dataset;
    this.classList = new FakeClassList(classNames);
    this.style = new FakeStyle();
    this.listeners = new Map();
    this.textContent = "";
    this._innerHTML = "";
    this.href = "";
    this.children = [];
    this.offsetWidth = 0;
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  addEventListener(type, handler) {
    const list = this.listeners.get(type) || [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 240, height: 80 };
  }

  click() {
    const handlers = this.listeners.get("click") || [];
    handlers.forEach((handler) => handler({ currentTarget: this }));
  }
}

function buildEnvironment() {
  const heroStage = new FakeElement({ id: "heroStage", classNames: ["hero-stage"] });
  const stagePanel = new FakeElement({ id: "stagePanel" });
  const stageFlash = new FakeElement({ id: "stageFlash" });
  const stageBadge = new FakeElement({ id: "stageBadge" });
  const stageDocLink = new FakeElement({ id: "stageDocLink" });
  const heroTitleEn = new FakeElement({ id: "heroTitleEn" });
  const heroTitleZh = new FakeElement({ id: "heroTitleZh" });
  const heroSummaryEn = new FakeElement({ id: "heroSummaryEn" });
  const heroSummaryZh = new FakeElement({ id: "heroSummaryZh" });
  const stageTitleEn = new FakeElement({ id: "stageTitleEn" });
  const stageTitleZh = new FakeElement({ id: "stageTitleZh" });
  const stageCopyEn = new FakeElement({ id: "stageCopyEn" });
  const stageCopyZh = new FakeElement({ id: "stageCopyZh" });
  const stagePoints = new FakeElement({ id: "stagePoints" });
  const stageStatus = new FakeElement({ id: "stageStatus" });
  const floatTagA = new FakeElement({ id: "floatTagA" });
  const floatTagB = new FakeElement({ id: "floatTagB" });
  const floatTagC = new FakeElement({ id: "floatTagC" });
  const stackCardA = new FakeElement({ id: "stackCardA" });
  const stackCardB = new FakeElement({ id: "stackCardB" });
  const stackCardC = new FakeElement({ id: "stackCardC" });
  const stackKickerA = new FakeElement({ id: "stackKickerA" });
  const stackKickerB = new FakeElement({ id: "stackKickerB" });
  const stackKickerC = new FakeElement({ id: "stackKickerC" });
  const stackTitleA = new FakeElement({ id: "stackTitleA" });
  const stackTitleB = new FakeElement({ id: "stackTitleB" });
  const stackTitleC = new FakeElement({ id: "stackTitleC" });
  const stackTextA = new FakeElement({ id: "stackTextA" });
  const stackTextB = new FakeElement({ id: "stackTextB" });
  const stackTextC = new FakeElement({ id: "stackTextC" });
  const canvas = new FakeElement({ id: "starfield" });
  canvas.getContext = () => ({
    setTransform() {},
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
  });

  const heroMetaNodes = [new FakeElement(), new FakeElement(), new FakeElement()];
  const themeControls = themeData.map((item, index) =>
    new FakeElement({
      dataset: { theme: item.key },
      classNames: ["theme-control", ...(index === 0 ? ["is-active"] : [])],
    }),
  );

  const elements = new Map([
    ["heroStage", heroStage],
    ["stagePanel", stagePanel],
    ["stageFlash", stageFlash],
    ["stageBadge", stageBadge],
    ["stageDocLink", stageDocLink],
    ["heroTitleEn", heroTitleEn],
    ["heroTitleZh", heroTitleZh],
    ["heroSummaryEn", heroSummaryEn],
    ["heroSummaryZh", heroSummaryZh],
    ["stageTitleEn", stageTitleEn],
    ["stageTitleZh", stageTitleZh],
    ["stageCopyEn", stageCopyEn],
    ["stageCopyZh", stageCopyZh],
    ["stagePoints", stagePoints],
    ["stageStatus", stageStatus],
    ["floatTagA", floatTagA],
    ["floatTagB", floatTagB],
    ["floatTagC", floatTagC],
    ["stackCardA", stackCardA],
    ["stackCardB", stackCardB],
    ["stackCardC", stackCardC],
    ["stackKickerA", stackKickerA],
    ["stackKickerB", stackKickerB],
    ["stackKickerC", stackKickerC],
    ["stackTitleA", stackTitleA],
    ["stackTitleB", stackTitleB],
    ["stackTitleC", stackTitleC],
    ["stackTextA", stackTextA],
    ["stackTextB", stackTextB],
    ["stackTextC", stackTextC],
    ["starfield", canvas],
  ]);

  const document = {
    getElementById(id) {
      return elements.get(id) || null;
    },
    querySelectorAll(selector) {
      if (selector === ".theme-control") return themeControls;
      if (selector === "#heroMetaRow span") return heroMetaNodes;
      return [];
    },
    createElement() {
      return new FakeElement();
    },
  };

  const window = {
    themeData,
    innerWidth: 1440,
    innerHeight: 960,
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame() {},
    addEventListener() {},
  };

  return {
    context: {
      window,
      document,
      console,
    },
    themeControls,
    stageTitleEn,
    stageTitleZh,
    stageBadge,
    stageDocLink,
    stageStatus,
    stagePoints,
    heroMetaNodes,
  };
}

test("clicking a theme control updates the visible stage content", () => {
  const env = buildEnvironment();

  vm.runInNewContext(scriptJs, env.context);

  const academicButton = env.themeControls.find((button) => button.dataset.theme === "academic");
  academicButton.click();

  assert.equal(
    env.stageTitleEn.textContent,
    "Research framing, structured analysis, and reproducible thinking.",
  );
  assert.equal(env.stageTitleZh.textContent, "面向研究问题建模、结构化分析与可复用的方法表达。");
  assert.equal(env.stageBadge.textContent, "Research Mode / 研究模式");
  assert.equal(env.stageDocLink.href, "https://scholar.google.com/");
  assert.match(env.stageStatus.textContent, /problem framing/);
  assert.equal(env.stagePoints.children.length, 3);
  assert.equal(env.heroMetaNodes[0].textContent, "Question framing / 问题建模");
});

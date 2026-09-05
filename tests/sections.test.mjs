// 区块结构测试，用于确保关键模块保持当前的组件结构和单语切换方式。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const coverageSource = fs.readFileSync(
  path.resolve(root, "src/components/CoverageField.jsx"),
  "utf8"
);
const milestoneSource = fs.readFileSync(
  path.resolve(root, "src/components/AnnualMilestones.jsx"),
  "utf8"
);
const milestoneTrendSource = fs.readFileSync(
  path.resolve(root, "src/components/MilestoneTrend.jsx"),
  "utf8"
);
const weatherTrendSource = fs.readFileSync(
  path.resolve(root, "src/components/WeatherTrendChart.jsx"),
  "utf8"
);
const workLinksSource = fs.readFileSync(
  path.resolve(root, "src/components/WorkLinks.jsx"),
  "utf8"
);
const appSource = fs.readFileSync(path.resolve(root, "src/App.jsx"), "utf8");
const signalCloudSource = fs.readFileSync(
  path.resolve(root, "src/components/SignalCloud.jsx"),
  "utf8"
);
const proofDeckSource = fs.readFileSync(
  path.resolve(root, "src/components/ProofDeck.jsx"),
  "utf8"
);
const workflowSource = fs.readFileSync(
  path.resolve(root, "src/components/WorkflowCanvas.jsx"),
  "utf8"
);
const heroSource = fs.readFileSync(
  path.resolve(root, "src/components/HeroStage.jsx"),
  "utf8"
);
const statsSource = fs.readFileSync(
  path.resolve(root, "src/components/StatsRow.jsx"),
  "utf8"
);
const edgeIndexPath = path.resolve(root, "src/components/EdgeIndex.jsx");
const edgeIndexSource = fs.existsSync(edgeIndexPath) ? fs.readFileSync(edgeIndexPath, "utf8") : "";
const skillGroupsSource = fs.readFileSync(
  path.resolve(root, "src/components/SkillGroups.jsx"),
  "utf8"
);
const appStyleSource = fs.readFileSync(
  path.resolve(root, "src/styles/app.css"),
  "utf8"
);
const packageJson = JSON.parse(
  fs.readFileSync(
    path.resolve(root, "package.json"),
    "utf8"
  )
);
const l7ThreePackageJson = JSON.parse(
  fs.readFileSync(
    path.resolve(
      root,
      "node_modules/@antv/l7-three/package.json"
    ),
    "utf8"
  )
);

// 验证地图模块标题走语言切换，并保留摘要栅格结构。
test("coverage field uses lang-specific heading and summary grid structure", () => {
  assert.match(coverageSource, /textByLang\(lang,\s*siteContent\.coverage\.titleEn,\s*siteContent\.coverage\.titleZh\)/);
  assert.doesNotMatch(coverageSource, /siteContent\.coverage\.titleEn} \/ {siteContent\.coverage\.titleZh/);
  assert.match(coverageSource, /coverage-card/);
  assert.match(coverageSource, /coverage-layout/);
  assert.match(coverageSource, /coverage-copy/);
  assert.match(coverageSource, /weather-panel/);
  assert.match(coverageSource, /WeatherTrendChart/);
  assert.match(coverageSource, /forecast\[0\]\?\.morningTemperature\s*\?\?\s*"--"/);
  assert.match(coverageSource, /forecast\[0\]\?\.eveningTemperature\s*\?\?\s*"--"/);
  assert.doesNotMatch(coverageSource, /forecast\[0\]\?\.morningTemperature\s*\?\?\s*weather\?\.temperature/);
  assert.doesNotMatch(coverageSource, /forecast\[0\]\?\.eveningTemperature\s*\?\?\s*weather\?\.temperature/);
  assert.match(coverageSource, /typhoonEta/);
  assert.match(coverageSource, /item\.key === "typhoonEta"/);
  assert.match(coverageSource, /coverage-summary-grid/);
  assert.match(coverageSource, /weatherSourceLabel/);
  assert.match(coverageSource, /weather\?\.sourceUrl/);
  assert.match(coverageSource, /weather\?\.isFallback/);
  assert.match(coverageSource, /weather-source-link/);
  assert.match(coverageSource, /alertSourceLabel/);
  assert.match(coverageSource, /weather\?\.typhoonAlert\?\.alertUrl/);
  assert.match(coverageSource, /weather-alert-source/);
});

// 验证地图示例被封装成真正的 React 组件，而不是直接把 demo 源码铺在模块顶层。
test("coverage field wraps the l7 scene inside the CoverageField react component", () => {
  assert.match(coverageSource, /export function CoverageField\(\{\s*lang,\s*weather\s*\}\)/);
  assert.doesNotMatch(coverageSource, /export function SignalCloud/);
  assert.match(coverageSource, /useEffect\(\(\)\s*=>\s*\{/);
  assert.match(coverageSource, /new Scene\(\{/);
});

// 验证深圳地图主层改为 L7 三维柱体与弧线，而不是平面弱网格背景。
test("coverage field uses 3d antv map layers for the shenzhen scene", () => {
  assert.match(coverageSource, /ThreeLayer/);
  assert.match(coverageSource, /ThreeRender/);
  assert.match(coverageSource, /scene\.registerRenderService\(ThreeRender\)/);
  assert.match(coverageSource, /const barLayer = new PointLayer/);
  assert.match(coverageSource, /\.shape\("cylinder"\)/);
  assert.match(coverageSource, /const airLineLayer = new LineLayer/);
  assert.match(coverageSource, /\.shape\("arc3d"\)/);
});

// 验证地图数据已经从长沙示例切到深圳 / 大湾区场景。
test("coverage field uses shenzhen and greater bay area coordinates instead of changsha sample data", () => {
  assert.match(coverageSource, /\[114\.0579,\s*22\.5431\]/);
  assert.match(coverageSource, /深圳宝安国际机场/);
  assert.match(coverageSource, /香港国际机场/);
  assert.match(coverageSource, /珠海金湾机场/);
  assert.match(coverageSource, /南山区/);
  assert.match(coverageSource, /宝安区/);
  assert.match(coverageSource, /textAllowOverlap:\s*true/);
  assert.match(coverageSource, /textOffset:/);
  assert.match(coverageSource, /textAnchor:/);
  assert.match(coverageSource, /rotation:\s*0/);
  assert.match(coverageSource, /style:\s*"blank"/);
  assert.match(coverageSource, /const wallLayer = new LineLayer/);
  assert.match(coverageSource, /\.shape\("wall"\)/);
  assert.match(coverageSource, /scene\.setBgColor\("#ffffff"\)/);
  assert.doesNotMatch(coverageSource, /scene\.setBgColor\("#6f95d1"\)/);
  assert.doesNotMatch(coverageSource, /长沙黄花国际机场/);
  assert.doesNotMatch(coverageSource, /常德桃花源机场/);
});

// 验证天气折线会按数据动态收紧纵轴，确保早晚差异在图上明显可见。
test("weather trend chart tightens the y-domain around the daily temperature spread", () => {
  assert.match(weatherTrendSource, /const minTemperature = Math\.min\(\.\.\.chartData\.map\(\(item\) => item\.temperature\)\)/);
  assert.match(weatherTrendSource, /const maxTemperature = Math\.max\(\.\.\.chartData\.map\(\(item\) => item\.temperature\)\)/);
  assert.match(weatherTrendSource, /domain:\s*\[minTemperature - 2,\s*maxTemperature \+ 2\]/);
});

// 验证里程碑模块标题走语言切换，并保留统一的趋势承载容器。
test("annual milestones use lang-specific heading inside roadmap surface", () => {
  assert.match(milestoneSource, /textByLang\(lang,\s*siteContent\.roadmap\.titleEn,\s*siteContent\.roadmap\.titleZh\)/);
  assert.doesNotMatch(milestoneSource, /siteContent\.roadmap\.titleEn} \/ {siteContent\.roadmap\.titleZh/);
  assert.match(milestoneSource, /roadmap-surface/);
});

// 验证年度里程碑的台阶使用固定高度，避免文案把逐年升高的节奏撑乱。
test("annual milestones use fixed step heights for a stable upward staircase", () => {
  assert.match(milestoneSource, /const heights = \[[\d,\s]+\]/);
  assert.match(milestoneSource, /index,/);
  assert.match(milestoneSource, /score:\s*heights\[index\]/);
  assert.match(milestoneTrendSource, /encode:\s*\{\s*x:\s*"index",\s*y:\s*"score"\s*\}/);
  assert.match(milestoneTrendSource, /x:\s*\{\s*domain:\s*\[0,\s*data\.length - 1\]/);
  assert.match(milestoneTrendSource, /height:\s*maxScore/);
  assert.match(milestoneTrendSource, /padding:\s*\[0,\s*0,\s*0,\s*0\]/);
  assert.match(milestoneTrendSource, /domain:\s*\[0,\s*maxScore\]/);
  assert.match(appStyleSource, /\.roadmap-stage\s*\{/);
  assert.match(appStyleSource, /\.milestone-trend\s*\{[\s\S]*inset:\s*0 0 0 0/);
  assert.match(appStyleSource, /\.milestone-trend\s*\{[\s\S]*height:\s*100%/);
  assert.match(appStyleSource, /\.milestone-trend\s*\{[\s\S]*z-index:\s*1/);
  assert.match(appStyleSource, /\.roadmap-track\s*\{[\s\S]*min-height:\s*240px/);
  assert.match(appStyleSource, /\.road-step\s*\{[\s\S]*height:\s*var\(--step-height\)/);
  assert.match(appStyleSource, /\.road-step\s*\{[\s\S]*box-shadow:\s*none/);
  assert.doesNotMatch(appStyleSource, /\.road-step\s*\{[\s\S]*min-height:\s*var\(--step-height\)/);
});

// 验证 CoverageField 使用的 three 运行时与 l7-three 对齐，避免高德场景里的 ThreeLayer 运行时崩溃。
test("coverage field uses the same three runtime as l7-three", () => {
  const packageAligned = packageJson.dependencies.three === `^${l7ThreePackageJson.dependencies.three}`;
  const sourceUsesL7ThreeRuntime =
    /@antv\/l7-three\/node_modules\/three\/build\/three\.module\.js/.test(coverageSource) &&
    /@antv\/l7-three\/node_modules\/three\/examples\/jsm\/loaders\/GLTFLoader\.js/.test(coverageSource);

  assert.ok(packageAligned || sourceUsesL7ThreeRuntime);
});

test("coverage field keeps map interaction optional without stealing page scroll", () => {
  assert.match(coverageSource, /typeof mapService\.setMapStatus === "function"/);
  assert.match(coverageSource, /dragEnable:\s*false/);
  assert.match(coverageSource, /zoomEnable:\s*false/);
  assert.match(coverageSource, /onPointerLeave/);
  assert.match(coverageSource, /coverage-map-toggle/);
  assert.match(coverageSource, /aria-pressed/);
  assert.match(coverageSource, /onWheelCapture/);
  assert.match(appStyleSource, /\.coverage-field\s*\{[\s\S]*touch-action:\s*pan-y/);
  assert.match(appStyleSource, /\.coverage-chart\s*\{[\s\S]*overscroll-behavior:\s*contain/);
});

test("edge index follows real page sections instead of becoming a second top navigation", () => {
  assert.match(appSource, /import \{ EdgeIndex \} from "\.\/components\/EdgeIndex\.jsx"/);
  assert.match(appSource, /<EdgeIndex lang=\{lang\} \/>/);
  assert.match(edgeIndexSource, /IntersectionObserver/);
  assert.match(edgeIndexSource, /id: "top"/);
  assert.match(edgeIndexSource, /id: "section-breakdown"/);
  assert.match(edgeIndexSource, /id: "section-signal-cloud"/);
  assert.match(edgeIndexSource, /id: "section-coverage"/);
  assert.match(edgeIndexSource, /id: "section-roadmap"/);
  assert.match(edgeIndexSource, /id: "live-news"/);
  assert.match(edgeIndexSource, /aria-current/);
  assert.match(appStyleSource, /\.edge-index\s*\{[\s\S]*position:\s*fixed/);
  assert.match(appStyleSource, /\.edge-index-link::before/);
  assert.doesNotMatch(appStyleSource, /\.edge-index\s*\{[\s\S]*border-left/);
});

test("signal cloud is the primary capability surface and keeps the four real skill groups", () => {
  assert.match(appSource, /<SignalCloud lang=\{lang\}\s*\/>[\s\S]*<div className="insight-grid">/);
  assert.match(signalCloudSource, /import \{ SkillGroups \} from "\.\/SkillGroups\.jsx"/);
  assert.match(signalCloudSource, /<SkillGroups\s+lang=\{lang\}\s+variant="index"[\s\S]*activeGroup=\{activeGroup\}[\s\S]*onGroupEnter=/);
  assert.match(skillGroupsSource, /variant\s*=\s*"default"/);
  assert.match(skillGroupsSource, /skill-index/);
  for (const key of ["frontend", "backend", "engineering", "ai-research"]) {
    assert.match(skillGroupsSource, new RegExp(key));
  }
});

test("editorial surface uses uneven composition and lighter structural lines", () => {
  assert.match(appStyleSource, /\.signal-cloud-layout\s*\{/);
  assert.match(appStyleSource, /\.signal-cloud-main\s*\{/);
  assert.match(appStyleSource, /\.skill-index\s*\{/);
  assert.match(appStyleSource, /grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s*minmax\(250px,\s*0\.65fr\)/);
  assert.match(appStyleSource, /\.workflow-lines path\s*\{[\s\S]*stroke-width:\s*1/);
  assert.doesNotMatch(appStyleSource, /\.workflow-lines path\s*\{[\s\S]*stroke-dasharray/);
});

test("proof deck presents full project evidence as editorial rows instead of cards", () => {
  assert.match(proofDeckSource, /proof-project-list/);
  assert.match(proofDeckSource, /proof-project-row/);
  assert.match(proofDeckSource, /proof-project-label/);
  assert.match(proofDeckSource, /proof-project-trail/);
  assert.match(proofDeckSource, /textByLang\(lang, item\.en, item\.zh\)/);
  assert.match(proofDeckSource, /proof-ai-note/);
  assert.match(proofDeckSource, /siteContent\.aiKnowledge/);
  assert.doesNotMatch(proofDeckSource, /proof-card/);
});

test("selected project rows expose an accessible active state and color change", () => {
  assert.match(proofDeckSource, /import \{ useState \} from "react"/);
  assert.match(proofDeckSource, /const \[activeProjectIndex, setActiveProjectIndex\] = useState\(0\)/);
  assert.match(proofDeckSource, /aria-pressed=\{isActive\}/);
  assert.match(proofDeckSource, /onClick=\{\(\) => setActiveProjectIndex\(index\)\}/);
  assert.match(proofDeckSource, /isActive/);
  assert.doesNotMatch(proofDeckSource, /<strong className="proof-deck-number">04<\/strong>/);
  assert.match(appStyleSource, /\.proof-project-row\.is-active \.proof-project-label h3/);
  assert.match(appStyleSource, /\.proof-project-row\s*\{[^}]*background:\s*transparent/);
  assert.match(appStyleSource, /\.proof-project-row:hover\s*\{[\s\S]*background:/);
  assert.match(appStyleSource, /\.proof-project-row\.is-active\s*\{[\s\S]*background:/);
  assert.match(appStyleSource, /\.proof-project-row:hover \.proof-project-copy > p/);
});

test("hero stats use one editorial accent instead of four repeated color blocks", () => {
  assert.match(appStyleSource, /\.stat-card strong\s*\{[\s\S]*background:\s*transparent/);
  assert.match(appStyleSource, /\.stat-card--primary strong\s*\{[\s\S]*color:\s*var\(--accent\)/);
  assert.match(appStyleSource, /\.stat-card--support strong,[\s\S]*\.stat-card--recognition strong\s*\{[\s\S]*color:\s*var\(--ink\)/);
  assert.match(appStyleSource, /\.stat-card--system strong\s*\{[\s\S]*color:\s*var\(--muted\)/);
  assert.doesNotMatch(appStyleSource, /#8a6d00/);
});

test("AI knowledge is treated as a connected project postscript", () => {
  assert.match(proofDeckSource, /AI PRACTICE \/ 实践/);
  assert.doesNotMatch(proofDeckSource, /AI \/ 04/);
  assert.match(appStyleSource, /\.proof-ai-note ul\s*\{[\s\S]*grid-template-columns:\s*repeat\(2/);
  assert.match(appStyleSource, /\.proof-ai-note\s*\{[\s\S]*background:/);
  assert.match(appStyleSource, /\.proof-ai-note\s*\{[\s\S]*margin-left:/);
});

test("hero stats use semantic layout tones instead of four unrelated colors", () => {
  const statsSource = fs.readFileSync(path.resolve(root, "src/components/StatsRow.jsx"), "utf8");
  assert.match(statsSource, /const statTones = \["primary", "support", "recognition", "system"\]/);
  assert.match(statsSource, /stat-card--\$\{statTones\[index\]\}/);
  assert.match(appStyleSource, /\.stat-card--primary\s+strong\s*\{[\s\S]*color:\s*var\(--accent\)/);
  assert.match(appStyleSource, /\.stat-card--recognition\s+strong\s*\{[\s\S]*color:\s*var\(--ink\)/);
  assert.doesNotMatch(appStyleSource, /\.stats-row\s*\{[\s\S]*grid-template-areas:/);
  assert.match(appStyleSource, /\.stats-row\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.35fr\)\s*minmax\(0,\s*0\.9fr\)\s*minmax\(0,\s*1\.1fr\)\s*minmax\(0,\s*0\.9fr\)/);
});

test("workflow nodes expose hover and selected states for the project-to-capability path", () => {
  assert.match(workflowSource, /import \{ useState \} from "react"/);
  assert.match(workflowSource, /aria-pressed=\{isActive\}/);
  assert.match(workflowSource, /className=\{`workflow-node \$\{className\} \$\{isActive \? "is-active" : ""\}`\}/);
  assert.match(appStyleSource, /\.workflow-node:hover[\s\S]*background:/);
  assert.match(appStyleSource, /\.workflow-node\.is-active[\s\S]*background:/);
  assert.match(appStyleSource, /\.workflow-column-right\s*\{[\s\S]*grid-template-columns:\s*repeat\(2/);
  assert.match(appStyleSource, /\.workflow-node\.is-active\s+strong\s*\{[\s\S]*color:\s*var\(--accent\)/);
});

test("selected work keeps the four project stories without an isolated giant count", () => {
  assert.doesNotMatch(proofDeckSource, /proof-deck-count/);
  assert.match(proofDeckSource, /四段真实项目经历/);
  assert.match(appStyleSource, /\.proof-deck-headline h2\s*\{[\s\S]*font-size:\s*clamp\(1\.8rem,\s*3\.2vw,\s*3\.2rem\)/);
});

test("hero keeps a personal introduction and adds compact working lanes without dropping evidence", () => {
  assert.match(heroSource, /hero-name/);
  assert.match(heroSource, /hero-thread/);
  assert.match(heroSource, /siteContent\.hero\.workingLanes\.map/);
  assert.match(heroSource, /<StatsRow lang=\{lang\} \/>/);
  assert.match(heroSource, /siteContent\.summary/);
  assert.match(heroSource, /siteContent\.domainLinks\.map/);
  assert.doesNotMatch(heroSource, /ProofDeck/);
  assert.match(appSource, /<HeroStage lang=\{lang\} setLang=\{setLang\} \/>[\s\S]*<ProofDeck lang=\{lang\} \/>/);
});

test("working lanes explain the delivered outcome before the technical vocabulary", () => {
  assert.match(heroSource, /lane\.leadEn/);
  assert.match(heroSource, /lane\.leadZh/);
  assert.match(heroSource, /hero-thread-lead/);
  assert.match(appStyleSource, /\.hero-thread-lead\s*\{/);
  assert.match(appStyleSource, /\.hero-thread-row small\s*\{/);
});

test("hero metrics explain themselves as delivery signals instead of an unexplained number wall", () => {
  assert.match(statsSource, /stats-caption/);
  assert.match(statsSource, /Delivery signals/);
  assert.match(appStyleSource, /\.stats-caption\s*\{/);
});

test("narrow layouts keep hero text inside the viewport and remove the blocking edge index", () => {
  assert.match(appStyleSource, /\.headline-wrap\s*\{[\s\S]*width:\s*100%/);
  assert.match(appStyleSource, /\.headline-main,[\s\S]*word-break:\s*break-word/);
  assert.match(appStyleSource, /@media \(max-width:\s*1220px\)\s*\{\s*\.edge-index\s*\{\s*display:\s*none/);
});

test("wide layouts show the edge index as a quiet desktop reading cue", () => {
  assert.match(appStyleSource, /@media \(min-width:\s*1221px\)\s*\{[\s\S]*\.edge-index\s*\{\s*display:\s*block/);
});

test("hero makes the existing identity and work focus scannable", () => {
  assert.match(heroSource, /hero-identity-label/);
  assert.match(heroSource, /hero-purpose-label/);
  assert.match(heroSource, /hero-role/);
  assert.match(heroSource, /siteContent\.summary/);
  assert.match(heroSource, /siteContent\.hero\.subline/);
});

test("hero leads with the work summary before the abstract thesis", () => {
  assert.match(heroSource, /hero-purpose-label[\s\S]*siteContent\.hero\.subline[\s\S]*className="headline"/);
  assert.match(appStyleSource, /@media \(min-width:\s*841px\)/);
  assert.match(appStyleSource, /\.hero-focus-summary[\s\S]*font-size:/);
});

test("hero delivery numbers carry a short semantic cue without replacing the original evidence", () => {
  assert.match(statsSource, /stat-context/);
  assert.match(statsSource, /branches/);
  assert.match(statsSource, /subsystems/);
  assert.match(statsSource, /siteContent\.stats/);
  assert.match(appStyleSource, /\.stat-context\s*\{/);
});

test("workflow context remains present but is visually subordinate to the title", () => {
  assert.match(workflowSource, /workflow-title-note/);
  assert.match(workflowSource, /workflowSection\.titleZh/);
});

test("map explore control stays clear of the native map controls", () => {
  assert.match(appStyleSource, /\.coverage-map-toggle\s*\{[\s\S]*left:\s*50%/);
  assert.match(appStyleSource, /\.coverage-map-toggle\s*\{[\s\S]*right:\s*auto/);
  assert.match(appStyleSource, /\.coverage-map-toggle\s*\{[\s\S]*transform:\s*translateX\(-50%\)/);
});

test("hero uses the reserved second column for the existing personal summary", () => {
  assert.match(heroSource, /hero-top-side/);
  assert.match(heroSource, /hero-profile-column/);
  assert.match(heroSource, /<StatsRow lang=\{lang\} \/>/);
  assert.match(heroSource, /className="summary-card"/);
  assert.match(heroSource, /siteContent\.domainLinks\.map/);
  assert.match(appStyleSource, /\.hero-top\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s*minmax\(300px,\s*0\.85fr\)/);
  assert.match(appStyleSource, /\.hero-profile-column\s*\{/);
});

test("annual milestones get a full-width reading lane instead of a narrow side column", () => {
  assert.match(appSource, /<div className="insight-grid">[\s\S]*<WorkflowCanvas lang=\{lang\} \/>\s*<\/div>\s*<AnnualMilestones lang=\{lang\} \/>/);
  assert.match(appStyleSource, /\.insight-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(appStyleSource, /\.roadmap-card\s*\{[\s\S]*width:\s*100%/);
  assert.match(appStyleSource, /\.roadmap-focus-row\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  const finalMobileStyle = appStyleSource.slice(appStyleSource.lastIndexOf("@media (max-width: 840px)"));
  assert.match(finalMobileStyle, /\.roadmap-focus-row\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("selected work restores the historical editorial intro and keeps the full project rows", () => {
  assert.match(proofDeckSource, /proof-deck-intro/);
  assert.match(proofDeckSource, /proof-deck-intro-copy/);
  assert.match(proofDeckSource, /四段真实项目经历/);
  assert.match(proofDeckSource, /siteContent\.problemsSolved\.map/);
  assert.match(proofDeckSource, /siteContent\.aiKnowledge\.map/);
});

test("selected work keeps the historical reading order instead of repeating a template heading", () => {
  assert.match(proofDeckSource, /proof-deck-context/);
  assert.match(proofDeckSource, /proof-deck-headline/);
  assert.match(proofDeckSource, /下面四个项目分别对应企业门户/);
  assert.match(appStyleSource, /\.proof-deck-headline\s*\{/);
  assert.match(appStyleSource, /\.proof-deck-context\s*\{/);
});

test("footer restores the historical three-band rhythm without replacing the continuous links", () => {
  const workLinksSource = fs.readFileSync(
    path.resolve(root, "src/components/WorkLinks.jsx"),
    "utf8"
  );

  assert.match(workLinksSource, /footer-callout/);
  assert.match(workLinksSource, /footer-signature/);
  assert.match(workLinksSource, /textByLang/);
  assert.match(workLinksSource, /link-marquee/);
  assert.match(workLinksSource, /siteContent\.workLinks\.map/);
  assert.match(appStyleSource, /\.footer-callout\s*\{/);
  assert.match(appStyleSource, /\.footer-signature\s*\{/);
  assert.match(appStyleSource, /\.footer-links\s*\{[\s\S]*overflow:\s*hidden/);
});

test("editorial links do not use underlines or decorative bottom rules", () => {
  assert.doesNotMatch(appStyleSource, /text-decoration\s*:\s*underline/);
  assert.doesNotMatch(appStyleSource, /text-underline-offset/);
  assert.doesNotMatch(appStyleSource, /border-bottom\s*:/);
  assert.match(appStyleSource, /\.events-page-link\s*\{[\s\S]*text-decoration:\s*none/);
});

test("editorial surfaces do not use decorative left rails", () => {
  assert.doesNotMatch(appStyleSource, /border-left(?:-color|-width)?\s*:/);
  assert.match(appStyleSource, /\.word-cloud-card,[\s\S]*\.footer-links\s*\{[\s\S]*border:\s*0/);
  assert.match(appStyleSource, /\.workflow-node\s*\{[\s\S]*border:\s*0/);
  assert.match(appStyleSource, /\.road-step\s*\{[\s\S]*border:\s*0/);
  assert.match(appStyleSource, /\.coverage-note\s*\{[\s\S]*border:\s*0/);
});

test("editorial surfaces use light backgrounds instead of black panels", () => {
  assert.match(appStyleSource, /--sage-surface:\s*#e4ebe2/);
  assert.match(appStyleSource, /\.hero-stage\s*\{[\s\S]*#fffdf8[\s\S]*color:\s*var\(--text\)/);
  assert.match(appStyleSource, /\.cloud-wrap\s*\{[\s\S]*var\(--sage-surface\)/);
  assert.match(appStyleSource, /\.coverage-card\s*\{[\s\S]*var\(--sage-surface\)[\s\S]*color:\s*var\(--text\)/);
  assert.doesNotMatch(appStyleSource, /background:\s*var\(--ink\)/);
  assert.doesNotMatch(appStyleSource, /#151814|#171b16|#20261e/);
});

test("utilities panel renders codex and public news panes", () => {
  const utilitiesSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/UtilitiesPanel.jsx"),
    "utf8"
  );

  assert.match(utilitiesSource, /codexNews\s*=\s*\[\]/);
  assert.match(utilitiesSource, /const hasCodexNews = codexNews\?\.length > 0/);
  assert.match(utilitiesSource, /Codex global brief \/ Codex 国外精选/);
  assert.match(utilitiesSource, /Current public feed \/ 当前五条/);
  assert.match(utilitiesSource, /news-brief-grid/);
  assert.match(utilitiesSource, /has-codex/);
  assert.match(utilitiesSource, /news-pane/);
  assert.match(utilitiesSource, /id="live-news"/);
  assert.match(utilitiesSource, /\{hasCodexNews \? \(/);
  assert.match(utilitiesSource, /variant="codex"[\s\S]*\) : null\}/);
  assert.match(utilitiesSource, /news-row-head/);
  assert.match(utilitiesSource, /href=\{item\.url\}/);
  assert.match(utilitiesSource, /item\.title/);
  assert.match(utilitiesSource, /item\.source/);
  assert.match(utilitiesSource, /item\.summary/);
  assert.match(utilitiesSource, /item\.whyItMatters/);
  assert.match(utilitiesSource, /item\.tags\.map/);
  assert.match(utilitiesSource, /news-tags/);
});

test("layout css protects mobile content from clipping", () => {
  assert.match(appStyleSource, /--page-gutter:\s*clamp\(4px,\s*0\.45vw,\s*8px\)/);
  assert.match(appStyleSource, /\.shell\s*\{[\s\S]*width:\s*min\(100%,\s*1680px\)/);
  assert.match(appStyleSource, /\.shell\s*\{[\s\S]*padding:\s*24px var\(--page-gutter\) 44px/);
  assert.match(appStyleSource, /\.insight-section\s*\{[\s\S]*gap:\s*24px/);
  assert.match(appStyleSource, /\.hero-stage\s*\{[\s\S]*min-width:\s*0/);
  assert.match(appStyleSource, /\.toolbar\s*\{[\s\S]*min-width:\s*0/);
  assert.match(appStyleSource, /\.toolbar-note\s*\{[\s\S]*min-width:\s*0/);
  assert.match(appStyleSource, /\.headline\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(appStyleSource, /\.live-news-card\s*\{[\s\S]*overflow:\s*visible/);
  assert.match(appStyleSource, /\.news-list li\s*\{[\s\S]*min-width:\s*0/);
  assert.match(appStyleSource, /\.graph-card,[\s\S]*\.footer-links\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.insight-grid\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.coverage-layout\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.coverage-copy\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.coverage-weather-card\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.metric-row\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.weather-panel-footer\s*\{[\s\S]*display:\s*grid/);
  assert.match(appStyleSource, /\.weather-panel-footer\s*\{[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(126px,\s*1fr\)\)/);
  assert.match(appStyleSource, /\.section-head\s*\{[^}]*min-width:\s*0/);
  assert.match(appStyleSource, /\.section-kicker\s*\{[^}]*white-space:\s*normal/);
  assert.match(appStyleSource, /@media \(max-width:\s*840px\)\s*\{[\s\S]*\.toolbar-note\s*\{[\s\S]*white-space:\s*normal/);
  assert.match(appStyleSource, /@media \(max-width:\s*840px\)\s*\{[\s\S]*\.shell\s*\{[\s\S]*padding:\s*12px 16px 24px/);
});

test("footer callout keeps the continuous interaction without oversized section typography", () => {
  assert.match(appStyleSource, /\.footer-callout h2\s*\{[\s\S]*font-size:\s*clamp\(1\.1rem,\s*1\.5vw,\s*1\.5rem\)/);
  assert.match(appStyleSource, /\.footer-callout h2\s*\{[\s\S]*margin:\s*clamp\(8px,\s*1\.2vw,\s*14px\) auto 8px/);
  assert.match(appStyleSource, /\.footer-callout\s*\{[\s\S]*padding:\s*clamp\(12px,\s*1\.8vw,\s*24px\)/);
});

test("footer entrances stay compact without shrinking the link interaction", () => {
  assert.match(appStyleSource, /\.footer-marquee-band\s*\{[\s\S]*padding:\s*4px 0/);
  assert.match(appStyleSource, /\.footer-marquee-band \.link-pill\s*\{[\s\S]*min-height:\s*28px/);
  assert.match(appStyleSource, /\.footer-marquee-band \.link-pill span\s*\{[\s\S]*font-size:\s*clamp\(0\.9rem,\s*1\.45vw,\s*1\.2rem\)/);
});

test("desktop footer uses a quieter heading and shorter callout band", () => {
  assert.match(appStyleSource, /@media \(min-width:\s*841px\)[\s\S]*\.footer-callout h2[\s\S]*font-size:\s*clamp\(1rem,\s*1\.2vw,\s*1\.2rem\)/);
  assert.match(appStyleSource, /@media \(min-width:\s*841px\)[\s\S]*\.footer-callout[\s\S]*padding:\s*14px 28px 16px/);
  assert.match(appStyleSource, /@media \(min-width:\s*841px\)[\s\S]*\.footer-signature[\s\S]*padding:\s*12px 28px/);
});

test("footer entrance stack keeps its compact mobile rhythm", () => {
  assert.match(appStyleSource, /\.footer-callout-head\s*\{[\s\S]*gap:\s*8px 14px/);
  assert.match(appStyleSource, /\.footer-marquee-band\s*\{[\s\S]*padding:\s*4px 0/);
  assert.match(appStyleSource, /\.footer-marquee-band \.link-pill\s*\{[\s\S]*min-height:\s*28px/);
  assert.match(appStyleSource, /\.footer-signature\s*\{[\s\S]*padding:\s*12px 18px/);
});

test("footer marquee keeps each entrance on one readable line", () => {
  assert.match(appStyleSource, /\.footer-marquee-band \.link-pill\s*\{[\s\S]*display:\s*inline-flex/);
  assert.match(appStyleSource, /\.footer-marquee-band \.link-pill\s*\{[\s\S]*align-items:\s*baseline/);
});

test("hero signal row is grouped instead of stretching into a metric wall", () => {
  assert.match(appStyleSource, /\.stats-row\s*\{[\s\S]*max-width:\s*78rem/);
});

test("mobile workflow canvas uses one readable column instead of clipping the capability nodes", () => {
  const finalResponsiveLayer = appStyleSource.slice(appStyleSource.lastIndexOf("@media (max-width: 840px)"));
  assert.match(finalResponsiveLayer, /\.workflow-layout\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("work links use a continuous accessible marquee", () => {
  assert.match(workLinksSource, /className="link-marquee"/);
  assert.match(workLinksSource, /className="link-track"/);
  assert.match(workLinksSource, /\[false,\s*true\]\.map/);
  assert.match(workLinksSource, /aria-hidden=\{isDuplicate\}/);
  assert.match(workLinksSource, /tabIndex=\{isDuplicate \? -1 : undefined\}/);
  assert.match(appStyleSource, /\.link-track\s*\{[\s\S]*animation:\s*workLinksMarquee [^;]+ linear infinite/);
  assert.match(appStyleSource, /@keyframes workLinksMarquee\s*\{/);
  assert.match(appStyleSource, /\.link-marquee:hover \.link-track,[\s\S]*\.link-marquee:focus-within \.link-track\s*\{[\s\S]*animation-play-state:\s*paused/);
  assert.match(appStyleSource, /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.link-marquee\s*\{[\s\S]*overflow-x:\s*auto/);
});

test("work links marquee does not force extra footer height", () => {
  assert.doesNotMatch(appStyleSource, /\.footer-links\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*min-height:\s*286px/);
  assert.match(appStyleSource, /\.back-top-row\s*\{\s*margin-top:\s*14px/);
});

test("desktop-only closing layer protects hierarchy and avoids mobile changes", () => {
  const desktopLayerStart = appStyleSource.lastIndexOf(
    "/* Final desktop pass: keep the authored layout as the last cascade layer. */"
  );
  const lastDesktopLayer = appStyleSource.slice(desktopLayerStart);

  assert.match(lastDesktopLayer, /\.hero-top\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s+minmax\(280px,\s*0\.92fr\)/);
  assert.match(lastDesktopLayer, /\.headline\s*\{[\s\S]*font-size:\s*clamp\(2rem,\s*3vw,\s*3\.35rem\)/);
  assert.match(lastDesktopLayer, /\.proof-deck-headline h2\s*\{[\s\S]*font-size:\s*clamp\(1\.55rem,\s*2\.3vw,\s*2\.4rem\)/);
  assert.match(lastDesktopLayer, /\.roadmap-track\s*\{[\s\S]*height:\s*240px/);
  assert.match(lastDesktopLayer, /\.coverage-field\s*\{[\s\S]*min-height:\s*420px/);
  assert.match(lastDesktopLayer, /\.footer-callout h2\s*\{[\s\S]*font-size:\s*clamp\(0\.95rem,\s*1\.05vw,\s*1\.1rem\)/);
  assert.match(lastDesktopLayer, /\.footer-marquee-band \.link-pill span\s*\{[\s\S]*font-size:\s*clamp\(0\.76rem,\s*1vw,\s*0\.98rem\)/);
});

test("desktop contrast pass makes the visual direction unmistakable without touching mobile", () => {
  const contrastPassStart = appStyleSource.lastIndexOf("/* Desktop contrast pass:");
  const contrastPassEnd = appStyleSource.indexOf("/* Keep the index", contrastPassStart);
  const contrastPass = appStyleSource.slice(
    contrastPassStart,
    contrastPassEnd === -1 ? undefined : contrastPassEnd
  );

  assert.match(contrastPass, /@media \(min-width:\s*841px\)/);
  assert.match(contrastPass, /\.hero-stage::before\s*\{[\s\S]*clip-path:/);
  assert.match(contrastPass, /\.hero-name\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.match(contrastPass, /\.stat-card--primary\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.match(contrastPass, /\.proof-project-row\.is-active\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.match(contrastPass, /\.workflow-node\.is-active\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.match(contrastPass, /\.road-step\.is-current\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.doesNotMatch(contrastPass, /@media \(max-width:/);
});

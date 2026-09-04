import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const eventDataPath = path.resolve(root, "src/events/eventData.js");

test("event data helpers normalize the Pages JSON URL and hide review items", async () => {
  const { getEventsUrl, normalizeEventsPayload } = await import(`file://${eventDataPath}`);
  assert.equal(getEventsUrl("/helloLeila/"), "/helloLeila/wechat-events.json");

  const events = normalizeEventsPayload({
    events: [
      { id: "review", title: "待确认", status: "needs-review" },
      { id: "published", title: "已确认", status: "published", sourceArticleUrl: "https://example.org/event", startTime: "2026-08-29T14:00:00+08:00" },
    ],
  });
  assert.deepEqual(events.map((event) => event.id), ["published"]);
});

test("event filters combine query, city, mode, tag, and time status", async () => {
  const { filterEvents } = await import(`file://${eventDataPath}`);
  const events = [
    { id: "shenzhen", title: "深圳 AI 沙龙", city: "深圳", isOnline: false, tags: ["AI"], startTime: "2026-08-22T14:00:00+08:00", status: "published" },
    { id: "online", title: "线上数据公开课", city: "", isOnline: true, tags: ["Data"], startTime: "2026-08-29T14:00:00+08:00", status: "published" },
  ];
  const result = filterEvents(events, { query: "AI", city: "深圳", mode: "offline", tag: "AI", status: "all" }, new Date("2026-08-20T07:00:00+08:00"));
  assert.deepEqual(result.map((event) => event.id), ["shenzhen"]);
});

test("vite config exposes a root and events HTML entry", () => {
  const viteSource = fs.readFileSync(path.resolve(root, "vite.config.js"), "utf8");
  assert.match(viteSource, /rollupOptions/);
  assert.match(viteSource, /events\/index\.html/);
  assert.match(viteSource, /createSourceConfigMiddleware/);
  assert.match(viteSource, /command === "serve"/);
  assert.match(viteSource, /data[\\/]wechat-event-sources\.json/);
});

test("events page includes accessible filters and explicit source links", () => {
  const source = fs.readFileSync(path.resolve(root, "src/events/EventsApp.jsx"), "utf8");
  assert.match(source, /aria-label/);
  assert.match(source, /sourceArticleUrl/);
  assert.match(source, /registrationUrl/);
  assert.match(source, /needs-review/);
  assert.match(source, /来源配置/);
  assert.match(source, /aria-haspopup="dialog"/);
  const drawerSource = fs.readFileSync(path.resolve(root, "src/events/SourceConfigDrawer.jsx"), "utf8");
  assert.match(drawerSource, /保存到项目 JSON/);
  assert.match(drawerSource, /添加名称/);
  assert.doesNotMatch(drawerSource, /文章地址|RSS|公众号 ID/);
});

test("Pages workflow refreshes event data before tests and build", () => {
  const workflowSource = fs.readFileSync(path.resolve(root, ".github/workflows/pages.yml"), "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(root, "package.json"), "utf8"));
  const setupSource = fs.readFileSync(path.resolve(root, "SETUP.md"), "utf8");
  assert.match(packageJson.scripts["refresh:wechat-events"], /python3 scripts\/fetch_wechat_events\.py/);
  assert.match(workflowSource, /Setup Python/);
  assert.match(workflowSource, /npm run refresh:wechat-events/);
  assert.match(workflowSource, /OPENAI_API_KEY/);
  assert.match(workflowSource, /Test event pipeline/);
  assert.ok(workflowSource.indexOf("Test event pipeline") < workflowSource.indexOf("npm run build"));
  assert.match(setupSource, /wechat-event-sources\.json/);
  assert.match(setupSource, /OPENAI_API_KEY/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");
const banner = fs.readFileSync(new URL("../assets/orbit-banner.svg", import.meta.url), "utf8");

test("profile README presents four bilingual capability groups", () => {
  assert.match(readme, /Full-stack Engineering \/ 全栈工程/);
  assert.match(readme, /Frontend Systems \/ 前端系统/);
  assert.match(readme, /Data Visualization \/ 数据可视化/);
  assert.match(readme, /Academic Research \/ 学术研究/);
});

test("profile README keeps a bilingual personal website entry", () => {
  assert.match(readme, /Personal Website \/ 个人网站/);
  assert.match(readme, /Full-stack engineering, frontend systems, data visualization, and academic research\./);
  assert.match(readme, /聚焦全栈工程、前端系统、数据可视化与学术研究。/);
});

test("profile banner uses the updated greeting copy", () => {
  assert.match(banner, /Hi there! Happy coding &amp; enjoy your day 😊/);
});

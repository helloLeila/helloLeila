import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scriptJs = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");
const themeDataJs = fs.readFileSync(new URL("../theme-data.js", import.meta.url), "utf8");
const indexHtml = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("runtime scripts avoid a second themeData declaration in script.js", () => {
  assert.match(themeDataJs, /window\.themeData\s*=/);
  assert.doesNotMatch(scriptJs, /\bconst themeData\b/);
});

test("homepage copy avoids explainer phrasing like 这是一个", () => {
  assert.doesNotMatch(indexHtml, /这是一个/);
});

test("homepage key navigation and stage labels stay bilingual", () => {
  assert.match(indexHtml, /nav-en">Work</);
  assert.match(indexHtml, /nav-zh">作品</);
  assert.match(indexHtml, /nav-en">Skills</);
  assert.match(indexHtml, /nav-zh">技能</);
  assert.match(indexHtml, /nav-en">Research</);
  assert.match(indexHtml, /nav-zh">研究</);
  assert.match(indexHtml, /Open Docs\s*\/\s*查看文档/);
});

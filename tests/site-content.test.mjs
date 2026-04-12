// 内容结构测试，用于约束站点静态数据的关键结构和文案边界。
import test from "node:test";
import assert from "node:assert/strict";
import { siteContent } from "../src/data/siteContent.js";
import { signalCloudKeywords } from "../src/data/signalCloudConfig.js";

// 验证首页只保留四个技能分组，避免信息架构继续膨胀。
test("homepage exposes four skill groups", () => {
  assert.equal(siteContent.skillGroups.length, 4);
});

// 验证每个技能分组下的标签都带有真实链接。
test("each skill group has linked tags", () => {
  for (const group of siteContent.skillGroups) {
    assert.ok(group.titleEn);
    assert.ok(group.titleZh);
    assert.ok(group.tags.length >= 3);
    for (const tag of group.tags) {
      assert.ok(tag.labelEn || tag.labelZh);
      assert.ok(tag.href);
    }
  }
});

// 验证新闻回退数据固定为五条，并指向指定新闻源。
test("news block is fixed to five items from the requested sources", () => {
  assert.equal(siteContent.newsFallback.length, 5);
  const hrefs = siteContent.newsFallback.map((item) => item.url).join(",");
  assert.match(hrefs, /36kr\.com/);
  assert.match(hrefs, /juejin\.cn/);
  assert.match(hrefs, /theverge\.com/);
  assert.match(hrefs, /oschina\.net/);
});

// 验证底部工作入口不再暴露原型参考用的 G2 / L7 示例链接。
test("work links do not expose prototype reference links for G2 and L7", () => {
  const hrefs = siteContent.workLinks.map((item) => item.href);
  assert.ok(!hrefs.includes("https://g2.antv.antgroup.com/examples"));
  assert.ok(!hrefs.includes("https://l7.antv.antgroup.com/examples/gallery/animate/#grid"));
});

// 验证深圳模块标题保持个人站语气。
test("coverage section uses personal base wording", () => {
  assert.equal(siteContent.coverage.titleEn, "Current base: Shenzhen");
  assert.equal(siteContent.coverage.titleZh, "当前主要阵地：深圳");
});

// 验证词云只保留真实技术栈关键词，并避免人造概念词。
test("signal cloud vocabulary stays focused on real stack terms", () => {
  const words = siteContent.signalCloud.map((item) => item.word);

  assert.ok(siteContent.signalCloud.length >= 28);
  assert.ok(siteContent.signalCloud.length <= 64);
  assert.equal(new Set(words).size, words.length);
  assert.ok(words.includes("React"));
  assert.ok(words.includes("Java"));
  assert.ok(words.includes("JavaScript"));
  assert.ok(words.includes("TypeScript"));
  assert.ok(words.includes("L7"));
  assert.ok(words.includes("AntV"));
  assert.doesNotMatch(words.join(","), /Product Thinking|Knowledge Ops|Agent Experience|System Design|Data Storytelling/);
});

// 验证词云数据来自独立配置文件，并包含当前新增的真实技术词。
test("signal cloud data comes from the dedicated config and includes requested stack terms", () => {
  const words = signalCloudKeywords.map((item) => item.word);

  assert.deepEqual(siteContent.signalCloud, signalCloudKeywords);
  assert.ok(words.includes("MySQL"));
  assert.ok(words.includes("Dva"));
  assert.ok(words.includes("Less"));
  assert.ok(words.includes("Linux"));
  assert.ok(words.includes("Python"));
  assert.ok(words.includes("Mock"));
  assert.ok(words.includes("Claude Code"));
  assert.ok(words.includes("Lodash"));
  assert.ok(words.includes("Postman"));
  assert.ok(words.includes("Swagger"));
  assert.ok(words.includes("SSE"));
  assert.ok(words.includes("Hash"));
  assert.ok(words.includes("iframe"));
  assert.ok(words.includes("Maven"));
});

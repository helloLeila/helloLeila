import test from "node:test";
import assert from "node:assert/strict";
import themeModule from "../theme-data.js";

const { themeData } = themeModule;

test("theme data contains four stage themes", () => {
  assert.equal(themeData.length, 4);
});

test("each theme contains bilingual title and summaries", () => {
  for (const item of themeData) {
    assert.ok(item.titleEn);
    assert.ok(item.titleZh);
    assert.ok(item.summaryEn);
    assert.ok(item.summaryZh);
    assert.equal(item.tags.length, 3);
    assert.equal(item.cards.length, 3);
  }
});

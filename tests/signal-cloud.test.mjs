// 词云配置测试，用于约束技术栈词云必须使用真实的 AntV 词云标记。
import test from "node:test";
import assert from "node:assert/strict";
import { siteContent } from "../src/data/siteContent.js";
import { createSignalCloudOptions } from "../src/components/signalCloudOptions.js";

// 验证词云配置使用 G2 的 wordCloud 标记，并保留更克制的字号和留白。
test("signal cloud options use restrained G2 word cloud layout", () => {
  const options = createSignalCloudOptions(siteContent.signalCloud);
  const cloud = options.children[0];

  assert.equal(options.type, "view");
  assert.equal(cloud.type, "wordCloud");
  assert.equal(cloud.data, siteContent.signalCloud);
  assert.deepEqual(cloud.encode, {
    text: "word",
    value: "value",
  });
  assert.equal(cloud.layout.spiral, "rectangular");
  assert.equal(cloud.layout.rotate, 0);
  assert.equal(cloud.tooltip, false);
  assert.ok(Array.isArray(cloud.layout.fontSize));
  assert.ok(cloud.layout.fontSize[0] <= 8);
  assert.ok(cloud.layout.fontSize[1] <= 40);
  assert.ok(cloud.layout.padding >= 2);
});

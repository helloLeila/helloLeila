import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";

const root = process.cwd();

test("source config normalizes names and creates the public search query", async () => {
  const { normalizeSourceName, buildSourceSearchQuery } = await import("../src/events/sourceConfig.js");
  assert.equal(normalizeSourceName("  量子位   "), "量子位");
  assert.equal(buildSourceSearchQuery("量子位"), '"量子位" 微信公众号 活动');
  assert.throws(() => normalizeSourceName("   "), /name/i);
});

test("source config filters names and maps source status labels", async () => {
  const { filterSourceNames, sourceStatusLabel } = await import("../src/events/sourceConfig.js");
  const sources = [
    { id: "qbitai", name: "量子位", status: "ok" },
    { id: "openbuild", name: "OpenBuild", discoveryStatus: "unavailable" },
  ];
  assert.deepEqual(filterSourceNames(sources, "open"), [sources[1]]);
  assert.equal(sourceStatusLabel(sources[0]), "已接入");
  assert.equal(sourceStatusLabel(sources[1]), "暂不可用");
});

test("source config keeps every original id, preserves fields, and rejects duplicate names", async () => {
  const { mergeSourceNames } = await import("../scripts/source-config-store.mjs");
  const current = {
    version: 2,
    sources: [
      { id: "qbitai", name: "量子位", category: "ai", feedUrl: "https://example.org/feed", enabled: true, discoveryStatus: "confirmed", confirmedArticleUrls: ["https://example.org/a"] },
      { id: "openbuild", name: "OpenBuild", category: "open-source", feedUrl: "", enabled: false, customField: "keep" },
    ],
    manualArticleUrls: ["https://mp.weixin.qq.com/s/example"],
  };

  const merged = mergeSourceNames(current, {
    sources: [
      { id: "qbitai", name: " 新量子位 " },
      { id: "openbuild", name: "OpenBuild 社区" },
      { id: "custom-source", name: "新增来源", custom: true },
    ],
  });
  assert.deepEqual(merged.sources[0], { ...current.sources[0], name: "新量子位" });
  assert.deepEqual(merged.sources[1], { ...current.sources[1], name: "OpenBuild 社区" });
  assert.deepEqual(merged.sources[2], { id: "custom-source", name: "新增来源", custom: true, category: "other", feedUrl: "", enabled: false });
  assert.deepEqual(merged.manualArticleUrls, current.manualArticleUrls);
  assert.equal(merged.version, 2);

  assert.throws(
    () => mergeSourceNames(current, { sources: [{ id: "qbitai", name: "OpenBuild" }] }),
    /original source/i,
  );
  assert.throws(
    () => mergeSourceNames(current, { sources: [{ id: "qbitai", name: "重复" }, { id: "openbuild", name: "重复" }] }),
    /duplicate/i,
  );
});

test("source config writes JSON atomically and leaves original file on failure", async () => {
  const { writeSourceConfig } = await import("../scripts/source-config-store.mjs");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "source-config-"));
  const filePath = path.join(dir, "sources.json");
  const initial = { sources: [{ id: "one", name: "一个" }], manualArticleUrls: [] };
  await fs.writeFile(filePath, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
  const next = { sources: [{ id: "one", name: "更新" }], manualArticleUrls: [] };
  await writeSourceConfig(filePath, next);
  assert.deepEqual(JSON.parse(await fs.readFile(filePath, "utf8")), next);

  const original = await fs.readFile(filePath, "utf8");
  await assert.rejects(() => writeSourceConfig(path.join(dir, "missing", "sources.json"), next));
  assert.equal(await fs.readFile(filePath, "utf8"), original);
});

function makeResponse() {
  const chunks = [];
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(chunk = "") { chunks.push(Buffer.from(chunk)); this.body = Buffer.concat(chunks).toString("utf8"); this.finished = true; },
  };
}

function makeRequest({ method = "GET", url = "/__events/source-config", body = "", remoteAddress = "127.0.0.1" } = {}) {
  const request = new EventEmitter();
  request.method = method;
  request.url = url;
  request.socket = { remoteAddress };
  process.nextTick(() => {
    if (body) request.emit("data", Buffer.from(body));
    request.emit("end");
  });
  return request;
}

test("source config middleware serves local GET and rejects non-local writes", async () => {
  const { createSourceConfigMiddleware } = await import("../scripts/source-config-store.mjs");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "source-config-api-"));
  const filePath = path.join(dir, "sources.json");
  await fs.writeFile(filePath, JSON.stringify({ sources: [{ id: "one", name: "一个" }], manualArticleUrls: [] }), "utf8");
  const middleware = createSourceConfigMiddleware({ filePath });

  const getResponse = makeResponse();
  await middleware(makeRequest(), getResponse, () => {});
  assert.equal(getResponse.statusCode, 200);
  assert.equal(JSON.parse(getResponse.body).sources[0].name, "一个");

  const forbiddenResponse = makeResponse();
  await middleware(makeRequest({ method: "PUT", remoteAddress: "192.0.2.1", body: "{}" }), forbiddenResponse, () => {});
  assert.equal(forbiddenResponse.statusCode, 403);
});

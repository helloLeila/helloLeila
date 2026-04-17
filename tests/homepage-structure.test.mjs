import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("homepage has a hero stage shell", () => {
  assert.match(html, /class="hero-stage"/);
  assert.match(html, /id="themeControls"/);
  assert.match(html, /id="stagePanel"/);
});

test("homepage exposes four theme buttons", () => {
  const matches = [...html.matchAll(/data-theme="/g)];
  assert.equal(matches.length, 4);
});

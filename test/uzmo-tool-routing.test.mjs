import test from "node:test";
import assert from "node:assert/strict";
import { selectTools } from "../uzmo/tools/registry.js";

test("tool capability routing uses word boundaries", () => {
  assert.equal(selectTools("prepare a spreadsheet report").some(tool => tool.id === "google_sheets"), true);
  assert.equal(selectTools("this is a data task").some(tool => tool.id === "google_sheets"), true);
  assert.equal(selectTools("update the mailing list").some(tool => tool.id === "gmail"), false);
  assert.equal(selectTools("discuss a meeting").some(tool => tool.id === "google_calendar"), true);
});

test("tool routing preserves fallback when no capability matches", () => {
  assert.deepEqual(selectTools("write a poem", []).map(tool => tool.id), ["http"]);
});

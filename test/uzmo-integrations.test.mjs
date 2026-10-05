import test from "node:test";
import assert from "node:assert/strict";
import { CONNECTOR_MANIFEST } from "../uzmo/integrations/manifest.js";
import { listTools } from "../uzmo/tools/registry.js";

test("registered CRM connectors have matching manifests", () => {
  assert.ok(CONNECTOR_MANIFEST.zoho_crm);
  assert.ok(CONNECTOR_MANIFEST.zoho_crm.capabilities.includes("crm"));
});

test("tool registry exposes declared CRM and workspace tools", () => {
  const ids = new Set(listTools().map(tool => tool.id));
  for (const id of ["zoho_crm", "google_sheets", "google_drive", "microsoft_365"]) assert.ok(ids.has(id), id);
});

test("integration manifests never expose credential values", () => {
  const serialized = JSON.stringify(CONNECTOR_MANIFEST);
  assert.equal(/client_secret|refresh_token|access_token/i.test(serialized), false);
});

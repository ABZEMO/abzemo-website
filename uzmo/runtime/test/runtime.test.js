import test from "node:test";
import assert from "node:assert/strict";
import { selectAgents } from "../src/agent-registry.js";
import { CrmStore } from "../src/crm.js";
import { AgentEngine } from "../src/engine.js";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("routes finance ERP work to specialist agents", () => {
  const names = selectAgents({ domain: "Finance", text: "Check ERP invoices and reconciliation" }).map(a => a.name);
  assert.ok(names.includes("Finance Agent"));
});

test("agent execution creates a CRM activity record", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uzmo-"));
  const crm = new CrmStore(path.join(dir, "crm.json"));
  await crm.load();
  const engine = new AgentEngine({ crm, config: { agents: { approvalRequiredByDefault: false } } });
  const result = await engine.execute({ goal: "Update the finance dashboard from ERP data" });
  assert.equal(result.status, "completed");
  assert.equal(crm.state.records.length, 1);
  assert.equal(crm.state.activity.length, 1);
});

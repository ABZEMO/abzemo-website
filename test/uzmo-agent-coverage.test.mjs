import test from "node:test";
import assert from "node:assert/strict";
import { listAgents, selectAgents } from "../uzmo/agents/registry.js";

test("UZMO exposes core enterprise domain agents", () => {
  const ids = new Set(listAgents().map(agent => agent.id));
  for (const id of ["finance", "procurement", "compliance", "hr", "operations", "supply_chain", "legal", "healthcare", "pharma", "education", "customs", "quality", "risk"]) {
    assert.ok(ids.has(id), id + " agent is missing");
  }
});

test("domain goals route to the relevant specialist", () => {
  assert.equal(selectAgents("review procurement compliance and supplier controls")[0].id, "procurement");
  assert.equal(selectAgents("check HR recruitment and employee payroll")[0].id, "hr");
  assert.equal(selectAgents("classify customs HS code for an import")[0].id, "customs");
  assert.equal(selectAgents("university admission scholarship options")[0].id, "education");
  assert.equal(selectAgents("hospital patient treatment workflow")[0].id, "healthcare");
});


test("short agent keywords do not match inside unrelated words", () => {
  assert.notEqual(selectAgents("human resources planning")[0].id, "research");
  assert.equal(selectAgents("prepare HR policy")[0].id, "hr");
  assert.equal(selectAgents("review the purchase PO")[0].id, "procurement");
  assert.equal(selectAgents("perform QA inspection")[0].id, "quality");
});

import test from "node:test";
import assert from "node:assert/strict";
import { selectAgents } from "../src/agent-registry.js";
import { procurementAgent } from "../../agents/procurement-agent.js";

test("routes source-to-pay requests to the Procurement Agent", () => {
  const names = selectAgents({
    text: "Create an RFQ, compare supplier quotations, and prepare a purchase order"
  }).map(a => a.name);
  assert.ok(names.includes("Procurement Agent"));
});

test("routes procurement domain explicitly", () => {
  const names = selectAgents({
    domain: "Procurement",
    text: "Review a supplier quotation"
  }).map(a => a.name);
  assert.equal(names[0], "Procurement Agent");
});

test("procurement agent exposes controlled source-to-pay capabilities", () => {
  assert.equal(procurementAgent.id, "procurement-agent");
  assert.ok(procurementAgent.capabilities.includes("three-way-match exception detection"));
  assert.ok(procurementAgent.approvalRequired.includes("purchase-order release"));
  assert.ok(procurementAgent.verification.includes("immutable audit event recording"));
});

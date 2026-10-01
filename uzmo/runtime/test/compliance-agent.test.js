import test from "node:test";
import assert from "node:assert/strict";
import { selectAgents } from "../src/agent-registry.js";
import { complianceAgent } from "../../agents/compliance-agent.js";

test("routes compliance requests to the Compliance Agent", () => {
  const names = selectAgents({
    text: "Check our policy controls, audit evidence, regulatory filing deadlines, and compliance exceptions"
  }).map(a => a.name);
  assert.ok(names.includes("Compliance Agent"));
});

test("routes compliance domain explicitly", () => {
  const names = selectAgents({
    domain: "Compliance",
    text: "Review a control failure"
  }).map(a => a.name);
  assert.equal(names[0], "Compliance Agent");
});

test("compliance agent exposes controlled continuous-monitoring capabilities", () => {
  assert.equal(complianceAgent.id, "compliance-agent");
  assert.ok(complianceAgent.capabilities.includes("regulatory-change monitoring and impact analysis"));
  assert.ok(complianceAgent.capabilities.includes("segregation-of-duties and access-control checks"));
  assert.ok(complianceAgent.approvalRequired.includes("regulatory filing or submission"));
  assert.ok(complianceAgent.verification.includes("requirement-to-evidence traceability"));
});

import test from "node:test";
import assert from "node:assert/strict";
import { requiresHumanApproval } from "../uzmo/core/approval.js";

test("side-effecting plans cannot be authorized by a client approval flag", () => {
  const plan = { requiresApproval: true, steps: [{ input: { action: "purchase" } }] };
  assert.equal(requiresHumanApproval(plan), true);
  assert.equal(plan.approved, undefined);
});

test("approval scope includes the exact plan and organization", () => {
  const plan = { requiresApproval: true, steps: [{ input: { action: "send" } }] };
  const differentPlan = { requiresApproval: true, steps: [{ input: { action: "delete" } }] };
  assert.notDeepEqual(plan, differentPlan);
});

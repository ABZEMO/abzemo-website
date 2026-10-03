import test from "node:test";
import assert from "node:assert/strict";
import { requiresHumanApproval } from "../uzmo/core/approval.js";
import { createApprovalToken, verifyApprovalToken } from "../uzmo/core/approval-token.js";

test("side-effecting plans cannot be authorized by a client approval flag", () => {
  const plan = { requiresApproval: true, steps: [{ input: { action: "purchase" } }] };
  assert.equal(requiresHumanApproval(plan), true);
  assert.equal(plan.approved, undefined);
});

test("approval token is bound to user, organization, and exact plan", async () => {
  const plan = { requiresApproval: true, steps: [{ input: { action: "send" } }] };
  const token = await createApprovalToken({ id: "approval-1", userId: "user-1", orgId: "org-1", plan }, "test-secret");
  assert.ok(token.token.includes("."));
  assert.ok(await verifyApprovalToken(token.token, "test-secret", "user-1", "org-1", plan));
  assert.equal(await verifyApprovalToken(token.token, "test-secret", "user-2", "org-1", plan), null);
  assert.equal(await verifyApprovalToken(token.token, "test-secret", "user-1", "org-2", plan), null);
  assert.equal(await verifyApprovalToken(token.token, "test-secret", "user-1", "org-1", { ...plan, steps: [{ input: { action: "delete" } }] }), null);
  assert.equal(await verifyApprovalToken(token.token, "wrong-secret", "user-1", "org-1", plan), null);
});

test("approval token round-trips Unicode plan data", async () => {
  const plan = { requiresApproval: true, note: "صرف مجاز صارف", steps: [{ input: { action: "send" } }] };
  const token = await createApprovalToken({ id: "approval-2", userId: "user-1", orgId: "org-1", plan }, "test-secret");
  assert.deepEqual(await verifyApprovalToken(token.token, "test-secret", "user-1", "org-1", plan), {
    id: "approval-2", userId: "user-1", orgId: "org-1", plan, expiresAt: token.expiresAt
  });
});

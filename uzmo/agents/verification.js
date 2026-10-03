export function verifyExecution({ goal, results = [], response = "" } = {}) {
  const failures = results.filter(item => ["failed", "approval_required", "adapter_pending"].includes(item.result?.status));
  return {
    verified: failures.length === 0,
    goal,
    completed_steps: results.filter(item => item.result?.status === "completed").length,
    failed_steps: failures.length,
    response: String(response || "")
  };
}

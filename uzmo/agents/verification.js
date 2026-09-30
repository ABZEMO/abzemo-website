const SUCCESS_STATUSES = new Set(["completed"]);
const TERMINAL_FAILURE_STATUSES = new Set(["failed", "approval_required", "authorization_required", "adapter_pending"]);

export function verifyExecution({ goal, results = [], response = "" } = {}) {
  const normalized = Array.isArray(results) ? results : [];
  const failures = normalized.filter(item => TERMINAL_FAILURE_STATUSES.has(item?.result?.status));
  const unexpected = normalized.filter(item => item?.result?.status && !SUCCESS_STATUSES.has(item.result.status) && !TERMINAL_FAILURE_STATUSES.has(item.result.status));
  const completedSteps = normalized.filter(item => SUCCESS_STATUSES.has(item?.result?.status)).length;
  const hasToolExecution = normalized.length > 0;
  const verified = failures.length === 0 && unexpected.length === 0;

  return {
    verified,
    goal,
    has_tool_execution: hasToolExecution,
    completed_steps: completedSteps,
    failed_steps: failures.length,
    unexpected_steps: unexpected.length,
    response: String(response || "")
  };
}

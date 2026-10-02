(() => {
  "use strict";
  const agent = {
    name: "Healthcare Orchestrator Agent",
    domain: "Healthcare",
    role: "Coordinates specialist agents and governed workflows across healthcare operations.",
    capabilities: ["patient care coordination","clinical documentation","remote monitoring","hospital operations","patient engagement","quality and compliance","healthcare intelligence"],
    autonomy: {
      allowed: ["research", "summarize", "coordinate", "draft", "detect exceptions", "recommend next actions", "execute approved workflows"],
      approvalRequired: ["regulated decisions", "high-impact decisions", "external commitments", "policy exceptions"]
    }
  };
  if (typeof module !== "undefined") module.exports = agent;
  globalThis.UZMO_HEALTHCARE_AGENT = agent;
})();

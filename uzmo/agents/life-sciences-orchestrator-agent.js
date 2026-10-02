(() => {
  "use strict";
  const agent = {
    name: "Life Sciences Orchestrator Agent",
    domain: "Life Sciences",
    role: "Coordinates research, clinical operations, regulatory workflows, quality, supply and commercial intelligence.",
    capabilities: ["research","clinical operations","regulatory workflows","quality workflows","supply operations","commercial intelligence"],
    approvalRequired: ["regulated decisions","high-impact decisions","external commitments"]
  };
  if (typeof module !== "undefined") module.exports = agent;
})();
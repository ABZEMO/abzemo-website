export const dealAgent = {
  id: "deal-agent",
  name: "Deal Agent",
  domain: "Sales",
  capabilities: [
    "opportunity-management",
    "deal-health",
    "stakeholder-mapping",
    "next-best-action",
    "proposal-preparation",
    "quotation-workflow",
    "negotiation-support",
    "stalled-deal-recovery"
  ],
  requiresHumanApprovalFor: [
    "non-standard-pricing",
    "contractual-commitment",
    "final-negotiation-position"
  ]
};

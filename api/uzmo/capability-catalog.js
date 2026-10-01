const domains = [
  {
    id: "finance_accounting",
    assistant: "UZMO-FA",
    name: "Finance & Accounting",
    capabilities: [
      "General ledger and chart of accounts",
      "Accounts payable and accounts receivable",
      "Cash and bank management",
      "Budgeting, forecasting and variance analysis",
      "Financial reporting and management reporting",
      "Billing, collections and payment workflows",
      "Expense and reimbursement management",
      "Fixed assets and depreciation",
      "Tax workflow support and documentation",
      "Financial controls and approval workflows",
      "Month-end and year-end close support",
      "Treasury and working-capital analysis"
    ]
  },
  {
    id: "procurement",
    assistant: "UZMO-PA",
    name: "Procurement & Source-to-Pay",
    capabilities: [
      "Procurement strategy and category management",
      "Purchase requisitions and approvals",
      "RFI, RFQ and RFP workflows",
      "Supplier discovery, onboarding and qualification",
      "Vendor due diligence and risk checks",
      "Quotation comparison and bid analysis",
      "Negotiation support and sourcing events",
      "Contracts, purchase agreements and renewals",
      "Purchase orders and change orders",
      "Goods receipt and service receipt workflows",
      "Invoice processing and two/three-way matching",
      "Supplier performance and spend analytics",
      "Maverick-spend and anomaly detection",
      "Procurement audit evidence and controls"
    ]
  },
  {
    id: "sales_crm",
    assistant: "UZMO-SA",
    name: "Sales, CRM & Revenue",
    capabilities: [
      "Lead capture, qualification and routing",
      "Account and contact intelligence",
      "Opportunity and pipeline management",
      "Sales forecasting and pipeline analytics",
      "Quotation and proposal workflows",
      "Pricing and discount approvals",
      "CRM data quality and enrichment",
      "Customer follow-up and communication workflows",
      "Order handoff and revenue coordination",
      "Renewals, upsell and cross-sell workflows",
      "Sales performance analytics",
      "Revenue-risk and pipeline anomaly detection"
    ]
  },
  {
    id: "human_resources",
    assistant: "UZMO-HRA",
    name: "Human Resources & Workforce",
    capabilities: [
      "Workforce planning and requisitions",
      "Recruitment and candidate workflows",
      "Onboarding and offboarding",
      "Employee records and document workflows",
      "Leave, attendance and workforce requests",
      "Payroll workflow support and exception checks",
      "Performance and goal-management workflows",
      "Learning and development coordination",
      "Policy acknowledgement and HR compliance",
      "Employee communication and self-service",
      "Workforce analytics and reporting",
      "HR case routing and escalation"
    ]
  },
  {
    id: "legal",
    assistant: "UZMO-LA",
    name: "Legal & Contract Management",
    capabilities: [
      "Contract intake and classification",
      "Contract drafting support",
      "Clause and obligation analysis",
      "Contract review and redline support",
      "Approval and signature workflows",
      "Contract repository and metadata",
      "Renewal, expiry and obligation monitoring",
      "Legal request and matter management",
      "Policy and legal-document workflows",
      "Legal research support",
      "Legal risk and exception tracking",
      "Audit-ready legal evidence"
    ]
  },
  {
    id: "compliance_risk",
    assistant: "UZMO-CA",
    name: "Compliance, Risk & Controls",
    capabilities: [
      "Regulatory obligation registers",
      "Policy and procedure management",
      "Risk identification and assessment",
      "Control design and control testing",
      "Compliance monitoring",
      "Evidence collection and retention",
      "Exception, issue and remediation tracking",
      "Approval and attestation workflows",
      "Third-party compliance checks",
      "Regulatory reporting support",
      "Compliance calendars and expiry alerts",
      "Audit trails and governance reporting"
    ]
  },
  {
    id: "audit",
    assistant: "UZMO-AA",
    name: "Internal Audit & Assurance",
    capabilities: [
      "Risk-based audit planning",
      "Audit universe and engagement management",
      "Control walkthrough support",
      "Testing plans and evidence requests",
      "Sampling support and exception analysis",
      "Finding and observation management",
      "Root-cause and corrective-action tracking",
      "Management responses and follow-up",
      "Audit workpapers and evidence indexing",
      "Continuous-control monitoring",
      "Audit reporting and dashboards",
      "External-audit coordination support"
    ]
  },
  {
    id: "operations",
    assistant: "UZMO-OA",
    name: "Operations & Business Processes",
    capabilities: [
      "Process mapping and workflow orchestration",
      "Task assignment and queue management",
      "SOP and work-instruction support",
      "Operational approvals and escalations",
      "Exception and incident management",
      "KPI monitoring and operational reporting",
      "Capacity and resource coordination",
      "SLA monitoring and alerts",
      "Cross-functional handoffs",
      "Root-cause analysis support",
      "Continuous-improvement workflows",
      "Operational document automation"
    ]
  },
  {
    id: "supply_chain",
    assistant: "UZMO-SCA",
    name: "Supply Chain & Logistics",
    capabilities: [
      "Demand planning support",
      "Inventory planning and replenishment",
      "Stock-level and shortage monitoring",
      "Warehouse workflow coordination",
      "Inbound and outbound logistics",
      "Shipment and delivery tracking",
      "Transport coordination",
      "Supplier and logistics performance",
      "Inventory ageing and excess-stock analysis",
      "Supply disruption and risk monitoring",
      "Supply-chain KPI reporting",
      "Exception and escalation management"
    ]
  },
  {
    id: "customs_trade",
    assistant: "UZMO-CTA",
    name: "Customs, Trade & HS Codes",
    capabilities: [
      "HS code classification support",
      "Product and tariff-code intelligence",
      "Import and export documentation",
      "Customs declaration workflow support",
      "Duty and tax calculation support",
      "Trade compliance checks",
      "Restricted-party and trade-control screening support",
      "Country-of-origin documentation",
      "Incoterms and shipment-document workflows",
      "Customs valuation support",
      "Regulatory change monitoring",
      "Customs audit evidence and reporting"
    ]
  },
  {
    id: "project_management",
    assistant: "UZMO-PMA",
    name: "Project & Portfolio Management",
    capabilities: [
      "Project initiation and planning",
      "Scope, milestones and deliverables",
      "Task and dependency management",
      "Resource and capacity planning",
      "Budget and cost tracking",
      "Risk, issue and action management",
      "Change-control workflows",
      "Status reporting and executive dashboards",
      "Schedule and variance monitoring",
      "Document and decision management",
      "Stakeholder communication workflows",
      "Portfolio-level prioritization support"
    ]
  },
  {
    id: "manufacturing",
    assistant: "UZMO-MA",
    name: "Manufacturing & Industrial Operations",
    capabilities: [
      "Production planning and scheduling",
      "Work-order workflows",
      "Bill-of-material and routing support",
      "Material availability checks",
      "Quality and non-conformance workflows",
      "Maintenance planning and work orders",
      "Downtime and OEE analysis",
      "Production KPI monitoring",
      "Safety and operational checklist workflows",
      "Inventory and WIP coordination",
      "Supplier and production exception handling",
      "Continuous-improvement support"
    ]
  },
  {
    id: "customer_service",
    assistant: "UZMO-CSA",
    name: "Customer Service & Support",
    capabilities: [
      "Case and ticket intake",
      "Issue classification and routing",
      "Knowledge-base assistance",
      "Customer communication workflows",
      "SLA and escalation monitoring",
      "Service scheduling and coordination",
      "Complaint and feedback management",
      "Return and service-request workflows",
      "Customer-history intelligence",
      "Resolution analytics",
      "Service-quality reporting",
      "Cross-functional case handoff"
    ]
  },
  {
    id: "it_service_management",
    assistant: "UZMO-ITSA",
    name: "IT, Data & Service Management",
    capabilities: [
      "IT service request workflows",
      "Incident and problem management",
      "Change-management workflows",
      "Asset and access request coordination",
      "Knowledge and runbook assistance",
      "API and system-integration orchestration",
      "Data-quality checks",
      "Database workflow support",
      "Monitoring and alert triage",
      "Service-level reporting",
      "Access and permission governance",
      "Technical documentation workflows"
    ]
  }
];

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  const capabilityCount = domains.reduce((total, domain) => total + domain.capabilities.length, 0);

  res.statusCode = 200;
  return res.end(JSON.stringify({
    ok: true,
    platform: "UZMO",
    catalog_version: "0.1.0",
    model: "domain > assistant > capabilities > workflows > connectors > governed actions",
    domain_count: domains.length,
    capability_count: capabilityCount,
    extensible: true,
    domains
  }));
};

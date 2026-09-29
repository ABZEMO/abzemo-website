const OFFICIAL_SOURCES = [
  { id: "ifrs", name: "IFRS Foundation", url: "https://www.ifrs.org/issued-standards/", capabilities: ["ifrs", "ias", "accounting", "financial-reporting"] },
  { id: "iaasb", name: "IAASB", url: "https://www.iaasb.org/standards-pronouncements", capabilities: ["isa", "audit", "assurance", "quality-management"] },
  { id: "fbr", name: "Pakistan FBR / IRIS", url: "https://iris.fbr.gov.pk/", capabilities: ["tax", "income-tax", "sales-tax", "withholding", "iris", "verification"] },
  { id: "secp", name: "Pakistan SECP", url: "https://www.secp.gov.pk/", capabilities: ["corporate", "company-law", "reporting", "compliance"] },
  { id: "sbp", name: "State Bank of Pakistan", url: "https://www.sbp.org.pk/", capabilities: ["banking", "monetary", "foreign-exchange", "prudential"] }
];

const DOMAINS = {
  accounting: ["accounting", "bookkeeping", "journal", "ledger", "trial balance", "chart of accounts", "accounts payable", "accounts receivable", "closing", "reconciliation", "depreciation", "inventory"],
  financial_management: ["budget", "forecast", "cash flow", "working capital", "capital budgeting", "npv", "irr", "wacc", "financial planning", "treasury", "cost control", "management accounting"],
  reporting: ["financial statements", "balance sheet", "income statement", "profit and loss", "cash flow statement", "notes", "consolidation", "segment reporting", "disclosure"],
  audit: ["audit", "internal audit", "external audit", "isa", "controls", "risk", "fraud", "materiality", "going concern", "assurance", "working papers"],
  tax: ["tax", "iris", "income tax", "sales tax", "vat", "gst", "withholding", "return", "tax notice", "tax registration", "fbr"],
  standards: ["ifrs", "ias", "ifric", "isa", "isqm", "ipsas", "gaap", "accounting standard", "auditing standard"],
  corporate_finance: ["valuation", "financial model", "merger", "acquisition", "due diligence", "capital structure", "fundraising", "investment", "dividend"],
  banking: ["bank reconciliation", "loan", "interest", "credit", "banking", "foreign exchange", "fx", "treasury"],
  forensic: ["forensic accounting", "fraud investigation", "embezzlement", "transaction testing", "red flags", "financial crime"]
};

function detectDomains(query) {
  const q = String(query || "").toLowerCase();
  return Object.entries(DOMAINS).filter(([, words]) => words.some(word => q.includes(word))).map(([id]) => id);
}

export function listFinanceSources() { return OFFICIAL_SOURCES; }

export function executeFinanceInformation(input = {}, context = {}) {
  const action = input.action || "analyze";
  if (action === "sources") return { status: "completed", tool: "finance_information", data: { sources: OFFICIAL_SOURCES } };
  const query = String(input.query || "").trim();
  if (!query) return { status: "failed", tool: "finance_information", message: "query is required." };
  const domains = detectDomains(query);
  return {
    status: "completed",
    tool: "finance_information",
    data: {
      query,
      domains,
      scope: ["accounting", "financial management", "financial reporting", "audit", "tax", "IFRS/IAS", "ISA", "corporate finance", "banking", "forensic accounting"],
      official_sources: OFFICIAL_SOURCES,
      live_verification_required: true,
      note: "Use UZMO live web search to verify current standards, tax rules, filing requirements, rates, deadlines and jurisdiction-specific requirements before presenting them as current."
    }
  };
}

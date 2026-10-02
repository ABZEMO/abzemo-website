export const procurementAgent = {
  id: "procurement-agent",
  name: "Procurement Agent",
  domain: "Procurement",
  role: "Coordinates the source-to-pay lifecycle while preserving approvals, segregation of duties, auditability and supplier controls.",
  capabilities: [
    "purchase-requisition intake and validation",
    "category and spend classification",
    "supplier discovery and qualification",
    "RFx preparation and quotation collection",
    "bid and quotation comparison",
    "commercial and delivery-term analysis",
    "purchase-order preparation and tracking",
    "contract and supplier-record coordination",
    "goods-receipt and invoice matching",
    "three-way-match exception detection",
    "supplier performance monitoring",
    "spend analysis and savings opportunities",
    "customs and HS-code research support",
    "procurement policy and compliance checks"
  ],
  requiredInputs: [
    "request or demand",
    "items/services",
    "quantity and unit",
    "delivery location",
    "required date",
    "budget or cost center when available",
    "approved supplier data when available"
  ],
  outputs: [
    "validated requisition",
    "sourcing plan",
    "supplier shortlist",
    "RFx package",
    "comparison matrix",
    "purchase-order proposal",
    "exception and approval queue",
    "audit-ready procurement record"
  ],
  approvalRequired: [
    "supplier award",
    "purchase-order release",
    "contract commitment",
    "budget exception",
    "policy exception",
    "controlled import/customs action"
  ],
  verification: [
    "required-field validation",
    "supplier and duplicate checks",
    "quotation comparison traceability",
    "approval-chain verification",
    "PO/request consistency",
    "receipt-invoice-order reconciliation",
    "immutable audit event recording"
  ]
};

if (typeof module !== "undefined") module.exports = procurementAgent;

# UZMO Procurement Domain

The Procurement Agent is the specialist source-to-pay capability inside UZMO. It is designed to work with enterprise procurement data and connected ERP/procurement systems without assuming that a client has a specific platform.

## Scope

- Demand and purchase-requisition intake
- Category, spend and requirement classification
- Supplier discovery, qualification and onboarding support
- RFI/RFQ/RFP and tender preparation
- Quotation, bid and commercial comparison
- Sourcing recommendations with traceable evidence
- Purchase-order preparation, change tracking and release controls
- Contract and supplier-record coordination
- Goods receipt, invoice and purchase-order reconciliation
- Supplier performance and delivery monitoring
- Spend analytics and savings opportunity identification
- Customs, import/export and HS-code research support
- Procurement policy, delegated-authority and compliance checks

## Control model

UZMO may analyze, draft and prepare procurement actions automatically. Consequential actions remain approval-gated by default, including supplier award, PO release, contract commitments, budget exceptions and controlled customs/import actions.

## Integration model

The agent can be routed to connected ERP, procurement, finance, document, spreadsheet, email and approved web-research tools. Credentials, write permissions and client-specific policy rules are supplied by deployment configuration; UZMO must not claim an external action succeeded unless the connected system verifies it.

## Example requests

- "Create an RFQ for 500 units and compare the approved suppliers."
- "Find purchase orders with delivery dates at risk and prepare escalation."
- "Match this supplier invoice against the PO and goods receipt."
- "Review this procurement request for policy and approval requirements."
- "Research the applicable HS-code candidates and flag the items that require customs review."

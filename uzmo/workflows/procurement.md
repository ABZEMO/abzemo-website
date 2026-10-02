# Procurement Agent Workflow

## Source-to-pay flow

1. **Intake** — capture the request, requester, items/services, quantity, location, timing and budget context.
2. **Validate** — identify missing fields, duplicates, policy constraints and approval requirements.
3. **Classify** — determine category, spend type, sourcing route and applicable controls.
4. **Source** — prepare the appropriate RFI/RFQ/RFP/tender package and identify approved or candidate suppliers.
5. **Compare** — normalize quotations for price, currency, tax, freight, lead time, payment terms, warranty, quality and other configured criteria.
6. **Recommend** — produce a traceable comparison and proposed next action.
7. **Approve** — pause for the required human approval before supplier award, PO release or other consequential commitment.
8. **Execute** — create/update the permitted ERP/procurement record through a configured connector.
9. **Verify** — confirm the external system's response, record IDs and resulting state.
10. **Monitor** — track delivery, receipt, invoice matching, supplier performance and exceptions.

## Controls

- Segregation-of-duties rules are evaluated where client policy data is available.
- Supplier award and financial commitments are approval-gated by default.
- External writes require configured credentials and permissions.
- Every consequential action must have an audit record and verification result.

# UZMO Frappe CRM connector

Server-side adapter for a self-hosted or managed Frappe CRM instance.

Supported: health/authenticated-user check, document list/read, approval-gated create/update, CRM Lead and CRM Deal helpers.

Configuration:
- UZMO_FRAPPE_CRM_URL
- UZMO_FRAPPE_CRM_API_KEY
- UZMO_FRAPPE_CRM_API_SECRET

Credentials must remain server-side and must never be exposed to browser code, prompts, or logs.

This is an integration foundation. A production connection is only verified after real credentials are configured and deployed health/read/write tests succeed.

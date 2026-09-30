# UZMO Runtime

The UZMO Runtime is the deployable execution layer for the UZMO platform.

## What it does

- Observes configured local files/directories and authenticated HTTP/JSON sources.
- Detects source changes and emits UZMO events.
- Routes events to specialist agents by domain and intent.
- Stores source observations, agent runs and activity in the UZMO CRM/state ledger.
- Exposes runtime APIs for execution, health, agents, state and approvals.
- Supports configurable web research and model-planning endpoints.
- Keeps consequential observed workflows approval-gated by default.

## Client deployment model

1. Install Node.js 20+ on the approved client/server machine.
2. Copy this runtime directory to the client environment.
3. Copy `config.example.json` to `config.json`.
4. Configure approved sources, credentials through environment variables, CRM storage and optional web/model endpoints.
5. Start with `npm start`.
6. Open the UZMO interface through the runtime URL.
7. Verify `/api/health`, then test one source change before enabling production automation.

## Source model

- `file`: observes a local file or a directory of files.
- `http-json`: polls an authenticated HTTP/JSON endpoint and detects payload changes.
- Google Sheets and Google Docs can be connected through their authenticated APIs using the HTTP/JSON source model.
- ERP systems can be connected through their APIs or a dedicated connector.
- Direct database drivers are connector-specific and should be added per client database technology rather than pretending a filesystem path is a universal database connection.

## Agentic flow

Connect -> Observe -> Detect -> Route -> Research when required -> Plan -> Approval when required -> Execute permitted actions -> Verify -> Record -> Dashboard/CRM.

The runtime never treats an action as completed merely because an AI model proposed it.

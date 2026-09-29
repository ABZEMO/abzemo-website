# UZMO

UZMO is ABZEMO's separate general-purpose agentic AI assistant and orchestration layer.

## Product boundary

UZMO is intentionally independent from the existing ABZEMO AI Sales Agent.

- Existing sales agent: `/abzemo-ai.html` + `/abzemo-ai.js`
- UZMO: `/uzmo/` and the `uzmo/` architecture

No UZMO runtime imports or modifies `abzemo-ai.js`.

## Architecture

```
User
  |
  v
UZMO Web / Voice UI
  |
  v
AI Gateway / Model Router
  |
  v
UZMO Orchestrator
  |---- Intent + context
  |---- Planning / reasoning
  |---- Agent selection
  |---- Tool selection
  |---- Permission + approval
  |---- Execution
  |---- Verification
  |
  +---- Specialized Agents
  +---- Memory + RAG
  +---- Workflow Engine
  +---- Tool / Integration Layer
             |---- Google Workspace
             |---- Microsoft 365
             |---- SAP
             |---- Salesforce
             |---- APIs / databases
             |---- Webhooks / MCP / A2A
```

## Design principles

1. Model-agnostic: foundation models are replaceable engines, not the product.
2. Agentic: UZMO can plan and execute multi-step goals rather than only answer questions.
3. Human-controlled: permissions, secrets and approval checkpoints are first-class.
4. Observable: execution state, audit events and verification results are recorded.
5. Extensible: new agents and connectors should be pluggable without rewriting the orchestrator.
6. Cost-aware: route work to the least expensive capable model/tool path.
7. Separate product boundary: the sales agent remains untouched.

## Deployment direction

The repository is currently a static site. The UZMO frontend is therefore self-contained and deployable as static assets. The production orchestration API should be hosted separately (for example with Cloudflare Workers) so model credentials and integration secrets never reach the browser.

This directory is the product foundation, not a claim that all external integrations are already connected.

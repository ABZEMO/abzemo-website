import { createKnowledgeService } from "../memory/knowledge.js";

export async function handleKnowledge(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const body = await request.json().catch(() => ({}));
  const service = createKnowledgeService(env);
  if (body.action === "ingest") {
    if (!body.content || typeof body.content !== "string") return json({ error: "content is required" }, 400);
    return json(await service.ingest({ content: body.content, userId: body.userId, orgId: body.orgId, source: body.source, metadata: body.metadata, chunking: body.chunking }));
  }
  if (body.action === "search") return json({ items: await service.search(String(body.query || ""), { userId: body.userId, orgId: body.orgId, limit: body.limit }) });
  return json({ error: "Unknown knowledge action" }, 400);
}
function json(payload, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }

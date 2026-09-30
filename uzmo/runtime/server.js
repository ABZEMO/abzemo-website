import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventBus } from "./src/event-bus.js";
import { Observer } from "./src/observer.js";
import { CrmStore } from "./src/crm.js";
import { AgentEngine } from "./src/engine.js";
import { listAgents } from "./src/agent-registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const configPath = process.env.UZMO_CONFIG || path.join(__dirname, "config.json");

async function loadConfig() {
  try { return JSON.parse(await readFile(configPath, "utf8")); }
  catch { return JSON.parse(await readFile(path.join(__dirname, "config.example.json"), "utf8")); }
}

const config = await loadConfig();
const bus = new EventBus();
const crm = new CrmStore(path.resolve(__dirname, config.crm?.path || "./data/uzmo-crm.json"));
await crm.load();

const engine = new AgentEngine({ crm, config });
const observer = new Observer({ bus, sources: config.sources || [], pollMs: 5000 });

bus.on(async event => {
  if (event.type === "source.changed") await engine.execute({ event, goal: "Process the detected source change and update approved business records." });
  else if (event.type === "source.error") await crm.logActivity(event);
});

observer.start();

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "no-store" });
  res.end(body);
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function serveStatic(req, res) {
  const relative = req.url === "/" ? "index.html" : req.url.replace(/^\/+/, "");
  const file = path.resolve(root, relative);
  if (!file.startsWith(root)) return json(res, 403, { error: "Forbidden" });
  try {
    const content = await readFile(file);
    const ext = path.extname(file);
    const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(content);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/health") return json(res, 200, { ok: true, service: "UZMO Runtime", observation: true, agents: listAgents().length });
    if (req.url === "/api/agents") return json(res, 200, { agents: listAgents() });
    if (req.url === "/api/state") return json(res, 200, crm.getState());
    if (req.method === "POST" && req.url === "/api/execute") {
      const input = await body(req);
      return json(res, 200, await engine.execute({ goal: input.goal || "", requestedAgent: input.domain || null }));
    }
    if (req.method === "POST" && req.url === "/api/approve") {
      const input = await body(req);
      const record = crm.state.records.find(item => item.id === input.id);
      if (!record) return json(res, 404, { error: "Run not found" });
      record.status = "completed";
      record.result.steps[4].status = "complete";
      record.result.steps[5].status = "complete";
      await crm.persist();
      await crm.logActivity({ type: "approval", runId: record.id, status: "approved" });
      return json(res, 200, { ok: true, record });
    }
    return serveStatic(req, res);
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
});

server.listen(config.server?.port || 8787, config.server?.host || "127.0.0.1", () => {
  console.log("UZMO Runtime listening on http://" + (config.server?.host || "127.0.0.1") + ":" + (config.server?.port || 8787));
});

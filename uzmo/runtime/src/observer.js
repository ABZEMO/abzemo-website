import { stat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { stableHash } from "./hash.js";

async function snapshotFile(target) {
  const info = await stat(target);
  if (!info.isFile()) return null;
  const content = await readFile(target, "utf8");
  return { target, modifiedAt: info.mtimeMs, size: info.size, hash: stableHash(content), content };
}

export class Observer {
  constructor({ bus, sources = [], pollMs = 5000 }) {
    this.bus = bus;
    this.sources = sources;
    this.pollMs = pollMs;
    this.previous = new Map();
    this.timer = null;
  }

  async scanFileSource(source) {
    try {
      const info = await stat(source.path);
      const targets = info.isDirectory()
        ? (await readdir(source.path, { withFileTypes: true }))
            .filter(entry => entry.isFile())
            .map(entry => path.join(source.path, entry.name))
        : [source.path];

      for (const target of targets) {
        try {
          const snap = await snapshotFile(target);
          if (!snap) continue;
          const key = source.id + ":" + target;
          const previous = this.previous.get(key);
          this.previous.set(key, snap);
          if (!previous) continue;
          if (previous.hash !== snap.hash || previous.size !== snap.size || previous.modifiedAt !== snap.modifiedAt) {
            await this.bus.emit({
              id: crypto.randomUUID(),
              type: "source.changed",
              sourceId: source.id,
              sourceType: source.type,
              domain: source.domain,
              target,
              observedAt: new Date().toISOString(),
              payload: { previousHash: previous.hash, hash: snap.hash, content: snap.content }
            });
          }
        } catch (error) {
          await this.bus.emit({
            id: crypto.randomUUID(),
            type: "source.error",
            sourceId: source.id,
            domain: source.domain,
            target,
            error: error.message,
            observedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      await this.bus.emit({
        id: crypto.randomUUID(),
        type: "source.error",
        sourceId: source.id,
        domain: source.domain,
        target: source.path,
        error: error.message,
        observedAt: new Date().toISOString()
      });
    }
  }

  async pollHttpSource(source) {
    try {
      const headers = { accept: "application/json" };
      if (source.authEnv && process.env[source.authEnv]) headers.authorization = "Bearer " + process.env[source.authEnv];
      const response = await fetch(source.url, { headers });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      const hash = stableHash(payload);
      const previous = this.previous.get(source.id);
      this.previous.set(source.id, { hash, payload });
      if (previous && previous.hash !== hash) {
        await this.bus.emit({
          id: crypto.randomUUID(),
          type: "source.changed",
          sourceId: source.id,
          sourceType: source.type,
          domain: source.domain,
          target: source.url,
          observedAt: new Date().toISOString(),
          payload: { previousHash: previous.hash, hash, data: payload }
        });
      }
    } catch (error) {
      await this.bus.emit({
        id: crypto.randomUUID(),
        type: "source.error",
        sourceId: source.id,
        domain: source.domain,
        target: source.url,
        error: error.message,
        observedAt: new Date().toISOString()
      });
    }
  }

  async scan() {
    for (const source of this.sources) {
      if (source.mode === "disabled") continue;
      if (source.type === "file") await this.scanFileSource(source);
      if (source.type === "http-json") await this.pollHttpSource(source);
    }
  }

  start() {
    if (this.timer) return;
    void this.scan();
    this.timer = setInterval(() => void this.scan(), this.pollMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

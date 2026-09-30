import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class CrmStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = { records: [], activity: [] };
  }

  async load() {
    try {
      this.state = JSON.parse(await readFile(this.filePath, "utf8"));
    } catch {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      await this.persist();
    }
  }

  async persist() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.state, null, 2));
  }

  async upsert(record) {
    const key = record.externalKey || record.id;
    const index = this.state.records.findIndex(item => (item.externalKey || item.id) === key);
    if (index >= 0) this.state.records[index] = { ...this.state.records[index], ...record, updatedAt: new Date().toISOString() };
    else this.state.records.push({ ...record, createdAt: new Date().toISOString() });
    await this.persist();
    return this.state.records[index >= 0 ? index : this.state.records.length - 1];
  }

  async logActivity(activity) {
    this.state.activity.unshift({ ...activity, timestamp: new Date().toISOString() });
    this.state.activity = this.state.activity.slice(0, 500);
    await this.persist();
  }

  getState() {
    return this.state;
  }
}

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 150;

export function chunkText(text, { size = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP } = {}) {
  const value = String(text || "").replace(/\\s+/g, " ").trim();
  if (!value) return [];
  const safeSize = Math.max(200, Number(size) || DEFAULT_CHUNK_SIZE);
  const safeOverlap = Math.min(Math.max(0, Number(overlap) || DEFAULT_OVERLAP), safeSize - 1);
  const chunks = [];
  for (let start = 0; start < value.length; start += safeSize - safeOverlap) {
    chunks.push(value.slice(start, start + safeSize).trim());
    if (start + safeSize >= value.length) break;
  }
  return chunks.filter(Boolean);
}

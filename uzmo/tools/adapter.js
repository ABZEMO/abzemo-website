export function createToolAdapter({ id, capabilities = [], execute }) {
  if (!id || typeof execute !== "function") {
    throw new Error("Tool adapter requires id and execute function.");
  }
  return { id, capabilities, execute };
}

export function createAdapterRegistry(adapters = []) {
  const map = new Map(adapters.map(adapter => [adapter.id, adapter]));
  return {
    get: id => map.get(id),
    list: () => [...map.values()]
  };
}

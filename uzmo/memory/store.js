const MAX_ITEMS = 50;

export function createMemoryStore() {
  const items = [];

  return {
    add(entry) {
      const item = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...entry
      };
      items.push(item);
      while (items.length > MAX_ITEMS) items.shift();
      return item;
    },
    list() {
      return [...items];
    },
    clear() {
      items.length = 0;
    }
  };
}

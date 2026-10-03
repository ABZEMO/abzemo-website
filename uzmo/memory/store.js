const MAX_ITEMS = 50;

export function createMemoryStore() {
  const items = [];
  return {
    add(entry) {
      const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...entry };
      items.push(item);
      while (items.length > MAX_ITEMS) items.shift();
      return item;
    },
    list() {
      return [...items];
    },
    clear(predicate) {
      if (typeof predicate !== "function") {
        items.length = 0;
        return;
      }
      for (let index = items.length - 1; index >= 0; index -= 1) {
        if (predicate(items[index])) items.splice(index, 1);
      }
    }
  };
}

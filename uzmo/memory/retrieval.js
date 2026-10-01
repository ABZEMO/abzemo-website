export function createRetriever({ search = async () => [] } = {}) {
  return {
    async retrieve(query, options = {}) {
      const results = await search(query, options);
      return Array.isArray(results) ? results.slice(0, options.limit || 8) : [];
    }
  };
}

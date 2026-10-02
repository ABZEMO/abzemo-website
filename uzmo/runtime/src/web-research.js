export async function webResearch({ endpoint, apiKeyEnv, query }) {
  if (!endpoint || !query) return { enabled: false, results: [] };
  const url = new URL(endpoint);
  url.searchParams.set("q", query);
  const headers = { accept: "application/json" };
  if (apiKeyEnv && process.env[apiKeyEnv]) headers.authorization = "Bearer " + process.env[apiKeyEnv];
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Web research HTTP " + response.status);
  const data = await response.json();
  return { enabled: true, results: Array.isArray(data.results) ? data.results : data };
}

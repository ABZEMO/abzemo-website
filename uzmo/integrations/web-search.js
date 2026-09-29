const WEB_SEARCH_ENDPOINT = "https://api.openai.com/v1/responses";
const MAX_QUERY_LENGTH = 1000;
const MAX_DOMAINS = 100;

export async function executeLiveWebSearch(input = {}, context = {}, fetchImpl = fetch) {
  const query = String(input.query || "").trim();
  if (!query) return { status: "failed", tool: "web_search", message: "query is required." };
  if (query.length > MAX_QUERY_LENGTH) return { status: "failed", tool: "web_search", message: "query is too long." };

  const apiKey = context.webSearchApiKey || context.env?.UZMO_OPENAI_API_KEY;
  if (!apiKey) {
    return { status: "authorization_required", tool: "web_search", message: "Live web search is not configured. Set UZMO_OPENAI_API_KEY." };
  }

  const domains = Array.isArray(input.allowedDomains)
    ? input.allowedDomains.map(value => String(value).trim().toLowerCase()).filter(Boolean).slice(0, MAX_DOMAINS)
    : undefined;

  const webTool = {
    type: "web_search",
    external_web_access: true,
    ...(domains?.length ? { filters: { allowed_domains: domains } } : {})
  };

  const response = await fetchImpl(WEB_SEARCH_ENDPOINT, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: context.webSearchModel || context.env?.UZMO_WEB_SEARCH_MODEL || "gpt-5.5",
      tools: [webTool],
      tool_choice: { type: "web_search" },
      input: query
    })
  });

  if (!response.ok) {
    return { status: "failed", tool: "web_search", http_status: response.status, message: "Live web search provider returned an error." };
  }

  const data = await response.json();
  const output = Array.isArray(data?.output) ? data.output : [];
  const textParts = [];
  const sources = [];

  for (const item of output) {
    if (item?.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part?.type !== "output_text" || !part.text) continue;
      textParts.push(String(part.text));
      for (const annotation of part.annotations || []) {
        const url = annotation?.url;
        if (typeof url === "string" && /^https?:\/\//i.test(url)) sources.push({ title: annotation.title || null, url });
      }
    }
  }

  return {
    status: "completed",
    tool: "web_search",
    live: true,
    data: {
      query,
      answer: textParts.join("\n\n"),
      sources: [...new Map(sources.map(source => [source.url, source])).values()]
    }
  };
}

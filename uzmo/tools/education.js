import { buildEducationSearchLinks, listEducationSources } from "../education/sources.js";

export function executeEducationDiscovery(input = {}) {
  const action = String(input.action || "search").toLowerCase();

  if (action === "sources") {
    return {
      status: "completed",
      tool: "education_discovery",
      data: listEducationSources()
    };
  }

  if (action !== "search") {
    return {
      status: "failed",
      tool: "education_discovery",
      message: "Supported actions are search and sources."
    };
  }

  const query = String(input.query || "").trim();
  const sourceIds = Array.isArray(input.sources) ? input.sources.map(String) : undefined;

  return {
    status: "completed",
    tool: "education_discovery",
    data: {
      query,
      verified_source_links: buildEducationSearchLinks(query, sourceIds),
      note: "UZMO should verify current eligibility, deadlines and program availability on the linked official source before presenting an opportunity as current."
    }
  };
}

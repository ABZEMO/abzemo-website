import { buildHealthSearchLinks, HEALTH_SAFETY_NOTICE, TRADITIONAL_MEDICINE_SAFETY_NOTICE, listHealthSources } from "../health/sources.js";

export function executeHealthInformation(input = {}) {
  const action = String(input.action || "search").toLowerCase();
  const traditional = input.traditional === true || /ayurveda|herbal|herb|traditional medicine|complementary/i.test(String(input.query || ""));

  if (action === "sources") {
    return {
      status: "completed",
      tool: "health_information",
      data: listHealthSources(),
      safety_notice: traditional ? TRADITIONAL_MEDICINE_SAFETY_NOTICE : HEALTH_SAFETY_NOTICE
    };
  }

  if (action !== "search") {
    return {
      status: "failed",
      tool: "health_information",
      message: "Supported actions are search and sources."
    };
  }

  const query = String(input.query || "").trim();
  const sourceIds = Array.isArray(input.sources) ? input.sources.map(String) : undefined;

  return {
    status: "completed",
    tool: "health_information",
    data: {
      query,
      verified_source_links: buildHealthSearchLinks(query, sourceIds)
    },
    safety_notice: HEALTH_SAFETY_NOTICE
  };
}

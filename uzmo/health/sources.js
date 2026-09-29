const OFFICIAL_SOURCES = [
  { id: "who", name: "World Health Organization", region: "global", url: "https://www.who.int/", capabilities: ["diseases", "treatments", "medicines", "patient-safety", "guidelines"] },
  { id: "fda", name: "U.S. Food and Drug Administration", region: "united-states", url: "https://www.fda.gov/", capabilities: ["medicines", "drug-safety", "approvals", "recalls", "devices"] },
  { id: "medlineplus", name: "MedlinePlus", region: "united-states", url: "https://medlineplus.gov/", capabilities: ["diseases", "medicines", "treatments", "patient-information"] },
  { id: "nhs", name: "NHS", region: "united-kingdom", url: "https://www.nhs.uk/", capabilities: ["conditions", "treatments", "medicines", "symptoms"] },
  { id: "ema", name: "European Medicines Agency", region: "european-union", url: "https://www.ema.europa.eu/", capabilities: ["medicines", "approvals", "safety", "regulatory"] },
  { id: "nice", name: "NICE", region: "united-kingdom", url: "https://www.nice.org.uk/", capabilities: ["clinical-guidelines", "treatments", "medicines"] },
  { id: "who_traditional_medicine", name: "WHO Traditional Medicine", region: "global", url: "https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine", capabilities: ["traditional-medicine", "herbal-medicine", "ayurveda", "evidence", "safety"] },
  { id: "nccih", name: "National Center for Complementary and Integrative Health", region: "united-states", url: "https://www.nccih.nih.gov/", capabilities: ["herbal-medicine", "supplements", "interactions", "safety", "evidence"] }
];

export function listHealthSources() {
  return OFFICIAL_SOURCES.map(source => ({ ...source, capabilities: [...source.capabilities] }));
}

export function getHealthSource(id) {
  return OFFICIAL_SOURCES.find(source => source.id === id) || null;
}

export function buildHealthSearchLinks(query, sourceIds = OFFICIAL_SOURCES.map(source => source.id)) {
  const term = String(query || "").trim();
  if (!term) throw new Error("A health condition, treatment, symptom, or medicine is required.");
  if (term.length > 300) throw new Error("Health search query is too long.");

  const selected = sourceIds
    .map(id => getHealthSource(id))
    .filter(Boolean);

  return selected.map(source => ({
    source: source.name,
    region: source.region,
    url: source.url,
    searchUrl: source.id === "who"
      ? "https://www.who.int/search?query=" + encodeURIComponent(term)
      : source.id === "fda"
        ? "https://www.fda.gov/search?s=" + encodeURIComponent(term)
        : source.id === "medlineplus"
          ? "https://medlineplus.gov/search/?query=" + encodeURIComponent(term)
          : source.id === "nhs"
            ? "https://www.nhs.uk/search/results/?q=" + encodeURIComponent(term)
            : source.id === "ema"
              ? "https://www.ema.europa.eu/en/search?search_api_fulltext=" + encodeURIComponent(term)
              : source.id === "who_traditional_medicine"
            ? "https://www.who.int/search?query=" + encodeURIComponent(term)
            : "https://www.nccih.nih.gov/search?query=" + encodeURIComponent(term)
  }));
}

export const HEALTH_SAFETY_NOTICE =
  "UZMO provides health information and links to authoritative sources. It must not diagnose a person, prescribe or change prescription treatment, or replace a qualified clinician or pharmacist. Urgent or emergency symptoms require local emergency medical care.";

export const TRADITIONAL_MEDICINE_SAFETY_NOTICE =
  "UZMO can explain Ayurveda, herbal remedies and other traditional/complementary practices, including available evidence and safety information. It must not present an unproven remedy as a proven cure, replace prescribed treatment, or recommend stopping prescribed medicines. Herb-drug interactions, contamination and product-quality risks must be checked where relevant.";

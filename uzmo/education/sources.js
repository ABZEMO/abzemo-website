const EDUCATION_SOURCES = [
  { id: "study_portals", name: "Studyportals", region: "global", url: "https://www.studyportals.com/", capabilities: ["universities", "programs", "scholarships"] },
  { id: "erasmus", name: "Erasmus+", region: "europe", url: "https://erasmus-plus.ec.europa.eu/", capabilities: ["scholarships", "mobility", "masters", "doctoral"] },
  { id: "daad", name: "DAAD", region: "germany", url: "https://www.daad.de/en/", capabilities: ["universities", "scholarships", "germany"] },
  { id: "campus_france", name: "Campus France", region: "france", url: "https://www.campusfrance.org/en", capabilities: ["universities", "scholarships", "france"] },
  { id: "study_uk", name: "Study UK", region: "united-kingdom", url: "https://study-uk.britishcouncil.org/", capabilities: ["universities", "scholarships", "uk"] },
  { id: "educationusa", name: "EducationUSA", region: "united-states", url: "https://educationusa.state.gov/", capabilities: ["universities", "admissions", "financial-aid", "usa"] },
  { id: "hec_pakistan", name: "Higher Education Commission Pakistan", region: "pakistan", url: "https://www.hec.gov.pk/", capabilities: ["scholarships", "pakistani-students", "recognition"] }
];

export function listEducationSources() {
  return EDUCATION_SOURCES.map(source => ({ ...source, capabilities: [...source.capabilities] }));
}

export function getEducationSource(id) {
  return EDUCATION_SOURCES.find(source => source.id === id) || null;
}

export function buildEducationSearchLinks(query, sourceIds = EDUCATION_SOURCES.map(source => source.id)) {
  const term = String(query || "").trim();
  if (!term) throw new Error("A university, degree, field, country, admission, or scholarship query is required.");
  if (term.length > 500) throw new Error("Education search query is too long.");

  const selected = sourceIds.map(id => getEducationSource(id)).filter(Boolean);
  const encoded = encodeURIComponent(term);

  return selected.map(source => ({
    source: source.name,
    region: source.region,
    url: source.url,
    searchUrl: source.id === "study_portals"
      ? "https://www.studyportals.com/search/?q=" + encoded
      : source.id === "erasmus"
        ? "https://erasmus-plus.ec.europa.eu/search?query=" + encoded
        : source.id === "daad"
          ? "https://www.daad.de/en/study-and-research-in-germany/scholarships/?q=" + encoded
          : source.id === "campus_france"
            ? "https://www.campusfrance.org/en/search?search_api_fulltext=" + encoded
            : source.id === "study_uk"
              ? "https://study-uk.britishcouncil.org/search?search=" + encoded
              : source.id === "educationusa"
                ? "https://educationusa.state.gov/search?search_api_fulltext=" + encoded
                : "https://www.hec.gov.pk/english/scholarshipsgrants/lao/Pages/default.aspx"
  }));
}

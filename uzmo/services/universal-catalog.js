export const UNIVERSAL_SERVICES = [
  ["business","Business & Entrepreneurship",["strategy","business plans","market research","operations","growth","startup"]],
  ["finance","Finance & Accounting",["accounting","audit","tax","budget","forecast","valuation","banking","treasury","financial management"]],
  ["legal","Legal & Compliance",["contracts","corporate law","regulation","compliance","policy","due diligence"]],
  ["hr","Human Resources",["recruitment","payroll","performance","policies","training","workforce planning"]],
  ["sales","Sales & CRM",["lead generation","crm","pipeline","proposals","quotations","customer follow-up"]],
  ["marketing","Marketing & Advertising",["branding","seo","sem","campaigns","analytics","content strategy"]],
  ["procurement","Procurement & Supply Chain",["sourcing","vendors","rfq","purchase orders","inventory","logistics"]],
  ["projects","Project & Program Management",["planning","scheduling","risks","dependencies","cost","delivery","portfolio"]],
  ["education","Education & Admissions",["universities","admissions","scholarships","courses","applications","research"]],
  ["health","Health & Medicine Information",["medicine","treatment information","drug safety","herbal","ayurveda","patient safety"]],
  ["science","Science & Research",["literature review","experiments","analysis","citations","research synthesis"]],
  ["engineering","Engineering & Technical",["design","calculations","specifications","troubleshooting","technical documentation"]],
  ["software","Software & IT",["coding","debugging","architecture","apis","databases","cloud","devops"]],
  ["cybersecurity","Cybersecurity",["security","threat analysis","hardening","monitoring","incident response"]],
  ["data","Data & Analytics",["data cleaning","statistics","dashboards","forecasting","sql","visualization"]],
  ["documents","Documents & Knowledge",["documents","pdf","spreadsheets","presentations","summaries","knowledge bases"]],
  ["communication","Communication & Productivity",["email","calendar","meetings","notes","translation","writing"]],
  ["social","Social Media & Publishing",["youtube","instagram","linkedin","facebook","tiktok","reddit","telegram"]],
  ["creative","Creative & Media",["images","video","audio","design","scripts","voice","presentations"]],
  ["travel","Travel & Local Services",["flights","hotels","itineraries","restaurants","local businesses","directions"]],
  ["shopping","Shopping & Product Research",["products","comparison","availability","specifications","reviews"]],
  ["real_estate","Real Estate",["property research","rent","buy","valuation","due diligence","market analysis"]],
  ["government","Government & Civic Services",["forms","applications","public services","official information","deadlines"]],
  ["agriculture","Agriculture & Livestock",["farm operations","crop","poultry","animal production","monitoring"]],
  ["manufacturing","Manufacturing & Operations",["production","quality","maintenance","inventory","process improvement"]],
  ["energy","Energy & Utilities",["energy analysis","utilities","efficiency","solar","monitoring"]],
  ["language","Language & Translation",["translation","transcription","interpretation","language learning"]],
  ["personal","Personal Assistant",["reminders","planning","organization","daily routines","personal research"]],
  ["automation","Agentic Automation",["workflows","triggers","scheduled jobs","approvals","multi-step execution"]]
];

export function listUniversalServices() {
  return UNIVERSAL_SERVICES.map(([id, name, capabilities]) => ({ id, name, capabilities }));
}

export function searchUniversalServices(query = "") {
  const q = String(query).toLowerCase();
  return listUniversalServices()
    .map(service => ({ ...service, score: service.capabilities.reduce((n, term) => n + (q.includes(term) ? 1 : 0), 0) }))
    .filter(service => service.score > 0)
    .sort((a, b) => b.score - a.score);
}

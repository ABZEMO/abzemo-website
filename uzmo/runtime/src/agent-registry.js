const AGENTS = [
  { name: "Finance Agent", domain: "Finance", keywords: ["invoice","payment","ledger","reconciliation","receivable","payable","finance","accounting","erp"] },
  { name: "HRM Agent", domain: "Human Resources", keywords: ["employee","attendance","leave","recruitment","payroll","hr","performance"] },
  { name: "Operations Agent", domain: "Operations", keywords: ["operation","sop","quality","inventory","production","process","vendor","supply"] },
  { name: "Sales Orchestrator Agent", domain: "Sales", keywords: ["lead","prospect","deal","customer","pipeline","sales","opportunity"] },
  { name: "Project Management Agent", domain: "Project Management", keywords: ["project","milestone","schedule","risk","wbs","pmo","scrum","kanban"] },
  { name: "Healthcare Orchestrator Agent", domain: "Healthcare", keywords: ["patient","hospital","clinical","care","appointment","healthcare"] },
  { name: "Life Sciences Orchestrator Agent", domain: "Pharmaceutical", keywords: ["pharma","clinical trial","drug","regulatory","gxp","pharmacovigilance"] },
  { name: "Education Orchestrator Agent", domain: "Education", keywords: ["student","school","university","course","admission","education"] },
  { name: "Enterprise Orchestrator Agent", domain: "Enterprise Management", keywords: ["strategy","kpi","governance","risk","board","enterprise","executive"] },
  { name: "Procurement Agent", domain: "Procurement", keywords: ["procurement","purchase requisition","requisition","rfq","rfi","rfx","quotation","bid","tender","supplier","vendor","sourcing","purchase order","po","contract","catalog","category","spend","three-way match","goods receipt","delivery","invoice matching","hs code","customs","import","export"] },
  { name: "Data Agent", domain: "Data", keywords: ["sheet","spreadsheet","database","data","analysis","csv","dashboard"] },
  { name: "Document Agent", domain: "Content", keywords: ["document","doc","report","policy","contract"] },
  { name: "Web Agent", domain: "Web", keywords: ["web","internet","research","search","latest","regulation","market"] },
  { name: "Automation Agent", domain: "Automation", keywords: ["automate","automation","trigger","workflow","schedule","watch","monitor"] }
];

export function listAgents() {
  return [...AGENTS];
}

export function selectAgents({ domain, text = "" }) {
  const haystack = text.toLowerCase();
  const scored = AGENTS.map(agent => {
    let score = domain && agent.domain.toLowerCase() === domain.toLowerCase() ? 10 : 0;
    for (const keyword of agent.keywords) {
      if (haystack.includes(keyword.toLowerCase())) score += 1;
    }
    return { agent, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  return scored.length ? scored.map(item => item.agent) : [AGENTS.find(a => a.name === "Automation Agent")];
}

const LAW_DOMAINS = ["constitutional/public law","corporate/company law","commercial law","contract law","civil law","criminal law","criminal procedure","tax law","customs/trade law","employment/labour law","industrial law","manufacturing/product regulation","environmental law","health/pharma law","intellectual property","data protection/privacy","cybersecurity","competition/antitrust","consumer protection","banking/financial services","securities/capital markets","AML/CFT","sanctions/export controls","immigration","real estate/property","construction","transport/aviation/maritime","energy/utilities","telecommunications","media","education","procurement","insolvency/restructuring","insurance","agriculture/food","mining","corporate governance","dispute resolution/arbitration","administrative/regulatory law","human rights"]; 
const GROUPS = [
 {id:"pakistan",name:"Pakistan",countries:["PK"],sources:["https://pakistancode.gov.pk/","https://www.secp.gov.pk/","https://www.fbr.gov.pk/","https://www.sbp.org.pk/","https://www.pakistancode.gov.pk/","https://www.punjab.gov.pk/","https://sindh.gov.pk/"]},
 {id:"gcc",name:"GCC",countries:["AE","SA","QA","KW","BH","OM"],sources:["https://gcc-sg.org/"]},
 {id:"us",name:"United States",countries:["US"],sources:["https://www.congress.gov/","https://www.govinfo.gov/","https://www.ecfr.gov/","https://www.uscourts.gov/"]},
 {id:"uk",name:"United Kingdom",countries:["GB"],sources:["https://www.legislation.gov.uk/","https://www.gov.uk/"]},
 {id:"canada",name:"Canada",countries:["CA"],sources:["https://laws-lois.justice.gc.ca/","https://www.canada.ca/"]},
 {id:"australia",name:"Australia",countries:["AU"],sources:["https://www.legislation.gov.au/","https://www.australia.gov.au/"]},
 {id:"nz",name:"New Zealand",countries:["NZ"],sources:["https://www.legislation.govt.nz/","https://www.govt.nz/"]},
 {id:"eu",name:"European Union",countries:["DE","FR","IT","ES","NL","BE","AT","LU","IE","SE","DK","FI"],sources:["https://eur-lex.europa.eu/","https://commission.europa.eu/"]},
 {id:"switzerland",name:"Switzerland",countries:["CH"],sources:["https://www.fedlex.admin.ch/","https://www.admin.ch/"]},
 {id:"nordics",name:"Nordic jurisdictions",countries:["NO","IS","SE","DK","FI"],sources:["https://www.regjeringen.no/","https://www.government.se/","https://www.government.is/"]},
 {id:"japan",name:"Japan",countries:["JP"],sources:["https://elaws.e-gov.go.jp/","https://www.e-gov.go.jp/"]},
 {id:"korea",name:"South Korea",countries:["KR"],sources:["https://www.law.go.kr/","https://www.gov.kr/"]},
 {id:"singapore",name:"Singapore",countries:["SG"],sources:["https://sso.agc.gov.sg/","https://www.gov.sg/"]},
 {id:"hong-kong",name:"Hong Kong",countries:["HK"],sources:["https://www.elegislation.gov.hk/","https://www.gov.hk/"]},
 {id:"india",name:"India",countries:["IN"],sources:["https://www.indiacode.nic.in/","https://www.cbic.gov.in/"]},
 {id:"china",name:"China",countries:["CN"],sources:["https://flk.npc.gov.cn/","https://www.gov.cn/"]},
 {id:"malaysia",name:"Malaysia",countries:["MY"],sources:["https://lom.agc.gov.my/","https://www.malaysia.gov.my/"]},
 {id:"brazil",name:"Brazil",countries:["BR"],sources:["https://www.planalto.gov.br/","https://www.gov.br/"]},
 {id:"mexico",name:"Mexico",countries:["MX"],sources:["https://www.diputados.gob.mx/LeyesBiblio/","https://www.gob.mx/"]},
 {id:"south-africa",name:"South Africa",countries:["ZA"],sources:["https://www.gov.za/","https://www.sars.gov.za/"]}
];
export function listLawDomains(){return LAW_DOMAINS;}
export function listLawJurisdictions(){return GROUPS;}
export function findLawCoverage(query="",country=""){const q=(String(query)+" "+String(country)).toLowerCase(); return GROUPS.filter(g=>g.name.toLowerCase().includes(q)||g.countries.some(c=>q.includes(c.toLowerCase()))||LAW_DOMAINS.some(d=>q.includes(d.split("/")[0])));}
export function buildLegalResearchPlan({country="",topic="",facts=""}={}){return {country,topic,facts,domains:LAW_DOMAINS,official_sources:findLawCoverage("",country),required_checks:["current statute/regulation","jurisdiction and territorial scope","effective date","amendments/repeals","regulator guidance","licensing/registration","penalties/enforcement","case law or official decisions where relevant"],note:"UZMO provides research and compliance information, not legal representation. Current law must be verified against the applicable official source and effective date."};}

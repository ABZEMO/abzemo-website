"use strict";
/*
 * ZEE verified knowledge base.
 *
 * HOW TO UPDATE: edit or add an entry in ENTRIES below (or, if you enable
 * ZEE_SUPPORT_KB_DB=true, edit the same entry in the MongoDB collection
 * support_knowledge_base). Nothing else in ZEE needs to change.
 *
 * RULES: every fact here was taken from the live ABZEMO website files
 * (the "source" field names the page). Do not add prices, guarantees,
 * client names, partnerships, certifications, response-time promises or
 * policies unless ABZEMO has actually published them.
 */

const CONTACT = {
  generalEmail: "info@abzemo.com",
  salesEmail: "sales@abzemo.com",
  supportEmail: "support@abzemo.com",
  whatsapp: "+92 333 7108770",
  hotline: "+92 333 7108770",
  location: "Karachi, Pakistan"
};

const ENTRIES = [
  {
    id: "company-overview",
    title: "Company information",
    category: "company",
    keywords: ["abzemo", "company", "about", "who", "kaun", "kya hai", "mission", "vision", "director", "pakistan", "karachi", "location", "where", "office"],
    text: "ABZEMO is a forward-thinking business, innovation and technology company built to create what comes next. It brings together business insight, innovation, technology and entrepreneurial thinking to develop solutions, build ventures and create opportunities across evolving industries. ABZEMO starts from Pakistan (Karachi) with a global outlook across technology, business, healthcare, education, trade and future ventures.",
    source: "about.html, contact.html"
  },
  {
    id: "services-solutions",
    title: "ABZEMO services and solutions",
    category: "services",
    keywords: ["service", "services", "solution", "solutions", "automation", "agent", "agents", "integration", "digital", "transformation", "data", "intelligence", "offer", "kya karte", "what do you do", "product", "products"],
    text: "ABZEMO solutions: AI Agents, Business Automation, Digital Solutions (web and business systems), Data & Intelligence, System Integration, and Digital Transformation. Approach: understand the business problem first, then design, build and evolve the solution. Pricing is not published on the website; for quotes or requirements, contact sales@abzemo.com or info@abzemo.com.",
    source: "solutions.html"
  },
  {
    id: "abzemo-ai",
    title: "ABZEMO AI",
    category: "abzemo-ai",
    keywords: ["abzemo ai", "ai", "agent", "agents", "agentic", "multilingual", "sales agent", "chatbot", "artificial", "intelligence"],
    text: "ABZEMO AI is the first major operating technology division of ABZEMO, focused on AI automation, business solutions, AI agents and agentic AI. Its vision is intelligent multilingual agents that understand conversations, collect information, automate workflows and connect people with business systems. The website describes possible agent roles such as Sales, Finance, ERP, Real Estate, Healthcare, Education and Enterprise agents. ZEE (this assistant) is separate from ABZEMO AI.",
    source: "abzemo-ai.html, solutions.html, ventures.html"
  },
  {
    id: "industries",
    title: "Industries",
    category: "services",
    keywords: ["industry", "industries", "healthcare", "education", "real estate", "pharma", "pharmaceutical", "logistics", "enterprise", "hospital", "school"],
    text: "ABZEMO designs technology around the workflows of Healthcare, Education, Real Estate, Pharmaceuticals, Logistics and Enterprise organizations, and says its industry vision will continue to expand.",
    source: "industries.html"
  },
  {
    id: "ventures",
    title: "ABZEMO Ventures",
    category: "company",
    keywords: ["venture", "ventures", "medical", "trade", "smart schooling", "fashions", "finance", "ecosystem", "future"],
    text: "ABZEMO Ventures explores opportunities across Technology, Healthcare, Trade, Education, Real Estate, Logistics, Finance and future industries. ABZEMO AI is the first operating division. The other directions (ABZEMO Medical, Trade, Smart Schooling, Fashions, Real Estate, Logistics, Finance) are described as long-term directions and potential venture areas whose operational status may evolve; do not describe them as live products.",
    source: "ventures.html, vision.html"
  },
  {
    id: "business-enquiries",
    title: "Business enquiries",
    category: "enquiries",
    keywords: ["business", "enquiry", "inquiry", "quote", "partnership", "partner", "requirement", "project", "sales", "proposal", "price", "pricing", "cost"],
    text: "For business enquiries, partnerships or project requirements use the Contact page (enquiry types: AI & Agentic Automation, Business Solutions, Digital Transformation, Partnerships & Opportunities, Other), the Online Message page, or email sales@abzemo.com / info@abzemo.com. Pricing is not published on the website.",
    source: "contact.html, online-message.html"
  },
  {
    id: "contact-information",
    title: "Contact information",
    category: "contact",
    keywords: ["contact", "email", "phone", "whatsapp", "call", "hotline", "number", "address", "reach", "rabta", "support"],
    text: "ABZEMO contact: general info@abzemo.com, business and sales sales@abzemo.com, support support@abzemo.com. WhatsApp and hotline: +92 333 7108770. Location: Karachi, Pakistan. Visitors can also use the Contact page form or the Online Message page.",
    source: "contact.html, contact-us.html"
  },
  {
    id: "careers",
    title: "Career enquiries",
    category: "careers",
    keywords: ["career", "careers", "job", "jobs", "hiring", "vacancy", "apply", "cv", "resume", "internship", "naukri"],
    text: "Careers are handled on the Careers page. Areas shown: Business Development, AI & Automation, and Project Delivery; the application form also offers Project Management, Internship and General Application. Applicants sign in with Google, then submit the form and attach a CV (PDF, DOC or DOCX, up to 3 MB); LinkedIn profile and short introduction are optional. Do not promise interviews or openings.",
    source: "careers.html, api/careers.js"
  },
  {
    id: "website-guide",
    title: "Website guidance",
    category: "website",
    keywords: ["website", "page", "pages", "menu", "navigate", "where", "find", "link", "privacy", "terms"],
    text: "Website pages: Home, About, Mission, Vision, Director's Note, Solutions, Industries, Ventures, ABZEMO AI (/abzemo-ai), Careers (/careers), Contact (/contact), Online Message, Privacy Policy and Terms.",
    source: "repository page list"
  },
  {
    id: "support-procedures",
    title: "Support procedures",
    category: "support",
    keywords: ["support", "complaint", "ticket", "issue", "problem", "help", "escalate", "feedback", "status", "track", "shikayat"],
    text: "Through ZEE a visitor can register a complaint (ZEE collects name, email, details and creates a ticket reference like ABZ-251106-K7M2PX), check a ticket's status using the reference plus the registered email, ask for a human (the support team is notified at info@abzemo.com), and leave a 1-5 rating with feedback. Ticket statuses: Open, In Progress, Awaiting Customer, Escalated, Resolved, Closed. Response times are not published; never promise one.",
    source: "ZEE support system"
  },
  {
    id: "faq-unpublished",
    title: "Information ABZEMO has not published",
    category: "faq",
    keywords: ["price", "pricing", "cost", "fee", "guarantee", "warranty", "refund", "client", "clients", "customer", "customers", "partner", "certification", "certified", "award", "salary"],
    text: "The ABZEMO website does not publish prices, guarantees, refund policies, client lists, partnerships, certifications or response-time commitments. Do not state any. Refer the visitor to sales@abzemo.com or info@abzemo.com.",
    source: "absence verified across all website pages"
  }
];

function tokens(text) {
  return String(text || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function score(entry, lower, tokenSet) {
  let s = 0;
  for (const kw of entry.keywords || []) {
    const k = String(kw).toLowerCase();
    if (k.includes(" ")) { if (lower.includes(k)) s += 2; }
    else if (tokenSet.has(k)) s += 1;
  }
  return s;
}

function selectKnowledge(text, entries, max) {
  const list = Array.isArray(entries) ? entries : ENTRIES;
  const lower = String(text || "").toLowerCase();
  const tokenSet = new Set(tokens(lower));
  return list
    .map(e => ({ e, s: score(e, lower, tokenSet) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max || 3)
    .map(x => x.e);
}

function formatKnowledge(selected) {
  if (!selected.length) return "";
  const lines = selected.map(e => "- " + e.title + ": " + e.text);
  let out = "VERIFIED KNOWLEDGE BASE (official ABZEMO facts; use only when relevant to the visitor's question and never add facts beyond these):\n" + lines.join("\n");
  if (out.length > 1800) out = out.slice(0, 1800);
  return out;
}

function knowledgeContext(text, entries) {
  return formatKnowledge(selectKnowledge(text, entries, 3));
}

module.exports = { CONTACT, ENTRIES, selectKnowledge, knowledgeContext, formatKnowledge };

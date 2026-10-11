(() => {
  "use strict";

  const agents = [
    ["finance", "Finance Agent", "Accounting, budgeting, invoicing, reconciliation and audit questions.", "Finance"],
    ["pharma", "Pharmaceutical Agent", "Pharma operations, regulatory affairs, pharmacovigilance and supply.", "Pharma"],
    ["healthcare", "Healthcare Agent", "Hospital and clinic operations and patient workflows.", "Healthcare"],
    ["education", "Education Agent", "Admissions, scholarships and academic administration.", "Education"],
    ["legal", "Legal & Policy Agent", "Contracts, clauses, regulation and policy.", "Legal"],
    ["customs", "Customs & Trade Agent", "Customs, HS codes, tariffs, import and export.", "Trade"],
    ["supply_chain", "Supply Chain Agent", "Logistics, inventory, warehousing and forecasting.", "Operations"],
    ["hr", "HR Agent", "Recruitment, payroll, leave and performance.", "People"],
    ["procurement", "Procurement Agent", "Vendors, quotations, sourcing and purchase orders.", "Operations"],
    ["compliance", "Compliance Agent", "Controls, regulatory compliance and remediation.", "Compliance"],
    ["quality", "Quality Agent", "QA/QC, inspection and corrective action.", "Quality"],
    ["risk", "Risk Agent", "Risk assessment, mitigation and business continuity.", "Risk"],
    ["real_estate", "Real Estate Agent", "Property sales and rentals, buyers, tenants and site visits.", "Real Estate"]
  ];

  const names = {};
  agents.forEach(a => { names[a[0]] = a[1]; });

  let currentAgent = null;
  let history = [];

  const grid = document.querySelector("#agents-grid");
  const form = document.querySelector("#command-form");
  const input = document.querySelector("#command-input");
  const stream = document.querySelector("#execution-stream");
  const state = document.querySelector("#run-state");

  grid.innerHTML = agents.map(([id, name, desc, tag]) =>
    '<article class="agent-card" data-agent="' + id + '" role="button" tabindex="0" style="cursor:pointer">' +
    '<span class="agent-tag">' + tag.toUpperCase() + '</span><h3>' + name + '</h3><p>' + desc + '</p></article>'
  ).join("");

  function showView(name) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelector("#" + name + "-view").classList.add("active");
    window.scrollTo(0, 0);
  }

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  }

  function addLine(who, text, status) {
    stream.classList.remove("empty");
    const row = document.createElement("div");
    row.className = "step";
    row.innerHTML = '<span class="num">' + (who === "You" ? "U" : "A") + '</span><div><b>' + escapeHtml(who) +
      '</b><small style="white-space:pre-wrap">' + escapeHtml(text) + '</small></div><span class="step-status">' + escapeHtml(status || "") + '</span>';
    stream.appendChild(row);
    return row;
  }

  function selectAgent(id) {
    currentAgent = id;
    history = [];
    stream.className = "stream";
    stream.innerHTML = "";
    addLine("UZMO", "You are now chatting with the " + names[id] + ". Ask your question below.", "Ready");
    state.textContent = names[id];
    showView("chat");
    input.focus();
  }

  grid.addEventListener("click", e => {
    const card = e.target.closest(".agent-card");
    if (card) selectAgent(card.dataset.agent);
  });
  grid.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".agent-card");
    if (card) { e.preventDefault(); selectAgent(card.dataset.agent); }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    if (!currentAgent) {
      state.textContent = "Choose an agent";
      showView("agents");
      return;
    }

    input.value = "";
    addLine("You", text);
    history.push({ role: "user", content: text });
    const thinking = addLine(names[currentAgent], "Thinking...", "Working");
    state.textContent = "Working";

    try {
      const res = await fetch("/api/uzmo-public", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agent: currentAgent, messages: history.slice(-10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      thinking.remove();
      addLine(names[currentAgent], data.reply || "No reply received.", "Done");
      history.push({ role: "assistant", content: data.reply || "" });
      state.textContent = names[currentAgent];
    } catch (error) {
      thinking.remove();
      history.pop();
      addLine("UZMO", error.message || "Something went wrong.", "Failed");
      state.textContent = "Error";
    }
  });

  document.querySelector("#clear-context").addEventListener("click", () => {
    currentAgent = null;
    history = [];
    stream.className = "stream empty";
    stream.innerHTML = '<div class="empty-icon">✦</div><p>Choose an agent in the Agents tab to start.</p>';
    state.textContent = "Idle";
  });

  document.querySelector("#voice-btn").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      state.textContent = "Voice unavailable";
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = e => { input.value = e.results[0][0].transcript; };
    recognition.start();
  });

  stream.className = "stream empty";
  stream.innerHTML = '<div class="empty-icon">✦</div><p>Choose an agent in the Agents tab to start.</p>';
})();

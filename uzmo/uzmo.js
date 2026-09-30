(() => {
  "use strict";

  const agents = [
    ["Executive Agent","Turns business goals into concise plans, decisions, briefings and follow-ups.","Strategy"],
    ["Project Agent","Plans projects, tracks actions, dependencies, risks and delivery workflows.","Operations"],
    ["Project Management Agent","Runs methodology-aware project delivery across predictive, adaptive and hybrid approaches.","Project Management"],
    ["HRM Agent","Coordinates workforce planning, talent, employee lifecycle, performance, learning and HR analytics.","Human Resources"],
    ["Operations Agent","Optimizes operational planning, processes, quality, supply operations and continuous improvement.","Operations"],
    ["Enterprise Orchestrator Agent","Coordinates strategy, governance, performance, risk, portfolios and cross-functional enterprise management.","Enterprise Management"],
    ["Healthcare Orchestrator Agent","Coordinates governed healthcare workflows, patient care operations and specialist healthcare agents.","Healthcare"],
    ["Life Sciences Orchestrator Agent","Coordinates pharmaceutical and life-sciences R&D, clinical, regulatory, quality, supply and commercial workflows.","Pharmaceutical"],
    ["Education Orchestrator Agent","Coordinates admissions, learning, student success, faculty and academic operations.","Education"],
    ["Sales Orchestrator Agent","Coordinates the full revenue lifecycle and specialist sales agents.","Sales"],
    ["Prospecting Agent","Finds, researches, enriches and prioritizes target accounts and contacts.","Sales"],
    ["Lead Qualification Agent","Qualifies leads, analyzes intent and routes opportunities.","Sales"],
    ["Sales Outreach Agent","Runs personalized, multi-channel outreach, follow-ups and meeting booking.","Sales"],
    ["Deal Agent","Manages opportunities, deal health, proposals and negotiation support.","Sales"],
    ["Sales Intelligence Agent","Analyzes pipeline, forecasts, risks, scenarios and sales performance.","Sales"],
    ["Research Agent","Searches approved sources, synthesizes evidence and produces research outputs.","Knowledge"],
    ["Data Agent","Works with structured data, sheets, databases, calculations and analysis.","Data"],
    ["Document Agent","Creates, transforms, reviews and organizes documents and reports.","Content"],
    ["Email Agent","Drafts, classifies, routes and executes email workflows with approval controls.","Communication"],
    ["Calendar Agent","Plans meetings, checks availability and coordinates calendar actions.","Productivity"],
    ["Finance Agent","Supports finance workflows, reporting, reconciliation and controlled approvals.","Finance"],
    ["Procurement Agent","Coordinates requests, comparisons, approvals, purchase workflows and records.","Operations"],
    ["Content Agent","Creates multi-channel content and prepares publishing workflows.","Growth"],
    ["Web Agent","Handles web research, extraction, navigation and approved web actions.","Web"],
    ["Automation Agent","Designs and manages reusable workflows, triggers, schedules and integrations.","Automation"]
  ];

  const grid = document.querySelector("#agents-grid");
  grid.innerHTML = agents.map(([name, desc, tag]) =>
    '<article class="agent-card"><span class="agent-tag">' + tag.toUpperCase() + '</span><h3>' + name + '</h3><p>' + desc + '</p></article>'
  ).join("");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector("#" + btn.dataset.view + "-view").classList.add("active");
    });
  });

  const form = document.querySelector("#command-form");
  const input = document.querySelector("#command-input");
  const stream = document.querySelector("#execution-stream");
  const state = document.querySelector("#run-state");

  const fallbackPlan = [
    ["Understand goal","Parsing intent, constraints and requested outcome."],
    ["Build plan","Breaking the goal into executable steps."],
    ["Select agents","Routing work to the appropriate specialist agents."],
    ["Select tools","Preparing integrations, knowledge and actions."],
    ["Execute","Running actions with controlled permissions."],
    ["Verify","Checking outputs, failures and completion criteria."]
  ];

  function renderSteps(steps) {
    stream.classList.remove("empty");
    stream.innerHTML = steps.map((item, i) =>
      '<div class="step" data-step="' + i + '"><span class="num">' + (i + 1) + '</span><div><b>' +
      escapeHtml(item.name || "Step") + '</b><small>' + escapeHtml(item.status || "") +
      (item.agents ? " — " + escapeHtml(item.agents.join(", ")) : "") +
      '</small></div><span class="step-status">' + escapeHtml(item.status || "queued") + '</span></div>'
    ).join("");
  }

  async function executeWithRuntime(goal) {
    const response = await fetch("./api/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal })
    });
    if (!response.ok) throw new Error("Runtime returned HTTP " + response.status);
    return response.json();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const goal = input.value.trim();
    if (!goal) return;

    state.textContent = "Connecting";
    renderSteps(fallbackPlan.map(([name]) => ({ name, status: "queued" })));

    try {
      const result = await executeWithRuntime(goal);
      renderSteps(result.steps || fallbackPlan.map(([name]) => ({ name, status: "complete" })));

      const summary = document.createElement("div");
      summary.className = "step";
      const status = result.status || "completed";
      summary.innerHTML =
        '<span class="num">✓</span><div><b>UZMO run ' + escapeHtml(status) +
        '</b><small>Agents: ' + escapeHtml((result.agents || []).join(", ") || "Automation Agent") +
        '</small></div><span class="step-status">' + escapeHtml(status) + '</span>';
      stream.appendChild(summary);
      state.textContent = status === "awaiting-approval" ? "Approval required" : "Complete";
    } catch (error) {
      for (const step of [...stream.querySelectorAll(".step")]) {
        step.classList.add("done");
        step.querySelector(".step-status").textContent = "Preview";
      }
      const summary = document.createElement("div");
      summary.className = "step";
      summary.innerHTML =
        '<span class="num">i</span><div><b>Runtime not connected</b><small>Start UZMO Runtime on the client/server to enable live execution and observation.</small></div><span class="step-status">Offline</span>';
      stream.appendChild(summary);
      state.textContent = "Runtime offline";
    }
  });

  document.querySelector("#clear-context").addEventListener("click", () => {
    stream.className = "stream empty";
    stream.innerHTML = '<div class="empty-icon">✦</div><p>Your plans and actions will appear here.</p>';
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

  async function refreshRuntimeStatus() {
    try {
      const response = await fetch("./api/health", { cache: "no-store" });
      if (!response.ok) throw new Error("offline");
      const health = await response.json();
      state.textContent = health.ok ? "Runtime connected" : "Runtime offline";
      const pill = document.querySelector(".status-pill");
      if (pill) pill.innerHTML = "<span></span> Runtime connected · " + health.agents + " agents";
    } catch {
      state.textContent = "Runtime offline";
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
  }

  refreshRuntimeStatus();
})();

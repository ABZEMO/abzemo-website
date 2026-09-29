(() => {
  "use strict";

  const agents = [
    ["Executive Agent","Turns business goals into concise plans, decisions, briefings and follow-ups.","Strategy"],
    ["Project Agent","Plans projects, tracks actions, dependencies, risks and delivery workflows.","Operations"],
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

  const plan = [
    ["Understand goal","Parsing intent, constraints and requested outcome."],
    ["Build plan","Breaking the goal into executable steps."],
    ["Select agents","Routing work to the appropriate specialist agents."],
    ["Select tools","Preparing integrations, knowledge and actions."],
    ["Execute","Running actions with controlled permissions."],
    ["Verify","Checking outputs, failures and completion criteria."]
  ];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const goal = input.value.trim();
    if (!goal) return;
    state.textContent = "Planning";
    stream.classList.remove("empty");
    stream.innerHTML = plan.map((item, i) =>
      '<div class="step" data-step="' + i + '"><span class="num">' + (i + 1) + '</span><div><b>' + item[0] + '</b><small>' + item[1] + '</small></div><span class="step-status">Queued</span></div>'
    ).join("");

    const steps = [...stream.querySelectorAll(".step")];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 380));
      steps[i].classList.add("done");
      steps[i].querySelector(".step-status").textContent = "Complete";
    }
    state.textContent = "Ready";
    const summary = document.createElement("div");
    summary.className = "step";
    summary.innerHTML = '<span class="num">✓</span><div><b>Plan ready</b><small>UZMO prepared a simulated execution plan for: ' + escapeHtml(goal) + '</small></div><span class="step-status">Preview</span>';
    stream.appendChild(summary);
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

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
  }
})();
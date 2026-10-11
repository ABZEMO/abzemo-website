(() => {
  "use strict";

  const names = {};
  let allAgents = [];
  let category = "All";
  let query = "";
  let currentAgent = null;
  let history = [];
  let user = null;
  let googleReady = false;

  const grid = document.querySelector("#agents-grid");
  const form = document.querySelector("#command-form");
  const input = document.querySelector("#command-input");
  const stream = document.querySelector("#execution-stream");
  const state = document.querySelector("#run-state");
  const sidenav = document.querySelector(".sidenav");

  const style = document.createElement("style");
  style.textContent =
    ".agent-tools{margin:0 0 26px}" +
    ".agent-search{width:100%;max-width:460px;padding:13px 16px;border:1px solid #dce5f0;border-radius:10px;font:inherit;font-size:15px;color:#24344d;outline:none}" +
    ".agent-search:focus{border-color:rgba(18,100,216,.5);box-shadow:0 0 0 3px rgba(18,100,216,.08)}" +
    ".chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}" +
    ".chip{border:1px solid #dce5f0;background:#fff;color:#071a35;padding:8px 14px;border-radius:999px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}" +
    ".chip:hover{border-color:#1264d8;color:#1264d8}" +
    ".chip.on{background:#071a35;border-color:#071a35;color:#fff}" +
    ".agent-count{margin-top:12px;color:#6f7f95;font-size:13px}" +
    ".agent-card{min-height:130px!important;cursor:pointer}" +
    ".userbox{margin-top:auto;padding:14px;border-top:1px solid #dce5f0;font-size:13px;color:#24344d;word-break:break-word}" +
    ".userbox button{margin-top:8px;background:none;border:0;color:#1264d8;font-weight:700;cursor:pointer;padding:0;font:inherit;font-size:13px}" +
    ".login-overlay{position:fixed;inset:0;z-index:2000;background:rgba(7,26,53,.72);display:none;align-items:center;justify-content:center;padding:20px}" +
    ".login-overlay.show{display:flex}" +
    ".login-card{background:#071a35;color:#fff;border:1px solid rgba(255,255,255,.13);border-radius:18px;padding:34px;max-width:420px;width:100%;text-align:center}" +
    ".login-card h2{margin:0 0 10px;font-size:28px}" +
    ".login-card p{margin:0 0 22px;color:rgba(255,255,255,.72);font-size:14px}" +
    "#g-btn{display:flex;justify-content:center;min-height:44px}" +
    ".login-msg{margin-top:14px;font-size:13px;color:#ffb4b4}";
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "login-overlay";
  overlay.innerHTML =
    '<div class="login-card"><h2>Sign in to UZMO</h2>' +
    "<p>Continue with Google to chat with UZMO agents.</p>" +
    '<div id="g-btn"></div><div class="login-msg" id="login-msg"></div></div>';
  document.body.appendChild(overlay);
  const loginMsg = overlay.querySelector("#login-msg");

  const userbox = document.createElement("div");
  userbox.className = "userbox";
  userbox.style.display = "none";
  if (sidenav) sidenav.appendChild(userbox);

  const tools = document.createElement("div");
  tools.className = "agent-tools";
  tools.innerHTML =
    '<input class="agent-search" type="text" placeholder="Search agents..." aria-label="Search agents">' +
    '<div class="chips"></div><div class="agent-count"></div>';
  grid.parentNode.insertBefore(tools, grid);
  const searchBox = tools.querySelector(".agent-search");
  const chipsBox = tools.querySelector(".chips");
  const countBox = tools.querySelector(".agent-count");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  }

  function setUser(u) {
    user = u && u.loggedIn ? u : null;
    if (user) {
      userbox.style.display = "block";
      userbox.innerHTML = "<b>" + escapeHtml(user.name) + "</b><br>" + escapeHtml(user.email) + '<br><button type="button" id="logout-btn">Log out</button>';
      overlay.classList.remove("show");
    } else {
      userbox.style.display = "none";
      userbox.innerHTML = "";
    }
  }

  function loadGoogle(cb) {
    if (window.google && window.google.accounts) return cb();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = cb;
    s.onerror = () => { loginMsg.textContent = "Could not load Google login. Please refresh."; };
    document.head.appendChild(s);
  }

  async function onCredential(resp) {
    loginMsg.textContent = "";
    try {
      const r = await fetch("/api/uzmo-auth?action=login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credential: resp.credential })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed");
      setUser(data);
    } catch (e) {
      loginMsg.textContent = e.message || "Login failed";
    }
  }

  async function showLogin() {
    overlay.classList.add("show");
    if (googleReady) return;
    try {
      const cfg = await (await fetch("/api/uzmo-auth?action=config")).json();
      if (!cfg.clientId) throw new Error("Login is not configured");
      loadGoogle(() => {
        window.google.accounts.id.initialize({ client_id: cfg.clientId, callback: onCredential });
        window.google.accounts.id.renderButton(document.getElementById("g-btn"), { theme: "outline", size: "large", text: "continue_with", width: 280 });
        googleReady = true;
      });
    } catch (e) {
      loginMsg.textContent = e.message || "Login unavailable";
    }
  }

  async function checkSession() {
    try {
      const me = await (await fetch("/api/uzmo-auth?action=me")).json();
      setUser(me);
      if (!user) showLogin();
    } catch (e) {
      showLogin();
    }
  }

  userbox.addEventListener("click", async e => {
    if (e.target.id !== "logout-btn") return;
    await fetch("/api/uzmo-auth?action=logout", { method: "POST" });
    setUser(null);
    showLogin();
  });

  function renderChips() {
    const cats = ["All"].concat([...new Set(allAgents.map(a => a.category))]);
    chipsBox.innerHTML = cats.map(c =>
      '<button type="button" class="chip' + (c === category ? " on" : "") + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + "</button>"
    ).join("");
  }

  function renderCards() {
    const q = query.trim().toLowerCase();
    const list = allAgents.filter(a => q
      ? (a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
      : (category === "All" || a.category === category)
    );
    countBox.textContent = list.length + " agents";
    grid.innerHTML = list.map(a =>
      '<article class="agent-card" data-agent="' + escapeHtml(a.id) + '" role="button" tabindex="0">' +
      '<span class="agent-tag">' + escapeHtml(a.category.toUpperCase()) + "</span>" +
      "<h3>" + escapeHtml(a.name) + "</h3></article>"
    ).join("") || '<p style="color:#6f7f95">No agents found.</p>';
  }

  chipsBox.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    category = chip.dataset.cat;
    renderChips();
    renderCards();
  });
  searchBox.addEventListener("input", () => { query = searchBox.value; renderCards(); });

  async function loadAgents() {
    countBox.textContent = "Loading agents...";
    try {
      const res = await fetch("/api/uzmo-public");
      const data = await res.json();
      allAgents = data.agents || [];
      allAgents.forEach(a => { names[a.id] = a.name; });
      renderChips();
      renderCards();
    } catch (e) {
      countBox.textContent = "Could not load agents. Please refresh the page.";
    }
  }

  function showView(name) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelector("#" + name + "-view").classList.add("active");
    window.scrollTo(0, 0);
  }

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  function addLine(who, text, status) {
    stream.classList.remove("empty");
    const row = document.createElement("div");
    row.className = "step";
    row.innerHTML = '<span class="num">' + (who === "You" ? "U" : "A") + '</span><div><b>' + escapeHtml(who) +
      '</b><small style="white-space:pre-wrap">' + escapeHtml(text) + '</small></div><span class="step-status">' + escapeHtml(status || "") + "</span>";
    stream.appendChild(row);
    return row;
  }

  function selectAgent(id) {
    if (!user) { showLogin(); return; }
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

    if (!user) { showLogin(); return; }

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
      if (res.status === 401) { setUser(null); showLogin(); }
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
  loadAgents();
  checkSession();
})();

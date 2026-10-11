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
      const me = await (await

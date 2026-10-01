/* =========================================================
   ABZEMO AI — GLOBAL MULTI-AGENT AI PLATFORM
   Version: 3.0
   Objective:
   Website visitor -> understand -> qualify -> solution match
   -> lead capture -> structured English record -> human handoff.

   FRONTEND ONLY:
   Never put an OpenAI/API key here.
   Actual intelligence, approved-data checks, qualification
   decisions, CRM actions and human handoff belong to the
   secure backend endpoint.
   ========================================================= */

(function () {
  "use strict";

  const ABZEMO_AI_ENDPOINT = "https://abzemo-website.vercel.app/api/chat";

  if (window.__ABZEMO_AI_WIDGET_LOADED__) return;
  window.__ABZEMO_AI_WIDGET_LOADED__ = true;

  /* =========================================================
     1. 50+ LANGUAGE FOUNDATION
     One multilingual agent — NOT one bot per language.
     ========================================================= */

  const ABZEMO_SUPPORTED_LANGUAGES = [
    ["en","English"],["zh","Mandarin Chinese"],["hi","Hindi"],
    ["es","Spanish"],["fr","French"],["ar","Modern Standard Arabic"],
    ["bn","Bengali"],["pt","Portuguese"],["ru","Russian"],["ur","Urdu"],
    ["id","Indonesian"],["de","German"],["ja","Japanese"],
    ["pcm","Nigerian Pidgin"],["mr","Marathi"],["te","Telugu"],
    ["tr","Turkish"],["ta","Tamil"],["yue","Cantonese"],
    ["vi","Vietnamese"],["tl","Tagalog"],["wuu","Wu Chinese"],
    ["ko","Korean"],["fa","Persian"],["ha","Hausa"],["th","Thai"],
    ["gu","Gujarati"],["kn","Kannada"],["it","Italian"],["arz","Egyptian Arabic"],
    ["pl","Polish"],["uk","Ukrainian"],["ml","Malayalam"],["yo","Yoruba"],
    ["my","Burmese"],["om","Oromo"],["su","Sundanese"],["nl","Dutch"],
    ["ro","Romanian"],["sr","Serbian"],["hu","Hungarian"],["sv","Swedish"],
    ["el","Greek"],["cs","Czech"],["he","Hebrew"],["hr","Croatian"],
    ["da","Danish"],["fi","Finnish"],["no","Norwegian"],["sk","Slovak"],
    ["bg","Bulgarian"],["sl","Slovenian"],["lt","Lithuanian"],
    ["lv","Latvian"],["et","Estonian"],["sq","Albanian"],["bs","Bosnian"],
    ["mk","Macedonian"],["is","Icelandic"],["ga","Irish"],["cy","Welsh"],
    ["ca","Catalan"],["eu","Basque"],["gl","Galician"],["mt","Maltese"],
    ["ur-roman","Roman Urdu"],["hi-roman","Roman Hindi"]
  ];

  /* =========================================================
     2. FINALIZED SALES OBJECTIVE
     ========================================================= */

  const AGENT_NAME = "ABZEMO AI Global Sales Agent";
  const AGENT_VERSION = "3.0";

  const ABZEMO_SOLUTIONS = [
    "AI Automation",
    "AI Agents",
    "Sales Automation",
    "Business Process Automation",
    "ERP / Business Workflow Automation",
    "Intelligent Data Workflows",
    "Digital Transformation",
    "Technology & Project Solutions"
  ];

  const QUALIFICATION_FIELDS = [
    "name",
    "company",
    "industry",
    "business_need",
    "solution_interest",
    "timeline",
    "budget",
    "contact_method",
    "contact_value",
    "consent_to_contact"
  ];

  const AGENT_OBJECTIVE =
    "Operate as a global multi-agent AI platform: understand the visitor, " +
    "route the request to the relevant specialist capability, use live research/location tools when needed, " +
    "provide useful source-backed answers, match ABZEMO solutions, and qualify sales opportunities only when appropriate.";

  /* =========================================================
     3. WIDGET STYLES
     ========================================================= */

  if (!document.getElementById("abzemo-ai-global-styles")) {
    const style = document.createElement("style");
    style.id = "abzemo-ai-global-styles";

    style.textContent = `
      .abzemo-ai-launcher{position:fixed;right:28px;bottom:28px;min-width:148px;height:54px;padding:0 20px;border:0;border-radius:999px;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;cursor:pointer;z-index:9998;box-shadow:0 14px 38px rgba(18,100,216,.32);transition:transform .25s ease,box-shadow .25s ease;display:flex;align-items:center;justify-content:center;gap:8px}
      .abzemo-ai-launcher:hover{transform:translateY(-3px);box-shadow:0 18px 45px rgba(18,100,216,.42)}
      .abzemo-ai-launcher-wrap{position:fixed;right:28px;bottom:28px;z-index:9998;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
      .abzemo-ai-launcher-wrap .abzemo-ai-launcher{position:static}
      .abzemo-ai-launcher-tip{max-width:230px;padding:9px 13px;border-radius:12px 12px 4px 12px;background:#071a35;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;line-height:1.35;box-shadow:0 10px 28px rgba(7,26,53,.22);animation:abzemoAiTip 2.8s ease-in-out infinite}
      @keyframes abzemoAiTip{0%,100%{transform:translateY(0);opacity:.92}50%{transform:translateY(-3px);opacity:1}}
      .abzemo-ai-robot{font-size:22px;line-height:1}
      .abzemo-ai-chat{position:fixed;right:28px;bottom:96px;width:390px;max-width:calc(100vw - 32px);height:590px;max-height:calc(100vh - 120px);background:#fff;border:1px solid rgba(7,26,53,.12);border-radius:22px;overflow:hidden;z-index:9999;display:none;flex-direction:column;box-shadow:0 25px 75px rgba(7,26,53,.25);font-family:Arial,Helvetica,sans-serif}
      .abzemo-ai-chat.active{display:flex;animation:abzemoAiOpen .22s ease-out}
      @keyframes abzemoAiOpen{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      .abzemo-ai-header{min-height:74px;padding:14px 16px;background:linear-gradient(135deg,#071a35,#0c2850);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0}
      .abzemo-ai-brand{display:flex;align-items:center;gap:11px;min-width:0}
      .abzemo-ai-logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1264d8,#168cff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800;flex-shrink:0}
      .abzemo-ai-title{font-size:14px;font-weight:800;line-height:1.2}
      .abzemo-ai-status{margin-top:4px;font-size:10px;color:rgba(255,255,255,.68);line-height:1.3}
      .abzemo-ai-close{width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center}
      .abzemo-ai-messages{flex:1;padding:20px;overflow-y:auto;background:#f7f9fc;scroll-behavior:smooth}
      .abzemo-ai-message{display:flex;width:100%;margin-bottom:14px}.abzemo-ai-message.bot{justify-content:flex-start}.abzemo-ai-message.user{justify-content:flex-end}
      .abzemo-ai-bubble{max-width:82%;padding:11px 14px;border-radius:16px;font-size:13px;line-height:1.55;word-break:break-word;overflow-wrap:anywhere;white-space:normal;text-align:left}
      .abzemo-ai-message.bot .abzemo-ai-bubble{background:#fff;color:#17243a;border:1px solid rgba(7,26,53,.08);border-top-left-radius:6px;box-shadow:0 5px 18px rgba(7,26,53,.05)}
      .abzemo-ai-message.user .abzemo-ai-bubble{background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;border-top-right-radius:6px;box-shadow:0 7px 18px rgba(18,100,216,.18)}
      .abzemo-ai-typing{display:none;margin-bottom:14px}.abzemo-ai-typing.active{display:flex}
      .abzemo-ai-typing .abzemo-ai-bubble{display:flex;align-items:center;gap:5px;padding:13px 15px}
      .abzemo-ai-typing span{width:5px;height:5px;border-radius:50%;background:#6c7a90;display:block;animation:abzemoAiTyping 1.2s infinite ease-in-out}
      .abzemo-ai-typing span:nth-child(2){animation-delay:.15s}.abzemo-ai-typing span:nth-child(3){animation-delay:.3s}
      @keyframes abzemoAiTyping{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-3px);opacity:1}}
      .abzemo-ai-input-area{padding:12px 14px 13px;background:#fff;border-top:1px solid rgba(7,26,53,.08);flex-shrink:0}
      .abzemo-ai-input-row{display:flex;align-items:flex-end;gap:9px}
      .abzemo-ai-input{flex:1;min-width:0;min-height:42px;max-height:110px;resize:none;border:1px solid rgba(7,26,53,.13);border-radius:13px;padding:11px 12px;background:#f8fafc;color:#17243a;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;outline:none;box-sizing:border-box}
      .abzemo-ai-input:focus{border-color:rgba(18,100,216,.5);background:#fff;box-shadow:0 0 0 3px rgba(18,100,216,.08)}
      .abzemo-ai-send{width:42px;height:42px;border:0;border-radius:12px;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .abzemo-ai-send:disabled{opacity:.55;cursor:not-allowed}
      .abzemo-ai-voice{width:42px;height:42px;border:1px solid rgba(7,26,53,.13);border-radius:12px;background:#fff;color:#1264d8;cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .abzemo-ai-voice.active{background:#1264d8;color:#fff;box-shadow:0 0 0 4px rgba(18,100,216,.12)}
      .abzemo-ai-voice:disabled{opacity:.45;cursor:not-allowed}
      .abzemo-ai-speaker{width:42px;height:42px;border:1px solid rgba(7,26,53,.13);border-radius:12px;background:#fff;color:#1264d8;cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .abzemo-ai-speaker.muted{color:#7d899a;background:#f4f6f9}
      .abzemo-ai-voice-status{margin-top:7px;text-align:center;font-size:9px;color:#6d7b90;min-height:12px}
      .abzemo-ai-lead-status{margin:8px 0 0;padding:8px 10px;border-radius:9px;background:#eef5fd;color:#245b9d;font-size:10px;line-height:1.35;display:none}
      .abzemo-ai-lead-status.active{display:block}
      .abzemo-ai-location-card{margin:4px 0 14px;background:#fff;border:1px solid rgba(7,26,53,.1);border-radius:16px;overflow:hidden;box-shadow:0 6px 22px rgba(7,26,53,.06)}
      .abzemo-ai-location-head{padding:10px 12px;background:#f3f7fc;color:#17345b;font-size:11px;font-weight:800}
      .abzemo-ai-map{width:100%;height:220px}
      .abzemo-ai-location-list{padding:8px 12px 10px;display:grid;gap:6px}
      .abzemo-ai-location-item{font-size:10px;line-height:1.35;color:#46566d}
      .abzemo-ai-location-item strong{display:block;color:#17345b}
      .abzemo-ai-research-card{margin:4px 0 14px;background:#fff;border:1px solid rgba(7,26,53,.1);border-radius:16px;overflow:hidden;box-shadow:0 6px 22px rgba(7,26,53,.06)}
      .abzemo-ai-research-head{padding:10px 12px;background:#f3f7fc;color:#17345b;font-size:11px;font-weight:800}
      .abzemo-ai-research-list{padding:9px 12px;display:grid;gap:7px}
      .abzemo-ai-research-link{font-size:10px;line-height:1.35;color:#1264d8;text-decoration:none;font-weight:700}
      .abzemo-ai-research-link:hover{text-decoration:underline}
      .abzemo-ai-location-note{padding:0 12px 9px;font-size:8px;line-height:1.3;color:#7b8798}
      .abzemo-ai-note{margin-top:8px;font-size:9px;line-height:1.3;color:#8a96a8;text-align:center;letter-spacing:.25px}
      @media(max-width:600px){.abzemo-ai-launcher-wrap{right:18px;bottom:18px}.abzemo-ai-launcher{right:auto;bottom:auto;min-width:132px;height:50px;padding:0 17px}.abzemo-ai-chat{right:12px;bottom:80px;width:calc(100vw - 24px);height:min(590px,calc(100vh - 100px));border-radius:18px}.abzemo-ai-messages{padding:16px}.abzemo-ai-bubble{max-width:88%}}
      @media(prefers-reduced-motion:reduce){.abzemo-ai-chat.active,.abzemo-ai-typing span{animation:none}}
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     4. SESSION + LANGUAGE
     ========================================================= */

  const sessionKey = "abzemo_ai_session_id";
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId =
      "abzemo_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2,10);

    sessionStorage.setItem(sessionKey, sessionId);
  }

  function getBrowserLanguage() {
    const browser = (navigator.language || "en").toLowerCase();

    const exact = ABZEMO_SUPPORTED_LANGUAGES.find(
      item => item[0].toLowerCase() === browser
    );

    if (exact) return exact[0];

    const base = browser.split("-")[0];

    const match = ABZEMO_SUPPORTED_LANGUAGES.find(
      item => item[0].split("-")[0] === base
    );

    return match ? match[0] : "en";
  }

  let detectedLanguage = getBrowserLanguage();

  /*
     Detect the visitor's writing style as well as browser language.
     This is especially important for Roman Urdu / Roman Hindi:
     a visitor may have an English browser but type in Roman Urdu.
     Browser language remains the fallback; the latest meaningful
     user message can refine the response language.
  */
  function detectWritingLanguage(text) {
    const value = String(text || "").toLowerCase().trim();
    if (!value) return detectedLanguage;

    const romanUrdu = /\b(mujhy|ap|kia|kyu|nhai|kr|krna|hain|aapko|batao|kahan|kaise|samajh|chahta|chahti|lagta|mein|mera|meri|mere)\b/;
    const romanHindi = /\b(mujhko|kripya|sakta|sakti|sakte|wali|wale|bahut|kaafi|liye|log|aaplog|mujhse|tumse|hamara|hamari|hamare)\b/;
    const romanUrduMatches = (value.match(romanUrdu) || []).length;
    const romanHindiMatches = (value.match(romanHindi) || []).length;
    const arabic = /[\\u0600-\\u06ff]/;
    const devanagari = /[\\u0900-\\u097f]/;
    const cyrillic = /[\\u0400-\\u04ff]/;
    const han = /[\\u4e00-\\u9fff]/;
    const hangul = /[\\uac00-\\ud7af]/;

    if (arabic.test(value)) return "ur";
    if (devanagari.test(value)) return "hi";
    if (cyrillic.test(value)) return "ru";
    if (han.test(value)) return "zh";
    if (hangul.test(value)) return "ko";
    if (romanUrduMatches > romanHindiMatches && romanUrduMatches >= 1) return "ur-roman";
    if (romanHindiMatches > romanUrduMatches && romanHindiMatches >= 1) return "hi-roman";

    return detectedLanguage;
  }

  /* =========================================================
     5. CREATE WIDGET
     ========================================================= */

  function createWidget() {
    let launcher = document.getElementById("abzemoAiLauncher");
    let chat = document.getElementById("abzemoAiChat");

    if (!launcher && !chat) {
      launcher = document.createElement("button");
      const launcherWrap = document.createElement("div");
      launcherWrap.className = "abzemo-ai-launcher-wrap";
      launcherWrap.id = "abzemoAiLauncherWrap";

      const launcherTip = document.createElement("div");
      launcherTip.className = "abzemo-ai-launcher-tip";
      launcherTip.innerHTML = "<span class=\"abzemo-ai-robot\" aria-hidden=\"true\">🤖</span> Press ABZEMO AI to communicate with our Global Sales Agent";

      launcher.className = "abzemo-ai-launcher";
      launcher.id = "abzemoAiLauncher";
      launcher.type = "button";
      launcher.setAttribute("aria-label","Open ABZEMO AI Global Sales Agent");
      launcher.title = "Talk to ABZEMO AI";
      launcher.innerHTML =
        "<span aria-hidden='true'>✦</span><span>ABZEMO AI</span>";

      chat = document.createElement("div");
      chat.className = "abzemo-ai-chat";
      chat.id = "abzemoAiChat";
      chat.setAttribute("aria-label",AGENT_NAME);

      chat.innerHTML = `
        <div class="abzemo-ai-header">
          <div class="abzemo-ai-brand">
            <div class="abzemo-ai-logo">AI</div>
            <div>
              <div class="abzemo-ai-title">ABZEMO AI</div>
              <div class="abzemo-ai-status">Global Multi-Agent AI Platform • 50+ Languages</div>
            </div>
          </div>
          <button class="abzemo-ai-close" id="abzemoAiClose" type="button" aria-label="Close ABZEMO AI">×</button>
        </div>

        <div class="abzemo-ai-messages" id="abzemoAiMessages">
          <div class="abzemo-ai-message bot">
            <div class="abzemo-ai-bubble">
              Welcome to ABZEMO.<br><br>
              I’m the ABZEMO AI Global Sales Agent. Tell me about your business, your challenge, or the solution you are looking for. I’ll help identify the right ABZEMO direction and next step.
            </div>
          </div>

          <div class="abzemo-ai-typing" id="abzemoAiTyping">
            <div class="abzemo-ai-bubble"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="abzemo-ai-input-area">
          <div class="abzemo-ai-input-row">
            <textarea id="abzemoAiInput" class="abzemo-ai-input" rows="1" placeholder="Tell us what your business needs..." aria-label="Message ABZEMO AI"></textarea>
            <button id="abzemoAiVoice" class="abzemo-ai-voice" type="button" aria-label="Use voice input" title="Voice input">🎙</button>
            <button id="abzemoAiSpeaker" class="abzemo-ai-speaker" type="button" aria-label="Mute AI voice" title="Mute AI voice">🔊</button>
            <button id="abzemoAiSend" class="abzemo-ai-send" type="button" aria-label="Send message">➤</button>
          </div>

          <div id="abzemoAiLeadStatus" class="abzemo-ai-lead-status"></div>
          <div id="abzemoAiVoiceStatus" class="abzemo-ai-voice-status" aria-live="polite"></div>

          <div class="abzemo-ai-note">
            ABZEMO AI • Global Multilingual Sales Intelligence
          </div>
        </div>
      `;

      launcherWrap.appendChild(launcherTip);
      launcherWrap.appendChild(launcher);
      document.body.appendChild(launcherWrap);
      document.body.appendChild(chat);
    }

    return {
      launcher: document.getElementById("abzemoAiLauncher"),
      chat: document.getElementById("abzemoAiChat"),
      close: document.getElementById("abzemoAiClose"),
      send: document.getElementById("abzemoAiSend"),
      input: document.getElementById("abzemoAiInput"),
      messages: document.getElementById("abzemoAiMessages"),
      typing: document.getElementById("abzemoAiTyping"),
      leadStatus: document.getElementById("abzemoAiLeadStatus")
    };
  }

  /* =========================================================
     6. INITIALIZE
     ========================================================= */

  function initializeAbzemoAI() {
    const el = createWidget();

    const launcher = el.launcher;
    const chat = el.chat;
    const close = el.close;
    const send = el.send;
    const voice = document.getElementById("abzemoAiVoice");
    const speaker = document.getElementById("abzemoAiSpeaker");
    const input = el.input;
    const messages = el.messages;
    const typing = el.typing;
    const leadStatus = el.leadStatus;
    const voiceStatus = document.getElementById("abzemoAiVoiceStatus");

    if (!launcher || !chat || !close || !send || !input || !messages || !typing) {
      return;
    }

    /*
      Conversation remains in this browser session.
      The backend receives it so qualification can continue
      instead of treating every message as a new enquiry.
    */
    const conversation = [];

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    let mapLibraryPromise = null;

    function loadMapLibrary() {
      if (mapLibraryPromise) return mapLibraryPromise;

      mapLibraryPromise = new Promise(function (resolve, reject) {
        if (window.L) {
          resolve(window.L);
          return;
        }

        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = function () { resolve(window.L); };
        script.onerror = reject;
        document.head.appendChild(script);
      });

      return mapLibraryPromise;
    }

    async function renderLocationContext(locationContext) {
      if (!locationContext || !locationContext.needed || !Array.isArray(locationContext.results) || !locationContext.results.length) {
        return;
      }

      const valid = locationContext.results.filter(function (item) {
        return item && Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon));
      });

      if (!valid.length) return;

      const card = document.createElement("div");
      card.className = "abzemo-ai-location-card";

      const head = document.createElement("div");
      head.className = "abzemo-ai-location-head";
      head.textContent = locationContext.intent === "property_search"
        ? "📍 Property / Location Map"
        : "📍 Location Map";
      card.appendChild(head);

      const mapNode = document.createElement("div");
      mapNode.className = "abzemo-ai-map";
      card.appendChild(mapNode);

      const list = document.createElement("div");
      list.className = "abzemo-ai-location-list";

      valid.slice(0, 4).forEach(function (item) {
        const row = document.createElement("div");
        row.className = "abzemo-ai-location-item";
        row.innerHTML = "<strong>" + escapeHtml(item.display_name || "Location") + "</strong>" +
          escapeHtml((item.category || "") + (item.type ? " • " + item.type : ""));
        list.appendChild(row);
      });

      card.appendChild(list);

      const note = document.createElement("div");
      note.className = "abzemo-ai-location-note";
      note.textContent = locationContext.property_listings === "not_configured"
        ? "Map location data is available. Live property listings require a connected property-data provider."
        : "Map data provided by OpenStreetMap.";
      card.appendChild(note);

      messages.insertBefore(card, typing);
      scrollToBottom();

      try {
        const L = await loadMapLibrary();
        const first = valid[0];
        const map = L.map(mapNode, { scrollWheelZoom: false }).setView([Number(first.lat), Number(first.lon)], valid.length > 1 ? 10 : 13);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        const bounds = [];
        valid.slice(0, 6).forEach(function (item) {
          const point = [Number(item.lat), Number(item.lon)];
          bounds.push(point);
          L.marker(point).addTo(map).bindPopup(escapeHtml(item.display_name || "Location"));
        });

        if (bounds.length > 1) map.fitBounds(bounds, { padding: [24, 24] });
        setTimeout(function () { map.invalidateSize(); }, 100);
      } catch (error) {
        console.error("ABZEMO AI map error:", error);
      }
    }

    function renderResearchSources(sources) {
      if (!Array.isArray(sources) || !sources.length) return;
      const card = document.createElement("div");
      card.className = "abzemo-ai-research-card";
      const head = document.createElement("div");
      head.className = "abzemo-ai-research-head";
      head.textContent = "🔎 Sources & Research";
      card.appendChild(head);
      const list = document.createElement("div");
      list.className = "abzemo-ai-research-list";
      sources.slice(0, 10).forEach(function (source) {
        if (!source || typeof source.url !== "string" || !/^https?:\/\//i.test(source.url)) return;
        const link = document.createElement("a");
        link.className = "abzemo-ai-research-link";
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = source.title || source.url;
        list.appendChild(link);
      });
      if (!list.children.length) return;
      card.appendChild(list);
      messages.insertBefore(card, typing);
      scrollToBottom();
    }

    let leadState = {
      status: "new",
      qualification: {},
      handoff_ready: false,
      notification_sent: false
    };

    function openAI() {
      chat.classList.add("active");

      setTimeout(function () {
        input.focus();
        scrollToBottom();
      },80);
    }

    function closeAI() {
      chat.classList.remove("active");
      launcher.focus();
    }

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(text,type) {
      const row = document.createElement("div");
      row.className = "abzemo-ai-message " + type;

      const bubble = document.createElement("div");
      bubble.className = "abzemo-ai-bubble";

      /*
        textContent keeps visitor/backend text from being
        interpreted as executable HTML.
      */
      bubble.textContent = text;

      row.appendChild(bubble);
      messages.insertBefore(row,typing);
      scrollToBottom();
    }

    function setLeadStatus(status,handoff) {
      if (!leadStatus) return;

      if (!status && !handoff) {
        leadStatus.classList.remove("active");
        return;
      }

      const labels = {
        new: "Conversation started",
        qualifying: "Understanding your requirement",
        qualified: "Qualified business enquiry",
        hot: "Sales-ready enquiry"
      };

      leadStatus.textContent = handoff
        ? "Sales handoff recommended — ABZEMO can follow up with you."
        : (labels[status] || "ABZEMO is processing your enquiry");

      leadStatus.classList.add("active");
    }

    function autoResize() {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight,110) + "px";
    }

    /* =========================================================
       7. VOICE INPUT + OUTPUT
       Browser-native voice keeps the frontend key-free.
       ========================================================= */

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    function setVoiceStatus(text) {
      if (voiceStatus) voiceStatus.textContent = text || "";
    }

    const speakerKey = "abzemo_ai_speaker_enabled";
    let speakerEnabled = localStorage.getItem(speakerKey) !== "false";

    function updateSpeakerButton() {
      if (!speaker) return;
      speaker.classList.toggle("muted", !speakerEnabled);
      speaker.textContent = speakerEnabled ? "🔊" : "🔇";
      speaker.setAttribute("aria-label", speakerEnabled ? "Mute AI voice" : "Unmute AI voice");
      speaker.title = speakerEnabled ? "Mute AI voice" : "Unmute AI voice";
    }

    function stopSpeaking() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    function speakReply(text) {
      if (!speakerEnabled || !("speechSynthesis" in window) || !text) return;

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = detectedLanguage === "ur-roman" || detectedLanguage === "hi-roman"
        ? "en-US"
        : (navigator.language || "en-US");

      utterance.rate = 0.98;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    }

    function setupVoiceInput() {
      if (!voice) return;

      if (!SpeechRecognition) {
        voice.disabled = true;
        voice.title = "Voice input is not supported by this browser";
        setVoiceStatus("Voice input is not supported in this browser.");
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || "en-US";

      recognition.onstart = function () {
        isListening = true;
        voice.classList.add("active");
        voice.textContent = "■";
        setVoiceStatus("Listening…");
      };

      recognition.onresult = function (event) {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        input.value = transcript.trim();
        autoResize();
      };

      recognition.onerror = function (event) {
        setVoiceStatus(
          event.error === "not-allowed"
            ? "Microphone permission is required."
            : "Voice input could not be captured. Please try again."
        );
      };

      recognition.onend = function () {
        isListening = false;
        voice.classList.remove("active");
        voice.textContent = "🎙";
        if (input.value.trim()) {
          setVoiceStatus("Voice captured — press send.");
        } else {
          setVoiceStatus("");
        }
      };
    }

    function toggleVoiceInput() {
      if (!recognition) return;

      if (isListening) {
        recognition.stop();
        return;
      }

      stopSpeaking();
      recognition.lang = navigator.language || "en-US";

      try {
        recognition.start();
      } catch (error) {
        console.error("ABZEMO AI voice start error:", error);
      }
    }

    /* =========================================================
       8. SEND TO SECURE AGENT BACKEND
       ========================================================= */

    async function sendMessage() {
      const message = input.value.trim();

      if (!message || send.disabled) return;

      addMessage(message,"user");

      conversation.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      });

      input.value = "";
      autoResize();
      send.disabled = true;
      typing.classList.add("active");
      scrollToBottom();

      /*
        Backend is deliberately separate.
        GitHub Pages must never contain the OpenAI secret.
      */
      if (
        !ABZEMO_AI_ENDPOINT ||
        ABZEMO_AI_ENDPOINT === "YOUR_SECURE_BACKEND_ENDPOINT"
      ) {
        setTimeout(function () {
          typing.classList.remove("active");

          addMessage(
            "ABZEMO AI is ready for its secure intelligence backend. The multilingual sales-agent frontend is configured, but the secure agent endpoint still needs to be connected.",
            "bot"
          );

          send.disabled = false;
          input.focus();
        },500);

        return;
      }

      try {
        const payload = {
          /* Agent identity */
          agent: AGENT_NAME,
          agent_version: AGENT_VERSION,

          /* Session */
          session_id: sessionId,

          /* Website context */
          source: "ABZEMO Website",
          page: window.location.href,
          referrer: document.referrer || null,

          /* Multilingual layer */
          detected_language: detectWritingLanguage(message),
          browser_language: navigator.language || "unknown",
          supported_languages_count: ABZEMO_SUPPORTED_LANGUAGES.length,
          supported_languages: ABZEMO_SUPPORTED_LANGUAGES,

          /*
            User-facing language remains the visitor's language.
            The backend should normalize internal records to English.
          */
          response_language: detectWritingLanguage(message),
          internal_record_language: "en",

          /* Finalized sales objective */
          objective: AGENT_OBJECTIVE,
    platform: "Global Multi-Agent AI Platform",

          /* Multi-agent platform context */
          agent_platform: "ABZEMO AI Global Multi-Agent AI Platform",
          specialist_routes: ["sales","business_automation","finance","erp_workflow","education_university","scholarship_study_abroad","healthcare","real_estate_property","trade_b2b","logistics","manufacturing","hr_recruitment","business_intelligence","web_research","location_maps","document_knowledge","general"],

          /* ABZEMO solution matching context */
          solutions: ABZEMO_SOLUTIONS,

          /* Lead qualification schema */
          qualification_fields: QUALIFICATION_FIELDS,

          /* Stateful conversation */
          conversation: conversation,

          /* Current qualification state */
          lead_state: leadState
        };

        const response = await fetch(
          ABZEMO_AI_ENDPOINT,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          throw new Error("ABZEMO AI backend request failed.");
        }

        const data = await response.json();

        typing.classList.remove("active");

        const reply =
          typeof data.reply === "string"
            ? data.reply.trim()
            : "";

        if (reply) {
          addMessage(reply,"bot");
          speakReply(reply);

          conversation.push({
            role: "assistant",
            content: reply,
            timestamp: new Date().toISOString()
          });
        } else {
          addMessage(
            "I could not process that request right now. Please try again.",
            "bot"
          );
        }

        /*
          Backend may return structured lead state.
          Frontend does not invent or score the lead itself.
        */
        if (
          data.lead_state &&
          typeof data.lead_state === "object"
        ) {
          leadState = {
            ...leadState,
            ...data.lead_state
          };
        }

        if (
          data.qualification &&
          typeof data.qualification === "object"
        ) {
          leadState.qualification = {
            ...leadState.qualification,
            ...data.qualification
          };
        }

        if (data.notification_sent === true) {
          leadState.notification_sent = true;
        }

        if (data.location_context) {
          renderLocationContext(data.location_context);
        }

        if (Array.isArray(data.research_sources)) {
          renderResearchSources(data.research_sources);
        }

        setLeadStatus(
          data.lead_status || leadState.status,
          data.handoff_ready === true ||
          leadState.handoff_ready === true
        );

      } catch (error) {
        console.error("ABZEMO AI error:",error);

        typing.classList.remove("active");

        addMessage(
          "ABZEMO AI is temporarily unavailable. Please try again shortly.",
          "bot"
        );
      } finally {
        send.disabled = false;
        input.focus();
        scrollToBottom();
      }
    }

    /* =========================================================
       8. EVENTS
       ========================================================= */

    document.querySelectorAll(".abzemo-intelligence-submit").forEach(function (button) {
      button.addEventListener("click", function () {
        const shell = button.closest(".abzemo-intelligence-search");
        const field = shell ? shell.querySelector(".abzemo-intelligence-input") : null;
        const query = field ? field.value.trim() : "";

        if (!query) {
          if (field) field.focus();
          return;
        }

        openAI();
        input.value = query;
        autoResize();
        setTimeout(function () {
          sendMessage();
        }, 100);
      });
    });

    document.querySelectorAll(".abzemo-intelligence-input").forEach(function (field) {
      field.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          const button = field.closest(".abzemo-intelligence-search")?.querySelector(".abzemo-intelligence-submit");
          if (button) button.click();
        }
      });
    });

    launcher.addEventListener("click",openAI);
    if (voice) voice.addEventListener("click",toggleVoiceInput);
    if (speaker) {
      speaker.addEventListener("click",function () {
        speakerEnabled = !speakerEnabled;
        localStorage.setItem(speakerKey, String(speakerEnabled));
        if (!speakerEnabled) stopSpeaking();
        updateSpeakerButton();
      });
      updateSpeakerButton();
    }
    setupVoiceInput();
    close.addEventListener("click",closeAI);
    send.addEventListener("click",sendMessage);
    input.addEventListener("input",autoResize);

    input.addEventListener("keydown",function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    document.addEventListener("keydown",function (event) {
      if (event.key === "Escape") stopSpeaking();
      if (
        event.key === "Escape" &&
        chat.classList.contains("active")
      ) {
        closeAI();
      }
    });

    autoResize();
  }

  /* =========================================================
     9. START
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAbzemoAI
    );
  } else {
    initializeAbzemoAI();
  }

  /*
    Non-secret configuration for future integration/testing.
    No API key or credential is exposed.
  */
  window.ABZEMO_AI_CONFIG = {
    agent: AGENT_NAME,
    version: AGENT_VERSION,
    objective: AGENT_OBJECTIVE,
    supportedLanguages: ABZEMO_SUPPORTED_LANGUAGES,
    solutions: ABZEMO_SOLUTIONS,
    qualificationFields: QUALIFICATION_FIELDS
  };

})();
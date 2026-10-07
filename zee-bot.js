/* =========================================================
   ABZEMO — ZEE Bot
   Lightweight predefined visitor-assistance bot.
   No OpenAI/API calls. No external dependencies.
   Present on public website pages except abzemo-ai.html.
   ========================================================= */

(function () {
  "use strict";

  if (window.__ABZEMO_ZEE_BOT_LOADED__) return;
  window.__ABZEMO_ZEE_BOT_LOADED__ = true;

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const pageIntro = {
    "index.html": "Welcome to ABZEMO. I can help you quickly explore what we do.",
    "about.html": "I can help you learn about ABZEMO and our approach.",
    "mission.html": "I can help you understand ABZEMO's mission and direction.",
    "vision.html": "I can help you explore ABZEMO's long-term vision.",
    "ventures.html": "I can help you explore ABZEMO's venture directions.",
    "industries.html": "I can help you find the industries ABZEMO serves.",
    "solutions.html": "I can help you discover ABZEMO's business and technology solutions.",
    "contact.html": "I can help you find the right way to contact ABZEMO.",
    "contact-us.html": "I can help you find the right way to contact ABZEMO.",
    "online-message.html": "I can help you choose the right way to reach ABZEMO online.",
    "director-note.html": "I can help you understand ABZEMO's leadership perspective.",
    "privacy.html": "I can help you navigate ABZEMO's privacy information.",
    "terms.html": "I can help you navigate ABZEMO's website terms."
  };

  const answers = {
    about: {
      title: "What is ABZEMO?",
      text: "ABZEMO is a technology and business solutions company focused on building what’s next across AI, automation, digital transformation and future ventures."
    },
    solutions: {
      title: "What does ABZEMO offer?",
      text: "ABZEMO works across AI Automation, AI Agents, Sales Automation, business process automation, ERP and workflow automation, intelligent data workflows, digital transformation, and technology & project solutions."
    },
    ai: {
      title: "What is ABZEMO AI?",
      text: "ABZEMO AI is ABZEMO's AI-focused branch. It covers AI Automations, AI Agents and Agentic AI work, alongside intelligent business solutions."
    },
    industries: {
      title: "Which industries do you serve?",
      text: "ABZEMO is designed to work across sectors including education, healthcare, pharma, real estate, logistics, manufacturing, finance, retail, mobility, energy, government and other business environments."
    },
    sales: {
      title: "Can ABZEMO automate sales?",
      text: "Yes. ABZEMO can design intelligent sales and lead-management workflows, including qualification, solution matching, structured lead capture and human handoff."
    },
    languages: {
      title: "Is ABZEMO multilingual?",
      text: "ABZEMO is building multilingual digital experiences and AI capabilities, including English, Arabic, Urdu, Roman Urdu, Roman Hindi and many other language modes."
    },
    contact: {
      title: "How can I contact ABZEMO?",
      text: "Use the Contact section on this website to reach ABZEMO. For a direct business enquiry, choose Contact or Online Message from the navigation."
    },
    ai_page: {
      title: "Where can I see the advanced AI?",
      text: "The dedicated ABZEMO AI page contains the full AI experience. ZEE Bot itself is a lightweight predefined website assistant and does not use the AI API."
    }
  };

  const questions = [
    ["about", "What is ABZEMO?"],
    ["solutions", "What solutions do you offer?"],
    ["ai", "What is ABZEMO AI?"],
    ["industries", "Which industries do you serve?"],
    ["sales", "Can you automate sales?"],
    ["languages", "Do you support multiple languages?"],
    ["contact", "How can I contact ABZEMO?"]
  ];

  const css = document.createElement("style");
  css.textContent = `
    #zee-bot-root,#zee-bot-root *{box-sizing:border-box}
    #zee-bot-root{position:fixed !important;right:28px !important;bottom:28px !important;z-index:2147483000 !important;display:block !important;visibility:visible !important;opacity:1 !important;font-family:Arial,Helvetica,sans-serif;direction:ltr;text-align:left}
    #zee-bot-launcher-wrap{width:min(390px,calc(100vw - 56px));display:flex;flex-direction:column;align-items:flex-end}
    .zee-bot-stage{width:390px;height:250px;margin-bottom:-6px;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}
    .zee-robot{width:230px;height:230px;display:block;filter:drop-shadow(0 18px 22px rgba(7,26,53,.18));animation:zeeRobotFloat 3.2s ease-in-out infinite}
    .zee-robot-core{transform-origin:150px 170px;animation:zeeRobotPulse 2.4s ease-in-out infinite}
    .zee-robot-eye{animation:zeeRobotBlink 4.5s infinite}
    .zee-robot-orbit{transform-origin:150px 155px;animation:zeeRobotOrbit 5s linear infinite}
    @keyframes zeeRobotFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(-1.5deg)}}
    @keyframes zeeRobotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
    @keyframes zeeRobotBlink{0%,44%,48%,100%{opacity:1}46%{opacity:.12}}
    @keyframes zeeRobotOrbit{to{transform:rotate(360deg)}}
    #zee-bot-launcher{position:relative !important;display:flex !important;visibility:visible !important;opacity:1 !important;width:min(390px,calc(100vw - 56px));height:52px;padding:5px 6px 5px 16px;border:1px solid rgba(18,100,216,.28);border-radius:999px;background:rgba(255,255,255,.98);font-family:Arial,Helvetica,sans-serif;box-shadow:0 14px 38px rgba(7,26,53,.18);display:flex;align-items:center;gap:8px;cursor:pointer;text-align:left;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
    #zee-bot-launcher:hover{transform:translateY(-1px);border-color:rgba(18,100,216,.55);box-shadow:0 16px 42px rgba(18,100,216,.2)}
    .zee-launcher-input{flex:1;min-width:0;color:#17243a;font-size:13px;line-height:40px}
    .zee-launcher-input::before{content:"Ask ZEE about ABZEMO...";color:#7a8798}
    .zee-launcher-send{width:40px;height:40px;border:0;border-radius:50%;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    #zee-bot-panel{position:fixed;right:28px;bottom:96px;width:390px;max-width:calc(100vw - 32px);height:590px;max-height:calc(100vh - 120px);overflow:hidden;border:1px solid rgba(7,26,53,.12);border-radius:22px;background:#fff;box-shadow:0 25px 75px rgba(7,26,53,.25);opacity:0;visibility:hidden;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .22s ease,transform .22s ease,visibility .22s ease;display:flex;flex-direction:column}
    #zee-bot-root.is-open #zee-bot-panel{opacity:1;visibility:visible;transform:translateY(0) scale(1)}
    .zee-head{min-height:74px;padding:14px 16px;background:linear-gradient(135deg,#071a35,#0c2850);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0}
    .zee-head-main{display:flex;align-items:center;gap:11px;min-width:0}
    .zee-head-logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1264d8,#168cff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0}
    .zee-head-title{font-size:14px;font-weight:800;line-height:1.2}.zee-head-subtitle{margin-top:4px;font-size:10px;color:rgba(255,255,255,.68);line-height:1.3}
    .zee-close{width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center}
    .zee-body{flex:1;padding:20px;overflow-y:auto;background:#f7f9fc}
    .zee-welcome{margin:0 0 14px;color:#24344d;font-size:13px;line-height:1.55}
    .zee-answer{display:none;margin:0 0 14px;padding:11px 14px;border-radius:16px;border-top-left-radius:6px;background:#fff;color:#17243a;border:1px solid rgba(7,26,53,.08);box-shadow:0 5px 18px rgba(7,26,53,.05);font-size:13px;line-height:1.55}
    .zee-answer.is-visible{display:block}.zee-answer strong{display:block;margin-bottom:5px;color:#071a35;font-size:13px}
    .zee-question-list{display:grid;gap:8px}.zee-question{width:100%;padding:11px 12px;border:1px solid rgba(7,26,53,.13);border-radius:13px;color:#17243a;background:#fff;text-align:left;font-size:12px;font-weight:700;line-height:1.35;cursor:pointer;transition:border-color .18s ease,background .18s ease,transform .18s ease}
    .zee-question:hover{border-color:rgba(18,100,216,.45);background:#f7faff;transform:translateX(2px)}
    .zee-composer{display:flex;gap:8px;margin-top:14px;padding:7px;border:1px solid rgba(7,26,53,.12);border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(7,26,53,.05)}
    .zee-composer-input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#17243a;font:13px/1.4 Arial,Helvetica,sans-serif;padding:6px 8px}
    .zee-composer-input::placeholder{color:#8a96a6}
    .zee-composer-send{width:38px;height:38px;border:0;border-radius:12px;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
    .zee-composer-send:hover{filter:brightness(1.05)}
    .zee-foot{margin-top:14px;padding-top:12px;border-top:1px solid #edf1f6;color:#7d899a;font-size:9px;line-height:1.3;text-align:center}
    @media(max-width:600px){#zee-bot-root{right:12px;bottom:84px}.zee-bot-stage{width:calc(100vw - 24px);height:210px;margin-bottom:-4px}.zee-robot{width:200px;height:200px}#zee-bot-launcher{width:calc(100vw - 24px);height:50px}#zee-bot-panel{right:12px;bottom:74px;width:calc(100vw - 24px);height:min(590px,calc(100vh - 100px));border-radius:18px}.zee-body{padding:16px}}
    @media(prefers-reduced-motion:reduce){.zee-robot,.zee-robot-core,.zee-robot-eye,.zee-robot-orbit,#zee-bot-panel,.zee-question{animation:none;transition:none}}
  `;
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "zee-bot-root";
  root.innerHTML = `
    <div id="zee-bot-launcher-wrap">
      <div class="zee-bot-stage" aria-hidden="true">
        <svg class="zee-robot" viewBox="0 0 300 300" role="img" aria-label="ZEE Bot">
          <g class="zee-robot-orbit" fill="none" stroke="#168cff" stroke-width="2" opacity=".55">
            <ellipse cx="150" cy="155" rx="122" ry="42" transform="rotate(-18 150 155)"/>
            <circle cx="272" cy="116" r="5" fill="#1264d8" stroke="none"/>
          </g>
          <g class="zee-robot-core">
            <rect x="72" y="90" width="156" height="124" rx="38" fill="#071a35"/>
            <rect x="84" y="102" width="132" height="96" rx="30" fill="#f7f9fc"/>
            <rect x="105" y="128" width="90" height="45" rx="18" fill="#071a35"/>
            <circle class="zee-robot-eye" cx="128" cy="150" r="7" fill="#168cff"/>
            <circle class="zee-robot-eye" cx="172" cy="150" r="7" fill="#168cff"/>
            <path d="M132 181 Q150 193 168 181" fill="none" stroke="#1264d8" stroke-width="5" stroke-linecap="round"/>
            <rect x="139" y="67" width="22" height="27" rx="11" fill="#071a35"/>
            <circle cx="150" cy="60" r="8" fill="#168cff"/>
            <circle cx="66" cy="148" r="15" fill="#1264d8" opacity=".9"/>
            <circle cx="234" cy="148" r="15" fill="#1264d8" opacity=".9"/>
            <path d="M88 218 Q150 242 212 218" fill="none" stroke="#1264d8" stroke-width="5" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
      <button id="zee-bot-launcher" type="button" aria-label="Open ZEE Bot" aria-expanded="false">
        <span class="zee-launcher-input" aria-hidden="true"></span>
        <span class="zee-launcher-send" aria-hidden="true">➤</span>
      </button>
    </div>

    <div id="zee-bot-panel" role="dialog" aria-label="ZEE Bot">
      <div class="zee-head">
        <div class="zee-head-main">
          <div class="zee-head-logo">ZEE</div>
          <div><div class="zee-head-title">ZEE Bot</div><div class="zee-head-subtitle">ABZEMO Visitor Assistant • Predefined Answers</div></div>
        </div>
        <button class="zee-close" type="button" aria-label="Close ZEE Bot">×</button>
      </div>
      <div class="zee-body">
        <p class="zee-welcome">${pageIntro[page] || pageIntro["index.html"]}</p>
        <div class="zee-answer" aria-live="polite"></div>
        <div class="zee-question-list"></div>
        <form class="zee-composer" novalidate>
          <input class="zee-composer-input" type="text" autocomplete="off" placeholder="Write your question..." aria-label="Write your question" />
          <button class="zee-composer-send" type="submit" aria-label="Send question">➤</button>
        </form>
        <div class="zee-foot">ZEE Bot • Predefined visitor assistance • No API required</div>
      </div>
    </div>
  `;


  document.body.appendChild(root);

  const panel = root.querySelector("#zee-bot-panel");
  const launcher = root.querySelector("#zee-bot-launcher");
  const close = root.querySelector(".zee-close");
  const answer = root.querySelector(".zee-answer");
  const list = root.querySelector(".zee-question-list");
  const composer = root.querySelector(".zee-composer");
  const composerInput = root.querySelector(".zee-composer-input");

  function showAnswer(key) {
    const item = answers[key];
    if (!item) return;
    answer.innerHTML = "<strong>" + item.title + "</strong>" + item.text;
    answer.classList.add("is-visible");
    composerInput.value = "";
  }

  function normalize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  const intentKeywords = {
    about: ["what is abzemo", "what does abzemo do", "tell me about abzemo", "about abzemo", "abzemo company"],
    solutions: ["solutions", "services", "what do you offer", "what can you do", "business solutions", "automation"],
    ai: ["abzemo ai", "what is ai", "agentic ai", "ai agents", "ai automation"],
    industries: ["industries", "sectors", "who do you serve", "which industries", "industry"],
    sales: ["sales", "lead", "leads", "sales automation", "automate sales"],
    languages: ["languages", "multilingual", "arabic", "urdu", "roman urdu", "multiple languages"],
    contact: ["contact", "email", "reach abzemo", "how can i contact", "contact abzemo"],
    ai_page: ["advanced ai", "where is the ai", "ai page", "full ai", "api bot"]
  };

  function findIntent(message) {
    const q = normalize(message);
    if (!q) return null;
    for (const key of Object.keys(intentKeywords)) {
      if (intentKeywords[key].some(keyword => q.includes(normalize(keyword)))) return key;
    }
    return null;
  }

  function showFallback() {
    answer.innerHTML = "<strong>I’m ZEE Bot.</strong>I can answer predefined questions about ABZEMO, our solutions, AI, industries, sales automation, languages and contact options. Please try one of those topics.";
    answer.classList.add("is-visible");
    composerInput.value = "";
  }

  questions.forEach(([key, label]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zee-question";
    button.textContent = label;
    button.addEventListener("click", function () {
      showAnswer(key);
    });
    list.appendChild(button);
  });

  composer.addEventListener("submit", function (event) {
    event.preventDefault();
    const intent = findIntent(composerInput.value);
    if (intent) showAnswer(intent);
    else showFallback();
  });

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(() => composerInput.focus(), 50);
  }

  launcher.addEventListener("click", function () {
    setOpen(!root.classList.contains("is-open"));
  });

  close.addEventListener("click", function () {
    setOpen(false);
    launcher.focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      setOpen(false);
      launcher.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (root.classList.contains("is-open") && !root.contains(event.target)) {
      setOpen(false);
    }
  });
})();

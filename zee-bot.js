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
    /* ZEE BOT — isolated styles */
    #zee-bot-root,
    #zee-bot-root * {
      box-sizing: border-box;
    }

    #zee-bot-root {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 2147483000;
      font-family: Arial, Helvetica, sans-serif;
      direction: ltr;
      text-align: left;
    }

    #zee-bot-launcher {
      width: 62px;
      height: 62px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      background: #071a35;
      box-shadow: 0 14px 35px rgba(7,26,53,.28);
      transition: transform .2s ease, box-shadow .2s ease;
    }

    #zee-bot-launcher:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 42px rgba(7,26,53,.34);
    }

    #zee-bot-launcher:focus-visible {
      outline: 3px solid rgba(18,100,216,.35);
      outline-offset: 4px;
    }

    .zee-launcher-mark {
      width: 44px;
      height: 44px;
      border: 1px solid rgba(255,255,255,.28);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: .04em;
      background: rgba(255,255,255,.08);
    }

    .zee-launcher-label {
      position: absolute;
      right: 72px;
      bottom: 10px;
      padding: 7px 10px;
      border-radius: 7px;
      color: #071a35;
      background: #fff;
      border: 1px solid #dce5f0;
      box-shadow: 0 8px 25px rgba(7,26,53,.10);
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      pointer-events: none;
    }

    #zee-bot-panel {
      position: absolute;
      right: 0;
      bottom: 76px;
      width: min(370px, calc(100vw - 32px));
      overflow: hidden;
      border: 1px solid #dce5f0;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 25px 70px rgba(7,26,53,.22);
      opacity: 0;
      visibility: hidden;
      transform: translateY(12px) scale(.98);
      transform-origin: bottom right;
      transition: opacity .2s ease, transform .2s ease, visibility .2s ease;
    }

    #zee-bot-root.is-open #zee-bot-panel {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .zee-head {
      padding: 18px 18px 16px;
      color: #fff;
      background: #071a35;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .zee-head-main {
      min-width: 0;
    }

    .zee-head-title {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      font-weight: 900;
    }

    .zee-head-subtitle {
      margin: 4px 0 0;
      color: rgba(255,255,255,.68);
      font-size: 11px;
      line-height: 1.4;
    }

    .zee-close {
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 8px;
      color: #fff;
      background: rgba(255,255,255,.08);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .zee-body {
      padding: 18px;
    }

    .zee-welcome {
      margin: 0 0 14px;
      color: #24344d;
      font-size: 13px;
      line-height: 1.65;
    }

    .zee-answer {
      display: none;
      margin: 0 0 14px;
      padding: 13px 14px;
      border-left: 3px solid #1264d8;
      border-radius: 10px;
      color: #24344d;
      background: #f5f8fc;
      font-size: 13px;
      line-height: 1.65;
    }

    .zee-answer.is-visible {
      display: block;
    }

    .zee-answer strong {
      display: block;
      margin-bottom: 5px;
      color: #071a35;
      font-size: 13px;
    }

    .zee-question-list {
      display: grid;
      gap: 8px;
    }

    .zee-question {
      width: 100%;
      padding: 11px 12px;
      border: 1px solid #dce5f0;
      border-radius: 9px;
      color: #071a35;
      background: #fff;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.35;
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease, transform .18s ease;
    }

    .zee-question:hover {
      border-color: rgba(18,100,216,.45);
      background: #f7faff;
      transform: translateX(2px);
    }

    .zee-foot {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #edf1f6;
      color: #6f7f95;
      font-size: 10px;
      line-height: 1.5;
    }

    @media (max-width: 600px) {
      #zee-bot-root {
        right: 14px;
        bottom: 14px;
      }

      #zee-bot-launcher {
        width: 58px;
        height: 58px;
      }

      .zee-launcher-label {
        display: none;
      }

      #zee-bot-panel {
        right: 0;
        bottom: 70px;
        width: min(340px, calc(100vw - 28px));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #zee-bot-launcher,
      #zee-bot-panel,
      .zee-question {
        transition: none;
      }
    }
  `;
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "zee-bot-root";
  root.innerHTML = `
    <div id="zee-bot-panel" role="dialog" aria-label="ZEE Bot">
      <div class="zee-head">
        <div class="zee-head-main">
          <p class="zee-head-title">ZEE Bot</p>
          <p class="zee-head-subtitle">ABZEMO Visitor Assistant</p>
        </div>
        <button class="zee-close" type="button" aria-label="Close ZEE Bot">×</button>
      </div>
      <div class="zee-body">
        <p class="zee-welcome">${pageIntro[page] || pageIntro["index.html"]}</p>
        <div class="zee-answer" aria-live="polite"></div>
        <div class="zee-question-list"></div>
        <div class="zee-foot">Predefined visitor assistance • No API required</div>
      </div>
    </div>
    <button id="zee-bot-launcher" type="button" aria-label="Open ZEE Bot" aria-expanded="false">
      <span class="zee-launcher-mark">ZEE</span>
      <span class="zee-launcher-label">Ask ZEE</span>
    </button>
  `;

  document.body.appendChild(root);

  const panel = root.querySelector("#zee-bot-panel");
  const launcher = root.querySelector("#zee-bot-launcher");
  const close = root.querySelector(".zee-close");
  const answer = root.querySelector(".zee-answer");
  const list = root.querySelector(".zee-question-list");

  questions.forEach(([key, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zee-question";
    button.textContent = label;
    button.addEventListener("click", function () {
      const item = answers[key];
      if (!item) return;
      answer.innerHTML = "<strong>" + item.title + "</strong>" + item.text;
      answer.classList.add("is-visible");
    });
    list.appendChild(button);
  });

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
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

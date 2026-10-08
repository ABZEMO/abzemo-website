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
    #zee-bot-root{position:fixed;right:28px;bottom:28px;z-index:2147483000;font-family:Arial,Helvetica,sans-serif;direction:ltr;text-align:left}
    #zee-bot-launcher-wrap{width:min(390px,calc(100vw - 56px));display:flex;flex-direction:column;align-items:flex-end}
    .zee-bot-stage{width:390px;height:330px;margin-bottom:-6px;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}
    .zee-robot{width:300px;height:300px;display:block;filter:drop-shadow(0 18px 22px rgba(7,26,53,.18));animation:zeeRobotFloat 3.2s ease-in-out infinite}
    .zee-robot-core{transform-origin:150px 170px;animation:zeeRobotPulse 2.4s ease-in-out infinite}
    .zee-robot-eye{animation:zeeRobotBlink 4.5s infinite}
    .zee-robot-orbit{transform-origin:150px 155px;animation:zeeRobotOrbit 5s linear infinite}
    @keyframes zeeRobotFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(-1.5deg)}}
    @keyframes zeeRobotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
    @keyframes zeeRobotBlink{0%,44%,48%,100%{opacity:1}46%{opacity:.12}}
    @keyframes zeeRobotOrbit{to{transform:rotate(360deg)}}
    #zee-bot-input-wrap{width:min(390px,calc(100vw - 56px));height:52px;padding:5px 6px 5px 16px;border:1px solid rgba(18,100,216,.28);border-radius:999px;background:rgba(255,255,255,.98);font-family:Arial,Helvetica,sans-serif;box-shadow:0 14px 38px rgba(7,26,53,.18);display:flex;align-items:center;gap:8px;transition:border-color .2s ease,box-shadow .2s ease}
    #zee-bot-input-wrap:focus-within{border-color:rgba(18,100,216,.65);box-shadow:0 16px 42px rgba(18,100,216,.2)}
    .zee-input{flex:1;min-width:0;height:40px;border:0;outline:0;background:transparent;color:#17243a;font:13px/40px Arial,Helvetica,sans-serif;padding:0}
    .zee-input::placeholder{color:#7a8798}
    .zee-send{width:40px;height:40px;border:0;border-radius:50%;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer}
    .zee-send:hover{filter:brightness(1.05)}
    @media(max-width:600px){#zee-bot-root{right:12px;bottom:84px}.zee-bot-stage{width:calc(100vw - 24px);height:250px;margin-bottom:-4px}.zee-robot{width:250px;height:250px}#zee-bot-input-wrap{width:calc(100vw - 24px);height:50px}.zee-input{height:38px;line-height:38px}}
    @media(prefers-reduced-motion:reduce){.zee-robot,.zee-robot-core,.zee-robot-eye,.zee-robot-orbit{animation:none}}
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
      <form id="zee-bot-input-wrap" aria-label="Ask ZEE">
        <input class="zee-input" type="text" autocomplete="off" placeholder="Ask ZEE about ABZEMO..." aria-label="Type your question for ZEE Bot"/>
        <button class="zee-send" type="submit" aria-label="Send question">➤</button>
      </form>
    </div>
  `;

  document.body.appendChild(root);

  const inputForm = root.querySelector("#zee-bot-input-wrap");
  const input = root.querySelector(".zee-input");

  inputForm.addEventListener("submit", function (event) {
    event.preventDefault();
    input.value = input.value.trim();
  });
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

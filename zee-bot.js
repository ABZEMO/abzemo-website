/* =========================================================
   ABZEMO — ZEE Bot
   AI-powered public website assistant.
   Uses the secure /api/zee-bot backend with Groq.
   The Groq API key never reaches the browser.
   Present on public website pages except abzemo-ai.html.
   ========================================================= */

(function () {
  "use strict";

  if (window.__ABZEMO_ZEE_BOT_LOADED__) return;
  window.__ABZEMO_ZEE_BOT_LOADED__ = true;

  const css = document.createElement("style");
  css.textContent = `
    #zee-bot-root,#zee-bot-root *{box-sizing:border-box}
    #zee-bot-root{position:fixed;right:28px;bottom:28px;z-index:2147483000;font-family:Arial,Helvetica,sans-serif;direction:ltr;text-align:left}
    #zee-bot-launcher-wrap{width:min(390px,calc(100vw - 56px));display:flex;flex-direction:column;align-items:flex-end}
    .zee-bot-stage{width:390px;height:250px;margin-bottom:-8px;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}
    .zee-robot{width:230px;height:230px;display:block;filter:drop-shadow(0 18px 22px rgba(7,26,53,.18));animation:zeeRobotFloat 3.2s ease-in-out infinite}
    .zee-robot-core{transform-origin:150px 170px;animation:zeeRobotPulse 2.4s ease-in-out infinite}
    .zee-robot-eye{animation:zeeRobotBlink 4.5s infinite}
    .zee-robot-orbit{transform-origin:150px 155px;animation:zeeRobotOrbit 5s linear infinite}
    @keyframes zeeRobotFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(-1.5deg)}}
    @keyframes zeeRobotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
    @keyframes zeeRobotBlink{0%,44%,48%,100%{opacity:1}46%{opacity:.12}}
    @keyframes zeeRobotOrbit{to{transform:rotate(360deg)}}
    .zee-chat{width:min(390px,calc(100vw - 56px));max-height:180px;overflow-y:auto;margin-bottom:10px;display:flex;flex-direction:column;gap:7px;scroll-behavior:smooth}
    .zee-msg{max-width:86%;padding:9px 12px;border-radius:14px;font-size:12px;line-height:1.45;box-shadow:0 5px 18px rgba(7,26,53,.08)}
    .zee-msg-user{align-self:flex-end;background:#1264d8;color:#fff;border-bottom-right-radius:5px}
    .zee-msg-bot{align-self:flex-start;background:#fff;color:#17243a;border:1px solid rgba(7,26,53,.08);border-bottom-left-radius:5px}
    .zee-msg-title{display:block;margin-bottom:3px;font-weight:800;color:#071a35}.zee-msg-user .zee-msg-title{color:#fff}
    #zee-bot-launcher{width:min(390px,calc(100vw - 56px));min-height:52px;padding:5px 6px 5px 16px;border:1px solid rgba(18,100,216,.28);border-radius:999px;background:rgba(255,255,255,.98);font-family:Arial,Helvetica,sans-serif;box-shadow:0 14px 38px rgba(7,26,53,.18);display:flex;align-items:center;gap:8px;text-align:left}
    #zee-bot-launcher:focus-within{border-color:rgba(18,100,216,.65);box-shadow:0 16px 42px rgba(18,100,216,.2)}
    .zee-launcher-input{flex:1;min-width:0;height:40px;border:0;outline:0;background:transparent;color:#17243a;font:13px/40px Arial,Helvetica,sans-serif}
    .zee-launcher-input::placeholder{color:#7a8798}
    .zee-launcher-send{width:40px;height:40px;border:0;border-radius:50%;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer}
    @media(max-width:600px){#zee-bot-root{right:12px;bottom:84px}.zee-bot-stage{width:calc(100vw - 24px);height:210px;margin-bottom:-4px}.zee-robot{width:200px;height:200px}.zee-chat{width:calc(100vw - 24px);max-height:150px}#zee-bot-launcher{width:calc(100vw - 24px);min-height:50px}}
    @media(prefers-reduced-motion:reduce){.zee-robot,.zee-robot-core,.zee-robot-eye,.zee-robot-orbit{animation:none}}
  `;
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "zee-bot-root";
  root.innerHTML = `
    <div id="zee-bot-launcher-wrap">
      <div class="zee-bot-stage" aria-hidden="true">
        <svg class="zee-robot" viewBox="0 0 300 300" role="img" aria-label="ZEE Bot">
          <g class="zee-robot-orbit" fill="none" stroke="#168cff" stroke-width="2" opacity=".55"><ellipse cx="150" cy="155" rx="122" ry="42" transform="rotate(-18 150 155)"/><circle cx="272" cy="116" r="5" fill="#1264d8" stroke="none"/></g>
          <g class="zee-robot-core"><rect x="72" y="90" width="156" height="124" rx="38" fill="#071a35"/><rect x="84" y="102" width="132" height="96" rx="30" fill="#f7f9fc"/><rect x="105" y="128" width="90" height="45" rx="18" fill="#071a35"/><circle class="zee-robot-eye" cx="128" cy="150" r="7" fill="#168cff"/><circle class="zee-robot-eye" cx="172" cy="150" r="7" fill="#168cff"/><path d="M132 181 Q150 193 168 181" fill="none" stroke="#1264d8" stroke-width="5" stroke-linecap="round"/><rect x="139" y="67" width="22" height="27" rx="11" fill="#071a35"/><circle cx="150" cy="60" r="8" fill="#168cff"/><circle cx="66" cy="148" r="15" fill="#1264d8" opacity=".9"/><circle cx="234" cy="148" r="15" fill="#1264d8" opacity=".9"/><path d="M88 218 Q150 242 212 218" fill="none" stroke="#1264d8" stroke-width="5" stroke-linecap="round"/></g>
        </svg>
      </div>
      <div class="zee-chat" aria-live="polite"></div>
      <form id="zee-bot-launcher" autocomplete="off">
        <input class="zee-launcher-input" type="text" aria-label="Ask ZEE about ABZEMO" placeholder="Write your question here..." />
        <button class="zee-launcher-send" type="submit" aria-label="Send message">➤</button>
      </form>
    </div>
  `;

  document.body.appendChild(root);
  const form = root.querySelector("#zee-bot-launcher");
  const input = root.querySelector(".zee-launcher-input");
  const chat = root.querySelector(".zee-chat");

  function normalize(text){return text.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();}
  const intentKeywords={about:["what is abzemo","about abzemo","abzemo kya","company","who are you"],solutions:["solutions","what do you offer","services","automation","business solution"],ai:["abzemo ai","what is ai","agentic ai","ai agents"],industries:["industries","which industry","sectors","education","healthcare","pharma","real estate","logistics"],sales:["sales","lead","selling","crm"],languages:["languages","multilingual","arabic","urdu","roman urdu","roman hindi"],contact:["contact","email","whatsapp","online message","reach abzemo"]};
  function findIntent(text){const value=normalize(text);let best=null,score=0;Object.keys(intentKeywords).forEach(function(key){const current=intentKeywords[key].reduce(function(total,phrase){return total+(value.includes(normalize(phrase))?1:0)},0);if(current>score){score=current;best=key;}});return best;}
  function addMessage(type,title,text){const bubble=document.createElement("div");bubble.className="zee-msg zee-msg-"+type;const strong=document.createElement("span");strong.className="zee-msg-title";strong.textContent=title;bubble.appendChild(strong);bubble.appendChild(document.createTextNode(text));chat.appendChild(bubble);chat.scrollTop=chat.scrollHeight;}
  form.addEventListener("submit",function(event){event.preventDefault();const value=input.value.trim();if(!value)return;addMessage("user","You",value);const key=findIntent(value);if(key&&answers[key])addMessage("bot","ZEE",answers[key].text);else addMessage("bot","ZEE","I can help with ABZEMO, our solutions, ABZEMO AI, industries, sales automation, languages, or contact options. Please ask me about one of these areas.");input.value="";input.focus();});
})();

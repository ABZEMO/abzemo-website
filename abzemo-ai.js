/* =========================================================
   ABZEMO AI — GLOBAL WEBSITE AI WIDGET
   Version: 1.0
   Purpose: Global Sales Intelligence / Multilingual AI
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     1. SECURE BACKEND ENDPOINT
     ---------------------------------------------------------
     IMPORTANT:
     Never put an OpenAI API key in this file.
     The website should communicate with your secure backend.
     ========================================================= */

  const ABZEMO_AI_ENDPOINT = "YOUR_SECURE_BACKEND_ENDPOINT";


  /* =========================================================
     2. PREVENT DUPLICATION
     ---------------------------------------------------------
     If the widget already exists on a page, this script
     will use the existing widget instead of creating another.
     ========================================================= */

  if (window.__ABZEMO_AI_WIDGET_LOADED__) {
    return;
  }

  window.__ABZEMO_AI_WIDGET_LOADED__ = true;


  /* =========================================================
     3. AI WIDGET CSS
     ========================================================= */

  if (!document.getElementById("abzemo-ai-global-styles")) {

    const style = document.createElement("style");

    style.id = "abzemo-ai-global-styles";

    style.textContent = `

      /* ================================
         LAUNCHER
         ================================ */

      .abzemo-ai-launcher {
        position: fixed;
        right: 28px;
        bottom: 28px;
        width: 62px;
        height: 62px;
        border: 0;
        border-radius: 50%;
        background: linear-gradient(135deg, #1264d8, #168cff);
        color: #ffffff;
        font-size: 23px;
        font-weight: 700;
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 14px 38px rgba(18,100,216,.32);
        transition:
          transform .25s ease,
          box-shadow .25s ease,
          opacity .25s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, Helvetica, sans-serif;
      }

      .abzemo-ai-launcher:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 18px 45px rgba(18,100,216,.42);
      }

      .abzemo-ai-launcher:active {
        transform: scale(.96);
      }


      /* ================================
         CHAT WINDOW
         ================================ */

      .abzemo-ai-chat {
        position: fixed;
        right: 28px;
        bottom: 105px;
        width: 390px;
        max-width: calc(100vw - 32px);
        height: 570px;
        max-height: calc(100vh - 130px);
        background: #ffffff;
        border: 1px solid rgba(7,26,53,.12);
        border-radius: 22px;
        overflow: hidden;
        z-index: 9999;
        display: none;
        flex-direction: column;
        box-shadow: 0 25px 75px rgba(7,26,53,.25);
        font-family:
          Arial,
          Helvetica,
          sans-serif;
      }

      .abzemo-ai-chat.active {
        display: flex;
        animation: abzemoAiOpen .22s ease-out;
      }

      @keyframes abzemoAiOpen {
        from {
          opacity: 0;
          transform: translateY(12px) scale(.98);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }


      /* ================================
         HEADER
         ================================ */

      .abzemo-ai-header {
        min-height: 74px;
        padding: 14px 16px;
        background:
          linear-gradient(
            135deg,
            #071a35 0%,
            #0c2850 100%
          );
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-shrink: 0;
      }

      .abzemo-ai-brand {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }

      .abzemo-ai-logo {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background:
          linear-gradient(
            135deg,
            #1264d8,
            #168cff
          );
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: .4px;
        flex-shrink: 0;
        box-shadow: 0 8px 22px rgba(22,140,255,.28);
      }

      .abzemo-ai-title {
        font-size: 14px;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: .2px;
      }

      .abzemo-ai-status {
        margin-top: 4px;
        font-size: 10px;
        line-height: 1.3;
        color: rgba(255,255,255,.68);
        letter-spacing: .25px;
      }

      .abzemo-ai-close {
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 10px;
        background: rgba(255,255,255,.08);
        color: #ffffff;
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .2s ease;
        flex-shrink: 0;
      }

      .abzemo-ai-close:hover {
        background: rgba(255,255,255,.16);
      }


      /* ================================
         MESSAGE AREA
         ================================ */

      .abzemo-ai-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #f7f9fc;
        scroll-behavior: smooth;
      }

      .abzemo-ai-messages::-webkit-scrollbar {
        width: 6px;
      }

      .abzemo-ai-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .abzemo-ai-messages::-webkit-scrollbar-thumb {
        background: rgba(7,26,53,.16);
        border-radius: 10px;
      }


      /* ================================
         MESSAGE ROW
         ================================ */

      .abzemo-ai-message {
        display: flex;
        width: 100%;
        margin-bottom: 14px;
      }

      .abzemo-ai-message.bot {
        justify-content: flex-start;
      }

      .abzemo-ai-message.user {
        justify-content: flex-end;
      }


      /* ================================
         MESSAGE BUBBLE
         ================================ */

      .abzemo-ai-bubble {
        max-width: 82%;
        padding: 11px 14px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.55;
        word-break: break-word;
        overflow-wrap: anywhere;

        /* Important alignment fix */
        white-space: normal;

        text-align: left;
      }

      .abzemo-ai-message.bot .abzemo-ai-bubble {
        background: #ffffff;
        color: #17243a;
        border: 1px solid rgba(7,26,53,.08);
        border-top-left-radius: 6px;
        box-shadow: 0 5px 18px rgba(7,26,53,.05);
      }

      .abzemo-ai-message.user .abzemo-ai-bubble {
        background:
          linear-gradient(
            135deg,
            #1264d8,
            #168cff
          );
        color: #ffffff;
        border-top-right-radius: 6px;
        box-shadow: 0 7px 18px rgba(18,100,216,.18);
      }


      /* ================================
         TYPING INDICATOR
         ================================ */

      .abzemo-ai-typing {
        display: none;
        margin-bottom: 14px;
      }

      .abzemo-ai-typing.active {
        display: flex;
      }

      .abzemo-ai-typing .abzemo-ai-bubble {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 13px 15px;
      }

      .abzemo-ai-typing span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #6c7a90;
        display: block;
        animation: abzemoAiTyping 1.2s infinite ease-in-out;
      }

      .abzemo-ai-typing span:nth-child(2) {
        animation-delay: .15s;
      }

      .abzemo-ai-typing span:nth-child(3) {
        animation-delay: .3s;
      }

      @keyframes abzemoAiTyping {
        0%,
        60%,
        100% {
          transform: translateY(0);
          opacity: .45;
        }

        30% {
          transform: translateY(-3px);
          opacity: 1;
        }
      }


      /* ================================
         INPUT AREA
         ================================ */

      .abzemo-ai-input-area {
        padding: 12px 14px 13px;
        background: #ffffff;
        border-top: 1px solid rgba(7,26,53,.08);
        flex-shrink: 0;
      }

      .abzemo-ai-input-row {
        display: flex;
        align-items: flex-end;
        gap: 9px;
      }

      .abzemo-ai-input {
        flex: 1;
        min-width: 0;
        min-height: 42px;
        max-height: 110px;
        resize: none;
        border: 1px solid rgba(7,26,53,.13);
        border-radius: 13px;
        padding: 11px 12px;
        background: #f8fafc;
        color: #17243a;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        font-size: 13px;
        line-height: 1.45;
        outline: none;
        box-sizing: border-box;
      }

      .abzemo-ai-input::placeholder {
        color: #8a96a8;
      }

      .abzemo-ai-input:focus {
        border-color: rgba(18,100,216,.5);
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(18,100,216,.08);
      }

      .abzemo-ai-send {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 12px;
        background:
          linear-gradient(
            135deg,
            #1264d8,
            #168cff
          );
        color: #ffffff;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
          transform .2s ease,
          opacity .2s ease;
      }

      .abzemo-ai-send:hover {
        transform: translateY(-1px);
      }

      .abzemo-ai-send:disabled {
        opacity: .55;
        cursor: not-allowed;
        transform: none;
      }

      .abzemo-ai-note {
        margin-top: 8px;
        font-size: 9px;
        line-height: 1.3;
        color: #8a96a8;
        text-align: center;
        letter-spacing: .25px;
      }


      /* ================================
         MOBILE
         ================================ */

      @media (max-width: 600px) {

        .abzemo-ai-launcher {
          right: 18px;
          bottom: 18px;
          width: 58px;
          height: 58px;
        }

        .abzemo-ai-chat {
          right: 12px;
          bottom: 88px;
          width: calc(100vw - 24px);
          height: min(570px, calc(100vh - 110px));
          border-radius: 18px;
        }

        .abzemo-ai-messages {
          padding: 16px;
        }

        .abzemo-ai-bubble {
          max-width: 88%;
          font-size: 13px;
        }

        .abzemo-ai-header {
          min-height: 68px;
        }

      }


      /* ================================
         REDUCED MOTION
         ================================ */

      @media (prefers-reduced-motion: reduce) {

        .abzemo-ai-chat.active {
          animation: none;
        }

        .abzemo-ai-typing span {
          animation: none;
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* =========================================================
     4. CREATE WIDGET IF IT DOES NOT ALREADY EXIST
     ========================================================= */

  function createWidget() {

    let launcher = document.getElementById("abzemoAiLauncher");
    let chat = document.getElementById("abzemoAiChat");

    /*
      If current index.html already contains the widget,
      do not create another one.
    */

    if (!launcher && !chat) {

      launcher = document.createElement("button");

      launcher.className = "abzemo-ai-launcher";
      launcher.id = "abzemoAiLauncher";
      launcher.type = "button";
      launcher.setAttribute("aria-label", "Open ABZEMO AI");
      launcher.setAttribute("title", "Talk to ABZEMO AI");
      launcher.textContent = "✦";

      chat = document.createElement("div");

      chat.className = "abzemo-ai-chat";
      chat.id = "abzemoAiChat";
      chat.setAttribute(
        "aria-label",
        "ABZEMO AI Global Sales Agent"
      );

      chat.innerHTML = `

        <div class="abzemo-ai-header">

          <div class="abzemo-ai-brand">

            <div class="abzemo-ai-logo">
              AI
            </div>

            <div>

              <div class="abzemo-ai-title">
                ABZEMO AI
              </div>

              <div class="abzemo-ai-status">
                Global Sales Intelligence
              </div>

            </div>

          </div>

          <button
            class="abzemo-ai-close"
            id="abzemoAiClose"
            type="button"
            aria-label="Close ABZEMO AI"
          >
            ×
          </button>

        </div>


        <div
          class="abzemo-ai-messages"
          id="abzemoAiMessages"
        >

          <div class="abzemo-ai-message bot">

            <div class="abzemo-ai-bubble">
              Welcome to ABZEMO.<br><br>
              I’m the ABZEMO AI Global Sales Agent.
              Tell me about your business or the solution
              you are looking for, and I’ll help you identify
              the right next step.
            </div>

          </div>


          <div
            class="abzemo-ai-typing"
            id="abzemoAiTyping"
          >

            <div class="abzemo-ai-bubble">

              <span></span>
              <span></span>
              <span></span>

            </div>

          </div>

        </div>


        <div class="abzemo-ai-input-area">

          <div class="abzemo-ai-input-row">

            <textarea
              id="abzemoAiInput"
              class="abzemo-ai-input"
              rows="1"
              placeholder="Tell us what you need..."
              aria-label="Message ABZEMO AI"
            ></textarea>

            <button
              id="abzemoAiSend"
              class="abzemo-ai-send"
              type="button"
              aria-label="Send message"
            >
              ➤
            </button>

          </div>

          <div class="abzemo-ai-note">
            ABZEMO AI • Multilingual Business Intelligence
          </div>

        </div>

      `;

      document.body.appendChild(launcher);
      document.body.appendChild(chat);
    }

    return {
      launcher: document.getElementById("abzemoAiLauncher"),
      chat: document.getElementById("abzemoAiChat"),
      close: document.getElementById("abzemoAiClose"),
      send: document.getElementById("abzemoAiSend"),
      input: document.getElementById("abzemoAiInput"),
      messages: document.getElementById("abzemoAiMessages"),
      typing: document.getElementById("abzemoAiTyping")
    };
  }


  /* =========================================================
     5. INITIALIZE
     ========================================================= */

  function initializeAbzemoAI() {

    const elements = createWidget();

    const launcher = elements.launcher;
    const chat = elements.chat;
    const close = elements.close;
    const send = elements.send;
    const input = elements.input;
    const messages = elements.messages;
    const typing = elements.typing;


    if (
      !launcher ||
      !chat ||
      !close ||
      !send ||
      !input ||
      !messages ||
      !typing
    ) {
      return;
    }


    /* =======================================================
       6. OPEN CHAT
       ======================================================= */

    function openAbzemoAI() {

      chat.classList.add("active");

      setTimeout(function () {
        input.focus();
        scrollToBottom();
      }, 80);
    }


    /* =======================================================
       7. CLOSE CHAT
       ======================================================= */

    function closeAbzemoAI() {

      chat.classList.remove("active");

      launcher.focus();
    }


    /* =======================================================
       8. SCROLL
       ======================================================= */

    function scrollToBottom() {

      messages.scrollTop = messages.scrollHeight;
    }


    /* =======================================================
       9. ADD MESSAGE
       ======================================================= */

    function addAbzemoMessage(
      text,
      type
    ) {

      const message = document.createElement("div");

      message.className =
        "abzemo-ai-message " +
        type;

      const bubble =
        document.createElement("div");

      bubble.className =
        "abzemo-ai-bubble";

      /*
        textContent is intentionally used here.

        This prevents unexpected HTML rendering
        from visitor input.
      */

      bubble.textContent = text;

      message.appendChild(bubble);

      messages.insertBefore(
        message,
        typing
      );

      scrollToBottom();
    }


    /* =======================================================
       10. TYPING
       ======================================================= */

    function showAbzemoTyping() {

      typing.classList.add("active");

      scrollToBottom();
    }


    function hideAbzemoTyping() {

      typing.classList.remove("active");
    }


    /* =======================================================
       11. SEND MESSAGE
       ======================================================= */

    async function sendAbzemoMessage() {

      const message =
        input.value.trim();

      if (!message) {
        return;
      }


      /*
        Add visitor message.
      */

      addAbzemoMessage(
        message,
        "user"
      );


      /*
        Clear input.
      */

      input.value = "";

      autoResizeInput();


      /*
        Disable send while processing.
      */

      send.disabled = true;

      showAbzemoTyping();


      /* =====================================================
         BACKEND NOT CONNECTED
         ===================================================== */

      if (
        !ABZEMO_AI_ENDPOINT ||
        ABZEMO_AI_ENDPOINT ===
          "YOUR_SECURE_BACKEND_ENDPOINT"
      ) {

        setTimeout(function () {

          hideAbzemoTyping();

          addAbzemoMessage(
            "ABZEMO AI is currently being connected to its secure intelligence system. Please try again shortly.",
            "bot"
          );

          send.disabled = false;

          input.focus();

        }, 700);

        return;
      }


      /* =====================================================
         SECURE BACKEND REQUEST
         ===================================================== */

      try {

        const response =
          await fetch(
            ABZEMO_AI_ENDPOINT,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                message: message,

                source:
                  "ABZEMO Website",

                agent:
                  "Global Sales Agent",

                page:
                  window.location.href,

                language:
                  navigator.language ||
                  "unknown"

              })
            }
          );


        if (!response.ok) {

          throw new Error(
            "Backend request failed."
          );
        }


        const data =
          await response.json();


        hideAbzemoTyping();


        /*
          Expected backend response:

          {
            "reply": "..."
          }
        */

        if (
          data &&
          typeof data.reply === "string" &&
          data.reply.trim()
        ) {

          addAbzemoMessage(
            data.reply.trim(),
            "bot"
          );

        } else {

          addAbzemoMessage(
            "I’m sorry, but I could not process that request right now. Please try again.",
            "bot"
          );

        }

      } catch (error) {

        console.error(
          "ABZEMO AI error:",
          error
        );

        hideAbzemoTyping();

        addAbzemoMessage(
          "ABZEMO AI is temporarily unavailable. Please try again shortly.",
          "bot"
        );

      } finally {

        send.disabled = false;

        input.focus();

        scrollToBottom();

      }
    }


    /* =======================================================
       12. AUTO RESIZE INPUT
       ======================================================= */

    function autoResizeInput() {

      input.style.height = "auto";

      const newHeight =
        Math.min(
          input.scrollHeight,
          110
        );

      input.style.height =
        newHeight + "px";
    }


    /* =======================================================
       13. EVENT LISTENERS
       ======================================================= */

    launcher.addEventListener(
      "click",
      openAbzemoAI
    );


    close.addEventListener(
      "click",
      closeAbzemoAI
    );


    send.addEventListener(
      "click",
      sendAbzemoMessage
    );


    input.addEventListener(
      "input",
      autoResizeInput
    );


    input.addEventListener(
      "keydown",
      function (event) {

        /*
          Enter = Send
          Shift + Enter = New line
        */

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendAbzemoMessage();

        }

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape" &&
          chat.classList.contains("active")
        ) {

          closeAbzemoAI();

        }

      }
    );


    /*
      Initial textarea sizing.
    */

    autoResizeInput();
  }


  /* =========================================================
     14. START AFTER DOM IS READY
     ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeAbzemoAI
    );

  } else {

    initializeAbzemoAI();

  }

})();

/* =========================================================
   ABZEMO — ZEE Bot
   AI-powered public website assistant.
   Uses the secure /api/zee-bot backend.
   API keys never reach the browser.
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
    .zee-robot-core{transform-origin:150px 220px;animation:zeeRobotPulse 2.6s ease-in-out infinite}
    .zee-robot-eye{animation:zeeRobotBlink 4.5s infinite}
    .zee-robot-orbit{transform-origin:150px 160px;animation:zeeRobotOrbit 7s linear infinite}
    @keyframes zeeRobotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
    @keyframes zeeRobotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
    @keyframes zeeRobotBlink{0%,44%,48%,100%{opacity:1}46%{opacity:.1}}
    @keyframes zeeRobotOrbit{to{transform:rotate(360deg)}}
    .zee-chat{width:min(390px,calc(100vw - 56px));max-height:220px;overflow-y:auto;margin-bottom:10px;display:flex;flex-direction:column;gap:7px;scroll-behavior:smooth}
    .zee-msg{max-width:92%;padding:9px 12px;border-radius:14px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word;box-shadow:0 5px 18px rgba(7,26,53,.08)}
    .zee-msg-user{align-self:flex-end;background:#1264d8;color:#fff;border-bottom-right-radius:5px}
    .zee-msg-bot{align-self:flex-start;background:#fff;color:#17243a;border:1px solid rgba(7,26,53,.08);border-bottom-left-radius:5px}
    .zee-msg-title{display:block;margin-bottom:3px;font-weight:800;color:#071a35}.zee-msg-user .zee-msg-title{color:#fff}
    #zee-bot-launcher{width:min(390px,calc(100vw - 56px));min-height:52px;padding:5px 6px 5px 16px;border:1px solid rgba(18,100,216,.28);border-radius:999px;background:rgba(255,255,255,.98);font-family:Arial,Helvetica,sans-serif;box-shadow:0 14px 38px rgba(7,26,53,.18);display:flex;align-items:center;gap:8px;text-align:left}
    #zee-bot-launcher:focus-within{border-color:rgba(18,100,216,.65);box-shadow:0 16px 42px rgba(18,100,216,.2)}
    .zee-launcher-input{flex:1;min-width:0;height:40px;border:0;outline:0;background:transparent;color:#17243a;font:13px/40px Arial,Helvetica,sans-serif}
    .zee-launcher-input::placeholder{color:#7a8798}
    .zee-launcher-send{width:40px;height:40px;border:0;border-radius:50%;background:linear-gradient(135deg,#1264d8,#168cff);color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer}
    .zee-tools{display:flex;align-items:center;gap:6px;margin-top:7px;width:min(390px,calc(100vw - 56px));justify-content:flex-end;flex-wrap:wrap}
    .zee-language,.zee-keyboard-toggle,.zee-clear{height:30px;border:1px solid rgba(18,100,216,.22);border-radius:15px;background:#fff;color:#17243a;font:11px Arial,sans-serif;padding:0 10px;cursor:pointer;box-shadow:0 5px 15px rgba(7,26,53,.08)}
    .zee-voice,.zee-speaker{width:30px;height:30px;border:1px solid rgba(18,100,216,.22);border-radius:50%;background:#fff;color:#1264d8;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 5px 15px rgba(7,26,53,.08);padding:0}
    .zee-voice.active{background:#1264d8;color:#fff}
    .zee-speaker.off{color:#7d899a;background:#f4f6f9}
    .zee-voice:disabled{opacity:.45;cursor:not-allowed}
    .zee-keyboard{display:none;width:min(390px,calc(100vw - 56px));margin-top:7px;padding:8px;border:1px solid rgba(18,100,216,.18);border-radius:14px;background:#fff;box-shadow:0 12px 28px rgba(7,26,53,.12);direction:ltr}
    .zee-keyboard.open{display:block}
    .zee-keyboard-grid{display:flex;flex-wrap:wrap;gap:5px;max-height:145px;overflow:auto}
    .zee-key{min-width:31px;height:31px;border:1px solid rgba(7,26,53,.1);border-radius:7px;background:#f7f9fc;color:#17243a;font:13px Arial,sans-serif;cursor:pointer}
    .zee-key-wide{padding:0 12px}
    .zee-keyboard-note{font:10px/1.35 Arial,sans-serif;color:#7a8798;margin-bottom:7px}
    @media(max-width:600px){#zee-bot-root{right:12px;bottom:84px}.zee-bot-stage{width:calc(100vw - 24px);height:210px;margin-bottom:-4px}.zee-robot{width:200px;height:200px}.zee-chat{width:calc(100vw - 24px);max-height:170px}#zee-bot-launcher{width:calc(100vw - 24px);min-height:50px}}
    @media(prefers-reduced-motion:reduce){.zee-robot,.zee-robot-core,.zee-robot-eye,.zee-robot-orbit{animation:none}}
  `;
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "zee-bot-root";
  root.innerHTML = `
    <div id="zee-bot-launcher-wrap">
      <div class="zee-bot-stage" aria-hidden="true">
        <svg class="zee-robot" viewBox="0 0 300 300" role="img" aria-label="ZEE Bot">
          <g class="zee-robot-orbit" fill="none" stroke="#168cff" stroke-width="2" opacity=".45"><ellipse cx="150" cy="165" rx="130" ry="46" transform="rotate(-16 150 165)"/><circle cx="278" cy="122" r="5" fill="#1264d8" stroke="none"/></g>
          <g class="zee-robot-core">
            <!-- back hair -->
            <path d="M80 140 C70 70 110 40 150 40 C190 40 230 70 220 140 L224 196 C224 206 210 206 206 196 L202 160 L98 160 L94 196 C90 206 76 206 76 196 Z" fill="#0b2a5b"/>
            <!-- hair bun and band -->
            <circle cx="150" cy="38" r="17" fill="#0b2a5b"/>
            <circle cx="150" cy="38" r="7" fill="#168cff"/>
            <!-- neck -->
            <rect x="136" y="188" width="28" height="22" rx="8" fill="#f3d9cc"/>
            <!-- body -->
            <path d="M88 280 C88 224 116 208 150 208 C184 208 212 224 212 280 Z" fill="#1264d8"/>
            <path d="M124 210 Q150 232 176 210" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
            <circle cx="150" cy="252" r="13" fill="#ffffff"/>
            <text x="150" y="258" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="900" fill="#1264d8">Z</text>
            <!-- face -->
            <ellipse cx="150" cy="140" rx="58" ry="54" fill="#fbe6da"/>
            <!-- fringe -->
            <path d="M90 130 C92 84 120 76 150 76 C180 76 208 84 210 130 C190 112 170 98 150 98 C130 98 110 112 90 130 Z" fill="#0b2a5b"/>
            <!-- headset -->
            <circle cx="90" cy="146" r="11" fill="#1264d8"/>
            <circle cx="210" cy="146" r="11" fill="#1264d8"/>
            <path d="M90 157 Q92 180 122 182" fill="none" stroke="#071a35" stroke-width="3" stroke-linecap="round"/>
            <circle cx="125" cy="182" r="4.5" fill="#168cff"/>
            <!-- eyes -->
            <ellipse class="zee-robot-eye" cx="130" cy="142" rx="7" ry="9" fill="#071a35"/>
            <ellipse class="zee-robot-eye" cx="170" cy="142" rx="7" ry="9" fill="#071a35"/>
            <circle cx="132.5" cy="138.5" r="2.6" fill="#ffffff"/>
            <circle cx="172.5" cy="138.5" r="2.6" fill="#ffffff"/>
            <path d="M120 130 Q130 124 140 130 M160 130 Q170 124 180 130" fill="none" stroke="#071a35" stroke-width="2.4" stroke-linecap="round"/>
            <!-- cheeks and smile -->
            <circle cx="116" cy="160" r="7" fill="#ff9db8" opacity=".5"/>
            <circle cx="184" cy="160" r="7" fill="#ff9db8" opacity=".5"/>
            <path d="M136 164 Q150 176 164 164" fill="none" stroke="#c2506f" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
      <div class="zee-chat" aria-live="polite"></div>
      <form id="zee-bot-launcher" autocomplete="off">
        <input class="zee-launcher-input" type="text" aria-label="Ask ZEE" placeholder="Write your question here..." />
        <button class="zee-launcher-send" type="submit" aria-label="Send message">➤</button>
      </form>
      <div class="zee-tools">
        <button type="button" class="zee-voice" aria-label="Voice input" title="Speak your question">🎙</button>
        <button type="button" class="zee-speaker" aria-label="Mute ZEE voice" title="ZEE voice replies on">🔊</button>
        <select class="zee-language" aria-label="Choose typing language">
          <option value="en">English</option><option value="ur">Urdu</option><option value="ar">Arabic</option><option value="hi">Hindi</option><option value="bn">Bengali</option><option value="pa">Punjabi</option><option value="sd">Sindhi</option><option value="ps">Pashto</option><option value="fa">Persian</option><option value="he">Hebrew</option><option value="ru">Russian</option><option value="uk">Ukrainian</option><option value="el">Greek</option><option value="hy">Armenian</option><option value="ka">Georgian</option><option value="zh">Chinese</option><option value="ja">Japanese</option><option value="ko">Korean</option><option value="th">Thai</option><option value="vi">Vietnamese</option><option value="tr">Turkish</option><option value="az">Azerbaijani</option><option value="kk">Kazakh</option><option value="uz">Uzbek</option><option value="pl">Polish</option><option value="cs">Czech</option><option value="sk">Slovak</option><option value="hu">Hungarian</option><option value="ro">Romanian</option><option value="bg">Bulgarian</option><option value="sr">Serbian</option><option value="hr">Croatian</option><option value="sl">Slovenian</option><option value="sq">Albanian</option><option value="it">Italian</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="fr">French</option><option value="de">German</option><option value="nl">Dutch</option><option value="da">Danish</option><option value="sv">Swedish</option><option value="no">Norwegian</option><option value="fi">Finnish</option><option value="is">Icelandic</option><option value="ga">Irish</option><option value="cy">Welsh</option><option value="id">Indonesian</option><option value="ms">Malay</option><option value="fil">Filipino</option><option value="sw">Swahili</option><option value="af">Afrikaans</option><option value="am">Amharic</option><option value="so">Somali</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="kn">Kannada</option><option value="ml">Malayalam</option><option value="mr">Marathi</option><option value="gu">Gujarati</option><option value="ne">Nepali</option><option value="si">Sinhala</option>
        </select>
        <button type="button" class="zee-keyboard-toggle" aria-expanded="false">Keyboard</button>
        <button type="button" class="zee-clear" aria-label="Clear chat">Clear</button>
      </div>
      <div class="zee-keyboard" aria-hidden="true">
        <div class="zee-keyboard-note">Choose a language above. Latin-script languages use the standard keyboard; script-specific characters appear here.</div>
        <div class="zee-keyboard-grid"></div>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  const form = root.querySelector("#zee-bot-launcher");
  const input = root.querySelector(".zee-launcher-input");
  const chat = root.querySelector(".zee-chat");
  const language = root.querySelector(".zee-language");
  const keyboardToggle = root.querySelector(".zee-keyboard-toggle");
  const keyboard = root.querySelector(".zee-keyboard");
  const keyboardGrid = root.querySelector(".zee-keyboard-grid");
  const voiceBtn = root.querySelector(".zee-voice");
  const speakerBtn = root.querySelector(".zee-speaker");
  const clearBtn = root.querySelector(".zee-clear");

  const keyboardChars = {
    ur: "ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ ر ڑ ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن ں و ہ ھ ء ی ے".split(" "),
    ar: "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ء أ إ آ ة ى".split(" "),
    hi: "अ आ इ ई उ ऊ ए ऐ ओ औ अं अः क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह".split(" "),
    bn: "অ আ ই ঈ উ ঊ এ ঐ ও ঔ ক খ গ ঘ ঙ চ ছ জ ঝ ট ঠ ড ঢ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ".split(" "),
    pa: "ਅ ਆ ਇ ਈ ਉ ਊ ਏ ਐ ਓ ਔ ਕ ਖ ਗ ਘ ਙ ਚ ਛ ਜ ਝ ਟ ਠ ਡ ਢ ਣ ਤ ਥ ਦ ਧ ਨ ਪ ਫ ਬ ਭ ਮ ਯ ਰ ਲ ਵ ਸ ਹ".split(" "),
    sd: "ا ب ٻ پ ت ٽ ث ج ڄ چ ح خ د ڌ ڊ ذ ر ڙ ز ژ س ش ص ض ط ظ ع غ ف ق ڪ ک گ ڱ ل م ن ڻ و ه ء ي ے".split(" "),
    ps: "ا ب پ ت ټ ث ج ځ چ څ ح خ د ډ ذ ر ړ ز ژ س ش ښ ص ض ط ظ ع غ ف ق ک ګ ل م ن ڼ و ه ی ې".split(" "),
    fa: "ا ب پ ت ث ج چ ح خ د ذ ر ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ه ی".split(" "),
    he: "א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת".split(" "),
    ru: "й ц у к е н г ш щ з х ъ ф ы в а п р о л д ж э я ч с м и т ь б ю".split(" "),
    uk: "й ц у к е н г ш щ з х ї ф і в а п р о л д ж є я ч с м и т ь б ю ґ".split(" "),
    el: "α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω".split(" "),
    hy: "ա բ գ դ ե զ է ը թ ժ ի լ խ ծ կ հ ձ ղ ճ մ յ ն շ ո չ պ ջ ռ ս վ տ ր ց ու փ ք".split(" "),
    ka: "ა ბ გ დ ე ვ ზ თ ი კ ლ მ ნ ო პ ჟ რ ს ტ უ ფ ქ ღ ყ შ ჩ ც ძ წ ჭ ხ ჯ ჰ".split(" "),
    am: "ሀ ሁ ሂ ሃ ሄ ህ ሆ ለ ሉ ሊ ላ ሌ ል ሎ መ ሙ ሚ ማ ሜ ም ሞ ረ ሩ ሪ ራ ሬ ር ሮ".split(" "),
    ta: "அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ க ங ச ஜ ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன".split(" "),
    te: "అ ఆ ఇ ఈ ఉ ఊ ఎ ఏ ఐ ఒ ఓ ఔ క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ".split(" "),
    kn: "ಅ ಆ ಇ ಈ ಉ ಊ ಎ ಏ ಐ ಒ ಓ ಔ ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ ಟ ಠ ಡ ಢ ಣ ತ ಥ ದ ಧ ನ ಪ ಫ ಬ ಭ ಮ ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ".split(" "),
    ml: "അ ആ ഇ ഈ ഉ ഊ എ ഏ ഐ ഒ ഓ ഔ ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ഞ ട ഠ ഡ ഢ ണ ത ഥ ദ ധ ന പ ഫ ബ ഭ മ യ ര ല വ ശ ഷ സ ഹ".split(" "),
    mr: "अ आ इ ई उ ऊ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह ळ".split(" "),
    gu: "અ આ ઇ ઈ ઉ ઊ એ ઐ ઓ ઔ ક ખ ગ ઘ ઙ ચ છ જ ઝ ટ ઠ ડ ઢ ત થ દ ધ ન પ ફ બ ભ મ ય ર લ વ શ ષ સ હ".split(" "),
    ne: "अ आ इ ई उ ऊ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह".split(" "),
    si: "අ ආ ඇ ඈ ඉ ඊ උ ඌ එ ඒ ඓ ඔ ඕ ඖ ක ග ච ජ ට ඩ ත ද න ප බ ම ය ර ල ව ස හ".split(" "),
    th: "ก ข ค ง จ ฉ ช ซ ญ ด ต ถ ท น บ ป ผ ฝ พ ฟ ม ย ร ล ว ศ ษ ส ห อ".split(" ")
  };

  const langTags = {
    en: "en-US", ur: "ur-PK", ar: "ar-SA", hi: "hi-IN", bn: "bn-BD", pa: "pa-IN", fa: "fa-IR", he: "he-IL",
    ru: "ru-RU", uk: "uk-UA", el: "el-GR", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", th: "th-TH", vi: "vi-VN",
    tr: "tr-TR", pl: "pl-PL", cs: "cs-CZ", sk: "sk-SK", hu: "hu-HU", ro: "ro-RO", bg: "bg-BG", sr: "sr-RS",
    hr: "hr-HR", it: "it-IT", es: "es-ES", pt: "pt-PT", fr: "fr-FR", de: "de-DE", nl: "nl-NL", da: "da-DK",
    sv: "sv-SE", no: "nb-NO", fi: "fi-FI", id: "id-ID", ms: "ms-MY", fil: "fil-PH", sw: "sw-KE", af: "af-ZA",
    ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", mr: "mr-IN", gu: "gu-IN", ne: "ne-NP", si: "si-LK"
  };

  function langTag() {
    return langTags[language.value] || language.value || "en-US";
  }

  function renderKeyboard(){
    const chars=keyboardChars[language.value] || "q w e r t y u i o p a s d f g h j k l z x c v b n m".split(" ");
    keyboardGrid.innerHTML="";
    chars.forEach(char=>{
      const key=document.createElement("button");
      key.type="button";
      key.className="zee-key";
      key.textContent=char;
      key.addEventListener("click",()=>{
        const start=input.selectionStart ?? input.value.length;
        const end=input.selectionEnd ?? input.value.length;
        input.value=input.value.slice(0,start)+char+input.value.slice(end);
        input.focus();
        input.setSelectionRange(start+char.length,start+char.length);
      });
      keyboardGrid.appendChild(key);
    });
    [["Space"," "],["Backspace","BACKSPACE"]].forEach(([label,value])=>{
      const key=document.createElement("button");
      key.type="button"; key.className="zee-key zee-key-wide"; key.textContent=label;
      key.addEventListener("click",()=>{
        if(value===" "){input.value=input.value+" ";input.focus();return;}
        const pos=input.selectionStart ?? input.value.length;
        if(pos>0){input.value=input.value.slice(0,pos-1)+input.value.slice(pos);input.focus();input.setSelectionRange(pos-1,pos-1);}
      });
      keyboardGrid.appendChild(key);
    });
  }

  language.addEventListener("change",function(){
    input.lang=language.value;
    input.dir=["ar","ur","fa","he","ps","sd"].includes(language.value)?"rtl":"ltr";
    renderKeyboard();
  });
  keyboardToggle.addEventListener("click",function(){
    const open=keyboard.classList.toggle("open");
    keyboard.setAttribute("aria-hidden",String(!open));
    keyboardToggle.setAttribute("aria-expanded",String(open));
    if(open) renderKeyboard();
  });
  input.lang=language.value;

  /* ---------- Voice replies (only when the visitor spoke) ---------- */
  const speakerKey = "abzemo_zee_voice_replies";
  let speakerOn = localStorage.getItem(speakerKey) !== "false";

  function updateSpeaker() {
    speakerBtn.classList.toggle("off", !speakerOn);
    speakerBtn.textContent = speakerOn ? "🔊" : "🔇";
    const label = speakerOn ? "Mute ZEE voice replies" : "Turn on ZEE voice replies";
    speakerBtn.setAttribute("aria-label", label);
    speakerBtn.title = label;
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  var FEMALE_HINT = /female|woman|zira|samantha|susan|hazel|heera|aria|jenny|salma|zariyah|karen|moira|tessa|victoria|fiona|joanna|catherine|linda|sara|natasha|libby|sonia|ayesha|asma|uzma|swara|neerja|kalpana|amelie|alice|elsa|helena|katja|paulina|laura|monica/i;

  function pickVoice(tag) {
    if (!("speechSynthesis" in window)) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var base = tag.slice(0, 2).toLowerCase();
    var pool = voices.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(base) === 0; });
    if (!pool.length) return null;
    var exact = pool.filter(function (v) { return (v.lang || "").toLowerCase() === tag.toLowerCase(); });
    var scoped = exact.length ? exact : pool;
    return scoped.find(function (v) { return FEMALE_HINT.test(v.name); }) || scoped[0];
  }

  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    stopSpeaking();
    var clean = String(text).replace(/[*#`_>]/g, "").replace(/\s+/g, " ").trim().slice(0, 1200);
    if (!clean) return;
    var u = new SpeechSynthesisUtterance(clean);
    var tag = langTag();
    u.lang = tag;
    var voice = pickVoice(tag);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1.12;
    window.speechSynthesis.speak(u);
  }

  speakerBtn.addEventListener("click", function () {
    speakerOn = !speakerOn;
    localStorage.setItem(speakerKey, String(speakerOn));
    if (!speakerOn) stopSpeaking();
    updateSpeaker();
  });
  updateSpeaker();

  /* ---------- Mic (visitor speaks) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;
  let lastWasVoice = false;

  if (!SR) {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice input is not supported in this browser";
  } else {
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      listening = true;
      voiceBtn.classList.add("active");
      voiceBtn.textContent = "■";
    };

    recognition.onresult = function (event) {
      let transcript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      input.value = transcript.trim();
      if (isFinal && input.value) {
        lastWasVoice = true;
        if (form.requestSubmit) form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    };

    recognition.onerror = function () {
      listening = false;
      voiceBtn.classList.remove("active");
      voiceBtn.textContent = "🎙";
    };

    recognition.onend = function () {
      listening = false;
      voiceBtn.classList.remove("active");
      voiceBtn.textContent = "🎙";
    };

    voiceBtn.addEventListener("click", function () {
      if (listening) { recognition.stop(); return; }
      stopSpeaking();
      recognition.lang = langTag();
      try { recognition.start(); } catch (e) {}
    });
  }

  /* ---------- Chat ---------- */
  const conversation = [];

  function addMessage(type,title,text){
    const bubble=document.createElement("div");
    bubble.className="zee-msg zee-msg-"+type;
    const strong=document.createElement("span");
    strong.className="zee-msg-title";
    strong.textContent=title;
    bubble.appendChild(strong);
    bubble.appendChild(document.createTextNode(text));
    chat.appendChild(bubble);
    chat.scrollTop=chat.scrollHeight;
  }

  async function askZee(message, viaVoice){
    conversation.push({role:"user",content:message});
    try{
      const response=await fetch("/api/zee-bot",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:conversation.slice(-12)})
      });
      let data={};
      try{data=await response.json();}catch(_error){}
      if(!response.ok || !data.reply) throw new Error(data.error || "ZEE Bot request failed.");
      conversation.push({role:"assistant",content:data.reply});
      addMessage("bot","ZEE",data.reply);
      if (viaVoice && speakerOn) speak(data.reply);
    }catch(error){
      console.error("ZEE Bot error:",error);
      conversation.pop();
      addMessage("bot","ZEE","I'm having trouble connecting right now. Please try again in a moment or contact info@abzemo.com.");
    }finally{
      input.disabled=false;
      input.focus();
    }
  }

  clearBtn.addEventListener("click", function () {
    stopSpeaking();
    conversation.length = 0;
    chat.innerHTML = "";
    input.value = "";
    input.disabled = false;
    input.focus();
  });

  form.addEventListener("submit",function(event){
    event.preventDefault();
    const value=input.value.trim();
    if(!value || input.disabled)return;
    const viaVoice = lastWasVoice;
    lastWasVoice = false;
    addMessage("user","You",value);
    input.value="";
    input.disabled=true;
    askZee(value, viaVoice);
  });
})();

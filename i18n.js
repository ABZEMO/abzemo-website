/* ABZEMO GLOBAL INTERNATIONALIZATION — reliable country/language detection */
(function () {
  "use strict";
  const STORAGE_KEY="abzemo_site_language", RTL=new Set(["ar","ur","fa","he"]);
  const LANGUAGES=[
    ["en","English"],["ar","العربية"],["ur","اردو"],["fr","Français"],["es","Español"],
    ["de","Deutsch"],["it","Italiano"],["pt","Português"],["tr","Türkçe"],["ru","Русский"],
    ["zh","中文"],["ja","日本語"],["ko","한국어"],["fa","فارسی"],["hi","हिन्दी"],["bn","বাংলা"],
    ["nl","Nederlands"],["pl","Polski"],["sv","Svenska"],["id","Bahasa Indonesia"],["ms","Bahasa Melayu"],
    ["th","ไทย"],["vi","Tiếng Việt"],["he","עברית"],["uk","Українська"],["ro","Română"],
    ["el","Ελληνικά"],["cs","Čeština"],["da","Dansk"],["fi","Suomi"],["no","Norsk"],["hu","Magyar"]
  ];
  const protectedText=new Set(["ABZEMO","ABZEMO AI","ABZEMO Medical","ABZEMO Trade","ABZEMO Fashions","ABZEMO Real Estate","ABZEMO Logistics","ABZEMO Finance","ABZEMO Smart Schooling","Building What's Next."]);
  let current=localStorage.getItem(STORAGE_KEY)||"en";
  if(!LANGUAGES.some(x=>x[0]===current)) current="en";
  const original=new Map(); let translating=false;

  function injectStyles(){
    if(document.getElementById("abzemo-i18n-styles")) return;
    const s=document.createElement("style"); s.id="abzemo-i18n-styles";
    s.textContent=`
      .abzemo-language-control{position:absolute;right:54px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:7px;height:40px;padding:0 10px;border:1px solid var(--line,#dce5f0);border-radius:999px;background:#fff;white-space:nowrap;font-size:12px;color:var(--navy,#071a35);z-index:1002}
      .abzemo-globe{font-size:12px;color:var(--blue,#1264d8)} .abzemo-country{font-weight:700}.abzemo-divider{color:#b4bfcc}
      .abzemo-language-control select{border:0;outline:0;background:transparent;color:var(--navy,#071a35);font-size:12px;font-weight:700;cursor:pointer;max-width:105px}
      html[dir="rtl"] .abzemo-language-control{direction:ltr}
      html[dir="rtl"] .mega-menu{left:auto;right:0;transform:translateX(105%)} html[dir="rtl"] .mega-menu.active{transform:translateX(0)}
      html[dir="rtl"] .mega-section{text-align:right} html[dir="rtl"] .hero-text,html[dir="rtl"] .section-header,html[dir="rtl"] .section,html[dir="rtl"] footer{text-align:right}
      @media(max-width:980px){.abzemo-language-control{right:52px;height:36px}.navbar{position:relative}}
      @media(max-width:640px){.abzemo-language-control{right:50px;padding:0 7px;gap:4px}.abzemo-country{display:none}.abzemo-language-control select{max-width:82px}}
    `;
    document.head.appendChild(s);
  }

  function translatable(el){return el&&!el.closest("script,style,noscript,svg,code,pre,[data-no-translate]")&&!el.matches("input,textarea,select,option");}
  function snapshot(){
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
    while(n=w.nextNode()){if(!translatable(n.parentElement))continue;const t=n.nodeValue.trim();if(t.length>=2&&!protectedText.has(t))original.set(n,n.nodeValue);}
  }
  function setDirection(lang){document.documentElement.lang=lang;document.documentElement.dir=RTL.has(lang)?"rtl":"ltr";}
  async function region(){
    try{
      const r=await fetch("/api/geo",{cache:"no-store"});
      if(r.ok){
        const d=await r.json();
        if(d.countryCode){
          try{return new Intl.DisplayNames(["en"],{type:"region"}).of(d.countryCode)||d.countryCode}catch(_){return d.countryCode}
        }
      }
    }catch(_){}
    try{
      const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
      if(tz==="Asia/Karachi")return"Pakistan";
      const r=new Intl.Locale(navigator.language||"en").region;
      if(!r)return"Global";
      try{return new Intl.DisplayNames(["en"],{type:"region"}).of(r)||r}catch(_){return r}
    }catch(_){return"Global"}
  }
  function buildSelector(){
    if(document.getElementById("abzemoLanguageControl"))return;
    const nav=document.querySelector(".navbar"); if(!nav)return;
    const wrap=document.createElement("div");wrap.id="abzemoLanguageControl";wrap.className="abzemo-language-control";
    wrap.innerHTML='<span class="abzemo-globe" aria-hidden="true">◎</span><span class="abzemo-country" id="abzemoCountryLabel">Global</span><span class="abzemo-divider">|</span><select id="abzemoLanguageSelect" aria-label="Website language"></select>';
    const select=wrap.querySelector("select");
    LANGUAGES.forEach(([code,label])=>{const o=document.createElement("option");o.value=code;o.textContent=code.toUpperCase();o.title=label;o.selected=code===current;select.appendChild(o)});
    select.addEventListener("change",()=>setLanguage(select.value));nav.appendChild(wrap);

    function positionBetweenContactAndSearch(){
      if(window.innerWidth<=980)return;
      const contact=[...nav.querySelectorAll("a")].find(a=>a.textContent.trim().toLowerCase()==="contact");
      const search=document.querySelector(".abzemo-search-trigger");
      if(!contact||!search)return;
      const nr=nav.getBoundingClientRect(), cr=contact.getBoundingClientRect(), sr=search.getBoundingClientRect();
      const midpoint=((cr.right+sr.left)/2)-nr.left;
      wrap.style.left=(midpoint-(wrap.offsetWidth/2))+"px";
      wrap.style.right="auto";
    }
    requestAnimationFrame(positionBetweenContactAndSearch);
    window.addEventListener("resize",positionBetweenContactAndSearch);

    const c=document.getElementById("abzemoCountryLabel");
    if(c)region().then(name=>{c.textContent=name||"Global"});
  }
  function restore(){original.forEach((v,n)=>{if(n&&n.parentNode)n.nodeValue=v})}
  async function translatePage(lang){
    if(lang==="en"){restore();return} if(translating)return; snapshot();
    const nodes=[...original.keys()].filter(n=>n&&n.parentNode), unique=[...new Set(nodes.map(n=>original.get(n).trim()).filter(Boolean))];
    if(!unique.length)return; translating=true;
    try{
      const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target_language:lang,texts:unique.slice(0,160)})});
      if(!r.ok)throw new Error("translation unavailable"); const data=await r.json();
      const map=new Map((data.translations||[]).map(x=>[x.source,x.translation]));
      nodes.forEach(n=>{const source=original.get(n),key=source.trim();if(map.has(key)){const lead=source.match(/^\s*/)?.[0]||"",trail=source.match(/\s*$/)?.[0]||"";n.nodeValue=lead+map.get(key)+trail}});
    }catch(e){console.warn("ABZEMO translation:",e)}finally{translating=false}
  }
  async function setLanguage(lang){
    if(!LANGUAGES.some(x=>x[0]===lang))lang="en";current=lang;localStorage.setItem(STORAGE_KEY,lang);setDirection(lang);
    const select=document.getElementById("abzemoLanguageSelect");if(select)select.value=lang;await translatePage(lang);
    window.dispatchEvent(new CustomEvent("abzemo:languagechange",{detail:{language:lang}}));
  }
  function init(){injectStyles();snapshot();setDirection(current);buildSelector();if(current!=="en")translatePage(current)}
  window.ABZEMO_I18N={languages:LANGUAGES,getLanguage:()=>current,setLanguage};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
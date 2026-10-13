/* ABZEMO GLOBAL INTERNATIONALIZATION — reliable country/language detection */
(function () {
  "use strict";
  const STORAGE_KEY="abzemo_site_language", CACHE_PREFIX="abzemo_tr2_", RTL=new Set(["ar","ur","fa","he"]);
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
      .abzemo-language-control{position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:7px;height:40px;padding:0 10px;border:1px solid var(--line,#dce5f0);border-radius:999px;background:#fff;white-space:nowrap;font-size:12px;color:var(--navy,#071a35);z-index:1002}
      .abzemo-globe{font-size:12px;color:var(--blue,#1264d8)} .abzemo-country{font-weight:700}.abzemo-divider{color:#b4bfcc}
      .abzemo-language-control select{border:0;outline:0;background:transparent;color:var(--navy,#071a35);font-size:12px;font-weight:700;cursor:pointer;max-width:105px}
      html[dir="rtl"] .abzemo-language-control{direction:ltr}
      html[dir="rtl"] .mega-menu{left:auto;right:0;transform:translateX(105%)} html[dir="rtl"] .mega-menu.active{transform:translateX(0)}
      html[dir="rtl"] .mega-section{text-align:right} html[dir="rtl"] .hero-text,html[dir="rtl"] .section-header,html[dir="rtl"] .section,html[dir="rtl"] footer{text-align:right}
      @media(max-width:980px){.abzemo-language-control{right:52px;height:36px}.navbar{position:relative}}
      @media(max-width:640px){.abzemo-language-control{right:50px;padding:0 7px;gap:4px}.abzemo-country{display:none}.abzemo-language-control select{max-width:82px}}
      /* MOBILE RESPONSIVE LAYOUT — mobile only; desktop remains unchanged */
      @media(max-width:600px){
        html,body{max-width:100%;overflow-x:hidden}
        .site-header{height:70px}
        .navbar{height:70px!important;min-height:70px!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:0 14px!important}
        .header-left{min-width:0!important;max-width:calc(100% - 96px)!important;display:flex!important;align-items:center!important;gap:5px!important;overflow:hidden!important}
        .menu-button,.menu-toggle{flex:0 0 42px!important;width:42px!important;height:42px!important}
        .brand{min-width:0!important;width:auto!important;max-width:calc(100% - 48px)!important;height:48px!important;gap:1px!important;overflow:hidden!important}
        .brand img{width:92px!important;max-width:92px!important;max-height:44px!important;object-fit:contain!important}
        .brand-name{font-size:24px!important;letter-spacing:-1.3px!important;margin-left:-6px!important}
        .abzemo-search-trigger{right:0!important;left:auto!important;width:40px!important;height:40px!important;z-index:1003!important}
        .abzemo-language-control{right:48px!important;left:auto!important;width:42px!important;height:36px!important;padding:0!important;gap:0!important;justify-content:center!important;z-index:1002!important}
        .abzemo-country,.abzemo-globe,.abzemo-divider{display:none!important}
        .abzemo-language-control select{width:38px!important;max-width:38px!important;padding:0!important;text-align:center!important;font-size:12px!important}
        .container{width:calc(100% - 28px)!important;max-width:100%!important}
        .hero,.page-hero{padding-top:120px!important;padding-bottom:70px!important}
        .hero h1,.page-hero h1{font-size:42px!important;line-height:1.02!important;letter-spacing:-.04em!important}
        .hero p,.page-hero p{font-size:16px!important;line-height:1.7!important}
        .hero-actions{flex-direction:column!important;align-items:stretch!important}
        .hero-actions .btn,.hero-actions a{width:100%!important}
        .two-column,.three-column,.four-column,.card-grid{grid-template-columns:1fr!important}
        .section{padding:70px 0!important}
        .section h2{font-size:40px!important;line-height:1.05!important}
        .section-header{max-width:100%!important;margin-bottom:34px!important}
        .card,.feature-card,.venture-card,.ai-demo{padding:24px!important}
        .cta-inner{flex-direction:column!important;align-items:stretch!important}
        .cta-section .btn{width:100%!important}
        .footer-grid{grid-template-columns:1fr!important;gap:30px!important}
        .footer-links{display:grid!important;grid-template-columns:1fr 1fr!important;gap:24px!important}
        img,video,svg{max-width:100%;height:auto}
        table{display:block!important;width:100%!important;overflow-x:auto!important}
        pre,code{max-width:100%!important;overflow-x:auto!important}
      }
          `;
    document.head.appendChild(s);
  }

  function translatable(el){return el&&!el.closest("script,style,noscript,svg,code,pre,[data-no-translate]")&&!el.matches("input,textarea,select,option");}
  function snapshot(){
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
    while(n=w.nextNode()){if(original.has(n)||!translatable(n.parentElement))continue;const t=n.nodeValue.trim();if(t.length>=2&&!protectedText.has(t))original.set(n,n.nodeValue);}
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

    positionSelector();
    const c=document.getElementById("abzemoCountryLabel");
    if(c)region().then(name=>{c.textContent=name||"Global";positionSelector()});
  }
  function positionSelector(){
    const wrap=document.getElementById("abzemoLanguageControl"),nav=document.querySelector(".navbar"),contact=[...document.querySelectorAll(".nav-links a")].find(a=>/contact/i.test(a.getAttribute("href")||"")),search=document.querySelector(".abzemo-search-trigger");
    if(!wrap||!nav||!contact||!search||window.innerWidth<=980){if(wrap&&window.innerWidth<=980){wrap.style.left="auto";wrap.style.right="52px"}return}
    const rtl=document.documentElement.dir==="rtl",nr=nav.getBoundingClientRect(),cr=contact.getBoundingClientRect(),sr=search.getBoundingClientRect(),gap=12;
    const a=rtl?sr.right+gap-nr.left:cr.right+gap-nr.left,b=rtl?cr.left-gap-wrap.offsetWidth-nr.left:sr.left-gap-wrap.offsetWidth-nr.left;
    wrap.style.left=(b>=a?a+(b-a)/2:Math.max(8,b))+"px";
    wrap.style.right="auto"; wrap.style.transform="translateY(-50%)";
  }
  function restore(){original.forEach((v,n)=>{if(n&&n.parentNode)n.nodeValue=v})}

  function loadCache(lang){try{return JSON.parse(localStorage.getItem(CACHE_PREFIX+lang)||"{}")||{}}catch(_){return{}}}
  function saveCache(lang,c){try{localStorage.setItem(CACHE_PREFIX+lang,JSON.stringify(c))}catch(_){}}
  function applyMap(map){
    original.forEach((source,n)=>{
      if(!n||!n.parentNode)return;
      const key=source.trim();
      if(map[key]){
        const lead=source.match(/^\s*/)?.[0]||"",trail=source.match(/\s*$/)?.[0]||"";
        n.nodeValue=lead+map[key]+trail;
      }
    });
  }
  async function translatePage(lang){
    if(lang==="en"){restore();return}
    if(translating)return;
    snapshot();
    const cache=loadCache(lang);
    applyMap(cache);
    const unique=[...new Set([...original.values()].map(v=>v.trim()).filter(Boolean))].filter(t=>!cache[t]);
    if(!unique.length)return;
    translating=true;
    const chunks=[];
    for(let i=0;i<unique.length;i+=25)chunks.push(unique.slice(i,i+25));
    let next=0;
    async function worker(){
      while(next<chunks.length){
        const chunk=chunks[next++];
        try{
          const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target_language:lang,texts:chunk})});
          if(!r.ok)continue;
          const data=await r.json();
          const list=data.translations||[];
          list.forEach(x=>{if(x&&x.source&&x.translation&&chunk.includes(x.source.trim()))cache[x.source.trim()]=x.translation});
          saveCache(lang,cache);
          if(current===lang)applyMap(cache);
        }catch(e){console.warn("ABZEMO translation:",e)}
      }
    }
    try{await Promise.all([worker(),worker(),worker()])}finally{translating=false}
  }
  async function setLanguage(lang){
    if(!LANGUAGES.some(x=>x[0]===lang))lang="en";current=lang;localStorage.setItem(STORAGE_KEY,lang);setDirection(lang);
    const select=document.getElementById("abzemoLanguageSelect");if(select)select.value=lang;
    restore();await translatePage(lang);
    window.dispatchEvent(new CustomEvent("abzemo:languagechange",{detail:{language:lang}}));
  }
  function init(){injectStyles();snapshot();setDirection(current);buildSelector();requestAnimationFrame(positionSelector);setTimeout(positionSelector,150);setTimeout(positionSelector,500);if(current!=="en")translatePage(current)}
  window.addEventListener("resize",()=>requestAnimationFrame(positionSelector));
  window.addEventListener("abzemo:languagechange",()=>setTimeout(positionSelector,150));
  window.ABZEMO_I18N={languages:LANGUAGES,getLanguage:()=>current,setLanguage};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

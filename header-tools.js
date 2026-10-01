/* ABZEMO HEADER SEARCH — Siemens-style AI / natural-language search */
(function(){
  "use strict";

  const PAGES=[
    ["Home","index.html"],["About ABZEMO","about.html"],["Mission","mission.html"],
    ["Vision","vision.html"],["Director's Note","director-note.html"],["Solutions","solutions.html"],
    ["Industries","industries.html"],["ABZEMO AI","abzemo-ai.html"],["Ventures","ventures.html"],
    ["Contact","contact.html"],["Privacy Policy","privacy.html"],["Terms & Conditions","terms.html"]
  ];

  function icon(name){
    const p={
      search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
      mic:'<rect x="8" y="3" width="8" height="12" rx="4"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"></path>',
      arrow:'<path d="M4 12h15"></path><path d="m13 6 6 6-6 6"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p[name]+'</svg>';
  }

  function language(){
    try{return window.ABZEMO_I18N?.getLanguage?.() || (navigator.language||"en").split("-")[0] || "en"}catch(_){return "en"}
  }

  function localSearch(q){
    const s=String(q||"").toLowerCase().trim();
    if(!s)return [];
    return PAGES.map(function(x){
      const hay=(x[0]+" "+x[1]).toLowerCase(), words=s.split(/\s+/).filter(w=>w.length>2);
      let score=hay===s?100:(hay.includes(s)?70:0);
      words.forEach(w=>{if(hay.includes(w))score+=15});
      return {title:x[0],url:x[1],score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
  }

  function init(){
    if(document.getElementById("abzemoHeaderTools"))return;
    const nav=document.querySelector(".navbar"); if(!nav)return;

    const tools=document.createElement("div");
    tools.id="abzemoHeaderTools";
    tools.className="abzemo-header-tools";
    tools.innerHTML='<button class="abzemo-search-trigger" type="button" aria-label="Open ABZEMO AI Search" aria-expanded="false"><span aria-hidden="true">'+icon("search")+'</span><span class="abzemo-search-label">Search</span></button>';
    nav.appendChild(tools);

    const backdrop=document.createElement("div");
    backdrop.className="abzemo-search-backdrop";
    const panel=document.createElement("section");
    panel.className="abzemo-search-panel";
    panel.setAttribute("aria-label","ABZEMO AI Search");
    panel.innerHTML=
      '<div class="abzemo-search-inner">'+
        '<div class="abzemo-search-top"><div><div class="abzemo-search-kicker">Search with ABZEMO AI</div><div class="abzemo-search-subtitle">Ask naturally. Find the right ABZEMO page or answer.</div></div><button class="abzemo-search-close" type="button" aria-label="Close search">×</button></div>'+
        '<form class="abzemo-search-box">'+
          '<input class="abzemo-search-input" autocomplete="off" placeholder="What are you looking for?" aria-label="Search ABZEMO">'+
          '<button class="abzemo-search-voice" type="button" aria-label="Search by voice" title="Voice search">'+icon("mic")+'</button>'+
          '<button class="abzemo-search-submit" type="submit" aria-label="Search">'+icon("arrow")+'</button>'+
        '</form>'+
        '<div class="abzemo-search-hints"><button type="button">What does ABZEMO build?</button><button type="button">Explore ABZEMO AI</button><button type="button">What industries do we serve?</button></div>'+
        '<div class="abzemo-search-status"></div><div class="abzemo-search-results"></div>'+
      '</div>';

    document.body.append(backdrop,panel);

    const trigger=tools.querySelector(".abzemo-search-trigger"), input=panel.querySelector(".abzemo-search-input"),
      form=panel.querySelector(".abzemo-search-box"), status=panel.querySelector(".abzemo-search-status"),
      results=panel.querySelector(".abzemo-search-results"), voice=panel.querySelector(".abzemo-search-voice");

    function open(){backdrop.classList.add("active");panel.classList.add("active");trigger.setAttribute("aria-expanded","true");document.body.style.overflow="hidden";setTimeout(()=>input.focus(),60)}
    function close(){backdrop.classList.remove("active");panel.classList.remove("active");trigger.setAttribute("aria-expanded","false");document.body.style.overflow=""}
    function renderLocal(items){
      results.innerHTML="";
      items.forEach(function(x){const a=document.createElement("a");a.className="abzemo-search-result";a.href=x.url;a.innerHTML='<strong></strong><span></span><small>Open this ABZEMO section.</small>';a.querySelector("strong").textContent=x.title;a.querySelector("span").textContent=x.url;results.appendChild(a)});
    }

    async function submit(query){
      query=String(query||"").trim(); if(!query)return;
      status.textContent="Understanding your request…"; results.innerHTML="";
      try{
        const r=await fetch("/api/ai-search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,language:language(),source:location.href})});
        if(!r.ok)throw new Error("search unavailable");
        const d=await r.json();
        if(d.answer){const a=document.createElement("div");a.className="abzemo-search-answer";a.textContent=d.answer;results.appendChild(a)}
        (Array.isArray(d.results)?d.results:[]).slice(0,8).forEach(function(x){
          if(!x||!x.url)return;
          const a=document.createElement("a");a.className="abzemo-search-result";a.href=x.url;
          a.innerHTML='<strong></strong><span></span><small></small>';
          a.querySelector("strong").textContent=x.title||"ABZEMO result";
          a.querySelector("span").textContent=x.url;
          a.querySelector("small").textContent=x.snippet||"";
          results.appendChild(a);
        });
        status.textContent="Results ready.";
      }catch(_){
        const local=localSearch(query);
        status.textContent=local.length?"AI Search unavailable — showing direct ABZEMO matches.":"No direct ABZEMO match found.";
        renderLocal(local);
      }
    }

    trigger.onclick=open; panel.querySelector(".abzemo-search-close").onclick=close; backdrop.onclick=e=>{if(e.target===backdrop)close()};
    form.onsubmit=e=>{e.preventDefault();submit(input.value)};
    panel.querySelectorAll(".abzemo-search-hints button").forEach(b=>b.onclick=()=>{input.value=b.textContent;submit(input.value)});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&panel.classList.contains("active"))close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open()}});

    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){voice.disabled=true;voice.title="Voice search is not supported by this browser"}else{
      const rec=new SR();rec.continuous=false;rec.interimResults=false;rec.maxAlternatives=1;
      voice.onclick=()=>{rec.lang=language();try{rec.start();status.textContent="Listening…"}catch(_){}};
      rec.onresult=e=>{input.value=(e.results[0]?.[0]?.transcript||"").trim();submit(input.value)};
      rec.onerror=()=>{status.textContent="Microphone permission is required or voice input failed."};
    }

    const style=document.createElement("style");
    style.textContent=`
      .abzemo-header-tools{justify-self:end;display:flex;align-items:center;margin-left:10px}
      .abzemo-search-trigger{height:40px;min-width:44px;padding:0 12px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--line,#dce5f0);border-radius:10px;background:#fff;color:var(--navy,#071a35);font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 6px 22px rgba(7,26,53,.05)}
      .abzemo-search-trigger:hover{color:var(--blue,#1264d8);border-color:var(--blue,#1264d8)}
      .abzemo-search-trigger svg{width:19px;height:19px}.abzemo-search-backdrop{position:fixed;inset:0;z-index:1300;background:rgba(4,18,37,.52);backdrop-filter:blur(7px);opacity:0;visibility:hidden;pointer-events:none;transition:.25s ease}.abzemo-search-backdrop.active{opacity:1;visibility:visible;pointer-events:auto}
      .abzemo-search-panel{position:fixed;left:0;right:0;top:0;z-index:1310;background:rgba(255,255,255,.985);border-bottom:1px solid #dce5f0;box-shadow:0 28px 80px rgba(4,18,37,.18);transform:translateY(-105%);transition:transform .34s cubic-bezier(.77,0,.18,1)}
      .abzemo-search-panel.active{transform:translateY(0)}.abzemo-search-inner{width:min(1120px,calc(100% - 40px));margin:auto;padding:24px 0 28px}.abzemo-search-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.abzemo-search-kicker{font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#1264d8}.abzemo-search-subtitle{margin-top:4px;color:#6f7f95;font-size:13px}.abzemo-search-close{width:40px;height:40px;border:1px solid #dce5f0;border-radius:9px;background:#fff;font-size:24px;color:#071a35;cursor:pointer}
      .abzemo-search-box{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;min-height:64px;padding:7px 8px 7px 20px;border:1px solid #bfcddd;border-radius:14px;background:#fff;box-shadow:0 12px 35px rgba(7,26,53,.09)}.abzemo-search-box:focus-within{border-color:#1264d8;box-shadow:0 14px 40px rgba(18,100,216,.13)}.abzemo-search-input{width:100%;border:0;outline:0;background:transparent;color:#071a35;font-size:18px}.abzemo-search-input::placeholder{color:#7a899d}.abzemo-search-voice,.abzemo-search-submit{width:48px;height:48px;border:0;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}.abzemo-search-voice{background:transparent;color:#52647b}.abzemo-search-voice:hover{background:#f5f8fc;color:#1264d8}.abzemo-search-submit{background:#1264d8;color:#fff}.abzemo-search-submit:hover{background:#084a9e}.abzemo-search-voice svg,.abzemo-search-submit svg{width:21px;height:21px}
      .abzemo-search-hints{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.abzemo-search-hints button{border:1px solid #dce5f0;border-radius:999px;background:#f8fafd;color:#52647b;padding:7px 12px;font-size:12px;cursor:pointer}.abzemo-search-hints button:hover{border-color:#1264d8;color:#1264d8}.abzemo-search-status{min-height:22px;margin-top:16px;color:#6f7f95;font-size:13px}.abzemo-search-results{display:grid;gap:10px;margin-top:8px;max-height:min(52vh,520px);overflow:auto}.abzemo-search-answer{padding:18px;border:1px solid #dce5f0;border-radius:12px;background:#f7faff;color:#24344d;line-height:1.7}.abzemo-search-result{display:block;padding:16px 18px;border:1px solid #dce5f0;border-radius:12px;background:#fff;transition:.2s ease}.abzemo-search-result:hover{border-color:#1264d8;transform:translateY(-1px)}.abzemo-search-result strong{display:block;color:#071a35;font-size:16px;margin-bottom:4px}.abzemo-search-result span{display:block;color:#1264d8;font-size:11px;margin-bottom:5px}.abzemo-search-result small{display:block;color:#6f7f95;font-size:13px;line-height:1.6}
      @media(max-width:980px){.abzemo-search-label{display:none}.abzemo-header-tools{margin-left:6px}}@media(max-width:640px){.abzemo-search-trigger{height:38px;width:40px;padding:0}.abzemo-search-inner{width:min(100% - 28px,1120px)}.abzemo-search-box{min-height:58px;padding-left:14px}.abzemo-search-input{font-size:16px}.abzemo-search-voice,.abzemo-search-submit{width:42px;height:42px}}
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

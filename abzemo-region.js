/* ABZEMO global country / language selector. */
(function(){
"use strict";
const COUNTRIES=[["PK","Pakistan"],["AE","United Arab Emirates"],["SA","Saudi Arabia"],["QA","Qatar"],["BH","Bahrain"],["OM","Oman"],["KW","Kuwait"],["GB","United Kingdom"],["US","United States"],["CA","Canada"],["AU","Australia"],["DE","Germany"],["FR","France"],["IT","Italy"],["ES","Spain"],["TR","Türkiye"],["JP","Japan"],["CN","China"],["KR","South Korea"],["SG","Singapore"],["MY","Malaysia"],["ID","Indonesia"],["IN","India"],["ZA","South Africa"],["NG","Nigeria"],["KE","Kenya"],["BR","Brazil"],["MX","Mexico"],["NL","Netherlands"],["CH","Switzerland"]];
const LANGUAGES=[["EN","English","en"],["AR","العربية","ar"],["UR","اردو","ur"],["FR","Français","fr"],["DE","Deutsch","de"],["ES","Español","es"],["IT","Italiano","it"],["PT","Português","pt"],["TR","Türkçe","tr"],["FA","فارسی","fa"],["HI","हिन्दी","hi"],["BN","বাংলা","bn"],["PA","ਪੰਜਾਬੀ","pa"],["SD","سنڌي","sd"],["PS","پښتو","ps"],["MS","Bahasa Melayu","ms"],["ID","Bahasa Indonesia","id"],["ZH","中文","zh"],["JA","日本語","ja"],["KO","한국어","ko"],["VI","Tiếng Việt","vi"],["TH","ไทย","th"],["TA","தமிழ்","ta"],["TE","తెలుగు","te"],["MR","मराठी","mr"],["GU","ગુજરાતી","gu"],["RU","Русский","ru"],["UK","Українська","uk"],["PL","Polski","pl"],["NL","Nederlands","nl"],["SV","Svenska","sv"],["NO","Norsk","no"],["DA","Dansk","da"],["FI","Suomi","fi"],["EL","Ελληνικά","el"],["HE","עברית","he"],["SW","Kiswahili","sw"],["SO","Soomaali","so"],["AM","አማርኛ","am"],["ZU","isiZulu","zu"],["AF","Afrikaans","af"],["FIL","Filipino","tl"],["RO","Română","ro"],["HU","Magyar","hu"],["CS","Čeština","cs"],["SK","Slovenčina","sk"],["BG","Български","bg"],["IS","Íslenska","is"],["NE","नेपाली","ne"]];
const countryMap=Object.fromEntries(COUNTRIES.map(x=>[x[0],x[1]])),langMap=Object.fromEntries(LANGUAGES.map(x=>[x[0],x]));
const localeCountry=(navigator.language||"en-US").split("-")[1]?.toUpperCase()||"US";
let state={country:localStorage.getItem("abzemo-country")||localeCountry,lang:localStorage.getItem("abzemo-language")||"EN"};
function langCode(){return (langMap[state.lang]||langMap.EN)[2]}
function globe(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"></path></svg>'}
function render(){
 const host=document.querySelector(".navbar");if(!host)return;
 let el=document.querySelector(".abzemo-region-selector");
 if(!el){
  el=document.createElement("div");el.className="abzemo-region-selector";
  el.innerHTML='<button class="abzemo-region-trigger" type="button" aria-expanded="false" aria-label="Country and language"><span class="abzemo-globe">'+globe()+'</span><span class="abzemo-region-label"></span></button><div class="abzemo-region-panel"><div class="abzemo-region-head"><strong>Region & Language</strong><button type="button" class="abzemo-region-close" aria-label="Close">×</button></div><label>Country / Region<select class="abzemo-country-select"></select></label><label>Language<select class="abzemo-language-select"></select></label><p class="abzemo-region-note">Your selection is saved for your next visit.</p></div>';
  const search=document.querySelector(".abzemo-search-trigger");host.insertBefore(el,search||null);
  el.querySelector(".abzemo-region-trigger").onclick=()=>{el.classList.toggle("open");el.querySelector(".abzemo-region-trigger").setAttribute("aria-expanded",el.classList.contains("open"))};
  el.querySelector(".abzemo-region-close").onclick=()=>el.classList.remove("open");
  el.querySelector(".abzemo-country-select").onchange=e=>{state.country=e.target.value;localStorage.setItem("abzemo-country",state.country);render()};
  el.querySelector(".abzemo-language-select").onchange=async e=>{state.lang=e.target.value;localStorage.setItem("abzemo-language",state.lang);render();if(window.ABZEMO_TRANSLATOR)await window.ABZEMO_TRANSLATOR.setLanguage(langCode())};
 }
 const c=countryMap[state.country]||state.country||"United States",l=langMap[state.lang]||langMap.EN;
 el.querySelector(".abzemo-region-label").textContent=c+" | "+l[0];
 const cs=el.querySelector(".abzemo-country-select");if(!cs.options.length)COUNTRIES.forEach(x=>{const o=document.createElement("option");o.value=x[0];o.textContent=x[1];cs.appendChild(o)});cs.value=state.country;
 const ls=el.querySelector(".abzemo-language-select");if(!ls.options.length)LANGUAGES.forEach(x=>{const o=document.createElement("option");o.value=x[0];o.textContent=x[1];ls.appendChild(o)});ls.value=state.lang;
}
async function detect(){try{const r=await fetch("/api/region");if(r.ok){const d=await r.json();if(d.country&&!localStorage.getItem("abzemo-country"))state.country=d.country}}catch(e){}render()}
function init(){const s=document.createElement("link");s.rel="stylesheet";s.href="abzemo-region.css";document.head.appendChild(s);render();detect();window.ABZEMO_REGION={get:()=>({...state}),languages:LANGUAGES,countries:COUNTRIES,languageCode:langCode}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
/* ABZEMO HEADER TOOLS — production sync verification */
(function(){
"use strict";
const pages=[
["Home","index.html"],["About","about.html"],["Mission","mission.html"],["Vision","vision.html"],["Director's Note","director-note.html"],
["Ventures","ventures.html"],["Industries","industries.html"],["Solutions","solutions.html"],["ABZEMO AI","abzemo-ai.html"],["Contact","contact.html"]
];
function init(){
 const nav=document.querySelector(".navbar"); if(!nav||document.getElementById("abzemoHeaderTools"))return;
 const tools=document.createElement("div"); tools.id="abzemoHeaderTools"; tools.className="abzemo-header-tools";
 tools.innerHTML='<button class="abzemo-search-btn" type="button" aria-label="Search">⌕ <span>Search</span></button>';
 nav.appendChild(tools);
 const overlay=document.createElement("div"); overlay.className="abzemo-search-overlay"; overlay.innerHTML='<div class="abzemo-search-panel"><button class="abzemo-search-close" type="button" aria-label="Close search">×</button><div class="abzemo-search-title">Search ABZEMO</div><input id="abzemoSearchInput" type="search" placeholder="Search ABZEMO..." autocomplete="off"><div id="abzemoSearchResults"></div></div>';
 document.body.appendChild(overlay);
 const input=overlay.querySelector("#abzemoSearchInput");
 const results=overlay.querySelector("#abzemoSearchResults");
 const render=q=>{const s=q.trim().toLowerCase(); results.innerHTML=""; if(!s)return; pages.filter(x=>x[0].toLowerCase().includes(s)||x[1].toLowerCase().includes(s)).forEach(x=>{const a=document.createElement("a");a.href=x[1];a.textContent=x[0];results.appendChild(a)}); if(!results.children.length)results.innerHTML='<div class="abzemo-no-result">No matching ABZEMO page found.</div>';};
 tools.querySelector("button").onclick=()=>{overlay.classList.add("active");setTimeout(()=>input.focus(),50)};
 overlay.querySelector(".abzemo-search-close").onclick=()=>overlay.classList.remove("active");
 overlay.onclick=e=>{if(e.target===overlay)overlay.classList.remove("active")};
 input.oninput=()=>render(input.value);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")overlay.classList.remove("active");if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();tools.querySelector("button").click()}});
 const style=document.createElement("style");style.textContent='.abzemo-header-tools{justify-self:end;display:flex;align-items:center;gap:10px}.abzemo-search-btn{height:40px;padding:0 13px;border:1px solid var(--line,#dce5f0);border-radius:999px;background:#fff;color:var(--navy,#071a35);font-size:12px;font-weight:800;cursor:pointer}.abzemo-search-overlay{position:fixed;inset:0;z-index:3000;background:rgba(7,26,53,.48);backdrop-filter:blur(8px);display:none;align-items:flex-start;justify-content:center;padding-top:12vh}.abzemo-search-overlay.active{display:flex}.abzemo-search-panel{width:min(680px,calc(100% - 32px));background:#fff;border-radius:20px;padding:28px;box-shadow:0 30px 90px rgba(7,26,53,.25);position:relative}.abzemo-search-close{position:absolute;right:18px;top:14px;border:0;background:none;font-size:28px;cursor:pointer;color:var(--navy,#071a35)}.abzemo-search-title{font-size:28px;font-weight:900;color:var(--navy,#071a35);margin-bottom:18px}.abzemo-search-panel input{width:100%;height:52px;border:1px solid var(--line,#dce5f0);border-radius:12px;padding:0 16px;font-size:16px;outline:none}.abzemo-search-panel input:focus{border-color:var(--blue,#1264d8)}#abzemoSearchResults{margin-top:16px;display:grid;gap:8px}#abzemoSearchResults a{padding:13px 15px;border:1px solid var(--line,#dce5f0);border-radius:10px;color:var(--navy,#071a35);font-weight:700}#abzemoSearchResults a:hover{border-color:var(--blue,#1264d8);color:var(--blue,#1264d8)}.abzemo-no-result{color:#6f7f95;padding:10px}@media(max-width:980px){.abzemo-header-tools{margin-left:auto}.abzemo-search-btn span{display:none}}';
 document.head.appendChild(style);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
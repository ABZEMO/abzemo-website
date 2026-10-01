(function(){
"use strict";
const CACHE="abzemo-page-translation";
let nodes=[];
function collect(){
 nodes=[];
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;
  if(!p||["SCRIPT","STYLE","NOSCRIPT","OPTION"].includes(p.tagName)||p.closest(".abzemo-region-selector,.abzemo-search-panel,.notranslate")||n.nodeValue.trim().length<2)return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
 }});
 while(w.nextNode())nodes.push(w.currentNode);
}
async function setLanguage(lang){
 collect();if(!nodes.length)return;
 if(lang==="en"){nodes.forEach(n=>{if(n.dataset.abzemoOriginal!=null)n.nodeValue=n.dataset.abzemoOriginal});document.documentElement.lang="en";return}
 const cacheKey=location.pathname+"::"+lang;
 let store={};try{store=JSON.parse(localStorage.getItem(CACHE)||"{}")}catch(e){}
 if(Array.isArray(store[cacheKey])&&store[cacheKey].length===nodes.length){
  nodes.forEach((n,i)=>{if(n.dataset.abzemoOriginal==null)n.dataset.abzemoOriginal=n.nodeValue;n.nodeValue=store[cacheKey][i]});
  document.documentElement.lang=lang;return;
 }
 const texts=nodes.map(n=>{if(n.dataset.abzemoOriginal==null)n.dataset.abzemoOriginal=n.nodeValue;return n.dataset.abzemoOriginal});
 try{
  const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language:lang,texts})});
  if(!r.ok)throw new Error("translation endpoint");
  const d=await r.json();if(!Array.isArray(d.translations)||d.translations.length!==texts.length)throw new Error("translation response");
  store[cacheKey]=d.translations;localStorage.setItem(CACHE,JSON.stringify(store));
  nodes.forEach((n,i)=>n.nodeValue=d.translations[i]||n.dataset.abzemoOriginal);
  document.documentElement.lang=lang;
 }catch(e){console.warn("ABZEMO translation unavailable",e)}
}
window.ABZEMO_TRANSLATOR={setLanguage};
function init(){if(window.ABZEMO_REGION?.languageCode){const lang=window.ABZEMO_REGION.languageCode();if(lang!=="en")setLanguage(lang)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
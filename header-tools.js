/* ABZEMO HEADER TOOLS — reserved for shared header utilities. Search is provided by abzemo-search.js. */
(function(){
  "use strict";

  var current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll(".nav-links a[href]").forEach(function(link){
    var href = (link.getAttribute("href") || "").split("#")[0].toLowerCase() || "index.html";

    if (href === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* Shared links: add to menu and footer if missing */
  function hasLink(scope, href) {
    return scope.querySelector('a[href="' + href + '"]') !== null;
  }

  function makeLink(href, text) {
    var a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = text;
    return a;
  }

  function addTo(scopes, titleSelector, wanted, href, text) {
    document.querySelectorAll(scopes).forEach(function(scope){
      var title = scope.querySelector(titleSelector);
      if (!title || title.textContent.trim().toLowerCase() !== wanted) return;
      if (hasLink(scope, href)) return;
      scope.appendChild(makeLink(href, text));
    });
  }

  /* UZMO: menu (Capabilities) and footer (Explore) */
  addTo(".mega-section", ".mega-section-title", "capabilities", "/uzmo/", "UZMO");
  addTo(".footer-column", "h4", "explore", "/uzmo/", "UZMO");

  /* Careers: menu (ABZEMO) and footer (Company) */
  addTo(".mega-section", ".mega-section-title", "abzemo", "careers.html", "Careers");
  addTo(".footer-column", "h4", "company", "careers.html", "Careers");


})();

  /* Pregnancy Plus button */
  var ppBtn = document.createElement("a");
  ppBtn.href = "https://pregnancy-plus.vercel.app/";
  ppBtn.className = "pp-btn";
  ppBtn.setAttribute("aria-label", "Pregnancy Plus");
  ppBtn.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="ppbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7a8c8"/><stop offset="1" stop-color="#7b4fbf"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ppbg)"/><path d="M24 36c-8-5.5-11-9.4-11-13.2 0-3.2 2.4-5.3 5.2-5.3 2.2 0 4.2 1.2 5.8 3.6 1.6-2.4 3.6-3.6 5.8-3.6 2.8 0 5.2 2.1 5.2 5.3C35 26.6 32 30.5 24 36z" fill="#fff"/></svg><span>Pregnancy <b>Plus</b></span>';
  var ppStyle = document.createElement("style");
  ppStyle.textContent = "@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap');.pp-btn{position:absolute;right:24px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px;font:600 26px 'Fredoka',sans-serif;letter-spacing:-.3px;line-height:1;color:#3b2268;white-space:nowrap;text-decoration:none}.pp-btn svg{width:40px;height:40px;flex:none}.pp-btn b{color:#e0559a;font-weight:600}.pp-btn:hover{filter:brightness(1.1)}@media(max-width:1700px){.pp-btn{display:none}}";
  document.head.appendChild(ppStyle);
  var ppHeader = document.querySelector(".site-header");
  if (ppHeader) ppHeader.appendChild(ppBtn);

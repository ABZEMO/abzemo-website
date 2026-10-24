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
  ppBtn.textContent = "♥ Pregnancy Plus";
  var ppStyle = document.createElement("style");
  ppStyle.textContent = ".pp-btn{position:absolute;right:24px;top:50%;transform:translateY(-50%);height:36px;padding:0 16px;display:flex;align-items:center;border-radius:999px;background:linear-gradient(135deg,#e0559a,#7b4fbf);color:#fff;font:600 13px Arial,sans-serif;white-space:nowrap}.pp-btn:hover{filter:brightness(1.08)}@media(max-width:1700px){.pp-btn{display:none}}";
  document.head.appendChild(ppStyle);
  var ppHeader = document.querySelector(".site-header");
  if (ppHeader) ppHeader.appendChild(ppBtn);

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

  /* Pregnancy Plus header button — isolated addition; keep existing header behavior unchanged. */
  var navbar = document.querySelector(".site-header .navbar");
  if (navbar && !navbar.querySelector(".pregnancy-plus-header-btn")) {
    var ppStyle = document.createElement("style");
    ppStyle.textContent =
      ".pregnancy-plus-header-btn{justify-self:end;display:inline-flex;align-items:center;justify-content:center;" +
      "min-height:40px;padding:0 15px;border:1px solid #f3bfd4;border-radius:999px;" +
      "background:linear-gradient(135deg,#ffe1ec,#e8ddff);color:#704b91;font-size:13px;" +
      "font-weight:800;white-space:nowrap;box-shadow:0 4px 12px rgba(155,127,230,.14);" +
      "transition:transform .2s ease,box-shadow .2s ease;text-decoration:none}" +
      ".pregnancy-plus-header-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(155,127,230,.22);color:#704b91}" +
      "@media(max-width:760px){.pregnancy-plus-header-btn{min-height:34px;padding:0 10px;font-size:11px}}" +
      "@media(max-width:420px){.pregnancy-plus-header-btn{padding:0 8px;font-size:10px}}";
    document.head.appendChild(ppStyle);
    var ppButton = document.createElement("a");
    ppButton.className = "pregnancy-plus-header-btn";
    ppButton.href = "https://pregnancy-plus.vercel.app/";
    ppButton.textContent = "Pregnancy Plus";
    ppButton.setAttribute("aria-label", "Open Pregnancy Plus");
    ppButton.setAttribute("target", "_blank");
    ppButton.setAttribute("rel", "noopener noreferrer");
    navbar.appendChild(ppButton);
  }

})();
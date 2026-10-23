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

  /* Pregnancy Plus header button — rightmost, after Search; keep other header content intact. */
  var navbar = document.querySelector(".site-header .navbar");
  if (navbar && !navbar.querySelector(".pregnancy-plus-header-btn")) {
    var ppStyle = document.createElement("style");
    ppStyle.textContent =
      ".pregnancy-plus-header-btn{position:absolute;right:0;top:50%;transform:translateY(-50%);" +
      "z-index:1004;display:inline-flex;flex-direction:row-reverse;align-items:center;justify-content:center;gap:7px;" +
      "min-height:40px;padding:0 14px;border:1px solid #f3bfd4;border-radius:999px;" +
      "background:linear-gradient(135deg,#ffe1ec,#e8ddff);color:#704b91;font-size:13px;" +
      "font-weight:800;white-space:nowrap;box-shadow:0 4px 12px rgba(155,127,230,.14);" +
      "transition:box-shadow .2s ease;text-decoration:none}" +
      ".pregnancy-plus-header-btn:hover{box-shadow:0 6px 16px rgba(155,127,230,.22);color:#704b91}" +
      ".pregnancy-plus-header-btn svg{width:17px;height:17px;flex:0 0 17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
      "@media(max-width:640px){.pregnancy-plus-header-btn{min-height:36px;padding:0 8px;gap:4px;font-size:10px}.pregnancy-plus-header-btn svg{width:14px;height:14px;flex-basis:14px}}" +
      "@media(max-width:420px){.pregnancy-plus-header-btn{padding:0 6px;font-size:9px;gap:3px}}";
    document.head.appendChild(ppStyle);
    var ppButton = document.createElement("a");
    ppButton.className = "pregnancy-plus-header-btn";
    ppButton.href = "https://pregnancy-plus.vercel.app/";
    ppButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg><span>Pregnancy Plus</span>';
    ppButton.setAttribute("aria-label", "Open Pregnancy Plus");
    ppButton.setAttribute("target", "_blank");
    ppButton.setAttribute("rel", "noopener noreferrer");
    navbar.appendChild(ppButton);
  }

})();
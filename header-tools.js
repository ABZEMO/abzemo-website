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

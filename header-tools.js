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

  /* UZMO link: add to menu (Capabilities) and footer (Explore) if missing */
  function hasUzmo(scope) {
    return scope.querySelector('a[href="/uzmo/"]') !== null;
  }

  function makeLink() {
    var a = document.createElement("a");
    a.setAttribute("href", "/uzmo/");
    a.textContent = "UZMO";
    return a;
  }

  document.querySelectorAll(".mega-section").forEach(function(section){
    var title = section.querySelector(".mega-section-title");
    if (!title || title.textContent.trim().toLowerCase() !== "capabilities") return;
    if (hasUzmo(section)) return;
    section.appendChild(makeLink());
  });

  document.querySelectorAll(".footer-column").forEach(function(column){
    var title = column.querySelector("h4");
    if (!title || title.textContent.trim().toLowerCase() !== "explore") return;
    if (hasUzmo(column)) return;
    column.appendChild(makeLink());
  });
})();

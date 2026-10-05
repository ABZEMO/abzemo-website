/* ABZEMO SHARED HEADER UTILITIES */
(function(){
  "use strict";

  var current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll(".site-header .nav-links a[href]").forEach(function(link){
    var href = (link.getAttribute("href") || "").split("#")[0].toLowerCase() || "index.html";
    if (href === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
})();
(function () {
  var APP_URL = 'https://pregnancy-plus.vercel.app/';
  var popup = null;
  var hideTimer = null;

  function build() {
    if (popup) return popup;

    var style = document.createElement('style');
    style.textContent =
      '#pregnancyPopup{position:fixed;z-index:1150;width:280px;padding:24px;box-sizing:border-box;' +
      'background:#071a35;border:1px solid rgba(255,255,255,.13);border-radius:18px;' +
      'box-shadow:0 25px 70px rgba(7,26,53,.25);font-family:Arial,Helvetica,sans-serif;' +
      'opacity:0;visibility:hidden;transform:translateX(-8px);' +
      'transition:opacity .25s ease,transform .25s ease,visibility .25s ease}' +
      '#pregnancyPopup.open{opacity:1;visibility:visible;transform:translateX(0)}' +
      '#pregnancyPopup .pp-label{margin:0 0 12px;color:#70a9ff;font-size:11px;font-weight:800;' +
      'letter-spacing:.14em;text-transform:uppercase}' +
      '#pregnancyPopup h3{margin:0 0 10px;color:#fff;font-size:20px;font-weight:700;line-height:1.25}' +
      '#pregnancyPopup p{margin:0 0 18px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.7}' +
      '#pregnancyPopup .pp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;' +
      'padding:0 20px;border-radius:10px;background:#1264d8;color:#fff;font-size:14px;font-weight:700;' +
      'text-decoration:none;transition:background .25s ease}' +
      '#pregnancyPopup .pp-btn:hover{background:#084a9e}' +
      '.pp-arrow{float:right;padding:0 8px;color:#1264d8;font-size:18px;font-weight:800;line-height:1.4;cursor:pointer}';
    document.head.appendChild(style);

    popup = document.createElement('div');
    popup.id = 'pregnancyPopup';
    popup.innerHTML =
      '<div class="pp-label">ABZEMO Medical</div>' +
      '<h3>Pregnancy Plus</h3>' +
      '<p>AI powered pregnancy companion with week-by-week guidance, health records, safety checks and doctor referral.</p>' +
      '<a class="pp-btn" href="' + APP_URL + '" target="_blank" rel="noopener">Open Pregnancy Plus</a>';
    document.body.appendChild(popup);

    popup.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    popup.addEventListener('mouseleave', scheduleHide);
    return popup;
  }

  function show(link) {
    clearTimeout(hideTimer);
    var p = build();
    var menu = document.getElementById('megaMenu');
    var menuRect = menu ? menu.getBoundingClientRect() : { right: 0 };
    var linkRect = link.getBoundingClientRect();

    if (window.innerWidth <= 760) {
      p.style.left = '14px';
      p.style.right = '14px';
      p.style.width = 'auto';
      p.style.top = Math.max(14, Math.min(linkRect.bottom + 8, window.innerHeight - p.offsetHeight - 14)) + 'px';
    } else {
      p.style.right = 'auto';
      p.style.width = '280px';
      p.style.left = (menuRect.right + 14) + 'px';
      p.style.top = Math.max(14, Math.min(linkRect.top - 20, window.innerHeight - p.offsetHeight - 14)) + 'px';
    }
    p.classList.add('open');
  }

  function hide() {
    if (popup) popup.classList.remove('open');
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 400);
  }

  function setup() {
    var link = document.querySelector('.mega-section a.sub-link[href$="#medical"]');
    if (!link || link.getAttribute('data-pp')) return;
    link.setAttribute('data-pp', '1');

    var arrow = document.createElement('span');
    arrow.className = 'pp-arrow';
    arrow.setAttribute('role', 'button');
    arrow.setAttribute('aria-label', 'Show Pregnancy Plus');
    arrow.textContent = '\u203A';
    link.appendChild(arrow);

    link.addEventListener('mouseenter', function () { show(link); });
    link.addEventListener('mouseleave', scheduleHide);

    arrow.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (popup && popup.classList.contains('open')) hide(); else show(link);
    });

    var menu = document.getElementById('megaMenu');
    if (menu) {
      new MutationObserver(function () {
        if (!menu.classList.contains('active')) hide();
      }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
  window.addEventListener('load', setup);
})();

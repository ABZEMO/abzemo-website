(function () {
  function addPregnancyLink() {
    var medical = document.querySelector('.mega-section a.sub-link[href$="#medical"]');
    if (!medical || document.querySelector('[data-pregnancy-plus]')) return;

    var link = document.createElement('a');
    link.className = 'sub-link';
    link.href = 'https://pregnancy-plus.vercel.app/';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Pregnancy Plus';
    link.setAttribute('data-pregnancy-plus', '');
    link.style.paddingLeft = '24px';

    medical.insertAdjacentElement('afterend', link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPregnancyLink);
  } else {
    addPregnancyLink();
  }
  window.addEventListener('load', addPregnancyLink);
})();

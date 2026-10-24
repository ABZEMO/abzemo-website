(function () {
  "use strict";

  const medicalNames = [
    "AI Pregnancy Plus",
    "AI Patient Health File",
    "AI Chronic Care Assistant",
    "AI Lab Reports Assistant",
    "AI Hospital Management",
    "AI Pharmacy & Medicine Management",
    "AI Telemedicine",
    "AI Mother & Baby Care"
  ];

  const style = document.createElement("style");
  style.textContent = `
    .medical-submenu-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 40px;
      width: 40px;
      min-height: 38px;
      margin-left: auto;
      border: 1px solid var(--line, #dce5f0);
      border-radius: 8px;
      background: #fff;
      color: var(--navy, #071a35);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }
    .medical-menu-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }
    .medical-menu-row > a {
      flex: 1;
      min-width: 0;
    }
    .medical-submenu-panel {
      display: none;
      min-height: 100%;
      padding: 0 28px 42px;
      background: #fff;
    }
    .medical-submenu-panel.is-active { display: block; }
    .medical-submenu-back {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 60px;
      padding: 12px 0;
      border: 0;
      border-bottom: 1px solid var(--line, #dce5f0);
      margin-bottom: 22px;
      background: transparent;
      color: var(--navy, #071a35);
      text-align: left;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }
    .medical-submenu-back span { color: var(--blue, #1264d8); font-size: 22px; }
    .medical-submenu-title {
      margin: 0 0 12px;
      color: var(--blue, #1264d8);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .medical-submenu-items { display: flex; flex-direction: column; }
    .medical-submenu-items a,
    .medical-submenu-items .medical-menu-item {
      display: block;
      width: 100%;
      padding: 12px 0;
      border: 0;
      border-bottom: 1px solid var(--line, #dce5f0);
      background: transparent;
      color: var(--navy, #071a35);
      text-align: left;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.45;
    }
    .medical-submenu-items a:hover { color: var(--blue, #1264d8); }
    .medical-menu-item { cursor: default; }
    .mega-menu.medical-submenu-open .mega-content { display: none; }
    .mega-menu.medical-submenu-open .medical-submenu-panel { display: block; }
    @media (max-width: 520px) {
      .medical-submenu-panel { padding-right: 22px; padding-left: 22px; }
      .medical-menu-row { gap: 8px; }
      .medical-submenu-trigger { flex-basis: 38px; width: 38px; }
    }
  `;
  document.head.appendChild(style);

  const menu = document.getElementById("megaMenu");
  if (!menu) return;

  const medicalLink = Array.from(menu.querySelectorAll(".mega-section a"))
    .find(function (link) { return link.textContent.trim() === "ABZEMO Medical"; });
  if (!medicalLink || medicalLink.dataset.medicalSubmenuReady === "true") return;

  medicalLink.dataset.medicalSubmenuReady = "true";
  const row = document.createElement("div");
  row.className = "medical-menu-row";
  medicalLink.parentNode.insertBefore(row, medicalLink);
  row.appendChild(medicalLink);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "medical-submenu-trigger";
  trigger.setAttribute("aria-label", "Open ABZEMO Medical submenu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = "›";
  row.appendChild(trigger);

  const panel = document.createElement("section");
  panel.className = "medical-submenu-panel";
  panel.setAttribute("aria-label", "ABZEMO Medical categories");
  const back = document.createElement("button");
  back.type = "button";
  back.className = "medical-submenu-back";
  back.innerHTML = '<span aria-hidden="true">←</span> Back to Menu';
  panel.appendChild(back);

  const title = document.createElement("div");
  title.className = "medical-submenu-title";
  title.textContent = "ABZEMO Medical";
  panel.appendChild(title);

  const items = document.createElement("div");
  items.className = "medical-submenu-items";
  medicalNames.forEach(function (name, index) {
    if (index === 0) {
      const link = document.createElement("a");
      link.href = "/pregnancy-plus";
      link.textContent = name;
      link.addEventListener("click", closeMenu);
      items.appendChild(link);
    } else {
      const item = document.createElement("div");
      item.className = "medical-menu-item";
      item.textContent = name;
      items.appendChild(item);
    }
  });
  panel.appendChild(items);
  menu.appendChild(panel);

  function showSubmenu() {
    menu.classList.add("medical-submenu-open");
    trigger.setAttribute("aria-expanded", "true");
    panel.classList.add("is-active");
    panel.scrollTop = 0;
    back.focus();
  }

  function hideSubmenu() {
    menu.classList.remove("medical-submenu-open");
    trigger.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-active");
    trigger.focus();
  }

  function closeMenu() {
    hideSubmenu();
    menu.classList.remove("active");
    const overlay = document.getElementById("megaOverlay");
    if (overlay) overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    const menuButton = document.getElementById("menuButton");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", showSubmenu);
  back.addEventListener("click", hideSubmenu);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("medical-submenu-open")) {
      hideSubmenu();
    }
  });
})();
(() => {
  const BUTTON_CSS = `
    :host { all: initial; }
    .ytdl-wrap { display: inline-flex; font-family: Roboto, Arial, sans-serif; }
    .ytdl-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 16px;
      border: none;
      border-radius: 18px;
      background: var(--ytdl-btn-bg, rgba(255,255,255,0.1));
      color: var(--ytdl-btn-fg, #fff);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }
    .ytdl-btn:hover { background: var(--ytdl-btn-bg-hover, rgba(255,255,255,0.2)); }
    .ytdl-caret { font-size: 10px; }
  `;

  const MENU_CSS = `
    :host { all: initial; }
    .ytdl-menu {
      position: fixed;
      z-index: 2147483647;
      background: var(--ytdl-menu-bg, #212121);
      color: var(--ytdl-menu-fg, #fff);
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,.5);
      min-width: 220px;
      overflow: hidden;
      font-family: Roboto, Arial, sans-serif;
    }
    .ytdl-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.15); }
    .ytdl-tab {
      flex: 1;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: inherit;
      opacity: 0.6;
      font-size: 13px;
      cursor: pointer;
    }
    .ytdl-tab.is-active { opacity: 1; border-bottom: 2px solid #3ea6ff; }
    .ytdl-tab-content { padding: 10px; max-height: 260px; overflow-y: auto; font-size: 13px; }
  `;

  function isDarkTheme() {
    return document.documentElement.hasAttribute("dark");
  }

  function mountDownloadButton(containerEl, { prepend = false } = {}) {
    if (document.getElementById("ytdl-shadow-host")) return;

    const btnHost = document.createElement("span");
    btnHost.id = "ytdl-shadow-host";

    if (prepend) containerEl.prepend(btnHost);
    else containerEl.after(btnHost);

    const btnShadow = btnHost.attachShadow({ mode: "open" });
    const btnStyle = document.createElement("style");
    btnStyle.textContent = BUTTON_CSS;
    btnShadow.appendChild(btnStyle);

    const wrap = document.createElement("div");
    wrap.className = "ytdl-wrap";
    if (!isDarkTheme()) {
      wrap.style.setProperty("--ytdl-btn-bg", "rgba(0,0,0,0.05)");
      wrap.style.setProperty("--ytdl-btn-bg-hover", "rgba(0,0,0,0.1)");
      wrap.style.setProperty("--ytdl-btn-fg", "#0f0f0f");
    }
    btnShadow.appendChild(wrap);

    const btn = document.createElement("button");
    btn.className = "ytdl-btn";
    btn.innerHTML = `Download As: <span class="ytdl-caret">▼</span>`;
    wrap.appendChild(btn);

    const menuHost = document.createElement("div");
    menuHost.id = "ytdl-menu-host";
    document.body.appendChild(menuHost);

    const menuShadow = menuHost.attachShadow({ mode: "open" });
    const menuStyle = document.createElement("style");
    menuStyle.textContent = MENU_CSS;
    menuShadow.appendChild(menuStyle);

    const state = { open: false, tab: "video" };

    function positionMenu(menuEl) {
      const rect = btn.getBoundingClientRect();
      menuEl.style.top = `${rect.bottom + 6}px`;
      menuEl.style.left = `${rect.left}px`;
    }

    function renderMenu() {
      menuShadow.querySelector(".ytdl-menu")?.remove();
      if (!state.open) return;

      const menu = document.createElement("div");
      menu.className = "ytdl-menu";
      if (!isDarkTheme()) {
        menu.style.setProperty("--ytdl-menu-bg", "#fff");
        menu.style.setProperty("--ytdl-menu-fg", "#0f0f0f");
      }

      const tabs = document.createElement("div");
      tabs.className = "ytdl-tabs";
      [["video", "Video"], ["audio", "Audio"]].forEach(([key, label]) => {
        const tabBtn = document.createElement("button");
        tabBtn.className = "ytdl-tab" + (state.tab === key ? " is-active" : "");
        tabBtn.textContent = label;
        tabBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.tab = key;
          renderMenu();
        });
        tabs.appendChild(tabBtn);
      });
      menu.appendChild(tabs);

      const content = document.createElement("div");
      content.className = "ytdl-tab-content";
      content.textContent = `TODO: список форматов — ${state.tab}`;
      menu.appendChild(content);

      menuShadow.appendChild(menu);
      positionMenu(menu);
    }

    function closeMenu() {
      if (!state.open) return;
      state.open = false;
      renderMenu();
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.open = !state.open;
      renderMenu();
    });

    document.addEventListener("click", (e) => {
      if (!state.open) return;
      if (e.composedPath().includes(btnHost)) return;
      closeMenu();
    });
    window.addEventListener("scroll", () => {
      const menuEl = menuShadow.querySelector(".ytdl-menu");
      if (menuEl) positionMenu(menuEl);
    }, true);
    window.addEventListener("resize", () => {
      const menuEl = menuShadow.querySelector(".ytdl-menu");
      if (menuEl) positionMenu(menuEl);
    });
  }

  window.YTDL = window.YTDL || {};
  window.YTDL.mountDownloadButton = mountDownloadButton;
})();
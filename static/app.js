// static/app.js
document.addEventListener("DOMContentLoaded", async () => {
  const loginScreen = document.getElementById("login-screen");
  const mainApp = document.getElementById("main-app");
  const statUnread = document.getElementById("stat-unread");
  const statAttention = document.getElementById("stat-attention");

  // Top clickable cards
  const btnUnread = document.getElementById("btn-open-unread");
  const btnAttention = document.getElementById("btn-open-attention");
  const btnTracker = document.getElementById("btn-open-tracker");

  const loader = document.getElementById("loader");
  const empty = document.getElementById("empty");
  const emailList = document.getElementById("email-list");
  const kanban = document.getElementById("kanban");

  // Modal elements still exist in HTML, but are unused now
  const emailModal = document.getElementById("email-modal");
  const modalClose = document.getElementById("modal-close");

  // Theme
  const themeBtn = document.getElementById("btn-theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const THEME_KEY = "tm_theme";

  const show = (el) => el.classList.remove("hidden");
  const hide = (el) => el.classList.add("hidden");

  const clearContent = () => {
    emailList.innerHTML = "";
    hide(emailList);
    hide(kanban);
    hide(loader);
    show(empty);
  };

  function formatDateSafe(val) {
    try { return val ? new Date(val).toLocaleString() : ""; }
    catch { return val || ""; }
  }

  function stripAddressBrackets(s = "") {
    return s.replace(/<.*?>/g, "").trim();
  }

  // Inline loader HTML (spinner + label)
  function loaderHtml() {
    return `
      <div class="inline-loader mt-2" role="status" aria-live="polite" aria-label="Loading message">
        <span class="spin" aria-hidden="true"></span>
        <span class="sr-only">Loading…</span>
      </div>
    `;
  }

  /* ====================== THEME LOGIC ====================== */
  function renderThemeIcon(theme){
    if (theme === "light") {
      // Sun
      return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.76 4.84 5.34 3.42 3.92 4.84 5.34 6.26 6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.84 17.24 3.42 18.66 4.84 20.08 6.26 18.66 4.84 17.24zM20 13h3v-2h-3v2zm-8-8h2V2h-2v3zm5.66-.34 1.42-1.42 1.42 1.42-1.42 1.42-1.42-1.42zM17.24 19.16l1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42zM12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7z"/>
        </svg>
      `;
    }
    // Moon
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/>
      </svg>
    `;
  }

  function getStoredTheme(){ return localStorage.getItem(THEME_KEY); }
  function getPreferredTheme(){
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme){
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
    themeIcon.innerHTML = renderThemeIcon(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme(){
    applyTheme(getPreferredTheme());
    // If user hasn’t set a preference, react to OS changes
    if (!getStoredTheme() && window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
        applyTheme(e.matches ? "light" : "dark");
      });
    }
  }

  /* ====================== APP LOGIC ====================== */
  async function checkAuth() {
    try {
      const res = await fetch("/auth/status");
      const { isAuthenticated } = await res.json();
      if (isAuthenticated) {
        hide(loginScreen);
        show(mainApp);
        await refreshStats();
      } else {
        show(loginScreen);
        hide(mainApp);
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      show(loginScreen);
      hide(mainApp);
    }
  }

  async function refreshStats() {
    try {
      const res = await fetch("/api/unread-count");
      const data = await res.json();
      statUnread.textContent = data.count ?? 0;
    } catch {
      statUnread.textContent = "0";
    }

    try {
      const res = await fetch("/api/emails?q=" + encodeURIComponent("is:unread label:Requires-Attention"));
      const data = await res.json();
      statAttention.textContent = Array.isArray(data) ? data.length : 0;
    } catch {
      statAttention.textContent = "0";
    }
  }

  // Build one accordion list item (inline expand + lazy load)
  function buildEmailItem(e, index) {
    const li = document.createElement("li");
    li.className = "email-item glass rounded-xl overflow-hidden fade-in";
    li.style.animationDelay = `${index * 35}ms`;
    li.dataset.id = e.id || "";
    li.dataset.loaded = ""; // not loaded yet

    const dateStr = e.date ? new Date(e.date).toLocaleDateString() : "";
    const from = stripAddressBrackets(e.from || "");

    const hasSnippet = Boolean(e.snippet && e.snippet.trim());
    const initialBody = hasSnippet ? escapeHtml(e.snippet) : "—";

    li.innerHTML = `
      <button type="button"
        class="email-row w-full flex items-start justify-between gap-3 p-4 text-left cursor-pointer hover:bg-indigo-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400">
        <div class="min-w-0 pr-4">
          <p class="font-semibold text-white truncate">${e.subject || "No subject"}</p>
          <p class="text-sm text-slate-400 truncate">${from}</p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <p class="text-xs text-slate-500 whitespace-nowrap">${dateStr}</p>
          <svg class="chev opacity-80" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.6 16.6 7.2 15.2 11.4 11 7.2 6.8 8.6 5.4 14.2 11z"/>
          </svg>
        </div>
      </button>

      <div class="email-body px-4 pb-4">
        <div class="rounded-lg border border-slate-700/40 p-3 bg-slate-900/40">
          <div class="text-slate-300 whitespace-pre-wrap leading-relaxed email-body-content" data-has-snippet="${hasSnippet ? "1" : "0"}">
            ${initialBody}
          </div>
          <div class="mt-2 text-xs text-slate-500">
            <span class="font-semibold">From:</span> ${escapeHtml(e.from || "")} &nbsp;•&nbsp;
            <span class="font-semibold">Date:</span> ${escapeHtml(formatDateSafe(e.date))}
          </div>
        </div>
      </div>
    `;

    // Toggle: expand/collapse and lazy-load full body once
    const headerBtn = li.querySelector(".email-row");
    headerBtn.addEventListener("click", async () => {
      const bodyContent = li.querySelector(".email-body-content");
      const hadSnippet = bodyContent.dataset.hasSnippet === "1";

      // If first open and not loaded yet, show spinner before expanding when no snippet
      if (!li.dataset.loaded && !hadSnippet) {
        bodyContent.innerHTML = loaderHtml();
      }

      const opened = li.classList.toggle("open");

      if (opened && !li.dataset.loaded) {
        try {
          const res = await fetch(`/api/email/${li.dataset.id}`);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const emailFull = await res.json();

          // Replace loader/snippet with final body (plain text for safety)
          bodyContent.textContent = emailFull.body ?? "(No body)";
          li.dataset.loaded = "1";
        } catch (err) {
          console.error("Failed to load email details:", err);
          bodyContent.textContent = "Failed to load message body.";
        }
      }
    });

    return li;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  async function loadEmails(query) {
    clearContent();
    hide(empty);
    show(loader);

    try {
      const res = await fetch("/api/emails?q=" + encodeURIComponent(query));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const emails = await res.json();

      hide(loader);
      if (!Array.isArray(emails) || emails.length === 0) {
        empty.textContent = "No messages found for this filter.";
        show(empty);
        return;
      }

      const frag = document.createDocumentFragment();
      emails.forEach((e, i) => frag.appendChild(buildEmailItem(e, i)));
      emailList.appendChild(frag);
      show(emailList);
    } catch (err) {
      hide(loader);
      empty.innerHTML = `Error loading emails. <a class="underline" href="/auth/logout">Log in again</a>.`;
      show(empty);
      console.error(err);
    }
  }

  function showKanban() {
    clearContent();
    hide(empty);
    show(kanban);
  }

  // Modal now unused; keep it hidden & harmless
  if (emailModal) emailModal.classList.add("hidden");
  if (modalClose) modalClose.addEventListener("click", () => {
    if (emailModal) emailModal.classList.add("hidden");
  });

  // Clickable stat cards
  btnUnread.addEventListener("click", () => loadEmails("is:unread in:inbox newer_than:1d"));
  btnAttention.addEventListener("click", () => loadEmails("is:unread label:Requires-Attention"));
  btnTracker.addEventListener("click", showKanban);

  // Theme init + toggle
  initTheme();
  themeBtn.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-light") ? "dark" : "light";
    applyTheme(next);
  });

  checkAuth();
});

document.addEventListener("DOMContentLoaded", async () => {
  const loginScreen = document.getElementById("login-screen");
  const mainApp = document.getElementById("main-app");
  const statUnread = document.getElementById("stat-unread");
  const statAttention = document.getElementById("stat-attention");
  const btnUnread = document.getElementById("btn-open-unread");
  const btnAttention = document.getElementById("btn-open-attention");
  const btnTracker = document.getElementById("btn-open-tracker");
  const loader = document.getElementById("loader");
  const empty = document.getElementById("empty");
  const emailList = document.getElementById("email-list");
  const kanban = document.getElementById("kanban");

  const show = (el) => el.classList.remove("hidden");
  const hide = (el) => el.classList.add("hidden");
  const clearContent = () => {
    emailList.innerHTML = "";
    hide(emailList);
    hide(kanban);
    hide(loader);
    show(empty);
  };

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

      emails.forEach((e, i) => {
        const li = document.createElement("li");
        li.className = "glass p-4 rounded-lg fade-in";
        li.style.animationDelay = `${i * 35}ms`;
        const date = e.date ? new Date(e.date).toLocaleDateString() : "";
        const from = (e.from || "").replace(/<.*?>/g, "").trim();
        li.innerHTML = `
          <div class="flex justify-between items-start">
            <div class="pr-4 truncate">
              <p class="font-semibold text-white truncate">${e.subject || "No subject"}</p>
              <p class="text-sm text-slate-400 truncate">${from}</p>
            </div>
            <p class="text-xs text-slate-500 whitespace-nowrap">${date}</p>
          </div>`;
        emailList.appendChild(li);
      });
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

  btnUnread.addEventListener("click", () => loadEmails("is:unread in:inbox newer_than:1d"));
  btnAttention.addEventListener("click", () => loadEmails("is:unread label:Requires-Attention"));
  btnTracker.addEventListener("click", showKanban);

  checkAuth();
});

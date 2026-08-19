/**
 * Virtual Smart Hospital — App controller
 * Handles: i18n toggle, tab navigation, dynamic mock-data rendering,
 * and all interactive widgets (chat, SOS, uploads, forms).
 */

const AppState = {
  lang: "ar", // 'ar' primary (RTL) | 'en' secondary (LTR)
  activeTab: "home",
};

// Backend for the AI Mental Health Support chat (see /server). Point this
// at wherever that Express server actually runs.
const AI_CHAT_BASE_URL = "http://localhost:8787";
let aiCsrfToken = null;

document.addEventListener("DOMContentLoaded", () => {
  applyI18n(AppState.lang);
  wireNav();
  wireLangToggle();
  wireNotifications();
  renderPatientHeader();
  renderHome();
  renderConsultations();
  renderEHR();
  renderLabs();
  renderBloodPanel();
  renderPharmacy();
  renderIsolation();
  renderEducation();
  renderEmergency();
  wireQuickActions();
  wireEducationModal();
  wireSOS();
  wireAIChat();
  wireBloodPanelAnalysis();
  initAIChatBackend();
  wireIsolationChat();
  wireUpload();
  wireForms();
  renderHealthChart(AppState.lang, "healthChart");
  renderHealthChart(AppState.lang, "labsTrendChart");
  switchTab("home");
});

/* ============================== i18n ============================== */

function applyI18n(lang) {
  AppState.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[key]) el.textContent = I18N[key][lang];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    if (I18N[key]) el.setAttribute("placeholder", I18N[key][lang]);
  });

  const toggleLabelKey = "langToggle";
  const toggleBtn = document.getElementById("langToggleBtn");
  if (toggleBtn) toggleBtn.textContent = I18N[toggleLabelKey][lang];
}

function wireLangToggle() {
  const btn = document.getElementById("langToggleBtn");
  btn.addEventListener("click", () => {
    const next = AppState.lang === "ar" ? "en" : "ar";
    applyI18n(next);
    renderPatientHeader();
    renderHome();
    renderConsultations();
    renderEHR();
    renderLabs();
    renderBloodPanel();
    renderPharmacy();
    renderIsolation();
    renderEducation();
    renderEmergency();
    renderHealthChart(next, "healthChart");
    renderHealthChart(next, "labsTrendChart");
  });
}

/* ============================== Navigation ============================== */

function wireNav() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(tab.getAttribute("data-tab"));
    });
  });
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", () => switchTab(el.getAttribute("data-goto")));
  });
  document.getElementById("mobileNavToggle")?.addEventListener("click", () => {
    document.getElementById("mobileNav").classList.toggle("hidden");
  });
}

function switchTab(tabId) {
  AppState.activeTab = tabId;
  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `view-${tabId}`);
  });
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
  });
  document.getElementById("mobileNav")?.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================== Header / Notifications ============================== */

function renderPatientHeader() {
  const lang = AppState.lang;
  const name = lang === "ar" ? MOCK_PATIENT.nameAr : MOCK_PATIENT.nameEn;
  const greetingText = `👋 ${I18N.greeting[lang]}، ${Security.sanitize(name)}`;
  const el = document.getElementById("patientGreeting");
  if (el) el.textContent = greetingText;
  const elMobile = document.getElementById("patientGreetingMobile");
  if (elMobile) elMobile.textContent = greetingText;
  const lastVisit = document.getElementById("lastVisitValue");
  if (lastVisit) lastVisit.textContent = MOCK_PATIENT.lastVisit;
  const badge = document.getElementById("notifBadge");
  if (badge) badge.textContent = MOCK_PATIENT.unreadNotifications;
}

function wireNotifications() {
  const bell = document.getElementById("notifBell");
  const overlay = document.getElementById("notifOverlay");
  const closeBtn = document.getElementById("notifClose");
  const list = document.getElementById("notifList");

  function render() {
    const lang = AppState.lang;
    list.innerHTML = MOCK_ALERTS.map(
      (a) => `<li class="card-alert p-3 flex items-start gap-2">
        <span class="text-xl">${a.icon}</span>
        <span>${Security.sanitize(lang === "ar" ? a.ar : a.en)}</span>
      </li>`
    ).join("");
  }

  bell.addEventListener("click", () => {
    render();
    overlay.classList.remove("hidden");
  });
  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
}

/* ============================== Home ============================== */

function renderHome() {
  const lang = AppState.lang;

  const alertsEl = document.getElementById("homeAlerts");
  if (alertsEl) {
    alertsEl.innerHTML = MOCK_ALERTS.map(
      (a) => `<div class="card-alert p-4 flex items-center gap-3">
        <span class="text-2xl">${a.icon}</span>
        <p class="text-sm md:text-base">${Security.sanitize(lang === "ar" ? a.ar : a.en)}</p>
      </div>`
    ).join("");
  }

  const vitalsEl = document.getElementById("vitalsGrid");
  if (vitalsEl) {
    vitalsEl.innerHTML = MOCK_VITALS.map(
      (v) => `<div class="card p-5 text-center">
        <div class="text-3xl mb-2">${v.icon}</div>
        <p class="text-sm text-gray-500 mb-1">${Security.sanitize(lang === "ar" ? v.ar : v.en)}</p>
        <p class="text-2xl font-extrabold" style="color:${v.color}">${Security.sanitize(String(v.value))}</p>
        <p class="text-xs text-gray-400">${Security.sanitize(v.unit)}</p>
      </div>`
    ).join("");
  }
}

function wireQuickActions() {
  document.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-quick");
      switchTab(target);
    });
  });
}

/* ============================== Consultations ============================== */

function renderConsultations() {
  const lang = AppState.lang;
  const list = document.getElementById("appointmentsList");
  if (list) {
    list.innerHTML = MOCK_APPOINTMENTS.map((a) => {
      const typeLabel = a.type === "video" ? I18N.videoCall[lang] : I18N.audioCall[lang];
      const typeIcon = a.type === "video" ? "🎥" : "📞";
      const anonTag = a.anonymous
        ? `<span class="text-xs bg-ice-blue text-sky-700 px-2 py-1 rounded-full" style="background:#E1F5FE;color:#0288D1">${I18N.anonymousMode[lang]}</span>`
        : "";
      return `<div class="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p class="font-bold">${Security.sanitize(lang === "ar" ? a.doctorAr : a.doctorEn)}</p>
          <p class="text-sm text-gray-500">${Security.sanitize(lang === "ar" ? a.specialtyAr : a.specialtyEn)}</p>
          <p class="text-sm text-gray-400 mt-1">${Security.sanitize(a.date)} · ${Security.sanitize(a.time)}</p>
          ${anonTag}
        </div>
        <button class="btn-primary px-5 py-2 flex items-center gap-2 justify-center">
          <span>${typeIcon}</span><span>${typeLabel}</span>
        </button>
      </div>`;
    }).join("");
  }
  appendAIChatWelcome();
}

function appendAIChatWelcome() {
  const box = document.getElementById("aiChatMessages");
  if (box && box.children.length === 0) {
    const lang = AppState.lang;
    box.innerHTML = `<div class="bubble-in p-3 max-w-[80%] self-start">${Security.sanitize(I18N.aiWelcomeMsg[lang])}</div>`;
  }
}

/**
 * Fetches a CSRF token from the AI chat backend (see /server). Safe to
 * fail silently — if the backend isn't running, wireAIChat() surfaces a
 * clear inline error the first time the patient actually tries to send
 * a message, instead of failing on page load.
 */
async function initAIChatBackend() {
  try {
    const res = await fetch(`${AI_CHAT_BASE_URL}/api/csrf-token`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    aiCsrfToken = data.csrfToken;
  } catch {
    // Backend not reachable yet — normal in local/demo setups without Node running.
  }
}

function appendChatBubble(box, { text, outgoing, tone }) {
  const bubble = document.createElement("div");
  bubble.className = outgoing
    ? "bubble-out p-3 max-w-[80%] self-end ms-auto"
    : "bubble-in p-3 max-w-[80%] self-start";
  if (tone === "warning") {
    bubble.style.borderInlineStart = "4px solid #FF5252";
  }
  bubble.textContent = text; // textContent only — never innerHTML with raw/model input
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  return bubble;
}

function wireAIChat() {
  const form = document.getElementById("aiChatForm");
  const input = document.getElementById("aiChatInput");
  const box = document.getElementById("aiChatMessages");
  const sessionToken = Security.getAnonymousSessionToken();
  console.info("AI mental-health session token (anonymous, not linked to PHI):", sessionToken);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    if (!Security.generalBucket.tryConsume()) return; // client-side throttle

    appendChatBubble(box, { text, outgoing: true });
    input.value = "";

    const lang = AppState.lang;
    const typing = appendChatBubble(box, {
      text: lang === "ar" ? "يكتب..." : "Typing...",
      outgoing: false,
    });
    typing.classList.add("opacity-60");

    try {
      const res = await fetch(`${AI_CHAT_BASE_URL}/api/ai-chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": aiCsrfToken || "",
        },
        body: JSON.stringify({ sessionToken, message: text, lang }),
      });

      typing.remove();

      if (res.status === 429) {
        appendChatBubble(box, {
          text: lang === "ar" ? "الرجاء الانتظار قليلًا قبل إرسال رسالة أخرى." : "Please wait a moment before sending another message.",
          outgoing: false,
        });
        return;
      }
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      appendChatBubble(box, { text: data.reply, outgoing: false, tone: data.escalated ? "warning" : undefined });
    } catch {
      typing.remove();
      appendChatBubble(box, {
        text: lang === "ar"
          ? "تعذر الاتصال بالمساعد الذكي حاليًا. تأكد من تشغيل الخادم الخلفي (راجع server/README.md)."
          : "Couldn't reach the AI assistant right now. Make sure the backend server is running (see server/README.md).",
        outgoing: false,
        tone: "warning",
      });
    }
  });
}

/* ============================== EHR ============================== */

function renderEHR() {
  const lang = AppState.lang;
  const name = lang === "ar" ? MOCK_PATIENT.nameAr : MOCK_PATIENT.nameEn;

  const infoEl = document.getElementById("ehrPersonalInfo");
  if (infoEl) {
    infoEl.innerHTML = `
      <div><p class="text-xs text-gray-400">${I18N.fullName[lang]}</p><p class="font-bold">${Security.sanitize(name)}</p></div>
      <div><p class="text-xs text-gray-400">${I18N.patientId[lang]}</p><p class="font-bold">${Security.sanitize(MOCK_PATIENT.id)}</p></div>
      <div><p class="text-xs text-gray-400">${I18N.age[lang]}</p><p class="font-bold">${MOCK_PATIENT.age}</p></div>
      <div><p class="text-xs text-gray-400">${I18N.bloodType[lang]}</p><p class="font-bold">${Security.sanitize(MOCK_PATIENT.bloodType)}</p></div>
    `;
  }

  const allergiesEl = document.getElementById("ehrAllergies");
  if (allergiesEl) {
    allergiesEl.innerHTML = MOCK_ALLERGIES.map(
      (a) => `<span class="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-200">
        ⚠️ ${Security.sanitize(lang === "ar" ? a.ar : a.en)} — ${Security.sanitize(lang === "ar" ? a.severityAr : a.severityEn)}
      </span>`
    ).join("");
  }

  const rxEl = document.getElementById("ehrPrescriptions");
  if (rxEl) {
    rxEl.innerHTML = MOCK_PRESCRIPTIONS.map(
      (p) => `<li class="flex justify-between py-2 border-b last:border-0" style="border-color:#E1F5FE">
        <span>${Security.sanitize(lang === "ar" ? p.nameAr : p.nameEn)}</span>
        <span class="text-sm text-sky-700" style="color:#0288D1">${Security.sanitize(lang === "ar" ? p.statusAr : p.statusEn)}</span>
      </li>`
    ).join("");
  }

  const labsEl = document.getElementById("ehrLabs");
  if (labsEl) {
    labsEl.innerHTML = MOCK_LABS.map(
      (l) => `<li class="flex justify-between py-2 border-b last:border-0" style="border-color:#E1F5FE">
        <span>${Security.sanitize(lang === "ar" ? l.nameAr : l.nameEn)}</span>
        <span class="text-sm text-gray-500">${Security.sanitize(l.date)}</span>
      </li>`
    ).join("");
  }
}

/* ============================== Labs & Diagnostics ============================== */

function renderLabs() {
  const lang = AppState.lang;
  const tbody = document.getElementById("labsTableBody");
  if (tbody) {
    tbody.innerHTML = MOCK_LABS.map(
      (l) => `<tr class="border-b last:border-0" style="border-color:#E1F5FE">
        <td class="py-2 px-3">${Security.sanitize(lang === "ar" ? l.nameAr : l.nameEn)}</td>
        <td class="py-2 px-3 text-gray-500">${Security.sanitize(l.date)}</td>
        <td class="py-2 px-3">
          <span class="text-xs px-2 py-1 rounded-full" style="background:#E1F5FE;color:#0288D1">
            ${Security.sanitize(lang === "ar" ? l.statusAr : l.statusEn)}
          </span>
        </td>
      </tr>`
    ).join("");
  }
}

const FLAG_STYLE = {
  normal: { bg: "#E1F5FE", fg: "#0288D1", key: "bpFlagNormal" },
  high: { bg: "#FFEBEE", fg: "#E53935", key: "bpFlagHigh" },
  low: { bg: "#FFF3E0", fg: "#FB8C00", key: "bpFlagLow" },
};

function renderBloodPanel() {
  const lang = AppState.lang;
  const tbody = document.getElementById("bloodPanelTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK_BLOOD_PANEL.map((m) => {
    const style = FLAG_STYLE[m.flag] || FLAG_STYLE.normal;
    return `<tr class="border-b last:border-0" style="border-color:#E1F5FE">
      <td class="py-2 px-3">${Security.sanitize(lang === "ar" ? m.nameAr : m.nameEn)}</td>
      <td class="py-2 px-3 font-bold">${Security.sanitize(m.value)} <span class="text-gray-400 font-normal">${Security.sanitize(m.unit)}</span></td>
      <td class="py-2 px-3 text-gray-500">${Security.sanitize(m.range)}</td>
      <td class="py-2 px-3">
        <span class="text-xs px-2 py-1 rounded-full" style="background:${style.bg};color:${style.fg}">
          ${Security.sanitize(I18N[style.key][lang])}
        </span>
      </td>
    </tr>`;
  }).join("");
}

/**
 * Sends the structured CBC panel (numeric values only — no name/ID/PHI) to
 * the backend, which calls the Claude API server-side and returns a
 * plain-language analysis + recommendations. Reuses the same CSRF token,
 * anonymous session token, and rate-limit pattern as the AI chat feature.
 */
function wireBloodPanelAnalysis() {
  const btn = document.getElementById("analyzeBloodPanelBtn");
  const resultBox = document.getElementById("bloodPanelResult");
  if (!btn || !resultBox) return;

  const sessionToken = Security.getAnonymousSessionToken();

  btn.addEventListener("click", async () => {
    const lang = AppState.lang;
    if (!Security.generalBucket.tryConsume()) {
      showBloodPanelMessage(resultBox, I18N.aiAnalysisRateLimited[lang], "warning");
      return;
    }

    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = I18N.analyzing[lang];
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "";
    const loading = document.createElement("p");
    loading.className = "text-sm text-gray-400";
    loading.textContent = I18N.analyzing[lang];
    resultBox.appendChild(loading);

    const panel = MOCK_BLOOD_PANEL.map((m) => ({
      name: lang === "ar" ? m.nameAr : m.nameEn,
      value: m.value,
      unit: m.unit,
      range: m.range,
      flag: m.flag,
    }));

    try {
      const res = await fetch(`${AI_CHAT_BASE_URL}/api/labs-analysis`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": aiCsrfToken || "",
        },
        body: JSON.stringify({ sessionToken, panel, lang }),
      });

      if (res.status === 429) {
        showBloodPanelMessage(resultBox, I18N.aiAnalysisRateLimited[lang], "warning");
        return;
      }
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      renderBloodPanelAnalysis(resultBox, data, lang);
    } catch {
      showBloodPanelMessage(resultBox, I18N.aiAnalysisError[lang], "warning");
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

function showBloodPanelMessage(box, text, tone) {
  box.classList.remove("hidden");
  box.innerHTML = "";
  const p = document.createElement("p");
  p.className = "text-sm p-3 rounded-card";
  p.style.background = tone === "warning" ? "#FFEBEE" : "#F5F7FA";
  p.style.color = tone === "warning" ? "#E53935" : "inherit";
  p.textContent = text; // textContent only — never innerHTML with model/user input
  box.appendChild(p);
}

function renderBloodPanelAnalysis(box, data, lang) {
  box.classList.remove("hidden");
  box.innerHTML = "";

  const summaryTitle = document.createElement("h3");
  summaryTitle.className = "font-bold mb-1";
  summaryTitle.textContent = I18N.aiAnalysisTitle[lang];
  box.appendChild(summaryTitle);

  const summaryP = document.createElement("p");
  summaryP.className = "text-sm mb-4";
  summaryP.textContent = data.summary || "";
  box.appendChild(summaryP);

  if (Array.isArray(data.recommendations) && data.recommendations.length) {
    const recTitle = document.createElement("h3");
    recTitle.className = "font-bold mb-1";
    recTitle.textContent = I18N.aiRecommendationsTitle[lang];
    box.appendChild(recTitle);

    const ul = document.createElement("ul");
    ul.className = "text-sm flex flex-col gap-1.5 list-disc ps-5 mb-4";
    data.recommendations.forEach((rec) => {
      const li = document.createElement("li");
      li.textContent = rec; // textContent only — model output, never trusted as HTML
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  const disclaimer = document.createElement("p");
  disclaimer.className = "text-xs text-gray-400 border-t pt-3";
  disclaimer.style.borderColor = "#E1F5FE";
  disclaimer.textContent = I18N.aiAnalysisDisclaimer[lang];
  box.appendChild(disclaimer);
}

function wireUpload() {
  const zone = document.getElementById("dropzone");
  const input = document.getElementById("fileInput");
  const fileList = document.getElementById("uploadedFiles");
  if (!zone) return;

  function addFile(file) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between card p-3";
    const name = document.createElement("span");
    name.textContent = `📄 ${file.name}`; // textContent — safe against XSS
    const size = document.createElement("span");
    size.className = "text-xs text-gray-400";
    size.textContent = `${(file.size / 1024).toFixed(0)} KB`;
    li.appendChild(name);
    li.appendChild(size);
    fileList.prepend(li);
  }

  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    [...e.dataTransfer.files].forEach(addFile);
  });
  input.addEventListener("change", () => {
    [...input.files].forEach(addFile);
  });
}

/* ============================== Pharmacy ============================== */

function renderPharmacy() {
  const lang = AppState.lang;
  const list = document.getElementById("pharmacyList");
  if (!list) return;
  list.innerHTML = MOCK_PRESCRIPTIONS.map((p) => {
    const refillTag = p.autoRefill
      ? `<span class="text-xs px-2 py-1 rounded-full" style="background:#E1F5FE;color:#0288D1">${I18N.autoRefill[lang]} ✓</span>`
      : "";
    return `<div class="card p-4">
      <div class="flex items-center justify-between mb-2">
        <p class="font-bold">${Security.sanitize(lang === "ar" ? p.nameAr : p.nameEn)}</p>
        ${refillTag}
      </div>
      <p class="text-sm text-gray-500 mb-1">${Security.sanitize(lang === "ar" ? p.statusAr : p.statusEn)}</p>
      <p class="text-xs text-gray-400 mb-3">${I18N.refillDate[lang]}: ${Security.sanitize(p.refillDate)}</p>
      <div class="flex gap-2">
        <button class="btn-secondary px-4 py-1.5 text-sm flex-1">${I18N.track[lang]}</button>
        <button class="btn-primary px-4 py-1.5 text-sm flex-1">${I18N.requestRefill[lang]}</button>
      </div>
    </div>`;
  }).join("");
}

/* ============================== Isolation ============================== */

function renderIsolation() {
  const lang = AppState.lang;
  const counter = document.getElementById("quarantineCounterValue");
  if (counter) counter.textContent = MOCK_ISOLATION.daysRemaining;
  const totalEl = document.getElementById("quarantineTotal");
  if (totalEl) totalEl.textContent = MOCK_ISOLATION.totalDays;
  const progressEl = document.getElementById("quarantineProgress");
  if (progressEl) {
    const pct = Math.round(((MOCK_ISOLATION.totalDays - MOCK_ISOLATION.daysRemaining) / MOCK_ISOLATION.totalDays) * 100);
    progressEl.style.width = `${pct}%`;
  }
  const startEl = document.getElementById("isolationStartValue");
  if (startEl) startEl.textContent = MOCK_ISOLATION.startDate;
  const endEl = document.getElementById("isolationEndValue");
  if (endEl) endEl.textContent = MOCK_ISOLATION.endDate;
}

function wireIsolationChat() {
  const form = document.getElementById("isolationChatForm");
  const input = document.getElementById("isolationChatInput");
  const box = document.getElementById("isolationChatMessages");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !Security.generalBucket.tryConsume()) return;
    const out = document.createElement("div");
    out.className = "bubble-out p-3 max-w-[80%] self-end ms-auto";
    out.textContent = text;
    box.appendChild(out);
    input.value = "";
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
      const reply = document.createElement("div");
      reply.className = "bubble-in p-3 max-w-[80%] self-start";
      reply.textContent = AppState.lang === "ar"
        ? "تم استلام رسالتك، سيتواصل معك الفريق الطبي قريبًا."
        : "Message received — your care team will follow up shortly.";
      box.appendChild(reply);
      box.scrollTop = box.scrollHeight;
    }, 700);
  });
}

/* ============================== Health Education ============================== */

function renderEducation() {
  const lang = AppState.lang;
  const grid = document.getElementById("educationGrid");
  if (!grid) return;
  grid.innerHTML = MOCK_EDUCATION.map((item, idx) => {
    const icon = item.typeAr === "فيديو" ? "🎬" : item.typeAr === "برنامج" ? "👨‍👩‍👧" : "📰";
    const actionLabel = item.typeAr === "فيديو" ? I18N.watchNow[lang] : I18N.readMore[lang];
    const openAttr = item.bodyAr ? `data-article-idx="${idx}"` : "";
    return `<div class="card p-4">
      <div class="text-3xl mb-3">${icon}</div>
      <span class="text-xs px-2 py-1 rounded-full" style="background:#E1F5FE;color:#0288D1">${Security.sanitize(lang === "ar" ? item.typeAr : item.typeEn)}</span>
      <p class="font-bold mt-2 mb-1">${Security.sanitize(lang === "ar" ? item.titleAr : item.titleEn)}</p>
      <p class="text-xs text-gray-400 mb-3">${item.minutes} ${I18N.minutesRead[lang]}</p>
      <button class="btn-secondary px-4 py-1.5 text-sm w-full" ${openAttr}>${actionLabel}</button>
    </div>`;
  }).join("");
}

function wireEducationModal() {
  const grid = document.getElementById("educationGrid");
  const overlay = document.getElementById("articleOverlay");
  const closeBtn = document.getElementById("articleClose");
  const titleEl = document.getElementById("articleModalTitle");
  const bodyEl = document.getElementById("articleModalBody");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-article-idx]");
    if (!btn) return;
    const item = MOCK_EDUCATION[Number(btn.getAttribute("data-article-idx"))];
    if (!item || !item.bodyAr) return;

    const lang = AppState.lang;
    titleEl.textContent = Security.sanitize(lang === "ar" ? item.titleAr : item.titleEn);

    if (lang !== "ar") {
      bodyEl.innerHTML = `<p class="text-gray-500">${Security.sanitize(I18N.articleArabicOnly.en)}</p>`;
    } else {
      bodyEl.innerHTML = item.bodyAr.map(
        (section) => `<div>
          <h3 class="font-bold mb-2" style="color:#0288D1">${Security.sanitize(section.week)}</h3>
          <ul class="flex flex-col gap-1.5 list-disc ps-5">
            ${section.items.map((point) => `<li>${Security.sanitize(point)}</li>`).join("")}
          </ul>
        </div>`
      ).join("");
    }
    overlay.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
}

/* ============================== Emergency ============================== */

function renderEmergency() {
  // Static mock hospital/ambulance panel content is set via data-i18n in HTML.
}

function wireSOS() {
  const btn = document.getElementById("sosButton");
  const fill = document.getElementById("sosFill");
  const statusBox = document.getElementById("sosStatus");
  if (!btn) return;

  let holdTimer = null;
  const HOLD_MS = 1100;

  function startHold() {
    fill.classList.add("filling");
    holdTimer = setTimeout(() => triggerSOS(), HOLD_MS);
  }
  function cancelHold() {
    clearTimeout(holdTimer);
    fill.classList.remove("filling");
  }

  function triggerSOS() {
    // Emergency actions use a dedicated high-ceiling token bucket so they
    // bypass general UI rate-limiting, while still being validated against
    // automated flood/DDoS abuse (see security.js).
    if (!Security.emergencyBucket.tryConsume(1)) {
      statusBox.textContent = AppState.lang === "ar"
        ? "تعذر الإرسال حاليًا، حاول مرة أخرى."
        : "Could not dispatch right now, please retry.";
      statusBox.classList.remove("hidden");
      return;
    }

    const lang = AppState.lang;
    statusBox.classList.remove("hidden");
    statusBox.textContent = I18N.sosSent[lang];
    statusBox.classList.add("card-alert", "p-4");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          statusBox.textContent = `${I18N.sosSent[lang]} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
        },
        () => {
          statusBox.textContent = `${I18N.sosSent[lang]} ${lang === "ar" ? "(تعذر الوصول للموقع، تم استخدام آخر موقع معروف)" : "(location unavailable, using last known location)"}`;
        },
        { timeout: 4000 }
      );
    }
  }

  btn.addEventListener("mousedown", startHold);
  btn.addEventListener("touchstart", (e) => { e.preventDefault(); startHold(); }, { passive: false });
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) =>
    btn.addEventListener(evt, cancelHold)
  );
}

/* ============================== Forms (appointment booking, isolation check-in) ============================== */

function wireForms() {
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // CSRF token is attached to every state-changing request; validated server-side.
      const csrf = Security.getCsrfToken();
      const toast = document.getElementById("bookingToast");
      toast.classList.remove("hidden");
      toast.textContent = AppState.lang === "ar" ? "تم تأكيد حجز موعدك بنجاح ✅" : "Your appointment has been booked ✅";
      console.debug("Booking submitted with CSRF token", csrf);
      bookingForm.reset();
      setTimeout(() => toast.classList.add("hidden"), 3500);
    });
  }

  const checkinForm = document.getElementById("checkinForm");
  if (checkinForm) {
    checkinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const toast = document.getElementById("checkinToast");
      toast.classList.remove("hidden");
      toast.textContent = AppState.lang === "ar" ? "تم إرسال تقريرك اليومي للفريق الطبي ✅" : "Your daily report was sent to the care team ✅";
      setTimeout(() => toast.classList.add("hidden"), 3500);
    });
  }
}

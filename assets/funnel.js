/* AlgoJan funnel: shared by /discord, /apply and /booked (each page says which one it is in <body data-page="…">).
   Everything you'd want to change without touching the pages is in CONFIG below. */

const CONFIG = {
  // Where opt-ins and applications are sent (a Google Apps Script web app, Zapier/Make hook, GoHighLevel inbound
  // webhook…). Sent as a JSON POST. Leave empty while testing: the funnel still works, it just doesn't send anything.
  leadWebhookUrl: "",
  pages: { discord: "/discord", apply: "/apply", booked: "/booked" },
  // Videos are vertical (9:16). Paste a Vimeo / YouTube link or a direct .mp4 link. Empty shows a placeholder.
  videos: {
    vsl: "",         // /apply, Step #1
    nextSteps: "",   // /booked, Step #1
  },
  // Booking calendar shown on /apply after the application (GoHighLevel / Calendly / iClosed embed link).
  // In the calendar's own settings, set "redirect after booking" to https://YOURDOMAIN/booked.
  calendarUrl: "",
  discordUrl: "https://whop.com/algo-world-db94/",
  // Answers to the investment question that don't qualify for a call: they get the free Discord instead.
  disqualify: ["Under $500", "I don't have money to invest right now"],
  call: { title: "Strategy Call With Jan", minutes: 30,
    details: "Your strategy call with Jan (AlgoJan). The link to join is in your confirmation email and texts." },
  // Results wall on /discord. Put the screenshots in /assets/results/ and list them here, in the order to show them.
  // e.g. ["result-1.webp", "result-2.jpg", ["result-3.png", "Optional caption"]]
  results: Array.from({ length: 13 }, (_, i) => `/assets/v2/results/${i + 1}.webp`),   // same screenshots as /v2/discord
  // FAQ videos on /booked (vertical, like the VSL): [question, Vimeo / YouTube / .mp4 link]. Empty link = placeholder.
  faqVideos: [
    ["What's Inside AlgoJan?", ""],
    ["Is AlgoJan Legit?", ""],
    ["Who Is This For?", ""],
    ["How Much Time Do I Need To Put In?", ""],
  ],
  // "Just joined" popup in the corner of /discord. PLACEHOLDER NAMES: before going live, feed this from real
  // opt-ins (export from your CRM, or set recentJoinsUrl to a JSON list of {name, city, at}). Showing made-up
  // sign-ups as real is deceptive and breaks FTC and Meta ad rules. Set recentJoins to [] to turn it off.
  recentJoinsUrl: "",
  recentJoins: [
    { name: "Tristan", city: "Dallas" },
    { name: "Marcus", city: "Atlanta" },
    { name: "Daniel", city: "Toronto" },
    { name: "Chris", city: "Houston" },
    { name: "Ryan", city: "London" },
    { name: "Andre", city: "Miami" },
  ],
  joinedPopup: { firstAfter: 6, every: 14, showFor: 5 },   // seconds
};

// The application on /apply, one question at a time. Visitors who didn't opt in first are asked name, email, phone too.
const CONTACT_QUESTIONS = [
  { key: "name", type: "text", title: "First, what's your full name?", placeholder: "Full name", autocomplete: "name" },
  { key: "email", type: "email", title: "What's your email?", placeholder: "name@example.com", autocomplete: "email" },
  { key: "phone", type: "tel", title: "And your phone number?", placeholder: "Phone number (with country code)", autocomplete: "tel" },
];
const QUESTIONS = [
  { key: "experience", type: "choice", title: "Which of these best describes you right now?",
    options: ["I trade manually and want to automate it", "I've tried bots before and they didn't work", "I trade but I'm not consistent yet", "I'm completely new to trading"] },
  { key: "market", type: "choice", title: "What do you trade (or want to trade)?",
    options: ["Futures (NQ, ES, Gold…)", "Forex", "Crypto", "Not sure yet"] },
  { key: "goal", type: "long", title: "What's your biggest goal with trading over the next 6‑12 months?", placeholder: "Type your answer here…" },
  { key: "obstacle", type: "long", title: "What's the #1 thing holding you back from that goal right now?", placeholder: "Type your answer here…" },
  { key: "instagram", type: "text", title: "What's your Instagram?", placeholder: "@handle", optional: true },
  { key: "investment", type: "choice",
    title: "If this was a perfect fit, how much are you ready to invest in your trading and 1‑on‑1 help from Jan?",
    help: "Be honest. We'll help you either way.",
    options: ["$1,000 – $3,000", "$3,000 – $5,000", "$5,000+", "Under $500", "I don't have money to invest right now"] },
];

/* ======================================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PAGE = document.body.dataset.page;
const qs = new URLSearchParams(location.search);

const store = {
  get(k) { try { const s = JSON.parse(localStorage.getItem("algojan_" + k)); return s && Date.now() - s.at < 30 * 864e5 ? s.v : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem("algojan_" + k, JSON.stringify({ v, at: Date.now() })); } catch {} },
};
let lead = store.get("lead") || {};
["name", "email", "phone"].forEach(k => { const v = qs.get(k); if (v) lead[k] = v; });

// UTMs / ?ref= from the first link that had them, kept with the lead.
const source = store.get("source") || {};
["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"].forEach(k => { const v = qs.get(k); if (v) source[k] = v; });
if (!source.referrer && document.referrer && !document.referrer.includes(location.host)) source.referrer = document.referrer;
store.set("source", source);

function send(stage, data) {
  if (!CONFIG.leadWebhookUrl) return Promise.resolve();
  const body = JSON.stringify({ stage, page: PAGE, at: new Date().toISOString(), ...source, ...data });
  try { if (navigator.sendBeacon && navigator.sendBeacon(CONFIG.leadWebhookUrl, new Blob([body], { type: "text/plain" }))) return Promise.resolve(); } catch {}
  return fetch(CONFIG.leadWebhookUrl, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body }).catch(() => {});
}
const go = (path, extra = "") => {
  const keep = new URLSearchParams();
  for (const k of ["v", "ref"]) if (qs.get(k)) keep.set(k, qs.get(k));
  const q = keep.toString();
  location.href = path + (q || extra ? "?" + [q, extra].filter(Boolean).join("&") : "");
};

const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
const tidyName = n => n.trim().replace(/\s+/g, " ").replace(/\b\p{L}/gu, c => c.toUpperCase());
const digits = p => p.replace(/\D/g, "");

const COUNTRIES = [["US", "+1", "🇺🇸"], ["CA", "+1", "🇨🇦"], ["GB", "+44", "🇬🇧"], ["AU", "+61", "🇦🇺"], ["NZ", "+64", "🇳🇿"],
  ["IE", "+353", "🇮🇪"], ["DE", "+49", "🇩🇪"], ["FR", "+33", "🇫🇷"], ["NL", "+31", "🇳🇱"], ["ES", "+34", "🇪🇸"], ["IT", "+39", "🇮🇹"],
  ["AE", "+971", "🇦🇪"], ["ZA", "+27", "🇿🇦"], ["NG", "+234", "🇳🇬"], ["KE", "+254", "🇰🇪"], ["GH", "+233", "🇬🇭"], ["IN", "+91", "🇮🇳"],
  ["PH", "+63", "🇵🇭"], ["BR", "+55", "🇧🇷"], ["MX", "+52", "🇲🇽"]];

/* ---------- sticky CTA on phones: shown once the target is out of view ---------- */
(function sticky() {
  const bar = $("#sticky-cta"); if (!bar) return;
  const targets = $$(bar.dataset.hide); let visible = new Set();
  const update = () => bar.classList.toggle("show", scrollY > 500 && visible.size === 0);
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)); update(); });
  targets.forEach(t => io.observe(t));
  addEventListener("scroll", update, { passive: true });
})();

/* ---------- videos (vertical) ---------- */
function mountVideo(box, url, { autoplay = false } = {}) {
  if (!box) return;
  if (!url) { box.innerHTML = `<div class="vsl__ph"><span class="vsl__play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg></span><span>Video coming soon</span></div>`; return; }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    box.innerHTML = `<video playsinline ${autoplay ? "autoplay muted" : "controls"} preload="metadata" src="${esc(url)}"></video>`;
    const v = $("video", box);
    if (autoplay) {
      const b = document.createElement("button");
      b.className = "unmute"; b.type = "button";
      b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>Click To Unmute`;
      b.onclick = () => { v.muted = false; v.currentTime = 0; v.controls = true; v.play(); b.remove(); };
      box.appendChild(b);
    }
    return;
  }
  let src = url;
  if (vimeo) src = `https://player.vimeo.com/video/${vimeo[1]}?${vimeo[2] ? "h=" + vimeo[2] + "&" : ""}title=0&byline=0&portrait=0&playsinline=1${autoplay ? "&autoplay=1&muted=1" : ""}`;
  else if (yt) src = `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1&modestbranding=1${autoplay ? "&autoplay=1&mute=1" : ""}`;
  box.innerHTML = `<iframe src="${esc(src)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
}

/* ---------- "just joined" popup ---------- */
async function joinedPopup() {
  const el = $("#joined"); if (!el) return;
  let list = CONFIG.recentJoins;
  if (CONFIG.recentJoinsUrl) { try { list = await (await fetch(CONFIG.recentJoinsUrl)).json(); } catch {} }
  if (!list || !list.length) return;
  const { firstAfter, every, showFor } = CONFIG.joinedPopup;
  const ago = at => { const sec = Math.max(1, Math.round((Date.now() - new Date(at)) / 1000));
    return sec < 60 ? `${sec} seconds ago` : sec < 3600 ? `${Math.round(sec / 60)} min ago` : "Today"; };
  let n = 0;
  const show = () => {
    if (document.hidden) return;
    const p = list[n++ % list.length];
    $("#joined-name").textContent = p.name;
    $("#joined-city").textContent = p.city || "the US";
    $("#joined-av").textContent = (p.name || "?")[0].toUpperCase();
    $("#joined-when").textContent = p.at ? ago(p.at) : "Just now";
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("in"));
    setTimeout(() => el.classList.toggle("in", false), showFor * 1000);
  };
  setTimeout(() => { show(); setInterval(show, every * 1000); }, firstAfter * 1000);
}

/* ---------- confetti for people who just opted in ---------- */
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
  const x = c.getContext("2d"), dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.scale(dpr, dpr);
  const cols = ["#ee6a1f", "#16120f", "#f4a46e"];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .3,
    vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 3, s: 5 + Math.random() * 6, r: Math.random() * 6, c: cols[Math.random() * cols.length | 0] }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += .1;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
    if (++t < 160) requestAnimationFrame(f); else c.remove();
  })();
}

/* ======================================================================= */
/* /discord: opt-in form, value stack, about, results                      */
/* ======================================================================= */
if (PAGE === "discord") {
  const form = $("#optin-form"), err = $("#optin-error");
  const cc = $("select[name=cc]", form);
  cc.innerHTML = COUNTRIES.map(([c, d, f]) => `<option value="${c}">${f} ${d}</option>`).join("");
  try {
    const region = (navigator.language || "").split("-")[1];
    if (region && COUNTRIES.some(c => c[0] === region)) cc.value = region;
  } catch {}
  if (lead.name) form.name.value = lead.name;
  if (lead.email) form.email.value = lead.email;

  form.addEventListener("submit", e => {
    e.preventDefault();
    $$(".bad", form).forEach(i => i.classList.remove("bad"));
    const name = tidyName(form.elements.name.value), email = form.email.value.trim(), phone = digits(form.phone.value);
    const bad = [];
    if (name.length < 2) bad.push([form.elements.name, "Please enter your name."]);
    if (phone.length < 6) bad.push([form.phone, "Please enter a valid phone number."]);
    if (!emailOk(email)) bad.push([form.email, "Please enter a valid email."]);
    if (bad.length) {
      bad.forEach(([i]) => (i.closest(".ifield") || i).classList.add("bad"));
      err.textContent = bad[0][1]; err.hidden = false; bad[0][0].focus(); return;
    }
    err.hidden = true;
    const dial = COUNTRIES.find(c => c[0] === cc.value)[1];
    lead = { name, email, phone: dial + phone, country: cc.value };
    store.set("lead", lead);
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.firstChild.textContent = "Sending your invite… ";
    // A page can send people somewhere else after the form (e.g. /v2/discord → checkout): <body data-next="…">.
    const next = document.body.dataset.next;
    send("optin", lead).finally(() => next ? (location.href = next) : go(CONFIG.pages.apply, "joined=1"));
  });

  joinedPopup();

  // Results wall
  const wall = $("#results");
  if (wall) {
    wall.innerHTML = CONFIG.results.length
      ? CONFIG.results.map(r => { const [file, cap] = Array.isArray(r) ? r : [r, ""];
          return `<figure class="result"><img loading="lazy" decoding="async" src="${file.startsWith("/") ? esc(file) : "/assets/results/" + esc(file)}" alt="${esc(cap || "Community member result")}">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`; }).join("")
      : Array.from({ length: 9 }, (_, i) => `<div class="result result--empty">Result screenshot ${i + 1}<br>(add to /assets/results)</div>`).join("");
  }
}

/* ======================================================================= */
/* /apply: vertical VSL, then the application, then the calendar          */
/* ======================================================================= */
if (PAGE === "apply") {
  if (qs.get("joined")) { setTimeout(confetti, 350); history.replaceState(null, "", location.pathname + location.search.replace(/[?&]joined=1/, "").replace(/^&/, "?")); }
  mountVideo($("#vsl"), CONFIG.videos.vsl, { autoplay: true });

  const steps = [...(lead.email && lead.name && lead.phone ? [] : CONTACT_QUESTIONS), ...QUESTIONS];
  const answers = store.get("answers") || {};
  let i = 0;
  const quiz = $("#quiz"), body = $("#quiz-body"), bar = $("#quiz-bar"), back = $("#quiz-back"), next = $("#quiz-next");

  function render() {
    const q = steps[i];
    bar.style.width = (i / steps.length * 100) + "%";
    back.style.visibility = i ? "visible" : "hidden";
    const val = q.key in lead && !(q.key in answers) ? lead[q.key] : answers[q.key] || "";
    let field = "";
    if (q.type === "choice") {
      field = `<div class="opts" role="radiogroup">${q.options.map((o, n) =>
        `<button type="button" class="opt${val === o ? " on" : ""}" role="radio" aria-checked="${val === o}" data-v="${esc(o)}"><span class="opt__key">${String.fromCharCode(65 + n)}</span>${esc(o)}</button>`).join("")}</div>`;
    } else if (q.type === "long") {
      field = `<textarea class="textarea" name="a" placeholder="${esc(q.placeholder || "")}">${esc(val)}</textarea>`;
    } else {
      field = `<input class="input" name="a" type="${q.type}" placeholder="${esc(q.placeholder || "")}" autocomplete="${q.autocomplete || "off"}" value="${esc(val)}">`;
    }
    body.innerHTML = `<div class="quiz__count">Question ${i + 1} of ${steps.length}</div>
      <h3 class="quiz__q">${esc(q.title)}</h3>${q.help ? `<p class="quiz__help">${esc(q.help)}</p>` : ""}
      <div class="quiz__body">${field}</div><p class="error" id="quiz-err" hidden></p>`;
    next.hidden = q.type === "choice";
    $$(".opt", body).forEach(b => b.onclick = () => {
      $$(".opt", body).forEach(o => { o.classList.remove("on"); o.setAttribute("aria-checked", "false"); });
      b.classList.add("on"); b.setAttribute("aria-checked", "true");
      setTimeout(() => commit(b.dataset.v), 180);
    });
    const inp = $("[name=a]", body);
    if (inp && i > 0) inp.focus({ preventScroll: true });
    if (inp && q.type !== "long") inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); next.click(); } };
  }
  function fail(msg) { const e = $("#quiz-err"); e.textContent = msg; e.hidden = false; }
  next.onclick = () => {
    const q = steps[i], v = $("[name=a]", body).value.trim();
    if (!v && !q.optional) return fail("Please answer to continue.");
    if (q.type === "email" && !emailOk(v)) return fail("Please enter a valid email.");
    if (q.type === "tel" && digits(v).length < 7) return fail("Please enter a valid phone number.");
    commit(q.key === "name" ? tidyName(v) : v);
  };
  back.onclick = () => { if (i) { i--; render(); } };

  function commit(v) {
    const q = steps[i];
    if (CONTACT_QUESTIONS.includes(q)) { lead[q.key] = v; store.set("lead", lead); }
    else { answers[q.key] = v; store.set("answers", answers); }
    if (++i < steps.length) return render();
    bar.style.width = "100%";
    const out = CONFIG.disqualify.includes(answers.investment);
    send(out ? "application-nq" : "application", { ...lead, ...answers });
    quiz.hidden = true;
    if (out) {
      $("#nq").hidden = false;
      $("#nq-discord").href = CONFIG.discordUrl;
    } else showCalendar();
    $("#book").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showCalendar() {
    const cal = $("#cal"); cal.hidden = false;
    const frame = $("#cal-frame");
    if (!CONFIG.calendarUrl) {
      frame.innerHTML = `<div class="cal__demo"><b>Booking calendar goes here.</b><span>Add your calendar link to <code>calendarUrl</code> in /assets/funnel.js.</span><a class="btn btn--dark" href="${CONFIG.pages.booked}">Preview the booked page →</a></div>`;
      return;
    }
    // Most calendars fill their booking form from these.
    const [first, ...rest] = (lead.name || "").split(" ");
    const u = new URL(CONFIG.calendarUrl);
    Object.entries({ first_name: first, last_name: rest.join(" ") || "-", name: lead.name, email: lead.email, phone: lead.phone })
      .forEach(([k, v]) => v && u.searchParams.set(k, v));
    frame.innerHTML = `<iframe src="${esc(u)}" title="Book your call" loading="eager"></iframe>`;
  }

  // If they already finished the application on this phone, go straight to the calendar.
  if (QUESTIONS.every(q => q.optional || answers[q.key]) && (lead.email)) {
    quiz.hidden = true;
    CONFIG.disqualify.includes(answers.investment) ? ($("#nq").hidden = false, $("#nq-discord").href = CONFIG.discordUrl) : showCalendar();
  } else render();
}

/* ======================================================================= */
/* /booked: confirm-your-call steps                                        */
/* ======================================================================= */
if (PAGE === "booked") {
  mountVideo($("#next-steps"), CONFIG.videos.nextSteps);
  const t = encodeURIComponent(CONFIG.call.title), d = encodeURIComponent(CONFIG.call.details);
  const g = $("#addcal-google"), o = $("#addcal-outlook");
  if (g) g.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&details=${d}`;
  if (o) o.href = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${t}&body=${d}`;
  const grid = $("#faq-videos");
  if (grid) {
    grid.innerHTML = CONFIG.faqVideos.map((_, n) => `<article class="vid"><div class="vsl" id="faq-${n}"></div><h3></h3></article>`).join("");
    CONFIG.faqVideos.forEach(([q, url], n) => { $(`#faq-${n} + h3`).textContent = q; mountVideo($(`#faq-${n}`), url); });
  }
  if (lead.name) { const n = $("#booked-name"); if (n) n.textContent = lead.name.split(" ")[0] + ", wait!"; }
}

$$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());

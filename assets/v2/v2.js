/* AlgoJan v2 (dark) — /v2/discord and /bots. The opt-in form, popup and sticky button come from /assets/funnel.js
   (this page says data-page="discord"); this file adds the dark page's own parts. */

const V2 = {
  // The VSL on Vimeo: 16:9 for tablets and desktops, 9:16 for phones (screens up to 767px wide).
  video: {
    wide: "https://player.vimeo.com/video/1248297945",
    tall: "https://player.vimeo.com/video/1248297943",
  },
  // The proof row under the button. Use REAL numbers only. Leave a value "" to hide that item.
  stats: {
    rating: "",             // average rating, e.g. "4.9" — Jan's real Whop rating (hidden until filled in)
    reviews: "",            // number of reviews, e.g. "162" (hidden until filled in)
    reviewsLink: "https://whop.com/algo-world-db94/",   // where people can read the reviews
    members: "2,200+",      // people in the community
    // Always-true items shown after the ones above. Add a payouts total here only once you can back it up.
    extras: [["Full bundle", "included"], ["50%", "off today"]],
  },
  // How many numbered images are in each folder (1.webp … N.webp). Bump the number after uploading more.
  // bg/sm/ holds small copies for the background (faster); if one is missing the full image is used.
  bgCount: 27,
  resultsCount: 13,
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const list = (dir, n) => Array.from({ length: n }, (_, i) => `${dir}${i + 1}.webp`);

  /* ---------- background: scattered, overlapping, tilted images ---------- */
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function fillCollage() {
    const box = $("#collage"); if (!box) return;
    const imgs = list("/assets/v2/bg/sm/", V2.bgCount);
    if (!imgs.length) return;
    const W = box.clientWidth, H = box.clientHeight, phone = W < 700;
    const cols = phone ? 3 : 7, rows = phone ? 5 : 4;
    const cw = W / cols, ch = H / rows;
    let html = "", k = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const w = cw * (0.85 + rnd() * 0.55);                        // wider than the cell, so they overlap
      const x = c * cw + (rnd() - 0.5) * cw * 0.5 - (w - cw) / 2;
      const y = r * ch + (rnd() - 0.5) * ch * 0.45 - 20;
      const h = w * (0.7 + rnd() * 0.55);
      const rot = (rnd() - 0.5) * 14;
      const src = imgs[k++ % imgs.length];
      html += `<img src="${src}" alt="" decoding="async" style="left:${x | 0}px;top:${y | 0}px;width:${w | 0}px;height:${h | 0}px;transform:rotate(${rot.toFixed(1)}deg);z-index:${(rnd() * 10) | 0}" onload="this.classList.add('in')" onerror="this.onerror=null;this.src=this.src.replace('/sm/','/')">`;
    }
    box.innerHTML = html;
  }

  /* ---------- results marquee under the button ---------- */
  function fillMarquee() {
    const box = $("#marquee"); if (!box) return;
    const imgs = list("/assets/v2/results/", V2.resultsCount);
    if (!imgs.length) { box.remove(); return; }
    const a = imgs.filter((_, i) => i % 2 === 0), b = imgs.filter((_, i) => i % 2 === 1);
    box.innerHTML = [a, b].map((r, i) => `<div class="marquee__row${i ? " marquee__row--rev" : ""}">${r.concat(r, r).map(src =>
      `<img src="${src}" alt="" loading="lazy" decoding="async">`).join("")}</div>`).join("");
  }

  /* ---------- the VSL (Vimeo) ----------
     1. On load the video starts silently in the background (muted preview, Vimeo's title/name/logo/controls off).
        Our designed thumbnail covers it ONLY until the preview is really playing, then fades away.
     2. Over the preview: the play button with "Plays at 1.2x speed" under it.
     3. Click: back to 0:00, sound on, 1.2x speed, our own controls.
     4. Just before the end it stops and shows the thumbnail with "Watch again", so Vimeo's end screen never shows.
     If the browser won't autoplay even a muted video (e.g. iPhone low-power mode), the thumbnail simply stays until
     the click. Same clean-embed approach as Jean's funnel. */
  const PHONE = matchMedia("(max-width: 767px)");
  const SPEED = 1.2;   // starting speed; the 1x / 1.2x button in the controls switches it
  const VIMEO_CLEAN = { title: 0, byline: 0, portrait: 0, badge: 0, vimeo_logo: 0, pip: 0, playsinline: 1, dnt: 1,
    autopause: 0, texttrack: "false", transparent: 0, speed: 1 };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5c1.5 1.5 1.5 5.5 0 7M19.5 5.5c3.2 3.2 3.2 9.8 0 13"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    fast: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5l9 7-9 7zM12 5l9 7-9 7z"/></svg>',
  };
  function mountVideo() {
    const box = $("#v2-video"), thumb = box && $(".thumb", box);
    if (!thumb) return;
    const url = (PHONE.matches ? V2.video.tall : V2.video.wide) || V2.video.wide || V2.video.tall;
    if (!url) return;
    const custom = !!window.Vimeo;
    const u = new URL(url);
    Object.entries({ ...VIMEO_CLEAN, ...(custom ? { controls: 0, autoplay: 1, muted: 1, loop: 0 } : {}) }).forEach(([k, v]) => u.searchParams.set(k, v));
    box.insertAdjacentHTML("afterbegin", `<iframe src="${u.href}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Video"></iframe>`);
    const iframe = $("iframe", box);
    if (!custom) {   // player library missing: Vimeo's own player under our thumbnail, which goes on click
      thumb.addEventListener("click", () => box.classList.add("is-playing"), { once: true });
      return;
    }
    const player = new Vimeo.Player(iframe);
    box.insertAdjacentHTML("beforeend", `
      <button class="vp__cover" type="button" aria-label="Play the video with sound">
        <span class="vp__play">${ICON.play}</span>
        <span class="vp__speed">${ICON.fast}Plays at ${SPEED}x speed</span>
      </button>
      <button class="vp__hit" type="button" aria-label="Play or pause"></button>
      <div class="vp__bar">
        <button class="vp__btn vp__toggle" type="button" aria-label="Play or pause">${ICON.play}${ICON.pause}</button>
        <div class="vp__track" role="slider" aria-label="Seek" tabindex="0"><span class="vp__rail"><span class="vp__fill"></span></span></div>
        <button class="vp__rate" type="button" aria-label="Playback speed">${SPEED}x</button>
        <button class="vp__btn vp__mute" type="button" aria-label="Sound on or off">${ICON.sound}${ICON.muted}</button>
        <button class="vp__btn vp__full" type="button" aria-label="Full screen">${ICON.full}</button>
      </div>`);
    const fill = $(".vp__fill", box), track = $(".vp__track", box);
    let mode = "preview", paused = true, duration = 0, uiTimer, rate = SPEED;   // mode: preview → watching → ended
    const set = m => { mode = m; box.dataset.mode = m; };
    set("preview");
    const showUi = () => { box.classList.add("show-ui"); clearTimeout(uiTimer); uiTimer = setTimeout(() => box.classList.remove("show-ui"), 2500); };
    const noCaptions = () => player.disableTextTrack().catch(() => {});
    ["loaded", "play"].forEach(ev => player.on(ev, noCaptions));
    player.on("cuechange", d => { if (d && d.cues && d.cues.length) noCaptions(); });
    player.ready().then(() => { player.setMuted(true).catch(() => {}); return player.play(); }).catch(() => {});   // the silent preview

    // The thumbnail goes once the preview is really moving (not just "loaded").
    player.on("timeupdate", d => {
      duration = d.duration || duration;
      if (mode === "preview" && d.seconds > 0.15) box.classList.add("is-ready");
      if (mode === "watching") {
        if (!paused && d.duration > 2 && d.seconds >= d.duration - 0.6) return finish();
        fill.style.width = (d.percent || 0) * 100 + "%";
      } else if (mode === "preview" && d.duration > 2 && d.seconds >= d.duration - 0.6) {
        player.setCurrentTime(0).catch(() => {});   // keep the preview looping without the end screen
      }
    });
    player.on("play", () => { paused = false; box.classList.remove("is-paused"); });
    player.on("pause", () => { paused = true; box.classList.add("is-paused"); });
    player.on("ended", () => (mode === "watching" ? finish() : player.setCurrentTime(0).then(() => player.play()).catch(() => {})));

    // Click: from the start, with sound, at 1.2x.
    const watch = () => {
      set("watching"); box.classList.add("is-ready", "is-playing");
      fill.style.width = "0%";
      player.setPlaybackRate(rate).catch(() => {});
      player.setCurrentTime(0).catch(() => {});
      player.setMuted(false).catch(() => {});
      player.setVolume(1).catch(() => {});
      player.play().catch(() => {
        // the browser refused sound: play muted and let them tap the sound button
        player.setMuted(true).catch(() => {}); box.classList.add("is-muted"); player.play().catch(() => {});
      });
      box.classList.remove("is-muted");
      showUi();
    };
    const finish = () => {
      set("ended"); box.classList.remove("is-playing");
      player.pause().catch(() => {}); player.setCurrentTime(0).catch(() => {});
      fill.style.width = "0%";
    };
    $(".vp__cover", box).addEventListener("click", watch);
    thumb.addEventListener("click", watch);
    thumb.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); watch(); } });
    const toggle = () => (paused ? player.play().catch(() => {}) : player.pause().catch(() => {}));
    $(".vp__hit", box).addEventListener("click", () => { toggle(); showUi(); });
    box.addEventListener("pointermove", e => { if (e.pointerType === "mouse" && mode === "watching") showUi(); });
    $(".vp__toggle", box).addEventListener("click", () => { toggle(); showUi(); });
    const rateBtn = $(".vp__rate", box);
    rateBtn.addEventListener("click", () => {
      rate = rate === 1 ? SPEED : 1;
      rateBtn.textContent = rate + "x"; rateBtn.classList.toggle("is-normal", rate === 1);
      player.setPlaybackRate(rate).catch(() => {}); showUi();
    });
    $(".vp__mute", box).addEventListener("click", () => {
      const m = !box.classList.contains("is-muted");
      box.classList.toggle("is-muted", m); player.setMuted(m).catch(() => {}); if (!m) player.setVolume(1).catch(() => {}); showUi();
    });
    $(".vp__full", box).addEventListener("click", () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) return (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      const full = box.requestFullscreen || box.webkitRequestFullscreen;
      if (full) full.call(box); else player.requestFullscreen().catch(() => {});
    });
    const seek = pct => { if (duration) player.setCurrentTime(Math.max(0, Math.min(1, pct)) * duration * 0.98).catch(() => {}); };
    track.addEventListener("click", e => { const r = track.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); showUi(); });
    track.addEventListener("keydown", e => { const step = { ArrowRight: .05, ArrowLeft: -.05 }[e.key]; if (step) { e.preventDefault(); seek(parseFloat(fill.style.width || 0) / 100 + step); } });
  }

  /* ---------- proof row ---------- */
  function fillStats() {
    const s = V2.stats, row = $("#proof"); if (!row) return;
    const items = [];
    if (s.rating) items.push(`<span class="stars" aria-hidden="true">★★★★★</span> <b>${s.rating}</b>${s.reviews ? ` from ${s.reviewsLink ? `<a href="${s.reviewsLink}" target="_blank" rel="noopener">${s.reviews} reviews</a>` : `${s.reviews} reviews`}` : " rating"}`);
    if (s.members) items.push(`${s.rating ? "" : `<span class="stars" aria-hidden="true">★★★★★</span> `}<b>${s.members}</b> members`);
    (s.extras || []).forEach(([v, t]) => items.push(`<b class="gold-t">${v}</b> ${t}`));
    row.innerHTML = items.map(t => `<li>${t}</li>`).join("");
  }

  /* ---------- join modal ---------- */
  /* ---------- tracking for /admin: a visit per page load, a click per "Get Access Now" ---------- */
  // Counts go to Abacus (free counter service, no account): a total and a per-day counter for each event.
  const COUNTER = "https://abacus.jasoncameron.dev/hit/algojan-ai-trading/";
  const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const track = ev => { [ev, ev + "-" + today()].forEach(k => fetch(COUNTER + k, { keepalive: true, mode: "cors" }).catch(() => {})); };
  function ctas() {
    if (/[?&]rt=off\b/.test(location.search)) { try { localStorage.setItem("algojan_notrack", "1"); } catch {} }
    let off = false; try { off = localStorage.getItem("algojan_notrack") === "1"; } catch {}
    if (off) return;
    track("visit");
    document.querySelectorAll("[data-cta]").forEach(a => a.addEventListener("click", () => track("click")));
  }

  fillStats(); mountVideo(); ctas(); if (typeof joinedPopup === "function") joinedPopup(); fillCollage(); fillMarquee();
  // redraw the background only when the width changes (phones fire resize when the address bar hides)
  let t, lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(t); t = setTimeout(() => { seed = 11; fillCollage(); }, 250); });
})();

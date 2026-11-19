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
    extras: [["9", "MT5 bots included"], ["FREE", "to join, no card"]],
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
     Same approach as Jean's funnel: Vimeo's title, name, avatar, logo, captions and controls are switched off and
     we draw our own controls. The video stops just before its last half second and goes back to our thumbnail
     with a Replay button, so Vimeo's end screen ("More from…" / other videos) never shows. Our thumbnail stays on
     top while the player loads and only fades once the video is really playing. */
  const PHONE = matchMedia("(max-width: 767px)");
  const VIMEO_CLEAN = { title: 0, byline: 0, portrait: 0, badge: 0, vimeo_logo: 0, pip: 0, playsinline: 1, dnt: 1,
    autopause: 0, texttrack: "false", transparent: 0 };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5c1.5 1.5 1.5 5.5 0 7M19.5 5.5c3.2 3.2 3.2 9.8 0 13"/></svg>',
    muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 3.5v5h5"/></svg>',
  };
  const vimeoSrc = (url, custom) => {
    const u = new URL(url);
    Object.entries({ ...VIMEO_CLEAN, autoplay: 1, ...(custom ? { controls: 0 } : {}) }).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.href;
  };
  function mountVideo() {
    const box = $("#v2-video"), thumb = box && $(".thumb", box);
    if (!thumb) return;
    const url = () => (PHONE.matches ? V2.video.tall : V2.video.wide) || V2.video.wide || V2.video.tall;
    if (!url()) return;
    // Warm up the connection to Vimeo when someone heads for the play button, so it starts faster.
    const warm = () => { ["https://player.vimeo.com", "https://i.vimeocdn.com", "https://f.vimeocdn.com"].forEach(h => {
      const l = document.createElement("link"); l.rel = "preconnect"; l.href = h; document.head.appendChild(l); }); };
    thumb.addEventListener("pointerenter", warm, { once: true });
    thumb.addEventListener("touchstart", warm, { once: true, passive: true });
    thumb.addEventListener("click", () => start(box, thumb, url()), { once: true });
    thumb.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); thumb.click(); } });
  }
  function start(box, thumb, url) {
    box.classList.add("is-loading");
    const custom = !!window.Vimeo;
    box.insertAdjacentHTML("afterbegin", `<iframe src="${vimeoSrc(url, custom)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Video"></iframe>`);
    const iframe = $("iframe", box);
    const reveal = () => { box.classList.remove("is-loading"); box.classList.add("is-playing"); };
    if (!custom) { iframe.addEventListener("load", () => setTimeout(reveal, 600)); return; }   // player library missing: Vimeo's own controls

    const player = new Vimeo.Player(iframe);
    box.insertAdjacentHTML("beforeend", `
      <button class="vp__hit" type="button" aria-label="Play or pause"></button>
      <div class="vp__bar">
        <button class="vp__btn vp__toggle" type="button" aria-label="Play or pause">${ICON.play}${ICON.pause}</button>
        <div class="vp__track" role="slider" aria-label="Seek" tabindex="0"><span class="vp__rail"><span class="vp__fill"></span></span></div>
        <button class="vp__btn vp__mute" type="button" aria-label="Sound on or off">${ICON.sound}${ICON.muted}</button>
        <button class="vp__btn vp__full" type="button" aria-label="Full screen">${ICON.full}</button>
      </div>
      <button class="vp__unmute" type="button" hidden>${ICON.muted}<span>Tap To Unmute</span></button>`);
    const fill = $(".vp__fill", box), unmuteBtn = $(".vp__unmute", box), track = $(".vp__track", box);
    let paused = true, duration = 0, ended = false, uiTimer;
    const showUi = () => { box.classList.add("show-ui"); clearTimeout(uiTimer); uiTimer = setTimeout(() => box.classList.remove("show-ui"), 2500); };
    const setMuted = m => { box.classList.toggle("is-muted", m); player.setMuted(m).catch(() => {}); if (!m) player.setVolume(1).catch(() => {}); };
    const noCaptions = () => player.disableTextTrack().catch(() => {});
    ["loaded", "play"].forEach(ev => player.on(ev, noCaptions));
    player.on("cuechange", d => { if (d && d.cues && d.cues.length) noCaptions(); });
    // Some browsers block sound when the player starts: play muted instead and offer "Tap to unmute".
    player.ready().then(() => player.play()).catch(() => { setMuted(true); unmuteBtn.hidden = false; player.play().catch(() => {}); });
    const play = () => player.play().catch(() => {});
    const toggle = () => (paused ? play() : player.pause().catch(() => {}));
    player.on("play", () => { paused = false; ended = false; box.classList.remove("is-paused", "is-ended"); reveal(); });
    player.on("pause", () => { paused = true; box.classList.add("is-paused"); });
    // The end: back to our thumbnail with Replay, before Vimeo's end screen can show.
    const finish = () => {
      if (ended) return; ended = true; paused = true;
      player.pause().catch(() => {}); player.setCurrentTime(0).catch(() => {});
      fill.style.width = "0%"; box.classList.add("is-ended"); box.classList.remove("is-playing");
    };
    player.on("ended", finish);
    player.on("timeupdate", d => {
      duration = d.duration || duration;
      if (!ended && !paused && d.duration > 2 && d.seconds >= d.duration - 0.6) return finish();
      fill.style.width = (d.percent || 0) * 100 + "%";
    });
    thumb.addEventListener("click", () => { if (box.classList.contains("is-ended")) { setMuted(false); play(); } });
    $(".vp__hit", box).addEventListener("click", () => { toggle(); showUi(); });
    box.addEventListener("pointermove", e => { if (e.pointerType === "mouse") showUi(); });
    $(".vp__toggle", box).addEventListener("click", () => { toggle(); showUi(); });
    $(".vp__mute", box).addEventListener("click", () => { unmuteBtn.hidden = true; setMuted(!box.classList.contains("is-muted")); showUi(); });
    unmuteBtn.addEventListener("click", () => { unmuteBtn.hidden = true; player.setCurrentTime(0).catch(() => {}); setMuted(false); play(); });
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
  function modal() {
    const dlg = $("#join"); if (!dlg) return;
    const open = e => { e.preventDefault(); if (!dlg.open) dlg.showModal(); setTimeout(() => $("input[name=name]", dlg).focus(), 50); };
    document.querySelectorAll("[data-join]").forEach(a => a.addEventListener("click", open));
    $(".join__close", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
    if (location.hash === "#join") setTimeout(() => dlg.showModal(), 300);
  }

  fillStats(); mountVideo(); modal(); fillCollage(); fillMarquee();
  // redraw the background only when the width changes (phones fire resize when the address bar hides)
  let t, lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(t); t = setTimeout(() => { seed = 11; fillCollage(); }, 250); });
})();

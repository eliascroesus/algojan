/* AlgoJan v2 (dark) — /v2/discord and /bots. The opt-in form, popup and sticky button come from /assets/funnel.js
   (this page says data-page="discord"); this file adds the dark page's own parts. */

const V2 = {
  // Horizontal VSL (16:9). Vimeo, YouTube, Wistia or .mp4 link. Empty = the thumbnail only.
  video: "",
  // The proof row under the button. Use REAL numbers only. Leave a value "" to hide that item.
  stats: {
    rating: "",             // average rating, e.g. "4.9" — Jan's real Whop rating (hidden until filled in)
    reviews: "",            // number of reviews, e.g. "162" (hidden until filled in)
    reviewsLink: "https://whop.com/algo-world-db94/",   // where people can read the reviews
    members: "2,200+",      // people in the community
    // Always-true items shown after the ones above. Add a payouts total here only once you can back it up.
    extras: [["9", "AI bots included"], ["$0", "to join, no card"]],
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

  /* ---------- horizontal VSL: the thumbnail loads the player when clicked ---------- */
  function mountVideo() {
    const box = $("#v2-video"); if (!box || !V2.video) return;
    $(".thumb", box).addEventListener("click", () => load(true), { once: true });
  }
  function load(autoplay) {
    const box = $("#v2-video"), url = V2.video;
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    const wistia = url.match(/(?:wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/|wvideo=)(\w{10})/);
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) { box.innerHTML = `<video controls playsinline ${autoplay ? "autoplay" : ""} preload="metadata" src="${url}"></video>`; return; }
    const src = vimeo ? `https://player.vimeo.com/video/${vimeo[1]}?${vimeo[2] ? "h=" + vimeo[2] + "&" : ""}title=0&byline=0&portrait=0${autoplay ? "&autoplay=1" : ""}`
      : yt ? `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`
      : wistia ? `https://fast.wistia.net/embed/iframe/${wistia[1]}?videoFoam=true${autoplay ? "&autoPlay=true" : ""}` : url;
    box.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
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

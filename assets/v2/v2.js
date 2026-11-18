/* AlgoJan v2 (dark) — /v2/discord. The opt-in form, popup and sticky button come from /assets/funnel.js
   (this page says data-page="discord"); this file adds the dark page's own parts. */

const V2 = {
  // Horizontal VSL (16:9). Vimeo, YouTube, Wistia or .mp4 link. Empty = the "Bot Vault in 3 minutes" placeholder.
  video: "",
  // The proof row under the button. Use REAL numbers only. Leave a value "" to hide that item.
  stats: {
    rating: "",             // average rating, e.g. "4.9" — Jan's real Whop rating (hidden until filled in)
    reviews: "",            // number of reviews, e.g. "162" (hidden until you fill it in)
    reviewsLink: "https://whop.com/algo-world-db94/",   // where people can read the reviews
    members: "2,200+",      // people in the community
    // Always-true items shown after the ones above. Add a payouts total here only once you can back it up.
    extras: [["9", "AI bots included"], ["$0", "to join, no card"]],
  },
  // Background collage + results wall: numbered images (1.webp, 2.jpg, 3.png…, no gaps) in these folders.
  // The page finds them by itself. See assets/v2/README.md.
  bgDir: "/assets/v2/bg/",
  resultsDir: "/assets/v2/results/",
  maxImages: 60,
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- find numbered images in a folder: 1.jpg, 2.png, … ---------- */
  const EXTS = ["jpg", "png", "webp", "jpeg"];
  const tryLoad = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(src); i.onerror = () => ok(null); i.src = src; });
  async function findImages(dir) {
    const found = [];
    for (let n = 1; n <= V2.maxImages; n++) {
      const hits = (await Promise.all(EXTS.map(e => tryLoad(`${dir}${n}.${e}`)))).filter(Boolean);
      if (!hits.length) break;
      found.push(hits[0]);
    }
    return found;
  }

  /* ---------- generated chart tile (used until real images are uploaded) ---------- */
  const SYMBOLS = ["NQ1! · 5m", "ES1! · 15m", "XAUUSD · 5m", "EURUSD · 15m", "GBPUSD · 5m", "BTCUSD · 1h", "YM1! · 5m", "US30 · 1m"];
  const BOTS = ["Liquidity Sweep Sniper", "London Breakout Bot", "NY Open Scalper", "Order Block Hunter", "FVG Reversal Algo", "Prop Firm Guardian"];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function chartTile(i) {
    const W = 300, H = 210, n = 34, cw = (W - 30) / n;
    let p = 100 + rnd() * 20, hi = -1e9, lo = 1e9; const c = [];
    const drift = rnd() > .35 ? .5 : -.4;
    for (let k = 0; k < n; k++) { const o = p, cl = o + (rnd() - .5) * 8 + drift; const h = Math.max(o, cl) + rnd() * 4, l = Math.min(o, cl) - rnd() * 4; c.push([o, h, l, cl]); p = cl; hi = Math.max(hi, h); lo = Math.min(lo, l); }
    const y = v => 52 + (hi - v) / (hi - lo) * (H - 70);
    const bars = c.map(([o, h, l, cl], k) => { const x = 15 + k * cw + cw / 2, up = cl >= o, col = up ? "#2fbf71" : "#e04848";
      return `<line x1="${x}" x2="${x}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="1"/><rect x="${x - cw * .32}" y="${y(Math.max(o, cl))}" width="${cw * .64}" height="${Math.max(1, Math.abs(y(o) - y(cl)))}" fill="${col}"/>`; }).join("");
    const lvl = y(c[Math.floor(n * .4)][1]);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="#101015"/>
      <g stroke="rgba(255,255,255,.04)">${[60, 100, 140, 180].map(v => `<line x1="0" x2="${W}" y1="${v}" y2="${v}"/>`).join("")}</g>
      <line x1="15" x2="${W - 15}" y1="${lvl}" y2="${lvl}" stroke="#e7bd45" stroke-dasharray="4 4" stroke-opacity=".6"/>
      ${bars}
      <text x="14" y="24" fill="#d9d6d0" font-family="Inter,sans-serif" font-size="13" font-weight="700">${SYMBOLS[i % SYMBOLS.length]}</text>
      <text x="14" y="40" fill="#7d7973" font-family="Inter,sans-serif" font-size="10.5">${BOTS[i % BOTS.length]} · running</text>
      <circle cx="${W - 22}" cy="20" r="4" fill="#3ddc84"/></svg>`;
  }

  async function fillCollage() {
    const box = $("#collage"); if (!box) return;
    const imgs = await findImages(V2.bgDir);
    const count = 30, tall = new Set([1, 4, 8, 13, 16, 21, 26]);
    box.innerHTML = Array.from({ length: count }, (_, i) => {
      const cls = tall.has(i) ? ' class="tall"' : "";
      return imgs.length ? `<div${cls}><img src="${imgs[i % imgs.length]}" alt="" loading="lazy" decoding="async"></div>` : `<div${cls}>${chartTile(i)}</div>`;
    }).join("");
  }

  async function fillMarquee() {
    const box = $("#marquee"); if (!box) return;
    const imgs = await findImages(V2.resultsDir);
    if (!imgs.length) { box.remove(); return; }
    const half = Math.ceil(imgs.length / 2);
    const rows = [imgs.slice(0, half), imgs.slice(half).concat(imgs.slice(0, Math.max(0, half - (imgs.length - half))))];
    // each row is doubled so the loop is seamless
    box.innerHTML = rows.map((r, i) => `<div class="marquee__row${i ? " marquee__row--rev" : ""}">${r.concat(r).map(src =>
      `<img src="${src}" alt="" loading="lazy" decoding="async">`).join("")}</div>`).join("");
  }

  async function fillResults() {
    const wall = $("#v2-results"); if (!wall) return;
    const imgs = await findImages(V2.resultsDir);
    wall.innerHTML = imgs.length
      ? imgs.map(src => `<figure style="margin:0 0 14px"><img src="${src}" alt="Community member result" loading="lazy" decoding="async"></figure>`).join("")
      : Array.from({ length: 9 }, (_, i) => `<div class="empty">Result ${i + 1}<br>upload to assets/v2/results</div>`).join("");
  }

  /* ---------- horizontal VSL ---------- */
  function mountVideo() {
    const box = $("#v2-video"); if (!box || !V2.video) return;
    $("#thumb-soon")?.remove();
    $(".thumb", box).addEventListener("click", () => load(true), { once: true });
  }
  function load(autoplay) {
    const box = $("#v2-video");
    const url = V2.video;
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

  fillStats(); mountVideo(); modal(); fillCollage(); fillMarquee(); fillResults();
})();

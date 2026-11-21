/* The database for /admin's numbers. Works with whatever Vercel added when you connected storage:
   - Upstash REST:  KV_REST_API_URL + KV_REST_API_TOKEN, UPSTASH_REDIS_REST_URL + _TOKEN, or the same with a custom
     prefix (e.g. STORAGE_KV_REST_API_URL)
   - Any Redis URL: REDIS_URL, KV_URL, or the same with a custom prefix (e.g. STORAGE_REDIS_URL) — e.g. Vercel's "Redis"
*/
function restEnv() {
  const e = process.env;
  for (const k of Object.keys(e)) {
    if (/(KV_REST_API|REDIS_REST)_URL$/.test(k)) {
      const t = e[k.replace(/URL$/, "TOKEN")];
      if (e[k] && t) return { url: e[k].replace(/\/+$/, ""), token: t };
    }
  }
  return null;
}
function redisUrl() {
  const e = process.env;
  const k = Object.keys(e).find(k => /(^|_)(REDIS|KV)_URL$/.test(k) && /^rediss?:\/\//.test(e[k] || ""));
  return k ? e[k] : null;
}
let client;
async function tcp(url, cmds) {
  if (!client) {
    const { createClient } = require("redis");
    client = createClient({ url, socket: { connectTimeout: 5000 } });
    client.on("error", () => {});
    await client.connect();
  }
  return Promise.all(cmds.map(c => client.sendCommand(c.map(String))));
}
async function pipeline(cmds) {
  const rest = restEnv();
  if (rest) {
    const r = await fetch(rest.url + "/pipeline", {
      method: "POST", headers: { Authorization: "Bearer " + rest.token, "Content-Type": "application/json" },
      body: JSON.stringify(cmds.map(c => c.map(String))),
    });
    const out = await r.json();
    if (!Array.isArray(out)) throw new Error("Redis: " + (out.error || r.status));
    return out.map(x => x.result);
  }
  const url = redisUrl();
  if (url) return tcp(url, cmds);
  const seen = Object.keys(process.env).filter(k => /REDIS|KV|UPSTASH/.test(k));
  throw Object.assign(new Error("No database connected yet. Database settings found: " + (seen.join(", ") || "none")), { code: "no_db" });
}
// Day in the business time zone, e.g. "2026-11-21"
const day = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: process.env.TRACK_TIMEZONE || "America/New_York" });
module.exports = { pipeline, day, PREFIX: "aj:" };

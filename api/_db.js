/* Upstash Redis over its REST API (no packages). Vercel → Storage → Upstash for Redis adds
   KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / _TOKEN) to the project. */
function env() {
  const e = process.env;
  for (const [u, t] of [["KV_REST_API_URL", "KV_REST_API_TOKEN"], ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]])
    if (e[u] && e[t]) return { url: e[u].replace(/\/+$/, ""), token: e[t] };
  return null;
}
async function pipeline(cmds) {
  const db = env();
  if (!db) throw Object.assign(new Error("No database connected"), { code: "no_db" });
  const r = await fetch(db.url + "/pipeline", {
    method: "POST", headers: { Authorization: "Bearer " + db.token, "Content-Type": "application/json" },
    body: JSON.stringify(cmds.map(c => c.map(String))),
  });
  const out = await r.json();
  if (!Array.isArray(out)) throw new Error("Redis: " + (out.error || r.status));
  return out.map(x => x.result);
}
// Day in the business time zone, e.g. "2026-11-21"
const day = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: process.env.TRACK_TIMEZONE || "America/New_York" });
module.exports = { pipeline, day, PREFIX: "aj:" };

// POST {e: "visit" | "click"} → +1 for today. Bots and link previews aren't counted.
const { pipeline, day, PREFIX } = require("./_db");
const BOT = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|discord|slack|headless|lighthouse/i;
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end();
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const e = body && body.e;
  if (!["visit", "click"].includes(e) || BOT.test(req.headers["user-agent"] || "")) return res.status(204).end();
  try {
    await pipeline([["HINCRBY", PREFIX + "d:" + day(), e, 1], ["HINCRBY", PREFIX + "total", e, 1]]);
    res.status(204).end();
  } catch (err) { res.status(err.code === "no_db" ? 503 : 500).json({ error: err.message }); }
};

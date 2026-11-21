// GET with header x-admin-password → totals + the last 30 days. Password: ADMIN_PASSWORD env var (default below).
const { pipeline, day, PREFIX } = require("./_db");
const PASSWORD = process.env.ADMIN_PASSWORD || "Uncapped123";
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if ((req.headers["x-admin-password"] || "") !== PASSWORD) return res.status(401).json({ error: "Wrong password" });
  try {
    const days = Array.from({ length: 30 }, (_, i) => day(new Date(Date.now() - i * 864e5)));
    const out = await pipeline([["HGETALL", PREFIX + "total"], ...days.map(d => ["HGETALL", PREFIX + "d:" + d])]);
    const h = flat => { const o = { visit: 0, click: 0 }; for (let i = 0; flat && i < flat.length; i += 2) o[flat[i]] = +flat[i + 1]; return o; };
    res.json({ total: h(out[0]), days: days.map((d, i) => ({ day: d, ...h(out[i + 1]) })) });
  } catch (err) { res.status(err.code === "no_db" ? 503 : 500).json({ error: err.message }); }
};

const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});
const express = require("express");
const chatHandler = require("./api/chat");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "512kb" }));
/* Site root is public/; run `npm run sync:assets` (or npm start) so `public/assets` mirrors ./assets. */
app.use(express.static(path.join(__dirname, "public")));

/* Simple in-memory rate limiter: max 20 requests per IP per minute */
const rateMap = new Map();
const RATE_WINDOW = 60_000;
const RATE_LIMIT = 20;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    entry = { start: now, count: 0 };
    rateMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    res.status(429).json({ error: "Too many requests. Please wait a moment." });
    return;
  }
  next();
}

// Prune stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW;
  for (const [ip, entry] of rateMap) {
    if (entry.start < cutoff) rateMap.delete(ip);
  }
}, 300_000);

app.post("/api/chat", rateLimiter, chatHandler);

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  if (!fs.existsSync(path.join(__dirname, "public", "assets"))) {
    console.warn(
      "public/assets/ is missing — images will 404. Run: npm run sync:assets"
    );
  }
});

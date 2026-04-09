/**
 * Copies project assets/ into public/assets/ for Cloudflare Worker deploy
 * (wrangler only bundles public/). Local dev uses server.js to serve assets/ directly.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "assets");
const dest = path.join(root, "public", "assets");

if (!fs.existsSync(src)) {
  console.error("sync-assets: missing assets/ directory");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log("sync-assets: assets/ -> public/assets/");

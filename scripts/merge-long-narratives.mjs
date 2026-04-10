/**
 * Merges long case narratives from site-data.json into data.js as `longNarrative`
 * when the site manuscript is longer than the existing case narrative.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadPortfolioDataJs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const m = text.match(/window\.PORTFOLIO_DATA\s*=\s*([\s\S]*?);?\s*$/);
  if (!m) throw new Error("Could not parse PORTFOLIO_DATA from " + filePath);
  return JSON.parse(m[1]);
}

function savePortfolioDataJs(filePath, data) {
  const body =
    "window.PORTFOLIO_DATA = " + JSON.stringify(data, null, 4) + ";\n";
  fs.writeFileSync(filePath, body, "utf8");
}

function buildSiteCaseNarratives(siteData) {
  /** @type {Record<string, string>} */
  const byId = {};
  for (const exp of siteData.experiences || []) {
    for (const c of exp.cases || []) {
      if (!c || !c.id) continue;
      const n = String(c.narrative || "").trim();
      if (!n) continue;
      if (!byId[c.id] || n.length > byId[c.id].length) byId[c.id] = n;
    }
  }
  return byId;
}

function mergeLongNarratives(data, siteById) {
  let count = 0;
  for (const exp of data.experiences || []) {
    for (const c of exp.cases || []) {
      const site = siteById[c.id];
      if (!site) continue;
      const cur = String(c.narrative || "").trim();
      if (site.length > cur.length + 40) {
        c.longNarrative = site;
        count++;
      }
    }
  }
  return count;
}

const sitePath = path.join(root, "site-data.json");
const siteData = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const siteById = buildSiteCaseNarratives(siteData);

for (const rel of ["data.js", path.join("public", "data.js")]) {
  const fp = path.join(root, rel);
  const data = loadPortfolioDataJs(fp);
  const n = mergeLongNarratives(data, siteById);
  savePortfolioDataJs(fp, data);
  console.log(rel + ": merged longNarrative for", n, "cases");
}

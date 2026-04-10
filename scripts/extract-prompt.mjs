import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const api = fs.readFileSync(path.join(root, "api", "chat.js"), "utf8");
const marker = "const SYSTEM_PROMPT = `";
const start = api.indexOf(marker);
if (start < 0) throw new Error("SYSTEM_PROMPT start not found");
const contentStart = start + marker.length;
let end = api.indexOf("`;\r\n\r\nconst MAX_CONVERSATION_MESSAGES", contentStart);
if (end < 0) end = api.indexOf("`;\n\nconst MAX_CONVERSATION_MESSAGES", contentStart);
if (end < 0) throw new Error("SYSTEM_PROMPT end not found");
const inner = api.slice(contentStart, end);
const out = path.join(root, "src", "prompt.js");
fs.writeFileSync(out, "export const SYSTEM_PROMPT = `" + inner + "`;\n");
console.log("Wrote", out, "chars:", inner.length);

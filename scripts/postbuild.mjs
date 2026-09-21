import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const extensionDir = resolve(fileURLToPath(new URL("..", import.meta.url)), "extension");
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

const extensionMessage = [
  "Form Autofiller ID",
  "",
  "Folder ini yang harus di-load ke Chrome/Opera.",
  "",
  "Chrome: chrome://extensions -> Developer mode -> Load unpacked",
  "Opera: opera://extensions -> Developer mode -> Load unpacked",
].join("\n");

const rootMessage = [
  "!!! JANGAN LOAD FOLDER INI KE CHROME/OPERA !!!",
  "",
  "Folder root ini bukan extension. Tidak ada manifest.json di sini.",
  "",
  "Langkah yang benar:",
  "1. Jalankan: npm run build",
  "2. Load folder ini ke browser:",
  "",
  `   ${extensionDir}`,
  "",
  "Atau buka subfolder: extension-autofiller/extension/",
].join("\n");

writeFileSync(join(extensionDir, "LOAD_THIS_FOLDER.txt"), extensionMessage, "utf8");
writeFileSync(join(rootDir, "INSTALL.txt"), rootMessage, "utf8");

console.log("\n" + rootMessage + "\n");

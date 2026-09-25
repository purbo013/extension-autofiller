import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const extensionDir = resolve(fileURLToPath(new URL("..", import.meta.url)), "extension");
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

function verifyExtensionBundle() {
  const manifestPath = join(extensionDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("Build gagal: extension/manifest.json tidak ditemukan.");
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const missing = [];

  const checkFile = (relativePath) => {
    const fullPath = join(extensionDir, relativePath.replace(/^\//, ""));
    if (!existsSync(fullPath)) {
      missing.push(relativePath);
    }
  };

  checkFile(manifest.background?.service_worker);

  for (const entry of manifest.content_scripts ?? []) {
    for (const script of entry.js ?? []) {
      checkFile(script);
    }
  }

  for (const entry of manifest.web_accessible_resources ?? []) {
    for (const resource of entry.resources ?? []) {
      if (resource.includes("*")) continue;
      checkFile(resource);
    }
  }

  const loader = manifest.content_scripts?.[0]?.js?.[0];
  if (loader) {
    const loaderPath = join(extensionDir, loader);
    const loaderSource = readFileSync(loaderPath, "utf8");
    const match = loaderSource.match(/chrome\.runtime\.getURL\("([^"]+)"\)/);
    if (match?.[1]) {
      checkFile(match[1]);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Build tidak konsisten. File hilang:\n- ${missing.join("\n- ")}`);
  }
}

const extensionMessage = [
  "Form Autofiller ID",
  "",
  "Folder ini yang harus di-load ke Chrome/Opera.",
  "",
  "Setelah npm run build:",
  "1. chrome://extensions -> Reload extension ini",
  "2. Refresh (F5) semua tab form yang terbuka",
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
  "3. Setelah setiap build: Reload extension + refresh tab form (F5)",
  "",
  "Atau buka subfolder: extension-autofiller/extension/",
].join("\n");

verifyExtensionBundle();
writeFileSync(join(extensionDir, "LOAD_THIS_FOLDER.txt"), extensionMessage, "utf8");
writeFileSync(join(rootDir, "INSTALL.txt"), rootMessage, "utf8");

console.log("\n" + rootMessage + "\n");

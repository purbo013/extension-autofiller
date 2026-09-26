import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packagePath = join(rootDir, "package.json");
const manifestPath = join(rootDir, "manifest.config.json");
const statePath = join(rootDir, ".version-fingerprint");

const WATCH_DIRS = ["src", "scripts"];
const WATCH_FILES = ["vite.config.ts", "tsconfig.json"];

function packageJsonWithoutVersion() {
  const pkg = readJson(packagePath);
  const { version: _v, ...rest } = pkg;
  return JSON.stringify(rest);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function getVersion() {
  return readJson(packagePath).version;
}

export function syncManifestVersion(version = getVersion()) {
  const manifest = readJson(manifestPath);
  if (manifest.version === version) return false;
  manifest.version = version;
  writeJson(manifestPath, manifest);
  return true;
}

export function bumpPatchVersion() {
  const pkg = readJson(packagePath);
  const parts = String(pkg.version).split(".").map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  const next = parts.join(".");
  pkg.version = next;
  writeJson(packagePath, pkg);
  syncManifestVersion(next);
  return next;
}

function listFilesRecursive(dir, base = dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = full.slice(base.length + 1).replace(/\\/g, "/");
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "extension") continue;
      out.push(...listFilesRecursive(full, base));
    } else {
      out.push(rel);
    }
  }
  return out.sort();
}

function hashFileContents() {
  const hash = createHash("sha256");
  hash.update("package.json:");
  hash.update(packageJsonWithoutVersion());
  for (const file of WATCH_FILES) {
    const full = join(rootDir, file);
    if (existsSync(full)) {
      hash.update(file);
      hash.update(readFileSync(full));
    }
  }
  for (const dir of WATCH_DIRS) {
    const abs = join(rootDir, dir);
    for (const rel of listFilesRecursive(abs, abs)) {
      const full = join(abs, rel);
      hash.update(`${dir}/${rel}`);
      hash.update(readFileSync(full));
    }
  }
  let gitHead = "";
  try {
    gitHead = execSync("git rev-parse HEAD", { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    gitHead = "no-git";
  }
  hash.update(`head:${gitHead}`);
  return hash.digest("hex");
}

export function bumpVersionIfSourcesChanged() {
  const fingerprint = hashFileContents();
  const previous = existsSync(statePath) ? readFileSync(statePath, "utf8").trim() : "";

  syncManifestVersion();

  if (fingerprint === previous) {
    return { bumped: false, version: getVersion() };
  }

  const version = bumpPatchVersion();
  writeFileSync(statePath, fingerprint, "utf8");
  return { bumped: true, version };
}

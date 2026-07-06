import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const distDir = resolve(root, "dist");

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

mkdirSync(distDir, { recursive: true });
cpSync(resolve(root, "index.html"), resolve(distDir, "index.html"));
cpSync(resolve(root, "styles.css"), resolve(distDir, "styles.css"));
cpSync(resolve(root, "app.js"), resolve(distDir, "app.js"));

console.log("Build complete: dist/");

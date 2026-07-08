import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexPath = path.join(distDir, "index.html");
const offlineLinkedPaths = ["ios-roadmap-priority.html", "roadmap/oc-roadmap.html", "docs/objective-c"];

let html = readFileSync(indexPath, "utf8");

html = html.replace(
  /<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g,
  (_match, assetPath) => {
    const css = readFileSync(path.join(distDir, assetPath), "utf8");
    return `<style>\n${css}\n</style>`;
  },
);

html = html.replace(
  /<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g,
  (_match, assetPath) => {
    const js = readFileSync(path.join(distDir, assetPath), "utf8");
    return "";
  },
);

const scriptMatch = readFileSync(indexPath, "utf8").match(
  /<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/,
);

if (scriptMatch) {
  const js = readFileSync(path.join(distDir, scriptMatch[1]), "utf8");
  html = html.replace("</body>", () => `    <script>\n${js}\n</script>\n  </body>`);
}

writeFileSync(indexPath, html);

for (const file of offlineLinkedPaths) {
  const target = path.join(distDir, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(path.join(root, file), target, { recursive: true });
}

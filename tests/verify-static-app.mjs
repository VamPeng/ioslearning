import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");
const exists = (file) => existsSync(path.join(root, file));

assert.ok(exists("package.json"), "package.json should define the frontend workflow");

const packageJson = JSON.parse(read("package.json"));
assert.equal(packageJson.scripts?.dev, "vite", "dev script should start Vite");
assert.equal(
  packageJson.scripts?.build,
  "vite build && node scripts/inline-dist-assets.mjs",
  "build script should create an offline single-file dist entry",
);
assert.equal(
  packageJson.scripts?.verify,
  "node tests/routing.test.mjs && node tests/verify-static-app.mjs",
  "verify script should run routing and app checks",
);
assert.ok(packageJson.dependencies?.marked, "marked should render Markdown");
assert.ok(packageJson.dependencies?.["highlight.js"], "highlight.js should highlight code blocks");
assert.ok(packageJson.devDependencies?.vite, "vite should provide the frontend build");

assert.ok(read("vite.config.js").includes('base: "./"'), "Vite should emit relative asset paths for file:// use");
assert.ok(read("index.html").includes('type="module" src="/src/main.js"'), "root index.html should load the Vite app");

const main = read("src/main.js");
assert.ok(main.includes("import.meta.glob"), "app should bundle Markdown with import.meta.glob");
assert.ok(main.includes("querySelector"), "app should render into the DOM");
assert.ok(main.includes("marked"), "app should use marked for Markdown rendering");
assert.ok(main.includes("highlight.js"), "app should import highlight.js");
assert.ok(exists("ios-roadmap-priority.html"), "priority iOS roadmap HTML should exist");
assert.ok(main.includes('href="ios-roadmap-priority.html"'), "home page should link to the priority iOS roadmap");

const objectiveCChapters = [
  ["04-memory-management-arc", "objective-c-memory-management-arc-cheatsheet.md"],
  ["05-block", "objective-c-block-cheatsheet.md"],
  ["06-category-extension", "objective-c-category-extension-cheatsheet.md"],
  ["07-protocol-delegate", "objective-c-protocol-delegate-cheatsheet.md"],
  ["08-swift-interop", "objective-c-swift-interop-cheatsheet.md"],
];

for (const [chapter, cheatsheet] of objectiveCChapters) {
  assert.ok(exists(`docs/objective-c/${chapter}.md`), `${chapter} doc should exist`);
  assert.ok(exists(`cheatsheets/${cheatsheet}`), `${chapter} cheatsheet should exist`);
  assert.ok(exists(`labs/objective-c/${chapter}/README.md`), `${chapter} lab should exist`);
  assert.ok(main.includes(`../docs/objective-c/${chapter}.md`), `${chapter} doc should be registered`);
  assert.ok(main.includes(`../cheatsheets/${cheatsheet}`), `${chapter} cheatsheet should be registered`);
  assert.ok(main.includes(`../labs/objective-c/${chapter}/README.md`), `${chapter} lab should be registered`);
}

const styles = read("src/styles.css");
assert.ok(styles.includes(".app-shell"), "styles should define the main app shell");
assert.ok(styles.includes(".reader"), "styles should define the reading surface");
assert.ok(styles.includes("--code: #f6f8fa"), "code blocks should use a light background matching the highlight theme");
assert.ok(styles.includes(".markdown-body pre code.hljs"), "highlighted code should keep readable foreground colors");
assert.ok(styles.includes("max-height: calc(100vh - 48px)"), "TOC should fit within the viewport");
assert.ok(styles.includes("overflow-y: auto"), "TOC should scroll independently");
assert.ok(styles.includes("overscroll-behavior: contain"), "TOC scrolling should not chain to the page");

const gitignore = read(".gitignore");
assert.ok(gitignore.includes("node_modules/"), ".gitignore should ignore installed dependencies");
assert.ok(gitignore.includes("dist/"), ".gitignore should ignore build output");

const devLog = read("docs/frontend-development-log.md");
assert.ok(devLog.includes("2D"), "development log should record the 2D approach");
assert.ok(devLog.includes("Vite"), "development log should explain the Vite workflow");
assert.ok(exists("scripts/inline-dist-assets.mjs"), "offline build should inline dist assets");

assert.ok(exists("dist/index.html"), "npm run build should create dist/index.html");
const offlineLinkedFiles = [
  "ios-roadmap-priority.html",
  "roadmap/oc-roadmap.html",
  "docs/objective-c/00-overview.md",
  "docs/objective-c/01-basic-syntax.md",
  "docs/objective-c/02-class-and-object.md",
  "docs/objective-c/03-property-and-method.md",
  "docs/objective-c/04-memory-management-arc.md",
  "docs/objective-c/05-block.md",
  "docs/objective-c/06-category-extension.md",
  "docs/objective-c/07-protocol-delegate.md",
  "docs/objective-c/08-swift-interop.md",
];

for (const file of offlineLinkedFiles) {
  assert.ok(exists(`dist/${file}`), `build should copy ${file} for offline links`);
}
const distAssets = readdirSync(path.join(root, "dist", "assets"));
assert.ok(distAssets.some((file) => file.endsWith(".js")), "build should emit a JavaScript bundle");
assert.ok(distAssets.some((file) => file.endsWith(".css")), "build should emit a CSS bundle");
const jsBundle = distAssets.find((file) => file.endsWith(".js"));
const jsBundleSize = statSync(path.join(root, "dist", "assets", jsBundle)).size;
assert.ok(jsBundleSize < 700_000, "JavaScript bundle should stay below 700 KB");

const distIndex = read("dist/index.html");
assert.ok(distIndex.includes("<style>"), "built index.html should inline CSS for file:// use");
assert.ok(distIndex.includes("<script>"), "built index.html should inline JavaScript for file:// use");
assert.ok(!distIndex.includes('src="./assets/'), "built index.html should not load external module scripts");
assert.ok(!distIndex.includes('href="./assets/'), "built index.html should not load external stylesheets");
const inlineScripts = [...distIndex.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)];
assert.equal(inlineScripts.length, 1, "built index.html should contain exactly one inline script");
assert.doesNotThrow(
  () => new Function(inlineScripts[0][1]),
  "inline JavaScript should remain syntactically valid after asset inlining",
);
assert.ok(
  distIndex.indexOf('<div id="app"></div>') < distIndex.indexOf("<script>"),
  "inline JavaScript should run after the app container exists",
);

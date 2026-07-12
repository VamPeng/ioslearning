import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import objectivec from "highlight.js/lib/languages/objectivec";
import plaintext from "highlight.js/lib/languages/plaintext";
import swift from "highlight.js/lib/languages/swift";
import "highlight.js/styles/github.css";
import "./styles.css";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("objectivec", objectivec);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("swift", swift);

const markdownModules = import.meta.glob(["../README.md", "../docs/**/*.md", "../cheatsheets/**/*.md", "../labs/**/*.md"], { eager: true, import: "default", query: "?raw" });

const roadmap = [
  { title: "基础阶段", items: ["Swift", "Objective-C", "iOS 核心概念", "iOS 架构概览"] },
  { title: "环境搭建", items: ["Git / GitHub", "Xcode"] },
  { title: "界面与组件", items: ["SwiftUI", "UIKit", "UI 设计规范", "界面导航"] },
  { title: "架构与模式", items: ["架构模式", "闭包与回调", "async / await"] },
  { title: "异步与数据", items: ["数据持久化", "JSON / XML", "网络请求"] },
  { title: "依赖与扩展", items: ["依赖管理", "系统能力框架"] },
  { title: "质量与发布", items: ["调试与质量", "发布与进阶"] },
];

const topics = [
  ["项目", /README|frontend-development-log/i, 0], ["Objective-C", /objective-c/i, 10], ["Swift", /swift/i, 20],
  ["iOS 核心概念", /core-programming-concepts|core-concepts/i, 30], ["iOS 架构概览", /ios-architecture|cocoa-touch|core-services|core-os/i, 40],
  ["Git / GitHub", /git|github|version-control/i, 50], ["Xcode", /xcode/i, 60], ["SwiftUI", /swiftui/i, 70], ["UIKit", /uikit/i, 80],
  ["UI 设计规范", /ui-design|hig|human-interface/i, 90], ["界面导航", /navigation|navigationstack|routing/i, 100],
  ["架构模式", /architecture|mvvm|mvc|tca|viper/i, 110], ["闭包与回调", /closure|callback|block/i, 120], ["async / await", /async-await|concurrency|taskgroup/i, 130],
  ["数据持久化", /data-persistence|persistence|swiftdata|core-data|userdefaults|keychain/i, 140], ["JSON / XML", /json|xml|codable/i, 150],
  ["网络请求", /networking|urlsession|http|rest|alamofire/i, 160], ["依赖管理", /dependency|spm|swift-package-manager|cocoapods|carthage/i, 170],
  ["系统能力框架", /system-frameworks|mapkit|healthkit|core-ml|arkit|gamekit/i, 180], ["调试与质量", /debugging|quality|swiftlint|testing|xctest/i, 190],
  ["发布与进阶", /app-store|testflight|fastlane|ci-cd|aso|wwdc/i, 200],
].map(([title, matcher, order]) => ({ title, matcher, order }));

const docs = Object.entries(markdownModules).map(([path, content]) => {
  const id = path.replace(/^\.\.\//, "").replace(/\/README\.md$/, "").replace(/\.md$/, "");
  const rawTitle = content.match(/^#\s+(.+)$/m)?.[1] ?? id.split("/").pop();
  const normalized = path.replace(/^\.\.\//, "");
  const topic = topics.find((item) => item.matcher.test(normalized)) ?? { title: "其他资料", order: 999 };
  const section = normalized.startsWith("cheatsheets/") ? "速查表" : normalized.startsWith("labs/") ? "Labs" : normalized === "README.md" ? "项目说明" : "正文";
  const num = Number(normalized.match(/(?:^|\/)(\d+)[-.]/)?.[1] ?? 50);
  const title = /^\d+[.．]/.test(rawTitle) ? rawTitle : `${String(num).padStart(2, "0")}. ${rawTitle}`;
  return { id, path, content, rawTitle, title, category: topic.title, categoryOrder: topic.order, section, order: num, headings: getHeadings(content), summary: getSummary(content) };
}).sort((a, b) => a.categoryOrder - b.categoryOrder || a.order - b.order || a.title.localeCompare(b.title, "zh-CN"));

const state = { query: "", activeId: resolveId(), roadmapOpen: false };
const app = document.querySelector("#app");
marked.setOptions({ gfm: true, breaks: false });
render();
window.addEventListener("hashchange", () => { state.activeId = resolveId(); render(); });

function render() {
  const active = docs.find((doc) => doc.id === state.activeId) ?? docs[0];
  const visible = docs.filter((doc) => matches(doc, state.query));
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">iOS</span><div><strong>iOS Learning</strong><small>Roadmap 驱动的学习资料</small></div></div>
        <button class="roadmap-entry ${state.roadmapOpen ? "active" : ""}" id="roadmap-toggle"><span>学习 Roadmap</span><small>总目录与学习顺序</small></button>
        <label class="search"><span>搜索资料</span><input id="search-input" value="${escapeAttr(state.query)}" placeholder="Swift、ARC、闭包、网络…" /></label>
        <nav class="doc-nav">${renderNav(visible, active)}</nav>
      </aside>
      <main class="workspace">
        ${state.roadmapOpen ? renderRoadmap() : renderReader(active)}
      </main>
    </div>`;
  bind(active);
}

function renderReader(active) {
  return `<div class="content-grid">
    <article class="reader"><div class="doc-head"><span>${escapeHtml(active.category)}</span><strong>${escapeHtml(active.title)}</strong><small>${escapeHtml(active.summary)}</small></div><div class="markdown-body">${marked.parse(active.content)}</div></article>
    <aside class="toc"><strong>本页目录</strong>${renderToc(active)}</aside>
  </div>`;
}

function renderRoadmap() {
  const groups = roadmap.map((group, index) => `<section class="roadmap-group"><div class="roadmap-index">${String(index + 1).padStart(2, "0")}</div><div><h2>${group.title}</h2><div class="roadmap-items">${group.items.map((name) => {
    const count = docs.filter((doc) => doc.category === name).length;
    const first = docs.find((doc) => doc.category === name);
    return first ? `<a href="#${escapeAttr(first.id)}" data-open-doc="1"><span>${escapeHtml(name)}</span><small>${count} 篇资料</small></a>` : `<div class="roadmap-empty"><span>${escapeHtml(name)}</span><small>待补充</small></div>`;
  }).join("")}</div></div></section>`).join("");
  return `<div class="roadmap-page"><header><span>iOS ROADMAP</span><h1>从语言基础到独立发布 App</h1><p>Roadmap 是总目录，左侧资料树是当前仓库内容，进入文档后右侧显示本页大纲。</p><a href="ios-roadmap-priority.html" target="_blank" rel="noreferrer">打开完整优先级路线图 ↗</a></header>${groups}</div>`;
}

function renderNav(visible, active) {
  const grouped = Object.groupBy ? Object.groupBy(visible, (doc) => doc.category) : visible.reduce((acc, doc) => ((acc[doc.category] ??= []).push(doc), acc), {});
  return topics.map((topic) => {
    const items = grouped[topic.title] ?? [];
    if (!items.length && state.query) return "";
    const open = items.some((doc) => doc.id === active.id);
    return `<details class="learn-topic" ${open ? "open" : ""}><summary><span>${escapeHtml(topic.title)}</span><small>${items.length || "待补充"}</small></summary><div>${items.length ? items.map((doc) => `<a class="doc-link ${doc.id === active.id ? "active" : ""}" href="#${escapeAttr(doc.id)}"><span>${escapeHtml(doc.title)}</span><small>${escapeHtml(doc.summary)}</small></a>`).join("") : `<p>该阶段目录已预留。</p>`}</div></details>`;
  }).join("");
}

function renderToc(doc) {
  if (!doc.headings.length) return `<p>当前文档没有二级标题。</p>`;
  return `<ol>${doc.headings.map((h) => `<li class="level-${h.level}"><a href="#${escapeAttr(doc.id)}/${escapeAttr(h.slug)}">${escapeHtml(h.text)}</a></li>`).join("")}</ol>`;
}

function bind(active) {
  document.querySelector("#roadmap-toggle")?.addEventListener("click", () => { state.roadmapOpen = true; render(); });
  document.querySelectorAll("[data-open-doc]").forEach((el) => el.addEventListener("click", () => { state.roadmapOpen = false; }));
  document.querySelector("#search-input")?.addEventListener("input", (event) => { state.query = event.target.value.trim(); render(); document.querySelector("#search-input")?.focus(); });
  document.querySelectorAll(".markdown-body h2, .markdown-body h3").forEach((heading) => { heading.id = slugify(heading.textContent); });
  document.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
  const slug = location.hash.split("/").slice(1).join("/");
  if (slug) document.querySelector(`#${CSS.escape(slug)}`)?.scrollIntoView({ block: "start" });
}

function resolveId() { const raw = decodeURIComponent(location.hash.replace(/^#/, "").split("/")[0]); return docs.some((doc) => doc.id === raw) ? raw : docs[0]?.id; }
function getHeadings(markdown) { return [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => ({ level: m[1].length, text: m[2].replace(/`/g, ""), slug: slugify(m[2]) })); }
function getSummary(markdown) { return markdown.split("\n").map((line) => line.trim()).find((line) => line && !line.startsWith("#") && !line.startsWith("```") && !line.startsWith("---"))?.replace(/[`*_]/g, "") ?? "学习资料"; }
function matches(doc, query) { if (!query) return true; const q = query.toLowerCase(); return [doc.title, doc.rawTitle, doc.category, doc.summary, doc.content].some((v) => v.toLowerCase().includes(q)); }
function slugify(value) { return String(value).toLowerCase().replace(/`/g, "").replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, ""); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function escapeAttr(value) { return escapeHtml(value); }

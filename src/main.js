import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import objectivec from "highlight.js/lib/languages/objectivec";
import plaintext from "highlight.js/lib/languages/plaintext";
import swift from "highlight.js/lib/languages/swift";
import "highlight.js/styles/github.css";
import "./styles.css";
import { parseRoute, resolveDocumentId } from "./routing.js";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("objectivec", objectivec);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("swift", swift);
hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
hljs.registerAliases(["js", "mjs"], { languageName: "javascript" });
hljs.registerAliases(["objc", "objective-c"], { languageName: "objectivec" });

const markdownModules = import.meta.glob(
  ["../README.md", "../docs/**/*.md", "../cheatsheets/**/*.md", "../labs/**/*.md"],
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);

const learningTopics = [
  { title: "项目", en: "Project", order: 0, tier: 2, matchers: [/^README\.md$/, /frontend-development-log/] },
  { title: "Objective-C", en: "Objective-C", order: 10, tier: 3, showWhenEmpty: true, matchers: [/objective-c/] },
  { title: "Swift", en: "Swift", order: 20, tier: 1, showWhenEmpty: true, matchers: [/swift/] },
  { title: "iOS 核心概念", en: "Core Programming Concepts", order: 30, tier: 1, showWhenEmpty: true, matchers: [/ios-core-concepts/, /core-programming-concepts/, /core-concepts/] },
  { title: "iOS 架构概览", en: "iOS Architecture", order: 40, tier: 2, matchers: [/ios-architecture/, /cocoa-touch/, /core-services/, /core-os/] },
  { title: "Git / GitHub", en: "Version Control", order: 50, tier: 1, matchers: [/git/, /github/, /version-control/] },
  { title: "Xcode", en: "Xcode", order: 60, tier: 1, matchers: [/xcode/] },
  { title: "SwiftUI", en: "SwiftUI", order: 70, tier: 1, matchers: [/swiftui/] },
  { title: "UIKit", en: "UIKit", order: 80, tier: 3, matchers: [/uikit/] },
  { title: "UI 设计规范", en: "UI Design / HIG", order: 90, tier: 2, matchers: [/ui-design/, /hig/, /human-interface/] },
  { title: "界面导航", en: "Navigation", order: 100, tier: 1, matchers: [/navigation/, /navigationstack/, /routing/] },
  { title: "架构模式", en: "Architecture Patterns", order: 110, tier: 1, matchers: [/architecture-patterns/, /architecture/, /mvvm/, /mvc/, /tca/, /viper/] },
  { title: "闭包与回调", en: "Closures & Callbacks", order: 120, tier: 1, matchers: [/closures?/, /callbacks?/, /block/] },
  { title: "async / await", en: "Async / Await", order: 130, tier: 1, matchers: [/async-await/, /concurrency/, /taskgroup/] },
  { title: "数据持久化", en: "Data Persistence", order: 140, tier: 1, matchers: [/data-persistence/, /persistence/, /swiftdata/, /core-data/, /userdefaults/, /keychain/] },
  { title: "JSON / XML", en: "JSON / XML", order: 150, tier: 1, matchers: [/json/, /xml/, /codable/] },
  { title: "网络请求", en: "Networking", order: 160, tier: 1, matchers: [/networking/, /urlsession/, /http/, /rest/, /alamofire/] },
  { title: "依赖管理", en: "Dependency Manager", order: 170, tier: 1, matchers: [/dependency/, /spm/, /swift-package-manager/, /cocoapods/, /carthage/] },
  { title: "系统能力框架", en: "System Frameworks", order: 180, tier: 3, matchers: [/system-frameworks/, /mapkit/, /healthkit/, /core-ml/, /arkit/, /gamekit/] },
  { title: "调试与质量", en: "Quality & Debugging", order: 190, tier: 1, matchers: [/debugging/, /quality/, /swiftlint/, /swiftformat/, /testing/, /xctest/, /xcuitest/] },
  { title: "发布与进阶", en: "Distribution & Beyond", order: 200, tier: 1, matchers: [/app-store/, /testflight/, /fastlane/, /ci-cd/, /aso/, /wwdc/] },
];

const sectionOrders = { 正文: 10, 速查表: 20, Labs: 30, 开发记录: 40, 项目说明: 50, 其他: 999 };

const explicitLabels = new Map([
  ["../README.md", { category: "项目", section: "项目说明", order: 0, label: "项目说明" }],
  ["../docs/frontend-development-log.md", { category: "项目", section: "开发记录", order: 10, label: "前端开发记录" }],
  ["../docs/objective-c/00-overview.md", { category: "Objective-C", section: "正文", order: 0, label: "00. 阶段总览" }],
  ["../docs/objective-c/01-basic-syntax.md", { category: "Objective-C", section: "正文", order: 10, label: "01. 基础语法" }],
  ["../docs/objective-c/02-class-and-object.md", { category: "Objective-C", section: "正文", order: 20, label: "02. 类与对象" }],
  ["../docs/objective-c/03-property-and-method.md", { category: "Objective-C", section: "正文", order: 30, label: "03. 属性与方法" }],
  ["../docs/objective-c/04-memory-management-arc.md", { category: "Objective-C", section: "正文", order: 40, label: "04. ARC 内存管理" }],
  ["../docs/objective-c/05-block.md", { category: "Objective-C", section: "正文", order: 50, label: "05. Block" }],
  ["../docs/objective-c/06-category-extension.md", { category: "Objective-C", section: "正文", order: 60, label: "06. Category / Extension" }],
  ["../docs/objective-c/07-protocol-delegate.md", { category: "Objective-C", section: "正文", order: 70, label: "07. Protocol / Delegate" }],
  ["../docs/objective-c/08-swift-interop.md", { category: "Objective-C", section: "正文", order: 80, label: "08. Swift 互操作" }],
  ["../cheatsheets/objective-c-memory-management-arc-cheatsheet.md", { category: "Objective-C", section: "速查表", order: 40, label: "ARC 内存管理速查表" }],
  ["../cheatsheets/objective-c-block-cheatsheet.md", { category: "Objective-C", section: "速查表", order: 50, label: "Block 速查表" }],
  ["../cheatsheets/objective-c-category-extension-cheatsheet.md", { category: "Objective-C", section: "速查表", order: 60, label: "Category / Extension 速查表" }],
  ["../cheatsheets/objective-c-protocol-delegate-cheatsheet.md", { category: "Objective-C", section: "速查表", order: 70, label: "Protocol / Delegate 速查表" }],
  ["../cheatsheets/objective-c-swift-interop-cheatsheet.md", { category: "Objective-C", section: "速查表", order: 80, label: "Swift 互操作速查表" }],
  ["../labs/objective-c/04-memory-management-arc/README.md", { category: "Objective-C", section: "Labs", order: 40, label: "Lab 04. ARC 内存管理" }],
  ["../labs/objective-c/05-block/README.md", { category: "Objective-C", section: "Labs", order: 50, label: "Lab 05. Block" }],
  ["../labs/objective-c/06-category-extension/README.md", { category: "Objective-C", section: "Labs", order: 60, label: "Lab 06. Category / Extension" }],
  ["../labs/objective-c/07-protocol-delegate/README.md", { category: "Objective-C", section: "Labs", order: 70, label: "Lab 07. Protocol / Delegate" }],
  ["../labs/objective-c/08-swift-interop/README.md", { category: "Objective-C", section: "Labs", order: 80, label: "Lab 08. Swift 互操作" }],
]);

const documents = Object.entries(markdownModules)
  .map(([path, content]) => createDocument(path, content))
  .sort(compareDocuments);

const state = { query: "", activeId: getInitialId() };
const app = document.querySelector("#app");

marked.setOptions({ gfm: true, breaks: false });
render();

window.addEventListener("hashchange", () => {
  state.activeId = getInitialId();
  render();
});

function render() {
  const active = documents.find((doc) => doc.id === state.activeId) ?? documents[0];
  const filtered = documents.filter((doc) => matchesQuery(doc, state.query));

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="学习资料导航">
        <a class="brand" href="#README" aria-label="回到项目说明">
          <span class="brand-mark">iOS</span>
          <span><strong>iOS Learning</strong><span>按路线图组织的离线学习资料</span></span>
        </a>
        <label class="search" for="search-input">
          搜索资料
          <input id="search-input" type="search" value="${escapeAttr(state.query)}" placeholder="例如 Swift、ARC、闭包、Lab" autocomplete="off" />
        </label>
        <nav class="doc-nav" aria-label="学习分类">${renderLearningNav(filtered, active)}</nav>
        <div class="sidebar-tools">
          <a href="ios-roadmap-priority.html" target="_blank" rel="noreferrer">iOS 优先级路线图</a>
          <a href="roadmap/oc-roadmap.html" target="_blank" rel="noreferrer">旧版 OC 路线图</a>
        </div>
      </aside>
      <main class="workspace">
        <div class="content-grid">
          <article class="reader"><div class="markdown-body">${marked.parse(active.content)}</div></article>
          <aside class="toc" aria-label="当前文档目录"><strong>本页目录</strong>${renderToc(active)}</aside>
        </div>
      </main>
    </div>
  `;

  bindEvents();
  app.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
  scrollToRouteHeading();
}

function renderLearningNav(filteredDocs, active) {
  if (filteredDocs.length === 0) return `<p class="nav-empty">没有匹配的学习资料。</p>`;
  const categorized = groupBy(filteredDocs, "category");
  const known = new Set(learningTopics.map((topic) => topic.title));
  const customTopics = Object.keys(categorized)
    .filter((category) => !known.has(category))
    .map((category) => ({ title: category, en: "Custom", order: 900, tier: 2, matchers: [] }));

  return [...learningTopics, ...customTopics]
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"))
    .map((topic) => {
      const docs = categorized[topic.title] ?? [];
      if (docs.length === 0 && (state.query || !topic.showWhenEmpty)) return "";
      return renderTopic(topic, docs, active);
    })
    .join("");
}

function renderTopic(topic, docs, active) {
  const isActiveTopic = docs.some((doc) => doc.id === active.id);
  const sectionGroups = groupBy(docs, "section");
  const sections = Object.entries(sectionGroups).sort(([a], [b]) => (sectionOrders[a] ?? 999) - (sectionOrders[b] ?? 999));
  return `
    <details class="learn-topic tier-${topic.tier}" ${isActiveTopic || state.query || topic.showWhenEmpty ? "open" : ""}>
      <summary><span class="topic-title">${escapeHtml(topic.title)}</span><span class="topic-meta">${escapeHtml(topic.en)} · ${docs.length || "待补充"}</span></summary>
      <div class="topic-body">${sections.length ? sections.map(([section, sectionDocs]) => renderSection(section, sectionDocs, active.id)).join("") : renderEmptyTopic()}</div>
    </details>
  `;
}

function renderSection(section, docs, activeId) {
  return `<details class="nav-section" open><summary>${escapeHtml(section)}</summary><div class="section-links">${docs.map((doc) => renderDocLink(doc, activeId)).join("")}</div></details>`;
}

function renderDocLink(doc, activeId) {
  return `<a class="doc-link${doc.id === activeId ? " active" : ""}" href="#${escapeAttr(doc.id)}"><span>${escapeHtml(doc.title)}</span><small>${escapeHtml(doc.summary)}</small></a>`;
}

function renderEmptyTopic() {
  return `<p class="empty-topic">这个一级分类已经按 roadmap 预留。把 Markdown 放到对应目录后会自动显示在这里。</p>`;
}

function renderToc(doc) {
  if (!doc?.headings?.length) return `<p class="toc-empty">当前文档没有二级标题。</p>`;
  return `<ol>${doc.headings.map((heading) => `<li class="level-${heading.level}"><a href="#${escapeAttr(doc.id)}/${escapeAttr(heading.slug)}">${escapeHtml(heading.text)}</a></li>`).join("")}</ol>`;
}

function bindEvents() {
  const searchInput = app.querySelector("#search-input");
  searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    render();
    const nextInput = app.querySelector("#search-input");
    nextInput?.focus();
    nextInput?.setSelectionRange(nextInput.value.length, nextInput.value.length);
  });

  app.querySelectorAll(".markdown-body h2, .markdown-body h3").forEach((heading) => {
    heading.id = slugify(heading.textContent);
  });
}

function scrollToRouteHeading() {
  const { headingSlug } = parseRoute(window.location.hash, documents);
  if (!headingSlug) return;
  const target = app.querySelector(`#${CSS.escape(headingSlug)}`);
  target?.scrollIntoView({ block: "start" });
}

function getInitialId() {
  return resolveDocumentId(window.location.hash, documents);
}

function createDocument(path, content) {
  const title = content.match(/^#\s+(.+)$/m)?.[1] ?? path.split("/").pop();
  const meta = normalizeMeta(path, title);
  return {
    id: path.replace(/^\.\.\//, "").replace(/\/README\.md$/, "").replace(/\.md$/, ""),
    path,
    title: meta.label ?? title,
    rawTitle: title,
    category: meta.category,
    section: meta.section,
    categoryOrder: meta.categoryOrder,
    sectionOrder: meta.sectionOrder,
    order: meta.order,
    content,
    summary: getSummary(content),
    headings: getHeadings(content),
  };
}

function normalizeMeta(path, title) {
  const explicit = explicitLabels.get(path) ?? {};
  const inferred = inferMetaFromPath(path, title);
  const meta = { ...inferred, ...explicit };
  const topic = learningTopics.find((item) => item.title === meta.category);
  return {
    ...meta,
    categoryOrder: topic?.order ?? 999,
    sectionOrder: sectionOrders[meta.section] ?? 999,
  };
}

function inferMetaFromPath(path, title) {
  const normalizedPath = path.replace(/^\.\.\//, "");
  const lower = normalizedPath.toLowerCase();
  const topic = learningTopics.find((item) => item.matchers.some((matcher) => matcher.test(lower)));
  return {
    category: topic?.title ?? "其他资料",
    section: inferSection(normalizedPath),
    order: inferOrder(normalizedPath),
    label: inferLabel(normalizedPath, title),
  };
}

function inferSection(path) {
  if (path.startsWith("cheatsheets/")) return "速查表";
  if (path.startsWith("labs/")) return "Labs";
  if (path.includes("frontend-development-log")) return "开发记录";
  if (path === "README.md") return "项目说明";
  if (path.startsWith("docs/")) return "正文";
  return "其他";
}

function inferLabel(path, title) {
  const order = path.match(/(?:^|\/)(\d+)[-.]/)?.[1];
  if (order && !/^\d+[.．]/.test(title)) return `${order}. ${title.replace(/^Swift\s*/, "")}`;
  if (path.startsWith("labs/")) return `Lab ${order ?? ""}. ${title}`.replace(/\s+\./, " ");
  if (path.startsWith("cheatsheets/")) return title.includes("速查") ? title : `${title}速查表`;
  return title;
}

function inferOrder(path) {
  const numericPrefix = path.match(/(?:^|\/)(\d+)[-.]/)?.[1];
  return numericPrefix ? Number(numericPrefix) * 10 : 500;
}

function compareDocuments(a, b) {
  return a.categoryOrder - b.categoryOrder || a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title, "zh-CN");
}

function getSummary(markdown) {
  const firstParagraph = markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("```") && !line.startsWith("---"));
  return firstParagraph?.replace(/[`*_]/g, "") ?? "学习资料";
}

function getHeadings(markdown) {
  return [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({
    level: match[1].length,
    text: match[2].replace(/`/g, ""),
    slug: slugify(match[2]),
  }));
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] ?? [];
    groups[value].push(item);
    return groups;
  }, {});
}

function matchesQuery(doc, query) {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return [doc.title, doc.rawTitle, doc.category, doc.section, doc.summary, doc.content].some((value) => value.toLowerCase().includes(normalized));
}

function slugify(value) {
  return value.toLowerCase().replace(/`/g, "").replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

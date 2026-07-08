import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import objectivec from "highlight.js/lib/languages/objectivec";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/github.css";
import "./styles.css";
import { parseRoute, resolveDocumentId } from "./routing.js";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("objectivec", objectivec);
hljs.registerLanguage("plaintext", plaintext);
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

const pathLabels = {
  "../README.md": { group: "项目", order: 0, label: "项目说明" },
  "../docs/objective-c/00-overview.md": { group: "Objective-C 正文", order: 10 },
  "../docs/objective-c/01-basic-syntax.md": { group: "Objective-C 正文", order: 20 },
  "../docs/objective-c/02-class-and-object.md": { group: "Objective-C 正文", order: 30 },
  "../docs/objective-c/03-property-and-method.md": { group: "Objective-C 正文", order: 40 },
  "../docs/objective-c/04-memory-management-arc.md": { group: "Objective-C 正文", order: 50 },
  "../docs/objective-c/05-block.md": { group: "Objective-C 正文", order: 60 },
  "../docs/objective-c/06-category-extension.md": { group: "Objective-C 正文", order: 70 },
  "../docs/objective-c/07-protocol-delegate.md": { group: "Objective-C 正文", order: 80 },
  "../docs/objective-c/08-swift-interop.md": { group: "Objective-C 正文", order: 90 },
  "../cheatsheets/objective-c-basic-syntax-cheatsheet.md": { group: "速查表", order: 110 },
  "../cheatsheets/objective-c-class-and-object-cheatsheet.md": { group: "速查表", order: 120 },
  "../cheatsheets/objective-c-property-and-method-cheatsheet.md": { group: "速查表", order: 130 },
  "../cheatsheets/objective-c-memory-management-arc-cheatsheet.md": { group: "速查表", order: 140 },
  "../cheatsheets/objective-c-block-cheatsheet.md": { group: "速查表", order: 150 },
  "../cheatsheets/objective-c-category-extension-cheatsheet.md": { group: "速查表", order: 160 },
  "../cheatsheets/objective-c-protocol-delegate-cheatsheet.md": { group: "速查表", order: 170 },
  "../cheatsheets/objective-c-swift-interop-cheatsheet.md": { group: "速查表", order: 180 },
  "../labs/objective-c/01-basic-syntax/README.md": { group: "Labs", order: 210 },
  "../labs/objective-c/02-class-and-object/README.md": { group: "Labs", order: 220 },
  "../labs/objective-c/03-property-and-method/README.md": { group: "Labs", order: 230 },
  "../labs/objective-c/04-memory-management-arc/README.md": { group: "Labs", order: 240 },
  "../labs/objective-c/05-block/README.md": { group: "Labs", order: 250 },
  "../labs/objective-c/06-category-extension/README.md": { group: "Labs", order: 260 },
  "../labs/objective-c/07-protocol-delegate/README.md": { group: "Labs", order: 270 },
  "../labs/objective-c/08-swift-interop/README.md": { group: "Labs", order: 280 },
};

const documents = Object.entries(markdownModules)
  .map(([path, content]) => {
    const title = content.match(/^#\s+(.+)$/m)?.[1] ?? path.split("/").pop();
    const meta = pathLabels[path] ?? { group: "其他资料", order: 999 };
    return {
      id: path.replace(/^\.\.\//, "").replace(/\/README\.md$/, "").replace(/\.md$/, ""),
      path,
      title: meta.label ?? title,
      rawTitle: title,
      group: meta.group,
      order: meta.order,
      content,
      summary: getSummary(content),
      headings: getHeadings(content),
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"));

const state = {
  query: "",
  activeId: getInitialId(),
};

const app = document.querySelector("#app");

marked.setOptions({
  gfm: true,
  breaks: false,
});

render();
window.addEventListener("hashchange", () => {
  state.activeId = getInitialId();
  render();
});

function render() {
  const active = documents.find((doc) => doc.id === state.activeId) ?? documents[0];
  const filtered = documents.filter((doc) => matchesQuery(doc, state.query));
  const groups = groupBy(filtered, "group");

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="学习资料导航">
        <div class="brand">
          <span class="brand-mark">iOS</span>
          <div>
            <strong>iOS Learning</strong>
            <span>离线学习 App</span>
          </div>
        </div>
        <label class="search">
          <span>搜索资料</span>
          <input id="search-input" type="search" value="${escapeAttr(state.query)}" placeholder="输入 Objective-C / property / Lab" />
        </label>
        <nav class="doc-nav">
          ${Object.entries(groups)
            .map(([group, docs]) => renderGroup(group, docs, active.id))
            .join("")}
        </nav>
      </aside>

      <main class="workspace">
        <section class="hero-panel">
          <div>
            <p class="eyebrow">Markdown bundled at build time</p>
            <h1>把学习资料变成可双击打开的前端学习 App</h1>
            <p>开发阶段用 Vite，构建后 Markdown 已打包进页面资源。打开 <code>dist/index.html</code> 时不需要再读取本地 .md 文件。</p>
          </div>
          <div class="hero-actions">
            <a href="#${documents[1]?.id ?? active.id}">开始学习</a>
            <a href="ios-roadmap-priority.html">iOS 优先级路线图</a>
            <a href="roadmap/oc-roadmap.html">旧版 OC 路线图</a>
          </div>
        </section>

        <section class="content-grid">
          <article class="reader">
            <div class="reader-head">
              <span>${escapeHtml(active.group)}</span>
              <h2>${escapeHtml(active.rawTitle)}</h2>
              <p>${escapeHtml(active.summary)}</p>
            </div>
            <div class="markdown-body">${marked.parse(active.content)}</div>
          </article>

          <aside class="toc" aria-label="当前文档目录">
            <strong>本页目录</strong>
            ${renderToc(active)}
          </aside>
        </section>
      </main>
    </div>
  `;

  bindEvents();
  app.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
  scrollToRouteHeading();
}

function renderGroup(group, docs, activeId) {
  return `
    <section class="nav-group">
      <h2>${escapeHtml(group)}</h2>
      ${docs
        .map(
          (doc) => `
            <a class="doc-link ${doc.id === activeId ? "active" : ""}" href="#${doc.id}">
              <span>${escapeHtml(doc.title)}</span>
              <small>${escapeHtml(doc.summary)}</small>
            </a>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderToc(doc) {
  if (doc.headings.length === 0) {
    return `<p class="toc-empty">当前文档没有二级标题。</p>`;
  }

  return `
    <ol>
      ${doc.headings
        .map(
          (heading) => `
            <li class="level-${heading.level}">
              <a href="#${doc.id}/${heading.slug}">${escapeHtml(heading.text)}</a>
            </li>
          `,
        )
        .join("")}
    </ol>
  `;
}

function bindEvents() {
  const searchInput = app.querySelector("#search-input");
  searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    render();
    app.querySelector("#search-input")?.focus();
  });

  app.querySelectorAll(".markdown-body h2, .markdown-body h3").forEach((heading) => {
    heading.id = slugify(heading.textContent);
  });
}

function scrollToRouteHeading() {
  const { headingSlug } = parseRoute(window.location.hash, documents);
  if (!headingSlug) {
    return;
  }

  const target = app.querySelector(`#${CSS.escape(headingSlug)}`);
  target?.scrollIntoView({ block: "start" });
}

function getInitialId() {
  return resolveDocumentId(window.location.hash, documents);
}

function getSummary(markdown) {
  const firstParagraph = markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("```"));
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
  return [doc.title, doc.rawTitle, doc.group, doc.summary, doc.content].some((value) =>
    value.toLowerCase().includes(normalized),
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

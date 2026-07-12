# iOS Learning

这是一个用于系统学习 iOS 开发的知识库。

当前采用“Markdown 源内容 + 前端学习 App”结构：

```text
Vite App = 学习入口 / 搜索 / Roadmap / Markdown 阅读体验
Markdown = 具体知识正文 / 代码解释 / 复习资料
Labs     = 可运行练习 / Demo 任务
HTML     = 完整路线图页面 / 可对照资料
```

## 学习入口

```bash
npm install
npm run dev
```

然后打开终端显示的本地地址，例如：

```text
http://127.0.0.1:5173/
```

构建离线版本：

```bash
npm run build
```

验证：

```bash
npm run verify
```

## 当前内容结构

```text
ioslearning/
├── index.html
├── ios-roadmap-priority.html
├── src/
│   ├── main.js
│   ├── routing.js
│   └── styles.css
├── docs/
│   ├── objective-c/
│   ├── swift/
│   ├── core-programming-concepts/
│   └── frontend-development-log.md
├── cheatsheets/
│   ├── objective-c-*.md
│   └── swift-basic-stage-cheatsheet.md
└── labs/
    ├── objective-c/
    └── swift/
```

## 页面目录结构

首页导航按 iOS Roadmap 阶段组织：

```text
一级目录：Roadmap 阶段
二级目录：技术主题
三级目录：具体学习文档
右侧目录：当前 Markdown 的 H2 / H3 大纲
```

当前阶段结构：

```text
基础阶段
├── Swift
├── Objective-C
├── iOS 核心概念
└── iOS 架构概览

环境搭建
├── Git / GitHub
└── Xcode

界面与组件
├── SwiftUI
├── UIKit
├── UI 设计规范
└── 界面导航
```

新增 Markdown 后，前端会根据文件路径自动识别学习主题并进入对应目录。

## Objective-C 当前阶段

```text
Objective-C
├── 00. 阶段总览
├── 01. 基础语法
├── 02. 类与对象
├── 03. 属性与方法
├── 04. ARC 内存管理
├── 05. Block
├── 06. Category / Extension
├── 07. Protocol / Delegate
├── 08. Swift 互操作
├── 09. Foundation 常用类型
└── 10. Foundation Collection 与轻量泛型
```

第 09 章配套：

```text
正文      docs/objective-c/09-foundation-common-types.md
速查表    cheatsheets/objective-c-foundation-common-types-cheatsheet.md
Lab       labs/objective-c/09-foundation-common-types/README.md
```

第 10 章配套：

```text
正文      docs/objective-c/10-foundation-collections-lightweight-generics.md
速查表    cheatsheets/objective-c-foundation-collections-lightweight-generics-cheatsheet.md
Lab       labs/objective-c/10-foundation-collections-lightweight-generics/README.md
```

Objective-C 下一步：

```text
11. KVC / KVO
12. Runtime 基础
13. RunLoop 与消息机制基础
14. GCD 与多线程基础
15. 阶段总结与综合实战
```

## Swift 当前阶段

```text
Swift
├── 00. 阶段总览
├── 01. 基础语法
├── 02. 运算符与控制流
├── 03. Optional
├── 04. 集合类型
├── 05. 函数
├── 06. 闭包
├── 07. Struct / Enum / 值类型
├── 08. Class 与 ARC
├── 09. Protocol / Extension
├── 10. 错误处理与 Codable
├── 11. 泛型
└── 12. async / await 并发基础
```

## Swift 当前学习顺序

```text
00-overview
↓
01-basic-syntax
↓
02-control-flow
↓
03-optionals
↓
04-collections
↓
05-functions
↓
06-closures
↓
07-struct-enum-value-type
↓
08-class-and-arc
↓
09-protocol-extension
↓
10-error-handling-codable
↓
11-generics
↓
12-concurrency-async-await
```

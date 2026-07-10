# iOS Learning

这是一个用于系统学习 iOS 开发的知识库。

当前采用“Markdown 源内容 + 前端学习 App”结构：

```text
Vite App = 学习入口 / 搜索 / 目录 / Markdown 阅读体验
Markdown = 具体知识正文 / 代码解释 / 复习资料
Labs     = 可运行练习 / Demo 任务
HTML     = 路线图页面 / 可对照资料
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

## 左侧学习分类

首页左侧导航按 iOS roadmap 的学习主题组织，不再按单纯文件类型组织。当前已接入：

```text
Objective-C
├── 正文
├── 速查表
└── Labs

Swift
├── 正文
├── 速查表
└── Labs

iOS 核心概念
└── 正文
```

后续新增 Xcode、SwiftUI、UIKit、网络请求、数据持久化、调试与发布等 Markdown 时，会根据文件路径自动进入对应一级学习分类。

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
└── 08. Swift 互操作
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

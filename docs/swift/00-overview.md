# Swift 基础阶段总览

Swift 是当前 iOS 新项目的主力语言。对你这种已经有 Android / Java / Kotlin 基础的开发者来说，Swift 入门不应该停留在语法翻译，而要尽快建立 iOS 语言层的核心模型：类型安全、Optional、值类型优先、协议抽象、闭包、ARC 和结构化并发。

本阶段目标不是“看懂所有 Swift 语法”，而是让你具备后续学习 SwiftUI、UIKit、网络请求、数据持久化和架构模式的语言基础。

## 阶段树

```text
Swift
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

## 学习顺序

```text
基础语法
→ 控制流
→ Optional
→ 集合
→ 函数
→ 闭包
→ Struct / Enum
→ Class / ARC
→ Protocol / Extension
→ Error Handling / Codable
→ Generics
→ async / await
```

## 最小上手标准

学完本阶段后，你应该能做到：

1. 用 Swift 写基本模型、函数和集合处理逻辑。
2. 正确处理 Optional，而不是到处强制解包。
3. 理解 struct 与 class 的值语义 / 引用语义差异。
4. 看懂 SwiftUI 中大量出现的闭包、泛型、协议和属性包装器前置语法。
5. 使用 Codable 解析 JSON。
6. 使用 async / await 写最小网络异步流程。

## 与 Android 经验的类比

| Swift | Android / Kotlin 类比 | 重点差异 |
| --- | --- | --- |
| Optional | Kotlin nullable type | Swift 的 `?`、`if let`、`guard let` 是主线语法 |
| struct | Kotlin data class / value object | Swift struct 是一等公民，优先用于模型 |
| protocol | interface | Swift protocol 可以配合 extension 提供默认实现 |
| closure | lambda | iOS API、SwiftUI、异步回调中极高频 |
| ARC | 引用计数内存管理 | 不需要手动 free，但要处理循环引用 |
| async / await | Kotlin coroutine suspend | Swift 使用 Task / MainActor / structured concurrency |

## 学习策略

先把红线主干打穿：Optional、闭包、值类型、协议、ARC、Codable、async / await。SwiftUI 阶段看不懂，通常不是 SwiftUI 本身难，而是这些 Swift 语言节点没有先建立清楚。

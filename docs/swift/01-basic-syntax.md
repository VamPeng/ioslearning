# Swift 基础语法

基础语法阶段要解决三个问题：变量怎么声明、类型怎么表达、代码如何最小运行。不要把 Swift 当作 Objective-C 的替代语法，它更接近一门类型安全、表达紧凑、值类型优先的现代语言。

## 1. let / var

```swift
let appName = "VideoGo"
var unreadCount = 0
unreadCount += 1
```

`let` 声明常量，初始化后不能再赋值；`var` 声明变量，可以修改。Swift 项目里优先使用 `let`，只有确认状态需要变化时再改成 `var`。

## 2. 类型推断与显式类型

```swift
let name = "Yuhui"        // String
let age = 28              // Int
let price = 19.9          // Double
let isOnline = true       // Bool

let userId: Int64 = 10001
let title: String = "Swift"
```

Swift 能根据右侧值推断类型。显式类型适合三种场景：接口边界、数字精度有要求、右侧表达式不够清晰。

## 3. 基础类型

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| `Int` | 整数 | `let count = 10` |
| `Double` | 浮点数 | `let ratio = 0.75` |
| `Bool` | 布尔值 | `let enabled = true` |
| `String` | 文本 | `let message = "hello"` |

Swift 类型不会自动隐式转换：

```swift
let count = 3
let text = "count = \(count)"
```

字符串插值使用 `\(...)`，这是日志、UI 文案、调试输出里最高频的基础语法。

## 4. 注释与 print

```swift
// 单行注释

/*
 多行注释
*/

print("start loading")
```

`print` 适合学习和简单调试；真实项目里更推荐统一日志系统。

## 5. Swift 文件与入口

在 iOS App 中，Swift 文件通常不是从 `main` 函数开始读，而是从 App 结构、View、ViewController、Model、Service 等角色开始读。学习阶段可以先在 Playground 或单个 Swift 文件中验证语法。

## 6. 最小练习

```swift
let deviceName = "Camera"
var battery = 80
battery -= 10
print("\(deviceName) battery: \(battery)%")
```

检查自己是否理解：哪些值应该是 `let`，哪些值必须是 `var`，字符串插值最终输出什么。

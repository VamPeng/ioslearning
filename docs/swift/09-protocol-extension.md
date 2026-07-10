# Swift Protocol / Extension

Protocol 是 Swift 抽象能力的核心。它类似 Java / Kotlin 的 interface，但 Swift 的 protocol 可以结合 extension 提供默认实现，从而形成“面向协议编程”的风格。

## 1. protocol 定义能力

```swift
protocol Loggable {
    var logTag: String { get }
    func log(_ message: String)
}
```

protocol 描述“一个类型应该具备什么能力”，而不是描述它具体怎么实现。

## 2. 遵守协议

```swift
struct NetworkService: Loggable {
    let logTag = "NetworkService"

    func log(_ message: String) {
        print("[\(logTag)] \(message)")
    }
}
```

struct、class、enum 都可以遵守协议。

## 3. extension 扩展类型

```swift
extension String {
    var isNotEmpty: Bool {
        !isEmpty
    }
}

"Swift".isNotEmpty
```

extension 可以给已有类型增加计算属性、方法、协议实现。不要用 extension 随意污染系统类型，项目中应有清晰命名和边界。

## 4. protocol extension 默认实现

```swift
extension Loggable {
    func log(_ message: String) {
        print("[\(logTag)] \(message)")
    }
}
```

遵守者只要提供 `logTag`，就能复用默认 `log` 实现。

## 5. 常见标准协议

| 协议 | 用途 |
| --- | --- |
| `Equatable` | 支持 `==` 比较 |
| `Hashable` | 可作为 Set 元素 / Dictionary key |
| `Identifiable` | SwiftUI List 常用身份标识 |
| `Codable` | JSON 编解码 |
| `Comparable` | 排序比较 |

## 6. Delegate 思想在 Swift 中的写法

```swift
protocol PlayerDelegate: AnyObject {
    func playerDidFinish()
}

class Player {
    weak var delegate: PlayerDelegate?

    func finish() {
        delegate?.playerDidFinish()
    }
}
```

class-only protocol 常配合 `AnyObject` 和 `weak`，避免 delegate 循环引用。

## 7. 面向协议编程入门

不要一上来就抽象。先有两个以上具体实现，再抽出 protocol：

```swift
protocol DeviceRepository {
    func fetchDevices() async throws -> [Device]
}
```

这样 ViewModel 可以依赖抽象，测试时替换成 fake repository。

## 8. 学习重点

1. protocol 描述能力。
2. extension 扩展行为。
3. protocol extension 提供默认实现。
4. delegate 需要关注 weak 和 class-only。
5. MVVM、依赖注入、测试替身都会用到协议。

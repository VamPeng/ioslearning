# Swift 泛型

泛型让类型成为参数。它能让你写出“对多种类型都适用，但仍然保持类型安全”的代码。SwiftUI、Combine、Result、Array、Dictionary、Optional 本身都大量依赖泛型。

## 1. 泛型函数

```swift
func swapTwoValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}
```

`T` 是类型参数。调用时 Swift 会自动推断具体类型。

## 2. 泛型类型

```swift
struct Box<Value> {
    let value: Value
}

let intBox = Box(value: 1)
let textBox = Box(value: "Swift")
```

泛型类型适合包装状态、结果、缓存容器、响应模型。

## 3. 类型约束

```swift
func contains<T: Equatable>(_ array: [T], _ value: T) -> Bool {
    array.contains(value)
}
```

`T: Equatable` 表示 T 必须支持相等比较。约束让泛型代码可以安全调用协议能力。

## 4. where 条件

```swift
func allEqual<S1: Sequence, S2: Sequence>(_ a: S1, _ b: S2) -> Bool
where S1.Element == S2.Element, S1.Element: Equatable {
    Array(a) == Array(b)
}
```

`where` 用于表达更复杂的泛型约束。初学阶段能看懂即可。

## 5. Result

```swift
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)
}
```

标准库已有 `Result`。在 async / await 之前，它常用于回调结果表达；现在仍可用于明确表达成功 / 失败数据。

## 6. associatedtype 只做概念了解

```swift
protocol Repository {
    associatedtype Item
    func fetch() async throws -> [Item]
}
```

`associatedtype` 是协议里的占位类型。SwiftUI、Collection、Sequence 等底层会大量使用。基础阶段先理解“协议也可以带类型占位”。

## 7. 泛型与协议组合

真实项目中常见写法：

```swift
protocol CacheStore {
    func save<T: Codable>(_ value: T, for key: String) throws
    func load<T: Codable>(_ type: T.Type, for key: String) throws -> T?
}
```

这表示缓存可以保存任意 Codable 类型，同时保持类型安全。

## 8. 学习重点

1. 看懂 `<T>` 是类型参数。
2. 看懂 `T: Protocol` 是类型约束。
3. 理解标准库集合、Optional、Result 都是泛型。
4. SwiftUI 中的 `some View`、`ViewBuilder` 背后也和泛型/协议有关，后续再深入。

# Swift Struct / Enum / 值类型

Swift 的语言风格是值类型优先。理解 `struct`、`enum` 和值语义，是后续学习 SwiftUI、状态管理、模型建模的关键。

## 1. struct 定义模型

```swift
struct Device {
    let id: String
    var name: String
    var online: Bool
}

let camera = Device(id: "A001", name: "Camera", online: true)
```

Swift 中模型对象优先使用 `struct`，尤其是接口 DTO、页面状态、配置数据。

## 2. 值语义

```swift
var a = Device(id: "1", name: "A", online: true)
var b = a
b.name = "B"

print(a.name) // A
print(b.name) // B
```

`struct` 赋值时表现为值拷贝。修改 `b` 不会影响 `a`。

## 3. mutating 方法

`struct` 的实例方法默认不能修改自身属性，需要 `mutating`：

```swift
struct Counter {
    var value = 0

    mutating func increase() {
        value += 1
    }
}
```

这能让“是否会改变自身”在声明层面变得明确。

## 4. enum 基本用法

```swift
enum LoginState {
    case idle
    case loading
    case success
    case failure
}
```

`enum` 很适合表达有限状态。比字符串或 Int 状态码更安全。

## 5. 关联值

```swift
enum LoadResult {
    case success(Device)
    case failure(message: String)
}

let result = LoadResult.failure(message: "network error")
```

关联值让 enum 不只是一个标签，还能携带不同 case 对应的数据。

## 6. 原始值

```swift
enum AlarmType: String {
    case motion = "motion"
    case sound = "sound"
}
```

原始值常用于接口字段、埋点字段、持久化字段映射。

## 7. switch 与 enum

```swift
switch result {
case .success(let device):
    print(device.name)
case .failure(let message):
    print(message)
}
```

Swift 会要求你穷尽所有 case，这能减少状态遗漏。

## 8. 与 class 的选择

优先 `struct`：模型、状态、配置、纯数据。

选择 `class`：需要共享引用、继承、对象身份、生命周期观察、与 Objective-C 框架互操作。

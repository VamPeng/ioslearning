# Swift Optional 可选值

Optional 是 Swift 入门阶段最重要的节点之一。它解决的是“一个值可能不存在”的问题。Swift 不允许你把可能为 `nil` 的值当作一定存在的值使用，这就是 Swift 安全性的核心来源之一。

## 1. Optional 是什么

```swift
var nickname: String? = nil
nickname = "Yuhui"
```

`String?` 表示这里可能有一个 `String`，也可能是 `nil`。它不是普通 `String`，不能直接当 `String` 使用。

## 2. 强制解包

```swift
let text = nickname!
```

`!` 表示“我保证这里一定有值”。如果实际是 `nil`，程序会直接崩溃。学习阶段要认识它，但真实项目里要尽量少用。

## 3. if let

```swift
if let nickname = nickname {
    print("hello \(nickname)")
} else {
    print("no nickname")
}
```

Swift 也支持简写：

```swift
if let nickname {
    print(nickname)
}
```

## 4. guard let

```swift
func render(title: String?) {
    guard let title else {
        print("empty title")
        return
    }

    print("render \(title)")
}
```

`guard let` 的优势是提前处理异常分支，后续主流程里 `title` 已经是非 Optional。

## 5. nil 合并运算符

```swift
let displayName = nickname ?? "未命名用户"
```

`??` 表示左边有值就用左边，左边是 `nil` 就用右边默认值。

## 6. Optional Chaining

```swift
let count = user.profile?.devices?.count
```

链路中任意一环是 `nil`，整体结果就是 `nil`，不会崩溃。

## 7. 什么时候用 Optional

适合使用 Optional 的场景：

1. 接口字段可能缺失。
2. 用户输入可能为空。
3. 对象生命周期中某个引用暂时不存在。
4. 查找结果可能失败。

不适合滥用 Optional 的场景：一个值从业务上必须存在，只是你懒得初始化。那应该重构初始化流程，而不是到处写 `?`。

## 8. Android 类比

Swift Optional 类似 Kotlin 的 nullable type：

```kotlin
val name: String? = null
```

区别是 Swift 项目里 `if let`、`guard let`、`??`、可选链是主线写法，阅读频率非常高，必须形成肌肉记忆。

# Swift 运算符与控制流

控制流决定代码按什么路径执行。Swift 的控制流比 C / Objective-C 更安全，尤其是 `switch` 必须穷尽所有情况，这一点在 enum、状态机和 UI 状态渲染里非常重要。

## 1. 常用运算符

```swift
let a = 10
let b = 3

let sum = a + b
let diff = a - b
let product = a * b
let quotient = a / b
let remainder = a % b
```

比较与逻辑：

```swift
let isAdult = age >= 18
let canEnter = isLogin && isAdult
let shouldShow = isVip || isOwner
let hidden = !shouldShow
```

## 2. if / else

```swift
if battery <= 20 {
    print("low battery")
} else if battery <= 60 {
    print("normal")
} else {
    print("enough")
}
```

Swift 的 `if` 条件必须是 `Bool`，不能像 C/Objective-C 那样用 `0` / 非 `0` 代替真假。

## 3. switch

```swift
let status = "online"

switch status {
case "online":
    print("在线")
case "offline":
    print("离线")
default:
    print("未知")
}
```

Swift 的 `switch` 默认不会贯穿执行，不需要每个 case 后面手写 `break`。

## 4. Range 区间

```swift
for index in 0..<5 {
    print(index) // 0,1,2,3,4
}

for index in 1...5 {
    print(index) // 1,2,3,4,5
}
```

`..<` 是半开区间，`...` 是闭区间。数组下标遍历常用半开区间。

## 5. for-in

```swift
let names = ["A", "B", "C"]

for name in names {
    print(name)
}
```

带下标：

```swift
for (index, name) in names.enumerated() {
    print("\(index): \(name)")
}
```

## 6. while / repeat-while

```swift
var count = 3
while count > 0 {
    print(count)
    count -= 1
}
```

`repeat-while` 至少执行一次：

```swift
repeat {
    print("run once")
} while false
```

## 7. guard 基本用法

`guard` 用于提前退出，让主流程保持扁平：

```swift
func openPage(userId: String?) {
    guard let userId else {
        print("missing user id")
        return
    }

    print("open page for \(userId)")
}
```

`guard` 在 Optional、参数校验、网络响应校验里非常高频。

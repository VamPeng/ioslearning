# Swift 集合类型

Swift 标准库提供三种最常用集合：`Array`、`Dictionary`、`Set`。iOS 开发中的列表数据、接口响应、缓存映射、去重集合都会用到它们。

## 1. Array

`Array` 是有序列表：

```swift
var devices = ["Camera", "Doorbell"]
devices.append("Sensor")
print(devices[0])
```

显式类型写法：

```swift
let ids: [String] = ["A001", "A002"]
```

数组越界会崩溃，所以访问下标前要保证 index 合法。

## 2. Dictionary

`Dictionary` 是键值表：

```swift
var userInfo: [String: String] = [
    "name": "Yuhui",
    "role": "Android"
]

let name = userInfo["name"]
```

字典下标返回的是 Optional，因为 key 可能不存在。

```swift
let role = userInfo["role"] ?? "unknown"
```

## 3. Set

`Set` 是无序且不重复的集合：

```swift
var tags: Set<String> = ["ios", "swift", "ios"]
print(tags.count) // 2
```

适合做去重、交集、并集、包含判断。

```swift
tags.contains("swift")
```

## 4. 遍历

```swift
for device in devices {
    print(device)
}

for (key, value) in userInfo {
    print("\(key): \(value)")
}
```

## 5. map / filter / reduce 入门

```swift
let numbers = [1, 2, 3, 4]
let doubled = numbers.map { $0 * 2 }
let even = numbers.filter { $0 % 2 == 0 }
let total = numbers.reduce(0) { $0 + $1 }
```

这些 API 是 Swift 函数式编程的入口，也是 SwiftUI 数据转换里常见的写法。

## 6. 可变与不可变

```swift
let fixed = [1, 2, 3]
var editable = [1, 2, 3]
editable.append(4)
```

`let` 集合不能增删元素；`var` 集合可以修改。项目中仍然优先 `let`，只有确实需要改变时使用 `var`。

## 7. 练习

给定设备列表，过滤在线设备并取出名称：

```swift
struct Device {
    let name: String
    let online: Bool
}

let devices = [
    Device(name: "A", online: true),
    Device(name: "B", online: false)
]

let onlineNames = devices.filter { $0.online }.map { $0.name }
```

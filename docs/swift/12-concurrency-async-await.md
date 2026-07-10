# Swift async / await 并发基础

async / await 是 2026 年 Swift 异步编程的主线。它让异步代码更接近同步代码的阅读方式，替代大量回调嵌套。后续网络请求、数据库读写、图片加载、ViewModel 状态更新都会遇到它。

## 1. async 函数

```swift
func fetchUserName() async -> String {
    "Yuhui"
}
```

`async` 表示函数是异步函数，调用它需要 `await`。

## 2. await 调用

```swift
let name = await fetchUserName()
```

`await` 表示这里可能挂起当前任务，等待异步结果返回。

## 3. async throws

真实网络请求通常既异步又可能失败：

```swift
func fetchDevices() async throws -> [Device] {
    []
}
```

调用方写法：

```swift
do {
    let devices = try await fetchDevices()
    print(devices)
} catch {
    print(error)
}
```

看到 `try await`，就表示这里同时有错误边界和异步边界。

## 4. Task

在同步上下文中启动异步任务：

```swift
Task {
    let name = await fetchUserName()
    print(name)
}
```

SwiftUI 中常见：

```swift
.task {
    await viewModel.load()
}
```

## 5. MainActor

UI 更新必须回到主线程语义。Swift 并发中推荐用 `MainActor` 表达主执行上下文：

```swift
@MainActor
final class DeviceViewModel {
    var devices: [Device] = []

    func load() async {
        // update UI state safely
    }
}
```

## 6. async let

并发启动多个异步任务：

```swift
async let user = fetchUserName()
async let count = fetchUnreadCount()

let result = await (user, count)
```

适合少量固定数量的并发请求。

## 7. TaskGroup 概念

当任务数量动态变化时，可以使用 TaskGroup：

```swift
let values = await withTaskGroup(of: Int.self) { group in
    for index in 0..<3 {
        group.addTask { index * 2 }
    }

    var result: [Int] = []
    for await value in group {
        result.append(value)
    }
    return result
}
```

基础阶段能看懂即可，真实项目用到时再深入。

## 8. 从回调迁移到 async / await

旧写法：

```swift
request { result in
    switch result {
    case .success(let data): print(data)
    case .failure(let error): print(error)
    }
}
```

新写法：

```swift
do {
    let data = try await request()
    print(data)
} catch {
    print(error)
}
```

async / await 的价值是减少回调嵌套，让错误处理和主流程更清晰。

## 9. 学习重点

1. `async` 标记异步函数。
2. `await` 标记挂起点。
3. `try await` 是网络层高频组合。
4. `Task` 用于启动异步上下文。
5. `MainActor` 保护 UI 状态更新。
6. `async let` 和 TaskGroup 是并发执行能力。

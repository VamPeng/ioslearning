# Swift 基础阶段速查表

这份速查表用于完成 Swift 基础阶段后的快速复习。

## 变量与类型

```swift
let name = "Yuhui"      // 常量
var count = 0           // 变量
let id: Int64 = 10001   // 显式类型
let text = "count=\(count)"
```

优先 `let`，需要修改时才用 `var`。

## 控制流

```swift
if isLogin {
    print("ok")
}

switch state {
case .loading: print("loading")
case .success: print("success")
case .failure: print("failure")
}

for item in items { print(item) }
```

Swift 的 `switch` 必须穷尽所有情况。

## Optional

```swift
let name: String? = nil

if let name { print(name) }

guard let token else { return }

let displayName = name ?? "未命名"
let count = user.profile?.devices?.count
```

避免滥用 `!` 强制解包。

## 集合

```swift
let list: [String] = ["A", "B"]
let map: [String: Int] = ["A": 1]
let set: Set<String> = ["ios", "swift"]

let names = users.map { $0.name }
let online = users.filter { $0.isOnline }
let total = numbers.reduce(0) { $0 + $1 }
```

## 函数

```swift
func add(_ a: Int, _ b: Int) -> Int {
    a + b
}

func move(from source: String, to target: String) {}
```

参数标签影响调用点可读性。

## 闭包

```swift
let doubled = numbers.map { $0 * 2 }

load { result in
    print(result)
}

onChange = { [weak self] in
    self?.reload()
}
```

闭包访问 `self` 时要想到 ARC。

## Struct / Enum

```swift
struct Device {
    let id: String
    var name: String
}

enum LoadState {
    case idle
    case loading
    case success([Device])
    case failure(String)
}
```

模型和状态优先用值类型。

## Class / ARC

```swift
class Player {
    weak var delegate: PlayerDelegate?
}
```

`class` 是引用类型；delegate、反向引用常用 `weak`。

## Protocol / Extension

```swift
protocol Repository {
    func fetch() async throws -> [Device]
}

extension String {
    var isNotEmpty: Bool { !isEmpty }
}
```

protocol 定义能力，extension 扩展行为。

## Error / Codable

```swift
enum AppError: Error { case invalidData }

struct User: Codable {
    let id: Int
    let name: String
}

let user = try JSONDecoder().decode(User.self, from: data)
```

## Generics

```swift
struct Box<Value> {
    let value: Value
}

func contains<T: Equatable>(_ array: [T], _ value: T) -> Bool {
    array.contains(value)
}
```

## async / await

```swift
func fetchDevices() async throws -> [Device] { [] }

Task {
    do {
        let devices = try await fetchDevices()
        print(devices)
    } catch {
        print(error)
    }
}
```

UI 状态更新优先考虑 `@MainActor`。

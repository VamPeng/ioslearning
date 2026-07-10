# Swift 基础阶段 Labs

这些练习用于把 Swift 基础阶段从“看懂语法”推进到“能写最小业务逻辑”。建议每学完一个正文节点，就完成对应练习。

## Lab 01. 基础语法

目标：使用 `let`、`var`、基础类型和字符串插值输出设备状态。

```swift
let deviceName = "Camera"
var battery = 80
battery -= 10
print("\(deviceName) battery: \(battery)%")
```

验收：能说明哪些值应使用 `let`，哪些值必须使用 `var`。

## Lab 02. Optional

目标：封装一个安全展示用户名的函数。

```swift
func displayName(_ name: String?) -> String {
    name ?? "未命名用户"
}
```

进阶：改成 `guard let`，并过滤空字符串。

## Lab 03. 集合处理

目标：过滤在线设备并提取名称。

```swift
struct Device {
    let name: String
    let online: Bool
}

let names = devices.filter { $0.online }.map { $0.name }
```

验收：能解释 `filter` 和 `map` 的输入输出。

## Lab 04. 值类型建模

目标：用 `struct` 表达设备，用 `enum` 表达加载状态。

```swift
enum LoadState {
    case idle
    case loading
    case success([Device])
    case failure(String)
}
```

验收：能用 `switch` 穷尽处理每个状态。

## Lab 05. ARC 与闭包

目标：写一个 `ViewModel`，其中闭包访问 `self` 时使用 `[weak self]`。

```swift
final class DeviceViewModel {
    var onChange: (() -> Void)?

    func bind() {
        onChange = { [weak self] in
            self?.reload()
        }
    }

    func reload() {}
}
```

验收：能说明为什么这里不能无脑强持有 `self`。

## Lab 06. Codable

目标：解析一段 JSON 为 Swift 模型。

```swift
struct User: Codable {
    let id: Int
    let name: String
}

let user = try JSONDecoder().decode(User.self, from: data)
```

验收：能处理解析失败的 `catch` 分支。

## Lab 07. async / await

目标：把一个模拟异步加载函数接到 `Task` 中。

```swift
func fetchDevices() async throws -> [Device] {
    []
}

Task {
    do {
        let devices = try await fetchDevices()
        print(devices)
    } catch {
        print(error)
    }
}
```

验收：能指出 `try await` 分别代表错误边界和异步边界。

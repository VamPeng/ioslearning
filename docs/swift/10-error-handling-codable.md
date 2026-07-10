# Swift 错误处理与 Codable

错误处理和 JSON 编解码是从语言基础走向真实 App 的关键节点。网络请求、文件读写、数据解析都可能失败，Swift 用 `throw / try / catch` 表达可恢复错误，用 `Codable` 处理结构化数据。

## 1. Error 协议

```swift
enum LoginError: Error {
    case emptyAccount
    case invalidPassword
    case networkFailed
}
```

错误通常用 enum 表达，因为失败原因是有限集合。

## 2. throws 函数

```swift
func validate(account: String) throws {
    if account.isEmpty {
        throw LoginError.emptyAccount
    }
}
```

`throws` 表示这个函数可能抛出错误。调用方必须处理。

## 3. do / try / catch

```swift
do {
    try validate(account: "")
    print("valid")
} catch LoginError.emptyAccount {
    print("account is empty")
} catch {
    print("other error: \(error)")
}
```

`try` 是错误边界标记。看到 `try` 就要意识到这里可能失败。

## 4. try? / try!

```swift
let result = try? validate(account: "")
```

`try?` 会把结果转成 Optional，失败时得到 `nil`。

```swift
try! validate(account: "root")
```

`try!` 表示强行相信不会失败，失败会崩溃。真实项目慎用。

## 5. defer

```swift
func readFile() {
    print("open")
    defer { print("close") }
    print("read")
}
```

`defer` 中的代码会在当前作用域退出时执行，适合释放资源、恢复状态。

## 6. Codable 基础

```swift
struct User: Codable {
    let id: Int
    let name: String
}
```

解析 JSON：

```swift
let data = """
{"id":1,"name":"Yuhui"}
""".data(using: .utf8)!

let user = try JSONDecoder().decode(User.self, from: data)
```

编码 JSON：

```swift
let encoded = try JSONEncoder().encode(user)
```

## 7. 字段名映射

```swift
struct Device: Codable {
    let deviceSerial: String
    let channelNo: Int
}
```

如果接口字段是 snake_case，可以配置 decoder：

```swift
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
```

复杂字段名映射使用 `CodingKeys`。

## 8. 实战建议

1. 接口 DTO 优先用 `struct + Codable`。
2. 解析失败不要静默吞掉，至少记录 error。
3. 业务错误用 enum 表达。
4. 可恢复错误用 `throws`；不可恢复状态用断言或提前设计避免。
5. 网络层最终应形成：请求 → data → decode → domain model。

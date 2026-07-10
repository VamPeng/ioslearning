# Swift 函数

函数是把逻辑拆成可命名、可复用、可测试单元的基本方式。Swift 函数的重点不只是 `func` 语法，还包括参数标签、默认参数、返回值、`inout` 以及函数作为值。

## 1. 基本声明

```swift
func greet(name: String) {
    print("Hello, \(name)")
}

greet(name: "Yuhui")
```

Swift 调用函数时默认需要写外部参数标签，这能提升调用点可读性。

## 2. 返回值

```swift
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}

let result = add(1, 2)
```

`_` 表示调用时省略参数标签。是否省略要看调用点是否清晰。

## 3. 外部参数名与内部参数名

```swift
func move(from source: String, to target: String) {
    print("move from \(source) to \(target)")
}

move(from: "A", to: "B")
```

`from`、`to` 是外部标签；`source`、`target` 是函数内部使用的名字。

## 4. 默认参数

```swift
func request(url: String, timeout: TimeInterval = 10) {
    print("request \(url), timeout \(timeout)")
}

request(url: "https://example.com")
```

默认参数适合给常用场景降低调用成本。

## 5. inout

Swift 参数默认是常量，不能在函数内部直接修改。如果要修改外部变量，需要 `inout`：

```swift
func increase(_ value: inout Int) {
    value += 1
}

var count = 0
increase(&count)
```

`inout` 不要滥用。多数情况下，返回新值比修改外部值更清晰。

## 6. 函数作为值

```swift
func double(_ value: Int) -> Int {
    value * 2
}

let transform: (Int) -> Int = double
print(transform(3))
```

这为闭包、回调、函数式集合操作做铺垫。

## 7. 小函数拆分习惯

一个函数只做一件事：

```swift
func isValidUserName(_ name: String) -> Bool {
    !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
}
```

在 iOS 项目中，View、ViewModel、Service、Mapper 都需要靠小函数降低复杂度。

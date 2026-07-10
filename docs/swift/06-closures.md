# Swift 闭包

闭包是 Swift 和 iOS API 中极高频的语法。SwiftUI 的 view builder、集合操作、动画、异步回调、按钮点击、网络完成回调都大量使用闭包。

## 1. 闭包基本形式

```swift
let greet = { (name: String) -> String in
    return "Hello, \(name)"
}

print(greet("Yuhui"))
```

闭包可以理解为“没有名字的函数”。

## 2. 作为参数传入

```swift
func load(completion: (String) -> Void) {
    completion("done")
}

load { result in
    print(result)
}
```

最后一个参数是闭包时，可以写成尾随闭包。

## 3. 简写参数

```swift
let numbers = [1, 2, 3]
let doubled = numbers.map { $0 * 2 }
```

`$0` 表示第一个参数，`$1` 表示第二个参数。简单闭包可以用简写，复杂逻辑建议显式命名参数。

## 4. 捕获外部变量

```swift
var count = 0
let increase = {
    count += 1
}

increase()
print(count)
```

闭包可以捕获外部变量。这个能力很强，但也会带来循环引用风险。

## 5. escaping 与 non-escaping 概念

如果闭包在函数返回后才执行，就是 escaping。典型场景是网络请求完成回调：

```swift
func request(completion: @escaping (String) -> Void) {
    DispatchQueue.main.async {
        completion("success")
    }
}
```

初学阶段先理解：`@escaping` 意味着闭包生命周期可能比当前函数更长。

## 6. weak self 入门

对象持有闭包，闭包又持有对象，可能形成循环引用：

```swift
class ViewModel {
    var onChange: (() -> Void)?

    func bind() {
        onChange = { [weak self] in
            self?.reload()
        }
    }

    func reload() {}
}
```

看到闭包里访问 `self`，就要想到 ARC 和循环引用。

## 7. 与 Objective-C Block 的关系

Swift closure 与 Objective-C Block 都是“可传递的代码块”。Swift 写法更轻量，类型推断更强，但内存捕获问题仍然要关注。

## 8. 必会场景

1. `map / filter / reduce`。
2. SwiftUI 组件内容闭包。
3. Button 点击事件。
4. 网络请求完成回调。
5. 动画 completion。
6. ViewModel 对外事件通知。

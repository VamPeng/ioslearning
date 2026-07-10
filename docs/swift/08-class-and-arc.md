# Swift Class 与 ARC

`class` 是引用类型。Swift 项目虽然强调值类型优先，但只要涉及对象身份、共享状态、生命周期、继承、UIKit / Objective-C 互操作，就仍然会用到 class。

## 1. class 基本定义

```swift
class DeviceManager {
    var devices: [String] = []

    func add(_ device: String) {
        devices.append(device)
    }
}

let manager = DeviceManager()
manager.add("Camera")
```

## 2. 引用语义

```swift
let a = DeviceManager()
let b = a
b.add("A")

print(a.devices) // ["A"]
```

`a` 和 `b` 指向同一个对象。修改 `b`，`a` 也能看到结果。

## 3. initializer / deinitializer

```swift
class UserSession {
    let token: String

    init(token: String) {
        self.token = token
    }

    deinit {
        print("session released")
    }
}
```

`init` 负责初始化，`deinit` 在对象释放时调用，常用于观察生命周期和释放资源。

## 4. 继承基础

```swift
class Animal {
    func speak() {
        print("...")
    }
}

class Dog: Animal {
    override func speak() {
        print("wang")
    }
}
```

Swift 支持继承，但新项目里不鼓励滥用继承。优先组合与协议抽象。

## 5. ARC 是什么

ARC（Automatic Reference Counting）自动引用计数：对象被强引用时引用计数增加，强引用消失时引用计数减少，计数为 0 时对象释放。

你不需要手动 free，但要处理循环引用。

## 6. strong / weak / unowned

Swift 默认引用是强引用：

```swift
class Owner {
    var device: Device?
}
```

`weak` 不增加引用计数，适合 delegate、反向引用：

```swift
class Child {
    weak var parent: Parent?
}
```

`unowned` 也不增加引用计数，但假设引用对象生命周期更长。如果对象已释放再访问，会崩溃。初学阶段优先使用 `weak`。

## 7. 循环引用

```swift
class A {
    var b: B?
}

class B {
    var a: A?
}
```

如果 `A` 强持有 `B`，`B` 又强持有 `A`，两者都不会释放。常见解决方式是把反向引用改为 `weak`。

## 8. 闭包中的循环引用

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

看到 class 持有闭包、闭包里访问 `self`，就要检查是否需要 `[weak self]`。

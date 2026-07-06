# Objective-C 语言定位

## 1. Objective-C 在 iOS 学习中的位置

Objective-C 不是现在新 iOS 项目的首选语言，但它仍然是理解老 iOS 项目、UIKit 代码、Runtime 机制、OC/Swift 混编的重要基础。

对于一个以 Android 背景入门 iOS 的开发者来说，学习 OC 的目的不是替代 Swift，而是补齐以下能力：

```text
1. 能读懂老 iOS 项目
2. 能理解 UIKit 时代的代码风格
3. 能看懂 .h / .m / Category / Delegate / Block
4. 能处理 OC 和 Swift 混编问题
5. 后续能继续理解 Runtime、消息发送、动态派发
```

## 2. OC 与 Swift 的关系

```text
Swift      = 当前 iOS 新项目主力语言
Objective-C = 老项目、老 SDK、UIKit 历史代码、Runtime 体系的重要语言
```

建议学习策略：

```text
新项目开发：Swift / SwiftUI 优先
老项目维护：OC 基础必须会
底层机制理解：OC Runtime 需要补
混编项目：OC / Swift 互操作需要会
```

## 3. 对 Android 开发者的类比

| Android / JVM 世界 | iOS / Apple 世界 |
|---|---|
| Java 老项目 | Objective-C 老项目 |
| Kotlin 新项目 | Swift 新项目 |
| XML / View 老 UI | UIKit / Storyboard / Xib |
| Compose 新 UI | SwiftUI |
| JVM 运行时机制 | Objective-C Runtime |
| Java 接口回调 | Protocol / Delegate |
| Lambda | Block / Swift Closure |

## 4. 学习顺序

```text
Objective-C 语言定位
↓
基础语法
↓
类与对象
↓
属性与方法
↓
ARC 内存管理
↓
Block
↓
Category / Extension
↓
Protocol / Delegate
↓
Swift 互操作
↓
Runtime 基础
```

## 5. 当前最低目标

第一阶段不用追求写大型 OC App，只需要达到：

```text
看到一个 OC 文件，知道它在声明什么、实现什么、调用什么。
```

最低掌握标准：

```text
1. 看懂 .h / .m
2. 看懂 @interface / @implementation
3. 看懂属性声明
4. 看懂方法声明和调用
5. 看懂 Foundation 常用类型
6. 看懂 nil、NSLog、NSArray、NSDictionary
```

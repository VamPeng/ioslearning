# Objective-C 与 Swift 互操作

## 1. 学习目标

很多 iOS 项目不是纯 Swift，也不是纯 OC，而是长期混编。

学完以后，你应该能看懂：

```text
1. Swift 调 OC 需要什么
2. OC 调 Swift 需要什么
3. Bridging Header 是什么
4. ProductModuleName-Swift.h 是什么
5. Swift 类为什么经常继承 NSObject 或标记 @objc
6. NSString / String、NSArray / Array 这类类型如何桥接
7. nullability 对 Swift 调 OC 有什么影响
```

一句话：

```text
Swift 和 OC 可以互相调用，但需要通过桥接头、生成头文件和 @objc 暴露接口。
```

---

## 2. Swift 调用 Objective-C

Swift 要调用 OC 代码，通常需要 Bridging Header。

例如项目里有：

```text
UserService.h
UserService.m
```

Bridging Header 中导入：

```objc
// ProjectName-Bridging-Header.h
#import "UserService.h"
```

然后 Swift 中可以使用：

```swift
let service = UserService()
service.loadUser()
```

粗略理解：

```text
Bridging Header = 告诉 Swift 哪些 OC 头文件可以被 Swift 看见。
```

如果某个 OC 类 Swift 里找不到，先检查：

```text
1. .h 是否被导入 Bridging Header
2. Target Membership 是否正确
3. 类和方法是否对 Swift 可见
```

---

## 3. Objective-C 调用 Swift

OC 要调用 Swift，通常导入自动生成的 Swift 头文件：

```objc
#import "ProjectName-Swift.h"
```

这个文件不是你手写的，而是 Xcode 构建时生成的。

OC 中使用 Swift 类：

```objc
#import "ProjectName-Swift.h"

SwiftUserService *service = [[SwiftUserService alloc] init];
[service loadUser];
```

读老项目时看到：

```objc
#import "AppName-Swift.h"
```

就说明这段 OC 正在调用 Swift 暴露出来的接口。

---

## 4. Swift 暴露给 OC

不是所有 Swift 类型都能直接给 OC 调用。常见写法：

```swift
@objcMembers
class SwiftUserService: NSObject {
    func loadUser() {
        print("load user")
    }
}
```

关键点：

```text
NSObject      让 Swift 类进入 OC 对象体系
@objcMembers 让成员自动暴露给 OC
```

也可以只暴露单个方法：

```swift
class SwiftUserService: NSObject {
    @objc func loadUser() {
        print("load user")
    }
}
```

如果 Swift 类型使用了 OC 不支持的特性，它就不能直接暴露给 OC。

---

## 5. 常见类型桥接

| Objective-C | Swift |
|---|---|
| `NSString *` | `String` |
| `NSNumber *` | `NSNumber` / 数值类型 |
| `NSArray *` | `Array` |
| `NSDictionary *` | `Dictionary` |
| `BOOL` | `Bool` |
| `NSInteger` | `Int` |
| `NSError **` | `throws` 风格可能参与桥接 |

示例 OC：

```objc
@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

@end
```

Swift 中大致使用：

```swift
let user = User()
user.name = "Yuhui"
user.age = 18
```

---

## 6. nullability

OC 早期没有 Swift 那样明确的可选类型。为了让 Swift 更准确地知道对象能不能为 nil，OC 头文件常写 nullability：

```objc
NS_ASSUME_NONNULL_BEGIN

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy, nullable) NSString *nickname;

- (nullable NSString *)displayName;

@end

NS_ASSUME_NONNULL_END
```

含义：

```text
NS_ASSUME_NONNULL_BEGIN / END 包住的对象默认 nonnull。
nullable 表示可以为 nil。
```

Swift 看到后：

```swift
user.name      // String
user.nickname  // String?
```

这会直接影响 Swift 侧是否需要解包。

---

## 7. 泛型轻量标注

OC 集合可以写轻量泛型：

```objc
@property (nonatomic, strong) NSArray<User *> *users;
@property (nonatomic, strong) NSDictionary<NSString *, User *> *userMap;
```

这能让 Swift 侧获得更清晰的类型信息。

如果不写泛型，Swift 看到的类型可能更宽泛：

```text
NSArray
NSDictionary
```

读混编代码时，nullability 和泛型标注越完整，Swift 调用体验通常越好。

---

## 8. Swift 名字暴露给 OC

Swift 方法暴露到 OC 后，名字会变成 OC 风格。

Swift：

```swift
@objcMembers
class SwiftUserService: NSObject {
    func loadUser(with identifier: String) {
        print(identifier)
    }
}
```

OC 可能这样调用：

```objc
[service loadUserWithIdentifier:@"1001"];
```

如果想指定 OC 名字：

```swift
@objc(loadUserWithId:)
func loadUser(id: String) {
    print(id)
}
```

OC：

```objc
[service loadUserWithId:@"1001"];
```

---

## 9. Block 与 Swift Closure

OC Block 可以桥接到 Swift Closure。

OC：

```objc
typedef void (^LoginCompletion)(BOOL success, NSError * _Nullable error);

- (void)loginWithCompletion:(LoginCompletion)completion;
```

Swift 调用时会像闭包：

```swift
service.login { success, error in
    if success {
        print("login ok")
    }
}
```

反过来，Swift 暴露给 OC 的闭包参数也需要能表示为 OC Block。

---

## 10. 常见限制

以下 Swift 特性不一定能直接暴露给 OC：

```text
1. Swift struct
2. Swift enum 的复杂关联值
3. 泛型 Swift 类型
4. 不继承 NSObject 的纯 Swift 类型
5. Swift-only 协议特性
```

混编项目里常见做法是：

```text
Swift 内部使用 Swift 风格类型。
需要给 OC 调用的边界层使用 NSObject、@objc、Foundation 类型。
```

---

## 11. 读混编项目的检查顺序

Swift 调 OC：

```text
1. 找 Bridging Header
2. 看里面导入了哪些 .h
3. 看 OC 头文件的 nullability 和泛型
```

OC 调 Swift：

```text
1. 搜索 -Swift.h
2. 看 Swift 类是否继承 NSObject
3. 看 @objc / @objcMembers 标记
4. 看方法参数和返回值是否能被 OC 表示
```

---

## 12. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. Bridging Header 解决什么问题？
2. ProjectName-Swift.h 是谁生成的？
3. Swift 类为什么经常继承 NSObject 才给 OC 用？
4. @objc 和 @objcMembers 有什么作用？
5. nullability 为什么会影响 Swift 调用体验？
6. NSString / NSArray 大致会桥接成 Swift 里的什么？
7. Swift 哪些类型不适合直接暴露给 OC？
```

到这里，Objective-C 第一阶段主线已经完整。后续可以继续进入 Runtime、UIKit、Swift 或项目实战。

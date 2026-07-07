# Lab：Objective-C 与 Swift 互操作

## 目标

通过一个混编示例理解：

```text
1. Swift 如何调用 Objective-C
2. Objective-C 如何调用 Swift
3. Bridging Header 的作用
4. ProjectName-Swift.h 的作用
5. @objc / @objcMembers / NSObject 为什么常一起出现
6. nullability 如何影响 Swift 侧类型
```

这个 Lab 更适合在 iOS App 或 macOS App 工程里做，因为需要 Xcode 混编配置。

---

## 练习 1：创建 OC 类给 Swift 调用

### OCUser.h

```objc
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OCUser : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, copy, nullable) NSString *nickname;

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
- (NSString *)displayName;

@end

NS_ASSUME_NONNULL_END
```

### OCUser.m

```objc
#import "OCUser.h"

@implementation OCUser

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = [name copy];
        _age = age;
    }
    return self;
}

- (NSString *)displayName {
    if (self.nickname.length > 0) {
        return self.nickname;
    }

    return self.name;
}

@end
```

---

## 练习 2：配置 Bridging Header

创建或找到项目的 Bridging Header：

```text
ProjectName-Bridging-Header.h
```

加入：

```objc
#import "OCUser.h"
```

Swift 中调用：

```swift
let user = OCUser(name: "Yuhui", age: 18)
user.nickname = "YP"
print(user.displayName())
```

观察：

```text
1. name 在 Swift 中是 String
2. nickname 在 Swift 中是 String?
3. age 在 Swift 中接近 Int 使用体验
```

---

## 练习 3：创建 Swift 类给 OC 调用

### SwiftGreeter.swift

```swift
import Foundation

@objcMembers
class SwiftGreeter: NSObject {
    func greet(name: String) -> String {
        return "Hello, \(name)"
    }

    @objc(greetWithId:)
    func greet(id: String) -> String {
        return "Hello user \(id)"
    }
}
```

关键点：

```text
NSObject      让 SwiftGreeter 进入 OC 对象体系
@objcMembers 让成员默认暴露给 OC
@objc(...)    指定 OC 侧看到的方法名
```

---

## 练习 4：OC 调用 Swift

在 OC 文件中导入生成头：

```objc
#import "ProjectName-Swift.h"
```

把 `ProjectName` 换成你的模块名。模块名通常和 Target/Product Module Name 有关。

调用：

```objc
SwiftGreeter *greeter = [[SwiftGreeter alloc] init];
NSString *message = [greeter greetWithName:@"Yuhui"];
NSLog(@"%@", message);

NSString *idMessage = [greeter greetWithId:@"1001"];
NSLog(@"%@", idMessage);
```

如果导入失败，检查：

```text
1. Swift 文件是否属于当前 Target
2. Product Module Name 是否和 import 名字一致
3. Swift 类是否继承 NSObject
4. Swift 方法是否 @objc 可见
```

---

## 练习 5：Block / Closure 桥接

### OCLoginService.h

```objc
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^OCLoginCompletion)(BOOL success, NSString * _Nullable message);

@interface OCLoginService : NSObject

- (void)loginWithName:(NSString *)name completion:(OCLoginCompletion)completion;

@end

NS_ASSUME_NONNULL_END
```

### OCLoginService.m

```objc
#import "OCLoginService.h"

@implementation OCLoginService

- (void)loginWithName:(NSString *)name completion:(OCLoginCompletion)completion {
    if (name.length == 0) {
        completion(NO, @"empty name");
        return;
    }

    completion(YES, @"login ok");
}

@end
```

Bridging Header：

```objc
#import "OCLoginService.h"
```

Swift 调用：

```swift
let service = OCLoginService()
service.login(withName: "Yuhui") { success, message in
    print(success)
    print(message ?? "")
}
```

---

## 完成标准

你需要能回答：

```text
1. Swift 调 OC 时，Bridging Header 做了什么？
2. OC 调 Swift 时，ProjectName-Swift.h 从哪里来？
3. SwiftGreeter 为什么继承 NSObject？
4. @objcMembers 和 @objc(...) 分别解决什么问题？
5. OCUser.nickname 为什么在 Swift 中是可选值？
6. OC Block 在 Swift 中大概变成什么？
7. OC 找不到 Swift 类时应该检查哪些地方？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS App 或 iOS App 项目，然后同时添加 Objective-C 和 Swift 文件。第一次添加另一种语言文件时，Xcode 通常会提示是否创建 Bridging Header。

示例结构：

```text
SwiftInteropLab/
├── ProjectName-Bridging-Header.h
├── OCUser.h
├── OCUser.m
├── OCLoginService.h
├── OCLoginService.m
└── SwiftGreeter.swift
```

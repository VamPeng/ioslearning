# Objective-C 与 Swift 互操作速查

## 1. Swift 调 Objective-C

在 Bridging Header 中导入 OC 头文件：

```objc
// ProjectName-Bridging-Header.h
#import "UserService.h"
```

Swift：

```swift
let service = UserService()
service.loadUser()
```

## 2. Objective-C 调 Swift

OC 中导入生成头：

```objc
#import "ProjectName-Swift.h"
```

OC：

```objc
SwiftUserService *service = [[SwiftUserService alloc] init];
[service loadUser];
```

## 3. Swift 暴露给 OC

```swift
@objcMembers
class SwiftUserService: NSObject {
    func loadUser() {
        print("load user")
    }
}
```

或单独暴露：

```swift
class SwiftUserService: NSObject {
    @objc func loadUser() {
        print("load user")
    }
}
```

## 4. 常见桥接类型

| Objective-C | Swift |
|---|---|
| `NSString *` | `String` |
| `NSArray *` | `Array` |
| `NSDictionary *` | `Dictionary` |
| `BOOL` | `Bool` |
| `NSInteger` | `Int` |

## 5. nullability

```objc
NS_ASSUME_NONNULL_BEGIN

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy, nullable) NSString *nickname;

@end

NS_ASSUME_NONNULL_END
```

Swift：

```swift
user.name      // String
user.nickname  // String?
```

## 6. 轻量泛型

```objc
@property (nonatomic, strong) NSArray<User *> *users;
@property (nonatomic, strong) NSDictionary<NSString *, User *> *userMap;
```

## 7. 指定 OC 名字

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

## 8. Block / Closure

OC：

```objc
typedef void (^LoginCompletion)(BOOL success, NSError * _Nullable error);
- (void)loginWithCompletion:(LoginCompletion)completion;
```

Swift：

```swift
service.login { success, error in
    print(success)
}
```

## 9. 常见检查

Swift 找不到 OC：

```text
1. 检查 Bridging Header
2. 检查 .h 是否导入
3. 检查 Target Membership
```

OC 找不到 Swift：

```text
1. 检查 ProjectName-Swift.h
2. 检查 Swift 类是否 @objc / @objcMembers
3. 检查是否继承 NSObject
```

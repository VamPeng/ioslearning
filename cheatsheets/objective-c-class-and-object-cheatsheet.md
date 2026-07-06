# Objective-C 类与对象速查

## 1. 一个类 = .h + .m

```text
User.h = 类声明，对外暴露属性和方法
User.m = 类实现，写方法内部逻辑
```

## 2. 类声明

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (void)printInfo;

@end
```

## 3. 类实现

```objc
#import "User.h"

@implementation User

- (void)printInfo {
    NSLog(@"name = %@, age = %ld", self.name, (long)self.age);
}

@end
```

## 4. 继承

```objc
@interface Student : User
@end
```

含义：

```text
Student 继承 User
```

## 5. 创建对象

```objc
User *user = [[User alloc] init];
```

拆解：

```text
alloc = 分配内存
init  = 初始化对象
```

Java 类比：

```java
User user = new User();
```

## 6. init 方法

```objc
- (instancetype)init {
    self = [super init];
    if (self) {
        _name = @"Default";
        _age = 0;
    }
    return self;
}
```

关键点：

```text
instancetype = 返回当前类实例
self = [super init] = 先初始化父类
if (self) = 父类初始化成功后再初始化自己
```

## 7. 自定义初始化方法

```objc
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = [name copy];
        _age = age;
    }
    return self;
}
```

调用：

```objc
User *user = [[User alloc] initWithName:@"Yuhui" age:18];
```

完整方法名：

```text
initWithName:age:
```

## 8. self / super

```text
self  = 当前对象，类似 Java this
super = 从父类开始查找方法实现
```

示例：

```objc
self.name = @"Yuhui";
self = [super init];
```

## 9. self.name 和 _name

```text
self.name = 走属性访问，可能触发 setter
_name     = 直接访问成员变量 ivar
```

初始化方法中常用：

```objc
_name = [name copy];
```

普通业务方法中常用：

```objc
self.name = @"Yuhui";
```

## 10. 实例方法和类方法

```objc
- (void)printInfo;       // 实例方法
+ (User *)defaultUser;   // 类方法
```

调用：

```objc
[user printInfo];       // 实例对象调用
[User defaultUser];     // 类对象调用
```

## 11. 类对象和实例对象

```text
User = 类对象
user = 实例对象
```

```objc
[User alloc];       // 给类对象发消息
[user printInfo];   // 给实例对象发消息
```

## 12. Android 类比

| Android / Java / Kotlin | Objective-C |
|---|---|
| `class User` | `@interface User : NSObject` + `@implementation User` |
| `extends BaseUser` | `@interface User : BaseUser` |
| `this` | `self` |
| `super` | `super` |
| `new User()` | `[[User alloc] init]` |
| 构造方法 | `init` / `initWith...` |
| 成员变量 | ivar，例如 `_name` |
| static 方法 | `+` 类方法 |
| 成员方法 | `-` 实例方法 |

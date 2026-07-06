# Objective-C 类与对象

## 1. 学习目标

这个节点从“能看懂基础语法”进入“能看懂一个 OC 类是怎么组织的”。

学完以后，你应该能解释：

```text
1. @interface 声明了什么
2. @implementation 实现了什么
3. NSObject 在 OC 里是什么角色
4. 类对象和实例对象有什么区别
5. alloc / init 为什么经常连在一起
6. self 和 super 分别代表什么
7. init 方法为什么要写成 if (self = [super init])
8. 继承在 OC 中怎么表达
9. 方法声明和方法实现怎么对应
```

一句话：

```text
类与对象 = OC 代码组织方式的核心。
```

---

## 2. 从 Java / Kotlin 视角理解 OC 类

Android / Java 中，一个类通常长这样：

```java
public class User {
    private String name;
    private int age;

    public void printInfo() {
        System.out.println(name + ", " + age);
    }
}
```

Objective-C 通常拆成两个文件：

```text
User.h  = 类的声明，对外暴露属性和方法
User.m  = 类的实现，写具体逻辑
```

对应关系：

```text
Java / Kotlin 类文件
≈
Objective-C 的 .h + .m 两个文件组合
```

---

## 3. @interface：类声明

`@interface` 用来声明类。

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (void)printInfo;

@end
```

拆解：

```objc
@interface User : NSObject
```

含义：

```text
声明一个叫 User 的类，它继承自 NSObject。
```

其中：

```text
User      = 当前类名
NSObject  = 父类
```

类比 Java：

```java
public class User extends Object {
}
```

但 OC 里多数对象都继承自 `NSObject`，它类似于 Java 里的 `Object`，但更直接承载 OC Runtime 对象能力。

---

## 4. @implementation：类实现

`@implementation` 用来实现类。

```objc
#import "User.h"

@implementation User

- (void)printInfo {
    NSLog(@"name = %@, age = %ld", self.name, (long)self.age);
}

@end
```

拆解：

```objc
@implementation User
```

含义：

```text
开始实现 User 类。
```

`@interface` 和 `@implementation` 必须对应：

```text
User.h:
@interface User : NSObject
@end

User.m:
@implementation User
@end
```

---

## 5. 类声明与类实现的关系

可以这样理解：

```text
.h 文件告诉别人：我有哪些属性、哪些方法可以用。
.m 文件告诉自己：这些方法内部到底怎么做。
```

对外暴露的方法一般写在 `.h` 中：

```objc
// User.h
- (void)printInfo;
```

具体实现写在 `.m` 中：

```objc
// User.m
- (void)printInfo {
    NSLog(@"name = %@", self.name);
}
```

如果某个方法只想在类内部使用，可以只写在 `.m` 中，不放到 `.h`。

这类似 Java / Kotlin 中的 `private` 方法，但 OC 老代码里经常通过“不暴露到 .h”来表达内部方法。

---

## 6. 对象创建：alloc / init

创建对象：

```objc
User *user = [[User alloc] init];
```

它分两步：

```objc
[User alloc]
```

表示向类发送 `alloc` 消息，分配内存。

```objc
[[User alloc] init]
```

表示对分配出来的对象发送 `init` 消息，完成初始化。

类比 Java：

```java
User user = new User();
```

对应关系：

```text
Java new User()
≈
Objective-C [[User alloc] init]
```

OC 写得更显式：

```text
alloc = 分配内存
init  = 初始化对象
```

---

## 7. init 初始化方法

OC 中常见初始化方法：

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

完整类：

```objc
@implementation User

- (instancetype)init {
    self = [super init];
    if (self) {
        _name = @"Default";
        _age = 0;
    }
    return self;
}

@end
```

这里有几个重点。

### 7.1 instancetype

```objc
- (instancetype)init
```

`instancetype` 表示返回当前类实例。

可以先理解为：

```text
init 返回一个初始化好的当前对象。
```

### 7.2 self = [super init]

```objc
self = [super init];
```

含义：

```text
先调用父类的初始化方法，并把父类初始化后的对象重新赋值给 self。
```

### 7.3 if (self)

```objc
if (self) {
    _name = @"Default";
}
```

含义：

```text
只有父类初始化成功后，才继续初始化自己的字段。
```

这是 OC 初始化方法的经典写法。

---

## 8. self

`self` 表示当前对象。

示例：

```objc
- (void)printInfo {
    NSLog(@"name = %@", self.name);
}
```

类比 Java / Kotlin：

```text
Objective-C self
≈
Java this
≈
Kotlin this
```

所以：

```objc
self.name
```

可以理解为：

```text
当前对象的 name 属性。
```

---

## 9. super

`super` 表示从父类开始查找方法实现。

示例：

```objc
- (instancetype)init {
    self = [super init];
    if (self) {
        _name = @"Default";
    }
    return self;
}
```

类比 Java：

```java
super();
```

或者：

```java
super.someMethod();
```

注意：

```text
self 是当前对象。
super 不是父类对象，而是告诉运行时从父类方法表开始查找方法。
```

这个点后续理解 Runtime、消息发送、方法查找时会很关键。

---

## 10. 继承

OC 继承写在 `@interface` 后面：

```objc
@interface Student : User
@end
```

含义：

```text
Student 继承 User。
```

完整示例：

```objc
// User.h
@interface User : NSObject
@property (nonatomic, copy) NSString *name;
- (void)printInfo;
@end
```

```objc
// Student.h
#import "User.h"

@interface Student : User
@property (nonatomic, copy) NSString *school;
- (void)study;
@end
```

```objc
// Student.m
#import "Student.h"

@implementation Student

- (void)study {
    NSLog(@"%@ is studying at %@", self.name, self.school);
}

@end
```

使用：

```objc
Student *student = [[Student alloc] init];
student.name = @"Yuhui";
student.school = @"iOS School";
[student printInfo];
[student study];
```

这里 `Student` 可以访问继承自 `User` 的 `name` 和 `printInfo`。

---

## 11. 方法声明与实现

方法声明写在 `.h` 中：

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age;
```

方法实现写在 `.m` 中：

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age {
    self.name = name;
    self.age = age;
}
```

拆解：

```text
-                实例方法
(void)           返回值类型
updateName:      第一段方法名
(NSString *)name 第一个参数
age:             第二段方法名
(NSInteger)age   第二个参数
```

完整方法名是：

```text
updateName:age:
```

调用：

```objc
[user updateName:@"Yuhui" age:18];
```

---

## 12. 成员变量：ivar

OC 中还可以声明成员变量，也叫 ivar。

```objc
@interface User : NSObject {
    NSString *_name;
    NSInteger _age;
}
@end
```

现代 OC 中更常见的是使用 `@property`：

```objc
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
```

编译器会自动生成对应的 ivar，默认名字通常是：

```text
_name
_age
```

所以在 init 里经常看到：

```objc
_name = @"Default";
_age = 0;
```

为什么不是 `self.name = ...`？

```text
初始化阶段直接使用 _name 可以避免触发 setter 逻辑。
```

第一阶段你先记住：

```text
self.name = 走属性访问，可能触发 setter。
_name = 直接访问成员变量。
```

---

## 13. 类对象和实例对象

OC 中类本身也是对象。

创建实例：

```objc
User *user = [[User alloc] init];
```

这里：

```text
User      = 类对象
user      = 实例对象
[User alloc] = 给类对象发送 alloc 消息
[user printInfo] = 给实例对象发送 printInfo 消息
```

类方法使用 `+`：

```objc
+ (User *)defaultUser {
    User *user = [[User alloc] init];
    user.name = @"Default";
    return user;
}
```

调用：

```objc
User *user = [User defaultUser];
```

实例方法使用 `-`：

```objc
- (void)printInfo {
    NSLog(@"%@", self.name);
}
```

调用：

```objc
[user printInfo];
```

---

## 14. 对 Android 开发者最重要的类比

| Android / Java / Kotlin | Objective-C |
|---|---|
| `class User` | `@interface User : NSObject` + `@implementation User` |
| `extends BaseUser` | `@interface User : BaseUser` |
| `this` | `self` |
| `super` | `super` |
| `new User()` | `[[User alloc] init]` |
| 构造方法 | `init` / 自定义 `initWith...` |
| 成员变量 | ivar，例如 `_name` |
| getter / setter | property 自动生成 |
| static 方法 | `+` 类方法 |
| 成员方法 | `-` 实例方法 |

---

## 15. 最低掌握标准

你应该能读懂下面这个类：

```objc
// User.h
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
- (void)printInfo;
+ (User *)defaultUser;

@end
```

```objc
// User.m
#import "User.h"

@implementation User

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = [name copy];
        _age = age;
    }
    return self;
}

- (void)printInfo {
    NSLog(@"name = %@, age = %ld", self.name, (long)self.age);
}

+ (User *)defaultUser {
    return [[User alloc] initWithName:@"Default" age:0];
}

@end
```

你应该能解释：

```text
1. User 继承 NSObject
2. name 和 age 是属性
3. initWithName:age: 是初始化方法
4. self = [super init] 是先初始化父类
5. _name 是直接访问成员变量
6. printInfo 是实例方法
7. defaultUser 是类方法
8. [User defaultUser] 是给类对象发消息
9. [user printInfo] 是给实例对象发消息
```

---

## 16. 常见误区

### 误区 1：认为 .h 和 .m 是两个类

不是。

```text
User.h + User.m 共同组成 User 这个类。
```

### 误区 2：认为 super 是父类对象

不是。

```text
super 表示从父类开始查找方法实现。
```

### 误区 3：init 中忘记调用 [super init]

错误：

```objc
- (instancetype)init {
    _name = @"Default";
    return self;
}
```

推荐：

```objc
- (instancetype)init {
    self = [super init];
    if (self) {
        _name = @"Default";
    }
    return self;
}
```

### 误区 4：混淆 `self.name` 和 `_name`

```text
self.name 走属性访问。
_name 直接访问成员变量。
```

初始化方法里常用 `_name`。

---

## 17. 练习任务

### 任务 1：创建 User 类

要求：

```text
1. 创建 User.h
2. 创建 User.m
3. User 继承 NSObject
4. 添加 name、age 属性
5. 添加 initWithName:age: 初始化方法
6. 添加 printInfo 实例方法
7. 添加 defaultUser 类方法
```

### 任务 2：创建 Student 子类

要求：

```text
1. Student 继承 User
2. 添加 school 属性
3. 添加 study 方法
4. 在 main.m 中创建 Student 对象
5. 调用 printInfo 和 study
```

### 任务 3：解释 self / super

用自己的话解释：

```text
1. self 是什么
2. super 是什么
3. 为什么 init 中要先 self = [super init]
4. 为什么初始化属性时经常使用 _name 而不是 self.name
```

---

## 18. 本节点之后学什么

建议继续：

```text
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
```

# Objective-C 属性与方法

## 1. 学习目标

这个节点继续拆解 OC 类里最常见的两类内容：

```text
属性 = 对象保存的数据
方法 = 对象能执行的行为
```

学完以后，你应该能看懂：

```text
1. @property 后面的 nonatomic / strong / weak / copy / assign 是什么意思
2. getter / setter 和点语法是什么关系
3. self.name 和 _name 的差异
4. 方法声明里的返回值、参数、方法名怎么拆
5. 类方法和实例方法应该怎么区分
6. 为什么 NSString 常用 copy
7. 为什么 delegate 常用 weak
```

一句话：

```text
属性与方法 = 读懂 OC 类对外能力和内部状态的关键。
```

---

## 2. property 的基本结构

一个属性声明通常长这样：

```objc
@property (nonatomic, copy) NSString *name;
```

拆开看：

```text
@property       声明属性
nonatomic       访问策略
copy            内存语义
NSString *      属性类型
name            属性名
```

再看几个常见例子：

```objc
@property (nonatomic, copy) NSString *title;
@property (nonatomic, strong) NSArray *items;
@property (nonatomic, assign) NSInteger count;
@property (nonatomic, weak) id delegate;
```

第一阶段读代码时，重点先看两件事：

```text
1. 类型是什么
2. 修饰符说明这个属性如何被持有或赋值
```

---

## 3. nonatomic / atomic

`nonatomic` 是 iOS 项目里最常见的属性修饰符：

```objc
@property (nonatomic, copy) NSString *name;
```

含义：

```text
nonatomic = 非原子访问，不保证属性读写的线程安全，但性能更好。
```

`atomic` 是默认值，但手写 iOS 代码时很少显式使用：

```objc
@property (atomic, copy) NSString *name;
```

第一阶段可以先记住：

```text
iOS 业务代码里的属性，绝大多数都会写 nonatomic。
```

不要把 `atomic` 理解成完整线程安全。它只能保证单次 getter / setter 访问的原子性，不能保证复杂业务逻辑的线程安全。

---

## 4. strong / weak / copy / assign

这些修饰符描述属性和对象之间的持有关系。

| 修饰符 | 常见用途 | 含义 |
|---|---|---|
| `strong` | 普通对象 | 强引用，属性持有这个对象 |
| `weak` | delegate / 避免循环引用 | 弱引用，不持有对象 |
| `copy` | `NSString` / Block | 拷贝一份对象 |
| `assign` | 基础类型 | 直接赋值，不管理对象生命周期 |

示例：

```objc
@property (nonatomic, strong) User *owner;
@property (nonatomic, weak) id delegate;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, assign) BOOL selected;
```

对 Android / Java 开发者来说，可以先这样类比：

```text
strong 约等于普通对象字段持有引用
weak   约等于弱引用，常用于避免互相持有
copy   约等于保存一份独立副本
assign 约等于基础类型直接赋值
```

---

## 5. 为什么 NSString 常用 copy

字符串属性常见写法：

```objc
@property (nonatomic, copy) NSString *name;
```

原因是 OC 中有可变字符串：

```objc
NSMutableString *mutableName = [NSMutableString stringWithString:@"Tom"];
user.name = mutableName;
[mutableName appendString:@" Lee"];
```

如果 `name` 使用 `strong`，它可能持有同一个可变字符串对象。外部修改 `mutableName` 时，`user.name` 也可能跟着变。

使用 `copy` 后：

```objc
@property (nonatomic, copy) NSString *name;
```

含义是：

```text
赋值时拷贝一份，属性内部保存稳定的字符串内容。
```

所以第一阶段记住：

```text
NSString 属性通常写 copy。
```

---

## 6. 为什么 delegate 常用 weak

delegate 常见写法：

```objc
@property (nonatomic, weak) id delegate;
```

或者更具体一点：

```objc
@property (nonatomic, weak) id<UserCellDelegate> delegate;
```

delegate 是一种“回调给外部对象”的关系。它通常不应该被当前对象强持有。

如果两个对象互相 `strong` 持有，就可能形成循环引用：

```text
ViewController strong -> Cell
Cell strong -> ViewController
```

这样两个对象都无法释放。

所以 delegate 通常写成：

```objc
@property (nonatomic, weak) id delegate;
```

这一节先知道规则：

```text
delegate 常用 weak。
循环引用的细节放到 ARC 节点继续讲。
```

---

## 7. assign 用在基础类型

基础类型不需要对象引用管理：

```objc
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, assign) BOOL enabled;
@property (nonatomic, assign) CGFloat progress;
```

这些类型不是 OC 对象：

```text
NSInteger
BOOL
CGFloat
int
double
```

所以它们不写 `strong` / `weak` / `copy`。

第一阶段可以这样判断：

```text
对象类型带 *，常用 strong / weak / copy。
基础类型不带 *，常用 assign。
```

---

## 8. property 自动生成 getter / setter

声明属性：

```objc
@property (nonatomic, copy) NSString *name;
```

编译器通常会自动生成：

```objc
- (NSString *)name;
- (void)setName:(NSString *)name;
```

读取属性：

```objc
NSString *name = user.name;
```

近似等价于：

```objc
NSString *name = [user name];
```

写入属性：

```objc
user.name = @"Yuhui";
```

近似等价于：

```objc
[user setName:@"Yuhui"];
```

所以：

```text
点语法不是 Java 字段访问。
OC 点语法本质上还是 getter / setter 方法调用。
```

---

## 9. 自定义 getter / setter

如果需要控制读取或写入逻辑，可以自己实现 getter / setter。

```objc
@implementation User

- (void)setName:(NSString *)name {
    _name = [name copy];
    NSLog(@"name changed: %@", _name);
}

- (NSString *)name {
    return _name;
}

@end
```

当你写：

```objc
user.name = @"Yuhui";
```

会调用：

```objc
[user setName:@"Yuhui"];
```

当你写：

```objc
NSString *name = user.name;
```

会调用：

```objc
[user name];
```

老项目中如果看到自定义 setter，要注意：

```text
属性赋值可能不只是保存值，还可能触发日志、刷新 UI、发送通知或做校验。
```

---

## 10. self.name 和 _name

`@property` 通常会自动生成一个 ivar，默认名字是属性名前加下划线：

```objc
@property (nonatomic, copy) NSString *name;
```

对应 ivar 通常是：

```objc
_name
```

两种访问方式：

```objc
self.name = @"Yuhui";
_name = @"Yuhui";
```

区别：

```text
self.name = 走 setter 方法
_name     = 直接访问成员变量
```

读取也一样：

```objc
NSString *a = self.name; // 走 getter
NSString *b = _name;     // 直接读 ivar
```

常见习惯：

```text
init 方法中常用 _name，避免触发 setter 中的额外逻辑。
普通业务方法中常用 self.name，遵守属性封装。
```

示例：

```objc
- (instancetype)initWithName:(NSString *)name {
    self = [super init];
    if (self) {
        _name = [name copy];
    }
    return self;
}

- (void)updateName:(NSString *)name {
    self.name = name;
}
```

---

## 11. readonly / readwrite

属性默认是 `readwrite`，也就是可以读也可以写：

```objc
@property (nonatomic, copy) NSString *name;
```

等价于：

```objc
@property (nonatomic, readwrite, copy) NSString *name;
```

如果只想外部读取，不允许外部写入，可以写：

```objc
@property (nonatomic, readonly, copy) NSString *identifier;
```

外部可以读：

```objc
NSString *identifier = user.identifier;
```

但外部不能写：

```objc
user.identifier = @"123"; // 编译错误
```

常见用法是 `.h` 对外只读，`.m` 内部重新声明成可写：

```objc
// User.h
@interface User : NSObject
@property (nonatomic, readonly, copy) NSString *identifier;
@end
```

```objc
// User.m
@interface User ()
@property (nonatomic, readwrite, copy) NSString *identifier;
@end

@implementation User
@end
```

这种写法表示：

```text
外部只能读取 identifier。
类内部可以修改 identifier。
```

---

## 12. 方法声明怎么读

OC 方法声明结构：

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age;
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

带返回值的方法：

```objc
- (NSString *)displayName;
```

调用：

```objc
NSString *name = [user displayName];
```

没有参数的方法：

```objc
- (void)printInfo;
```

调用：

```objc
[user printInfo];
```

---

## 13. 类方法和实例方法

OC 方法前面的符号很重要：

```objc
- (void)printInfo;
+ (User *)defaultUser;
```

含义：

```text
- 实例方法：需要对象调用
+ 类方法：直接用类调用
```

示例：

```objc
User *user = [[User alloc] init];
[user printInfo];

User *defaultUser = [User defaultUser];
```

类方法常见用途：

```text
1. 创建默认对象
2. 工具方法
3. 工厂方法
```

实例方法常见用途：

```text
1. 读取或修改当前对象状态
2. 执行和当前对象有关的行为
```

判断方法：

```text
如果方法需要访问某个对象自己的 name / age / state，通常是实例方法。
如果方法只和类本身有关，或者负责创建对象，常见写成类方法。
```

---

## 14. 方法命名习惯

OC 方法名通常会把参数含义写进方法名里：

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age;
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
- (BOOL)isAdult;
```

调用时可读性较强：

```objc
[user updateName:@"Yuhui" age:18];
User *user = [[User alloc] initWithName:@"Yuhui" age:18];
BOOL adult = [user isAdult];
```

对比 Java：

```java
user.updateName("Yuhui", 18);
```

OC 调用里每个参数前通常有一段标签：

```objc
[user updateName:@"Yuhui" age:18];
```

这也是为什么 OC 方法名经常看起来很长。

---

## 15. 最低掌握标准

你应该能读懂下面这个类：

```objc
// User.h
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, readonly, copy) NSString *identifier;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, weak) id delegate;

- (instancetype)initWithIdentifier:(NSString *)identifier name:(NSString *)name age:(NSInteger)age;
- (void)updateName:(NSString *)name age:(NSInteger)age;
- (BOOL)isAdult;
+ (User *)defaultUser;

@end
```

```objc
// User.m
#import "User.h"

@interface User ()
@property (nonatomic, readwrite, copy) NSString *identifier;
@end

@implementation User

- (instancetype)initWithIdentifier:(NSString *)identifier name:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _identifier = [identifier copy];
        _name = [name copy];
        _age = age;
    }
    return self;
}

- (void)updateName:(NSString *)name age:(NSInteger)age {
    self.name = name;
    self.age = age;
}

- (BOOL)isAdult {
    return self.age >= 18;
}

+ (User *)defaultUser {
    return [[User alloc] initWithIdentifier:@"0" name:@"Default" age:0];
}

@end
```

你应该能解释：

```text
1. identifier 对外是 readonly
2. User.m 中把 identifier 重新声明成 readwrite，表示内部可写
3. name 使用 copy
4. age 使用 assign
5. delegate 使用 weak
6. updateName:age: 是实例方法
7. isAdult 返回 BOOL
8. defaultUser 是类方法
9. init 中使用 _identifier / _name / _age 是直接访问 ivar
10. updateName:age: 中使用 self.name / self.age 会走 setter
```

---

## 16. 常见误区

### 误区 1：以为点语法就是直接访问字段

不是。

```objc
user.name = @"Yuhui";
```

本质上是：

```objc
[user setName:@"Yuhui"];
```

### 误区 2：基础类型也写 strong

错误：

```objc
@property (nonatomic, strong) NSInteger age;
```

推荐：

```objc
@property (nonatomic, assign) NSInteger age;
```

### 误区 3：delegate 写 strong

容易导致循环引用：

```objc
@property (nonatomic, strong) id delegate;
```

通常写：

```objc
@property (nonatomic, weak) id delegate;
```

### 误区 4：在 init 里随意使用 self.property

不是绝对不能用，但新手阶段建议先遵守：

```text
init 中直接写 _property。
普通方法中优先写 self.property。
```


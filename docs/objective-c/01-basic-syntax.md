# Objective-C 基础语法

## 1. 学习目标

这个节点的目标不是让你立刻写完整 iOS App，而是让你具备阅读 OC 代码的能力。

学完以后，你应该能看懂：

```text
1. .h 和 .m 文件分别做什么
2. @interface / @implementation 是什么
3. NSString *name 里的 * 为什么存在
4. [object method] 为什么不像 Java / Kotlin 的点调用
5. property 属性声明怎么看
6. NSArray / NSDictionary / NSNumber 等 Foundation 类型怎么用
7. nil 和 Java null 的差异
8. NSLog 如何打印日志
```

一句话：

```text
OC 基础语法 = 读懂老 iOS 代码的入场券。
```

---

## 2. 文件结构：.h / .m

Objective-C 常见文件分为两类：

```text
Person.h
Person.m
```

含义：

```text
.h = Header，头文件，声明这个类对外暴露什么
.m = Implementation，实现文件，写这个类内部具体怎么做
```

Android / Java 类比：

```text
Java / Kotlin:
一个 Person.java / Person.kt 通常同时写声明和实现。

Objective-C:
Person.h 负责声明
Person.m 负责实现
```

---

## 3. 最小 OC 类

### Person.h

```objc
#import <Foundation/Foundation.h>

@interface Person : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (void)sayHello;

@end
```

### Person.m

```objc
#import "Person.h"

@implementation Person

- (void)sayHello {
    NSLog(@"Hello, my name is %@, age is %ld", self.name, (long)self.age);
}

@end
```

核心符号：

| 符号 | 含义 |
|---|---|
| `#import` | 导入头文件 |
| `@interface` | 声明类 |
| `@implementation` | 实现类 |
| `@property` | 声明属性 |
| `-` | 实例方法 |
| `+` | 类方法 |
| `NSObject` | OC 大多数对象的基类 |
| `NSString *` | 字符串对象引用 |
| `NSInteger` | 整数类型 |
| `NSLog` | 打印日志 |

---

## 4. 对象与指针

OC 对象变量通常带 `*`：

```objc
NSString *name = @"Yuhui";
Person *person = [[Person alloc] init];
NSArray *list = @[@"A", @"B"];
```

这里的 `*` 表示变量保存的是对象地址，也可以先类比成 Java / Kotlin 里的对象引用。

对 Android 开发者来说，第一阶段可以先这样理解：

```text
NSString *      ≈ String 引用
NSArray *       ≈ List 引用
NSDictionary *  ≈ Map 引用
Person *        ≈ Person 对象引用
```

不建议一开始陷入 C 指针细节。先把它理解成：

```text
OC 对象类型基本都带 *。
基础类型不带 *。
```

示例：

```objc
NSInteger age = 18;       // 基础类型，不带 *
BOOL isLogin = YES;       // 基础类型，不带 *
NSString *name = @"Tom";  // 对象类型，带 *
Person *person = nil;     // 对象类型，带 *
```

---

## 5. 消息发送语法

OC 最大的语法差异是方法调用。

Java / Kotlin：

```java
person.sayHello();
```

Objective-C：

```objc
[person sayHello];
```

OC 的核心模型叫“消息发送”：

```text
[接收者 消息]
```

所以：

```objc
[person sayHello];
```

含义是：

```text
给 person 这个对象发送 sayHello 消息。
```

带一个参数：

```objc
[person setName:@"Yuhui"];
```

带多个参数：

```objc
[person updateName:@"Yuhui" age:18];
```

对应方法声明：

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age;
```

注意：OC 的完整方法名不是 `updateName`，而是：

```text
updateName:age:
```

这点在读崩溃栈、方法查找、Runtime 相关内容时非常重要。

---

## 6. 对象创建

OC 创建对象的典型写法：

```objc
Person *person = [[Person alloc] init];
```

拆开看：

```objc
[Person alloc]
```

表示分配内存。

```objc
[[Person alloc] init]
```

表示分配内存后初始化对象。

Java 类比：

```java
Person person = new Person();
```

对应关系：

```text
Java:
new Person()

Objective-C:
[[Person alloc] init]
```

OC 把“分配内存”和“初始化对象”拆成了两个消息。

---

## 7. property 属性

OC 使用 `@property` 声明属性：

```objc
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
```

常见修饰符：

| 修饰符 | 含义 | 常见使用 |
|---|---|---|
| `nonatomic` | 非线程安全，性能更好 | iOS 属性常用 |
| `atomic` | 原子访问，性能较低 | 很少手写 |
| `copy` | 拷贝对象 | NSString / Block |
| `strong` | 强引用对象 | 普通对象属性 |
| `weak` | 弱引用对象 | delegate / 避免循环引用 |
| `assign` | 直接赋值 | NSInteger / BOOL / CGFloat |

使用属性：

```objc
person.name = @"Yuhui";
person.age = 18;
```

点语法本质上还是方法调用。

写入：

```objc
person.name = @"Yuhui";
```

近似等价于：

```objc
[person setName:@"Yuhui"];
```

读取：

```objc
NSString *name = person.name;
```

近似等价于：

```objc
NSString *name = [person name];
```

---

## 8. 实例方法和类方法

OC 方法前面有 `-` 或 `+`。

```objc
- (void)sayHello;
+ (Person *)createDefaultPerson;
```

含义：

```text
- 实例方法，需要对象调用
+ 类方法，直接用类调用
```

示例：

```objc
Person *person = [[Person alloc] init];
[person sayHello];

Person *defaultPerson = [Person createDefaultPerson];
```

Android / Java 类比：

```text
- 方法 ≈ 普通成员方法
+ 方法 ≈ static 方法 / companion object 方法
```

---

## 9. nil

OC 中对象为空使用 `nil`：

```objc
Person *person = nil;
```

Java 对应：

```java
Person person = null;
```

重要差异：

```objc
[person sayHello];
```

如果 `person == nil`，OC 中给 nil 发送消息通常不会崩溃，而是返回 0 / nil / false 之类的默认值。

Java 不一样：

```java
person.sayHello();
```

如果 `person == null`，Java 会直接抛出 `NullPointerException`。

所以：

```text
Java / Kotlin:
null 调方法容易崩。

Objective-C:
nil 收消息通常不崩，但可能导致逻辑静默失败。
```

---

## 10. Foundation 常用类型

Foundation 是 OC 最常见的基础框架。

常用类型：

| OC 类型 | 含义 | Android / Java 对应 |
|---|---|---|
| `NSString *` | 字符串 | `String` |
| `NSNumber *` | 数字对象包装 | `Integer` / `Long` / `Double` |
| `NSArray *` | 不可变数组 | `List` |
| `NSMutableArray *` | 可变数组 | `ArrayList` |
| `NSDictionary *` | 不可变字典 | `Map` |
| `NSMutableDictionary *` | 可变字典 | `HashMap` |
| `NSData *` | 二进制数据 | `byte[]` / `ByteArray` |
| `NSDate *` | 日期 | `Date` / `Instant` |

---

## 11. NSString

字符串字面量：

```objc
NSString *name = @"Yuhui";
```

字符串拼接 / 格式化：

```objc
NSString *message = [NSString stringWithFormat:@"Hello, %@", name];
```

判断字符串内容相等：

```objc
if ([name isEqualToString:@"Yuhui"]) {
    NSLog(@"same");
}
```

不要这样判断字符串内容：

```objc
if (name == @"Yuhui") {
    // 错误：这是比较指针地址，不是比较字符串内容
}
```

Java 类比：

```java
name.equals("Yuhui")
```

OC 对应：

```objc
[name isEqualToString:@"Yuhui"]
```

---

## 12. NSArray

不可变数组：

```objc
NSArray *names = @[@"Tom", @"Jack", @"Yuhui"];
```

取值：

```objc
NSString *first = names[0];
```

遍历：

```objc
for (NSString *name in names) {
    NSLog(@"%@", name);
}
```

可变数组：

```objc
NSMutableArray *list = [NSMutableArray array];
[list addObject:@"Tom"];
[list addObject:@"Jack"];
```

区别：

```text
NSArray 不可变。
NSMutableArray 可变。
```

---

## 13. NSDictionary

不可变字典：

```objc
NSDictionary *user = @{
    @"name": @"Yuhui",
    @"age": @18
};
```

取值：

```objc
NSString *name = user[@"name"];
NSNumber *age = user[@"age"];
```

可变字典：

```objc
NSMutableDictionary *dict = [NSMutableDictionary dictionary];
dict[@"name"] = @"Yuhui";
dict[@"age"] = @18;
```

类比：

```text
NSDictionary ≈ 不可变 Map
NSMutableDictionary ≈ 可变 HashMap
```

---

## 14. NSNumber

OC 集合中只能放对象，不能直接放基础类型。

所以数字要包装成 `NSNumber`：

```objc
NSNumber *age = @18;
NSNumber *isLogin = @YES;
NSNumber *price = @12.5;
```

取出真实值：

```objc
NSInteger realAge = [age integerValue];
BOOL login = [isLogin boolValue];
double realPrice = [price doubleValue];
```

Java 类比：

```text
int     -> Integer
long    -> Long
double  -> Double
boolean -> Boolean
```

---

## 15. 条件判断和循环

条件判断：

```objc
NSInteger age = 18;

if (age >= 18) {
    NSLog(@"adult");
} else {
    NSLog(@"child");
}
```

布尔值：

```objc
BOOL isLogin = YES;

if (isLogin) {
    NSLog(@"logged in");
}
```

OC 布尔值：

```text
YES / NO
```

for 循环：

```objc
for (NSInteger i = 0; i < 10; i++) {
    NSLog(@"%ld", (long)i);
}
```

for-in 遍历：

```objc
NSArray *names = @[@"Tom", @"Jack", @"Yuhui"];

for (NSString *name in names) {
    NSLog(@"%@", name);
}
```

---

## 16. NSLog

基础打印：

```objc
NSLog(@"Hello Objective-C");
```

带变量：

```objc
NSString *name = @"Yuhui";
NSInteger age = 18;

NSLog(@"name = %@, age = %ld", name, (long)age);
```

常见格式化符：

| 符号 | 含义 |
|---|---|
| `%@` | 对象 |
| `%ld` | long / NSInteger |
| `%d` | int |
| `%f` | double / CGFloat |

`%@` 很常见，因为 OC 里大量东西都是对象。

---

## 17. Android 开发者核心类比

| Android / Java / Kotlin | Objective-C |
|---|---|
| `new Person()` | `[[Person alloc] init]` |
| `person.sayHello()` | `[person sayHello]` |
| `person.name = "Yuhui"` | `person.name = @"Yuhui"` |
| `String` | `NSString *` |
| `List` | `NSArray *` |
| `Map` | `NSDictionary *` |
| `null` | `nil` |
| `static method` | `+` 类方法 |
| 成员方法 | `-` 实例方法 |
| `import` | `#import` |
| 类声明和实现同文件 | `.h` 声明，`.m` 实现 |

---

## 18. 最低掌握标准

你应该能读懂下面这段代码：

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (void)printInfo;

@end

@implementation User

- (void)printInfo {
    NSLog(@"name = %@, age = %ld", self.name, (long)self.age);
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        User *user = [[User alloc] init];
        user.name = @"Yuhui";
        user.age = 18;
        [user printInfo];
    }
    return 0;
}
```

你应该能解释：

```text
1. User 是一个 OC 类
2. User 继承 NSObject
3. name 是 NSString 对象属性
4. age 是 NSInteger 基础类型属性
5. printInfo 是实例方法
6. [[User alloc] init] 创建对象
7. [user printInfo] 给 user 发送 printInfo 消息
8. NSLog 用于打印日志
```

---

## 19. 常见误区

### 误区 1：把 OC 方法调用看成 Java 点调用

OC 是消息发送：

```objc
[user printInfo];
```

不是：

```objc
user.printInfo();
```

### 误区 2：不理解 `*`

```objc
NSString *name;
```

第一阶段先理解为：

```text
name 是一个 NSString 对象引用。
```

### 误区 3：字符串比较用 `==`

错误：

```objc
if (name == @"Yuhui") {}
```

正确：

```objc
if ([name isEqualToString:@"Yuhui"]) {}
```

### 误区 4：不区分 NSArray 和 NSMutableArray

```text
NSArray 不可变。
NSMutableArray 可变。
```

---

## 20. 练习任务

### 任务 1：创建 User 类

要求：

```text
1. 创建 User.h
2. 创建 User.m
3. 添加 name、age 属性
4. 添加 printInfo 方法
5. 在 main.m 中创建 User 对象并调用 printInfo
```

### 任务 2：数组遍历

要求：

```text
1. 创建 NSArray
2. 放入 3 个 NSString
3. 使用 for-in 遍历打印
```

### 任务 3：字典取值

要求：

```text
1. 创建 NSDictionary
2. 包含 name、age 两个字段
3. 取出字段并打印
```

---

## 21. 本节点之后学什么

建议顺序：

```text
OC 基础语法
↓
类与对象
↓
属性与方法
↓
内存管理 ARC
↓
Block
↓
Category / Extension
↓
Protocol / Delegate
↓
Swift 与 OC 互操作
```

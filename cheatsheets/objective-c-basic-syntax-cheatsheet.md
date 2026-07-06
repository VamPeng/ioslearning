# Objective-C 基础语法速查

## 1. 文件结构

```text
Person.h = 声明类对外暴露的属性和方法
Person.m = 实现类内部逻辑
```

## 2. 类声明与实现

```objc
@interface Person : NSObject
@end

@implementation Person
@end
```

## 3. 导入文件

```objc
#import <Foundation/Foundation.h> // 系统框架
#import "Person.h"               // 项目文件
```

## 4. 常见类型

| 类型 | 含义 |
|---|---|
| `NSString *` | 字符串对象 |
| `NSInteger` | 整数 |
| `BOOL` | 布尔值，`YES` / `NO` |
| `NSArray *` | 不可变数组 |
| `NSMutableArray *` | 可变数组 |
| `NSDictionary *` | 不可变字典 |
| `NSNumber *` | 数字对象包装 |

## 5. 对象创建

```objc
Person *person = [[Person alloc] init];
```

类比：

```java
Person person = new Person();
```

## 6. 消息发送

```objc
[person sayHello];
[person updateName:@"Yuhui" age:18];
```

结构：

```text
[接收者 消息]
```

完整方法名：

```text
updateName:age:
```

## 7. 方法类型

```objc
- (void)sayHello;                  // 实例方法
+ (Person *)createDefaultPerson;   // 类方法
```

## 8. 属性

```objc
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, strong) NSObject *object;
@property (nonatomic, weak) id delegate;
```

常见修饰符：

```text
copy   : NSString / Block
strong : 普通对象强引用
weak   : delegate / 避免循环引用
assign : 基础类型
```

## 9. NSString

```objc
NSString *name = @"Yuhui";
NSString *msg = [NSString stringWithFormat:@"Hello, %@", name];

if ([name isEqualToString:@"Yuhui"]) {
    NSLog(@"same");
}
```

不要用 `==` 比较字符串内容。

## 10. NSArray

```objc
NSArray *names = @[@"Tom", @"Jack"];
NSString *first = names[0];

for (NSString *name in names) {
    NSLog(@"%@", name);
}
```

## 11. NSDictionary

```objc
NSDictionary *user = @{
    @"name": @"Yuhui",
    @"age": @18
};

NSString *name = user[@"name"];
NSNumber *age = user[@"age"];
```

## 12. nil

```objc
Person *person = nil;
[person sayHello]; // 通常不崩，但可能导致逻辑静默失败
```

## 13. NSLog

```objc
NSLog(@"Hello");
NSLog(@"name = %@, age = %ld", name, (long)age);
```

| 符号 | 含义 |
|---|---|
| `%@` | 对象 |
| `%ld` | long / NSInteger |
| `%d` | int |
| `%f` | double |

## 14. Android 类比

| Android / Java / Kotlin | Objective-C |
|---|---|
| `new Person()` | `[[Person alloc] init]` |
| `person.sayHello()` | `[person sayHello]` |
| `String` | `NSString *` |
| `List` | `NSArray *` |
| `Map` | `NSDictionary *` |
| `null` | `nil` |
| `static` 方法 | `+` 类方法 |
| 成员方法 | `-` 实例方法 |

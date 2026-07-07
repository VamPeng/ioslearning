# Lab：Objective-C 属性与方法

## 目标

通过一个 `User` 类练习：

```text
1. 使用 strong / weak / copy / assign
2. 理解 readonly / readwrite
3. 区分 self.name 和 _name
4. 编写实例方法和类方法
5. 编写带返回值的方法
6. 观察自定义 setter 的调用时机
```

完成后你应该能解释：

```text
1. name 为什么用 copy
2. age 为什么用 assign
3. delegate 为什么用 weak
4. identifier 为什么对外 readonly
5. updateName:age: 的完整方法名是什么
6. user.name = @"Tom" 本质上调用了什么
```

---

## 练习 1：创建 User 类

### User.h

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, readonly, copy) NSString *identifier;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, weak) id delegate;

- (instancetype)initWithIdentifier:(NSString *)identifier name:(NSString *)name age:(NSInteger)age;
- (void)updateName:(NSString *)name age:(NSInteger)age;
- (BOOL)isAdult;
- (void)printInfo;
+ (User *)defaultUser;

@end
```

---

## 练习 2：实现 User 类

### User.m

```objc
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

- (void)setName:(NSString *)name {
    _name = [name copy];
    NSLog(@"setName called: %@", _name);
}

- (void)updateName:(NSString *)name age:(NSInteger)age {
    self.name = name;
    self.age = age;
}

- (BOOL)isAdult {
    return self.age >= 18;
}

- (void)printInfo {
    NSLog(@"id = %@, name = %@, age = %ld, adult = %@",
          self.identifier,
          self.name,
          (long)self.age,
          [self isAdult] ? @"YES" : @"NO");
}

+ (User *)defaultUser {
    return [[User alloc] initWithIdentifier:@"0" name:@"Default" age:0];
}

@end
```

---

## 练习 3：main.m 调用

```objc
#import <Foundation/Foundation.h>
#import "User.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        User *defaultUser = [User defaultUser];
        [defaultUser printInfo];

        User *user = [[User alloc] initWithIdentifier:@"1001" name:@"Yuhui" age:18];
        [user printInfo];

        user.name = @"Tom";
        user.age = 20;
        [user printInfo];

        [user updateName:@"Jack" age:16];
        [user printInfo];
    }
    return 0;
}
```

---

## 观察点

运行后重点观察：

```text
1. init 中给 _name 赋值时，不会打印 setName called
2. user.name = @"Tom" 会调用 setName:
3. updateName:age: 内部使用 self.name，也会调用 setName:
4. isAdult 根据 age 返回 YES / NO
5. identifier 可以读取，但外部不能重新赋值
```

下面这行如果写在 `main.m` 中，应该会编译失败：

```objc
user.identifier = @"2002";
```

因为 `identifier` 在 `User.h` 中是 `readonly`。

---

## 完成标准

你需要能回答：

```text
1. @property (nonatomic, copy) NSString *name; 每一段分别是什么意思？
2. @property (nonatomic, assign) NSInteger age; 为什么不用 strong？
3. @property (nonatomic, weak) id delegate; 为什么不用 strong？
4. identifier 在 .h 中 readonly，在 .m 中 readwrite，这表达了什么？
5. self.name = name 和 _name = [name copy] 有什么区别？
6. - (BOOL)isAdult 是类方法还是实例方法？
7. + (User *)defaultUser 是类方法还是实例方法？
8. updateName:age: 为什么是完整方法名？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C，然后添加这些文件。

目录大致为：

```text
PropertyMethodLab/
├── main.m
├── User.h
└── User.m
```


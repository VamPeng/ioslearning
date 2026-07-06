# Lab：Objective-C 类与对象

## 目标

通过 `User` 和 `Student` 两个类，练习 OC 中的类声明、类实现、继承、初始化方法、实例方法、类方法、self、super。

完成后你应该能解释：

```text
1. User.h / User.m 分别负责什么
2. @interface 和 @implementation 的关系
3. Student 如何继承 User
4. initWithName:age: 为什么是初始化方法
5. self 和 super 分别是什么
6. + 方法和 - 方法有什么区别
7. self.name 和 _name 有什么区别
```

---

## 练习 1：创建 User 类

### User.h

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
- (void)printInfo;
+ (User *)defaultUser;

@end
```

### User.m

```objc
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

---

## 练习 2：创建 Student 子类

### Student.h

```objc
#import "User.h"

@interface Student : User

@property (nonatomic, copy) NSString *school;

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age school:(NSString *)school;
- (void)study;

@end
```

### Student.m

```objc
#import "Student.h"

@implementation Student

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age school:(NSString *)school {
    self = [super initWithName:name age:age];
    if (self) {
        _school = [school copy];
    }
    return self;
}

- (void)study {
    NSLog(@"%@ is studying at %@", self.name, self.school);
}

@end
```

---

## 练习 3：main.m 调用

```objc
#import <Foundation/Foundation.h>
#import "User.h"
#import "Student.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        User *defaultUser = [User defaultUser];
        [defaultUser printInfo];

        User *user = [[User alloc] initWithName:@"Yuhui" age:18];
        [user printInfo];

        Student *student = [[Student alloc] initWithName:@"Tom" age:20 school:@"iOS School"];
        [student printInfo];
        [student study];
    }
    return 0;
}
```

---

## 完成标准

你需要能回答：

```text
1. User.h 中声明了哪些内容？
2. User.m 中实现了哪些内容？
3. Student 为什么能调用 printInfo？
4. [User defaultUser] 调用的是类方法还是实例方法？
5. [student study] 调用的是类方法还是实例方法？
6. self = [super initWithName:name age:age] 的作用是什么？
7. _school = [school copy] 为什么使用 _school，而不是 self.school？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C，然后添加这些文件。

目录大致为：

```text
ClassObjectLab/
├── main.m
├── User.h
├── User.m
├── Student.h
└── Student.m
```

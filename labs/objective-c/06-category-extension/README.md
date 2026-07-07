# Lab：Objective-C Category / Extension

## 目标

通过 `NSString+Learning` 和 `UserManager` 练习：

```text
1. 创建 Category
2. 给系统类添加工具方法
3. 使用前缀降低方法冲突
4. 在 .m 中使用 Extension 声明私有属性
5. 区分对外 API 和内部实现
```

---

## 练习 1：创建 NSString Category

### NSString+Learning.h

```objc
#import <Foundation/Foundation.h>

@interface NSString (Learning)

- (BOOL)ly_isNotEmpty;
- (NSString *)ly_trimmedString;

@end
```

### NSString+Learning.m

```objc
#import "NSString+Learning.h"

@implementation NSString (Learning)

- (BOOL)ly_isNotEmpty {
    return self.ly_trimmedString.length > 0;
}

- (NSString *)ly_trimmedString {
    return [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
}

@end
```

---

## 练习 2：使用 Category

### main.m

```objc
#import <Foundation/Foundation.h>
#import "NSString+Learning.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *name = @"  Yuhui  ";
        NSLog(@"trimmed = %@", [name ly_trimmedString]);
        NSLog(@"valid = %@", [name ly_isNotEmpty] ? @"YES" : @"NO");

        NSString *empty = @"   ";
        NSLog(@"empty valid = %@", [empty ly_isNotEmpty] ? @"YES" : @"NO");
    }
    return 0;
}
```

观察：

```text
1. Category 方法像 NSString 自己的方法一样调用
2. 使用前需要 import 对应的 Category 头文件
```

---

## 练习 3：创建 UserManager

### UserManager.h

```objc
#import <Foundation/Foundation.h>

@interface UserManager : NSObject

- (void)addUserName:(NSString *)name;
- (NSArray<NSString *> *)allUserNames;

@end
```

### UserManager.m

```objc
#import "UserManager.h"
#import "NSString+Learning.h"

@interface UserManager ()

@property (nonatomic, strong) NSMutableArray<NSString *> *mutableUserNames;

- (void)printCurrentCount;

@end

@implementation UserManager

- (instancetype)init {
    self = [super init];
    if (self) {
        _mutableUserNames = [NSMutableArray array];
    }
    return self;
}

- (void)addUserName:(NSString *)name {
    NSString *trimmed = [name ly_trimmedString];
    if (![trimmed ly_isNotEmpty]) {
        return;
    }

    [self.mutableUserNames addObject:trimmed];
    [self printCurrentCount];
}

- (NSArray<NSString *> *)allUserNames {
    return [self.mutableUserNames copy];
}

- (void)printCurrentCount {
    NSLog(@"user count = %lu", (unsigned long)self.mutableUserNames.count);
}

@end
```

---

## 练习 4：调用 UserManager

```objc
#import <Foundation/Foundation.h>
#import "UserManager.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        UserManager *manager = [[UserManager alloc] init];
        [manager addUserName:@"  Tom  "];
        [manager addUserName:@"   "];
        [manager addUserName:@"Jack"];

        NSLog(@"users = %@", [manager allUserNames]);
    }
    return 0;
}
```

观察：

```text
1. mutableUserNames 没有出现在 UserManager.h
2. printCurrentCount 没有出现在 UserManager.h
3. 外部只能看到 addUserName: 和 allUserNames
```

---

## 完成标准

你需要能回答：

```text
1. NSString+Learning 表示什么？
2. Category 方法为什么建议加 ly_ 这类前缀？
3. Category 中适合添加什么？
4. @interface UserManager () 是什么？
5. mutableUserNames 为什么放在 .m 的 Extension 里？
6. UserManager.h 对外暴露了什么？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C。

目录大致为：

```text
CategoryExtensionLab/
├── main.m
├── NSString+Learning.h
├── NSString+Learning.m
├── UserManager.h
└── UserManager.m
```

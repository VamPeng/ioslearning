# Lab：Objective-C Foundation 常用类型

## 目标

通过“用户资料摘要生成器”练习：

```text
NSString / NSMutableString
NSNumber
NSDate / NSDateFormatter / NSCalendar
NSURLComponents / NSURLQueryItem
NSData
NSNull
不可变对象与可变对象
```

建议在 Xcode 中创建 macOS Command Line Tool，语言选择 Objective-C。

---

## 1. 项目结构

```text
FoundationTypesLab/
├── main.m
├── OCProfile.h
├── OCProfile.m
├── OCProfileFormatter.h
└── OCProfileFormatter.m
```

---

## 2. 创建用户资料模型

### OCProfile.h

```objc
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OCProfile : NSObject

@property (nonatomic, copy) NSString *userId;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, strong) NSNumber *age;
@property (nonatomic, strong, nullable) id nickname;
@property (nonatomic, strong) NSDate *createdAt;

- (instancetype)initWithUserId:(NSString *)userId
                          name:(NSString *)name
                           age:(NSNumber *)age
                      nickname:(nullable id)nickname
                     createdAt:(NSDate *)createdAt;

@end

NS_ASSUME_NONNULL_END
```

### OCProfile.m

```objc
#import "OCProfile.h"

@implementation OCProfile

- (instancetype)initWithUserId:(NSString *)userId
                          name:(NSString *)name
                           age:(NSNumber *)age
                      nickname:(id)nickname
                     createdAt:(NSDate *)createdAt {
    self = [super init];
    if (self) {
        _userId = [userId copy];
        _name = [name copy];
        _age = age;
        _nickname = nickname;
        _createdAt = createdAt;
    }
    return self;
}

@end
```

观察：

```text
NSString 属性使用 copy
NSNumber、NSDate 使用 strong
nickname 使用 id，用来模拟 nil、NSNull、NSString 三种状态
```

---

## 3. 创建资料格式化器

### OCProfileFormatter.h

```objc
#import <Foundation/Foundation.h>

@class OCProfile;

NS_ASSUME_NONNULL_BEGIN

@interface OCProfileFormatter : NSObject

- (NSString *)displayNameForProfile:(OCProfile *)profile;
- (NSString *)summaryForProfile:(OCProfile *)profile;
- (nullable NSURL *)detailURLForProfile:(OCProfile *)profile;
- (NSDate *)seventhDayAfterDate:(NSDate *)date;

@end

NS_ASSUME_NONNULL_END
```

### OCProfileFormatter.m

```objc
#import "OCProfileFormatter.h"
#import "OCProfile.h"

@implementation OCProfileFormatter

- (NSString *)displayNameForProfile:(OCProfile *)profile {
    id nickname = profile.nickname;

    if (nickname == nil || nickname == [NSNull null]) {
        return profile.name;
    }

    if (![nickname isKindOfClass:[NSString class]]) {
        return profile.name;
    }

    NSString *trimmed = [(NSString *)nickname
        stringByTrimmingCharactersInSet:
            [NSCharacterSet whitespaceAndNewlineCharacterSet]];

    return trimmed.length > 0 ? trimmed : profile.name;
}

- (NSDateFormatter *)makeDateFormatter {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"zh_CN"];
    formatter.dateFormat = @"yyyy年MM月dd日 HH:mm";
    return formatter;
}

- (NSString *)summaryForProfile:(OCProfile *)profile {
    NSString *displayName = [self displayNameForProfile:profile];
    NSString *createdAtText = [[self makeDateFormatter]
        stringFromDate:profile.createdAt];

    NSString *ageText = @"未知";
    NSInteger age = profile.age.integerValue;
    if (age >= 0 && age <= 150) {
        ageText = profile.age.stringValue;
    }

    NSMutableString *builder = [NSMutableString string];
    [builder appendFormat:@"用户：%@\n", displayName];
    [builder appendFormat:@"ID：%@\n", profile.userId];
    [builder appendFormat:@"年龄：%@\n", ageText];
    [builder appendFormat:@"创建时间：%@\n", createdAtText];

    return [builder copy];
}

- (NSURL *)detailURLForProfile:(OCProfile *)profile {
    NSURLComponents *components = [[NSURLComponents alloc] init];
    components.scheme = @"https";
    components.host = @"example.com";
    components.path = @"/profile/detail";
    components.queryItems = @[
        [NSURLQueryItem queryItemWithName:@"userId" value:profile.userId],
        [NSURLQueryItem queryItemWithName:@"name" value:profile.name],
        [NSURLQueryItem queryItemWithName:@"createdAt"
                                   value:@(profile.createdAt.timeIntervalSince1970).stringValue]
    ];
    return components.URL;
}

- (NSDate *)seventhDayAfterDate:(NSDate *)date {
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *delta = [[NSDateComponents alloc] init];
    delta.day = 7;

    return [calendar dateByAddingComponents:delta
                                     toDate:date
                                    options:0];
}

@end
```

关键点：

```text
NSNull 需要显式处理
isKindOfClass: 防止错误类型
NSMutableString 用于构建，最终 copy 为 NSString
NSDateFormatter 负责展示
NSCalendar 负责日历计算
NSURLComponents 负责安全构建 URL
```

---

## 4. 完整运行代码

### main.m

```objc
#import <Foundation/Foundation.h>
#import "OCProfile.h"
#import "OCProfileFormatter.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        OCProfile *profile = [[OCProfile alloc]
            initWithUserId:@"1001"
            name:@"Yuhui"
            age:@18
            nickname:[NSNull null]
            createdAt:[NSDate date]];

        OCProfileFormatter *formatter = [[OCProfileFormatter alloc] init];

        NSString *summary = [formatter summaryForProfile:profile];
        NSLog(@"\n%@", summary);

        NSURL *url = [formatter detailURLForProfile:profile];
        NSLog(@"URL = %@", url.absoluteString);

        NSDate *seventhDay = [formatter seventhDayAfterDate:profile.createdAt];
        NSLog(@"seventh day = %@", seventhDay);

        NSData *data = [summary dataUsingEncoding:NSUTF8StringEncoding];
        NSLog(@"data length = %lu", (unsigned long)data.length);

        NSString *restored = [[NSString alloc]
            initWithData:data
            encoding:NSUTF8StringEncoding];
        NSLog(@"restored = %@", restored);

        NSString *path = [NSTemporaryDirectory()
            stringByAppendingPathComponent:@"profile-summary.txt"];
        BOOL success = [data writeToFile:path atomically:YES];
        NSLog(@"write=%@ path=%@", success ? @"YES" : @"NO", path);

        NSData *readData = [NSData dataWithContentsOfFile:path];
        NSString *readText = [[NSString alloc]
            initWithData:readData
            encoding:NSUTF8StringEncoding];
        NSLog(@"read = %@", readText);
    }

    return 0;
}
```

---

## 5. 验证字符串比较

错误写法：

```objc
if (profile.name == @"Yuhui") {
    NSLog(@"same");
}
```

正确写法：

```objc
if ([profile.name isEqualToString:@"Yuhui"]) {
    NSLog(@"same");
}
```

解释：

```text
==                比较对象地址
isEqualToString:  比较字符串内容
```

---

## 6. 验证 nil 与 NSNull

依次测试：

```objc
profile.nickname = nil;
profile.nickname = [NSNull null];
profile.nickname = @"";
profile.nickname = @"   ";
profile.nickname = @"YP";
profile.nickname = @100;
```

预期：只有有效的非空字符串才作为展示名，其他情况回退到 `profile.name`。

---

## 7. 验证 NSNumber

```objc
profile.age = @18;
NSLog(@"%ld", (long)profile.age.integerValue);

profile.age = @(-1);
NSLog(@"%@", [formatter summaryForProfile:profile]);

profile.age = @200;
NSLog(@"%@", [formatter summaryForProfile:profile]);
```

观察 `NSNumber` 的包装与拆箱，以及年龄校验逻辑。

---

## 8. 验证 URL 编码

```objc
profile.name = @"Objective-C 学习者 & iOS";
NSURL *url = [formatter detailURLForProfile:profile];
NSLog(@"%@", url.absoluteString);
```

观察空格、中文和 `&` 如何被 `NSURLComponents` 正确处理。

---

## 9. 验证 NSData

```objc
NSData *data = [@"Hello Foundation"
    dataUsingEncoding:NSUTF8StringEncoding];

NSString *text = [[NSString alloc]
    initWithData:data
    encoding:NSUTF8StringEncoding];
```

注意：只有确认数据编码时，才能按 UTF-8 还原字符串。图片或压缩包等任意二进制数据不能直接按文本理解。

---

## 10. 扩展任务

### 任务 A：日期格式复用

当前 `makeDateFormatter` 每次创建实例。尝试设计一个只读、固定配置的复用方案，并思考共享实例的线程约束。

### 任务 B：文件 URL

把字符串路径改成：

```objc
NSURL *fileURL = [NSURL fileURLWithPath:path];
```

尝试使用 `writeToURL:options:error:` 写入。

### 任务 C：增加评分

为 `OCProfile` 增加：

```objc
@property (nonatomic, strong) NSNumber *score;
```

摘要中保留一位小数。

### 任务 D：修改外部可变字符串

```objc
NSMutableString *source = [NSMutableString stringWithString:@"Alice"];
profile.name = source;
[source appendString:@" changed"];
```

验证 `profile.name` 是否变化，并解释 `copy` 的作用。

---

## 11. 完成标准

```text
1. NSString 为什么是不可变对象？
2. NSString 属性为什么通常使用 copy？
3. 字符串内容比较为什么不能使用 ==？
4. NSNumber 为什么存在？
5. NSDate、NSDateFormatter、NSCalendar 分别负责什么？
6. 为什么 URL 查询参数应该使用 NSURLComponents？
7. NSData 如何和 UTF-8 字符串互相转换？
8. nil 和 NSNull 有什么区别？
9. 为什么构建阶段使用 NSMutableString，输出时返回 NSString？
10. 如何避免错误类型或 NSNull 导致崩溃？
```

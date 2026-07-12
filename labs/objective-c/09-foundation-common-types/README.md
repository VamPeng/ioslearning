# Lab：Objective-C Foundation 常用类型

## 目标

通过一个“用户资料摘要生成器”练习 Foundation 常用类型：

```text
1. NSString / NSMutableString
2. NSNumber
3. NSDate / NSDateFormatter / NSCalendar
4. NSURLComponents / NSURLQueryItem
5. NSData
6. NSNull
7. 不可变对象和可变对象
```

这个 Lab 可以在 Xcode 的 macOS Command Line Tool 中运行，也可以把核心代码放进 iOS App 工程测试。

---

## 练习 1：创建用户资料模型

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
nickname 使用 id，是为了模拟 nil / NSNull / NSString 三种状态
```

---

## 练习 2：规范化空值

### OCProfileFormatter.h

```objc
#import <Foundation/Foundation.h>

@class OCProfile;

NS_ASSUME_NONNULL_BEGIN

@interface OCProfileFormatter : NSObject

- (NSString *)displayNameForProfile:(OCProfile *)profile;
- (NSString *)summaryForProfile:(OCProfile *)profile;

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

    if ([nickname isKindOfClass:[NSString class]] &&
        [(NSString *)nickname length] > 0) {
        return nickname;
    }

    return profile.name;
}

- (NSString *)summaryForProfile:(OCProfile *)profile {
    NSString *displayName = [self displayNameForProfile:profile];

    NSMutableString *builder = [NSMutableString string];
    [builder appendFormat:@"用户：%@\n", displayName];
    [builder appendFormat:@"ID：%@\n", profile.userId];
    [builder appendFormat:@"年龄：%ld\n", (long)profile.age.integerValue];

    return [builder copy];
}

@end
```

这里使用：

```text
NSMutableString 构建内容
copy 返回稳定的 NSString
NSNull 显式表示空值
isKindOfClass: 防止错误类型导致崩溃
```

---

## 练习 3：格式化创建时间

在 `OCProfileFormatter.m` 中增加：

```objc
- (NSDateFormatter *)profileDateFormatter {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"zh_CN"];
    formatter.dateFormat = @"yyyy年MM月dd日 HH:mm";
    return formatter;
}
```

然后扩展摘要：

```objc
- (NSString *)summaryForProfile:(OCProfile *)profile {
    NSString *displayName = [self displayNameForProfile:profile];
    NSString *createdAtText = [[self profileDateFormatter]
        stringFromDate:profile.createdAt];

    NSMutableString *builder = [NSMutableString string];
    [builder appendFormat:@"用户：%@\n", displayName];
    [builder appendFormat:@"ID：%@\n", profile.userId];
    [builder appendFormat:@"年龄：%ld\n", (long)profile.age.integerValue];
    [builder appendFormat:@"创建时间：%@\n", createdAtText];

    return [builder copy];
}
```

思考：

```text
当前代码每次都创建 NSDateFormatter，适合练习但不适合高频调用。
实际项目中应根据使用频率设计复用策略，同时避免跨线程修改同一实例。
```

---

## 练习 4：计算账号创建后的第 7 天

在 formatter 中增加：

```objc
- (NSDate *)seventhDayAfterDate:(NSDate *)date {
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *components = [[NSDateComponents alloc] init];
    components.day = 7;

    return [calendar dateByAddingComponents:components
                                     toDate:date
                                    options:0];
}
```

调用：

```objc
NSDate *seventhDay = [formatter seventhDayAfterDate:profile.createdAt];
NSString *text = [[formatter profileDateFormatter] stringFromDate:seventhDay];
NSLog(@"第 7 天：%@", text);
```

不要简单写：

```objc
[date dateByAddingTimeInterval:7 * 24 * 60 * 60]
```

如果需求表达的是“日历上的第七天”，应优先使用 `NSCalendar`。

---

## 练习 5：生成用户详情 URL

在 `OCProfileFormatter.h` 增加：

```objc
- (nullable NSURL *)detailURLForProfile:(OCProfile *)profile;
```

实现：

```objc
- (NSURL *)detailURLForProfile:(OCProfile *)profile {
    NSURLComponents *components = [[NSURLComponents alloc] init];
    components.scheme = @"https";
    components.host = @"example.com";
    components.path = @"/profile/detail";
    components.queryItems = @[
        [NSURLQueryItem queryItemWithName:@"userId" value:profile.userId],
        [NSURLQueryItem queryItemWithName:@"name" value:profile.name]
    ];

    return components.URL;
}
```

测试中文和空格：

```objc
OCProfile *profile = [[OCProfile alloc]
    initWithUserId:@"1001"
    name:@"Objective-C 学习者"
    age:@18
    nickname:[NSNull null]
    createdAt:[NSDate date]];

NSLog(@"%@", [formatter detailURLForProfile:profile].absoluteString);
```

观察 `NSURLComponents` 如何处理需要编码的查询参数。

---

## 练习 6：摘要与 NSData 转换

把摘要编码成 UTF-8 数据：

```objc
NSString *summary = [formatter summaryForProfile:profile];
NSData *data = [summary dataUsingEncoding:NSUTF8StringEncoding];

NSLog(@"data length = %lu", (unsigned long)data.length);
```

再还原：

```objc
NSString *restored = [[NSString alloc]
    initWithData:data
    encoding:NSUTF8StringEncoding];

NSLog(@"restored:\n%@", restored);
```

写入临时目录：

```objc
NSString *path = [NSTemporaryDirectory()
    stringByAppendingPathComponent:@"profile-summary.txt"];

BOOL success = [data writeToFile:path atomically:YES];
NSLog(@"write=%@ path=%@", success ? @"YES" : @"NO", path);
```

---

## 练习 7：完整 main.m

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

        NSData *data = [summary dataUsingEncoding:NSUTF8StringEncoding];
        NSString *restored = [[NSString alloc]
            initWithData:data
            encoding:NSUTF8StringEncoding];
        NSLog(@"restored = %@", restored);
    }

    return 0;
}
```

---

## 练习 8：故意制造并修复错误

### 错误 A：字符串使用 `==`

```objc
if (profile.name == @"Yuhui") {
    NSLog(@"same");
}
```

改为：

```objc
if ([profile.name isEqualToString:@"Yuhui"]) {
    NSLog(@"same");
}
```

### 错误 B：只判断 nil

```objc
if (profile.nickname != nil) {
    NSLog(@"%@", profile.nickname);
}
```

`nickname` 仍可能是 `NSNull`。需要同时处理：

```objc
if (profile.nickname != nil && profile.nickname != [NSNull null]) {
    NSLog(@"%@", profile.nickname);
}
```

### 错误 C：手工拼接 URL

```objc
NSString *urlText = [NSString stringWithFormat:
    @"https://example.com/profile?name=%@", profile.name];
```

改为 `NSURLComponents + NSURLQueryItem`。

### 错误 D：把任意 NSData 当 UTF-8 文本

只有确认数据编码是 UTF-8 时，才能安全使用：

```objc
[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
```

---

## 扩展任务

### 任务 1：年龄校验

当年龄小于 0 或大于 150 时，在摘要中输出：

```text
年龄：未知
```

### 任务 2：昵称规范化

支持：

```text
nil
NSNull
空字符串
全空格字符串
正常字符串
```

最终只有正常字符串才能作为展示名。

提示：

```objc
[string stringByTrimmingCharactersInSet:
    [NSCharacterSet whitespaceAndNewlineCharacterSet]]
```

### 任务 3：URL 增加时间参数

在查询参数中加入：

```text
createdAt=<时间戳>
```

提示：

```objc
NSNumber *timestamp = @(profile.createdAt.timeIntervalSince1970);
NSString *value = timestamp.stringValue;
```

### 任务 4：读取已写入文件

使用：

```objc
[NSData dataWithContentsOfFile:path]
```

读取并恢复摘要。

---

## 完成标准

你需要能回答：

```text
1. NSString 为什么是不可变对象？
2. NSString 属性为什么通常使用 copy？
3. 字符串内容比较为什么不能使用 ==？
4. NSNumber 为什么存在？
5. NSDate、NSDateFormatter、NSCalendar 分别负责什么？
6. 为什么 URL 查询参数应该使用 NSURLComponents？
7. NSData 如何和 UTF-8 字符串互相转换？
8. nil 和 NSNull 有什么区别？
9. 为什么构建阶段可以使用 NSMutableString，输出时返回 NSString？
10. 如何避免错误类型或 NSNull 导致消息发送崩溃？
```

---

## 建议项目结构

```text
FoundationTypesLab/
├── main.m
├── OCProfile.h
├── OCProfile.m
├── OCProfileFormatter.h
└── OCProfileFormatter.m
```

# Objective-C Foundation 常用类型

## 1. 学习目标

Objective-C 语言本身提供对象、消息、指针和基础类型；真实项目中的字符串、数字、日期、URL、二进制数据等能力，主要来自 Foundation 框架。

学完以后，你应该能看懂并正确使用：

```text
1. Foundation 在 Objective-C 项目中的职责
2. NSString / NSMutableString 的区别
3. NSNumber 为什么能包装基础数值
4. NSValue、NSRange 和结构体包装
5. NSDate、NSCalendar、NSDateFormatter 的分工
6. NSURL、NSURLComponents 如何表达 URL
7. NSData / NSMutableData 如何保存二进制数据
8. nil 和 NSNull 的区别
9. 不可变对象和可变对象的设计意义
10. Foundation 类型与 Swift、Java 的概念映射
```

一句话：

```text
Foundation = Objective-C 开发中的基础对象库。
```

---

## 2. 导入 Foundation

```objc
#import <Foundation/Foundation.h>
```

最小程序：

```objc
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *message = @"Hello Foundation";
        NSLog(@"%@", message);
    }
    return 0;
}
```

```text
Foundation.h      导入 Foundation 常用声明
@autoreleasepool  管理当前作用域内的自动释放对象
NSString          Foundation 字符串对象
NSLog             格式化输出
```

---

## 3. NSString：不可变字符串

Objective-C 字符串字面量以 `@` 开头：

```objc
NSString *name = @"Yuhui";
```

没有 `@` 的字符串是 C 字符串：

```objc
const char *name = "Yuhui";
```

常用操作：

```objc
NSString *firstName = @"Yu";
NSString *lastName = @"hui";

NSString *fullName = [firstName stringByAppendingString:lastName];
NSString *message = [NSString stringWithFormat:@"Hello, %@", fullName];

NSUInteger length = fullName.length;
BOOL empty = fullName.length == 0;
BOOL equal = [fullName isEqualToString:@"Yuhui"];
BOOL contains = [fullName containsString:@"hui"];
NSString *upper = fullName.uppercaseString;
```

`NSString` 是不可变对象：

```objc
NSString *text = @"Yu";
[text stringByAppendingString:@"hui"];
NSLog(@"%@", text); // 仍然是 Yu
```

正确接收返回值：

```objc
text = [text stringByAppendingString:@"hui"];
```

---

## 4. 字符串比较

`==` 比较的是指针地址：

```objc
NSString *a = [NSString stringWithFormat:@"user-%d", 1];
NSString *b = @"user-1";

if (a == b) {
    // 不能据此判断内容相等
}
```

比较内容应使用：

```objc
if ([a isEqualToString:b]) {
    NSLog(@"same content");
}
```

```text
==                对象身份比较
isEqualToString:  字符串内容比较
```

通用对象场景还可能看到：

```objc
[a isEqual:b]
```

明确比较字符串时，优先使用 `isEqualToString:`。

---

## 5. copy 与字符串属性

字符串属性通常写成：

```objc
@property (nonatomic, copy) NSString *name;
```

原因是调用方可能传入可变字符串：

```objc
NSMutableString *source = [NSMutableString stringWithString:@"Alice"];
user.name = source;
[source appendString:@" changed"];
```

如果属性使用 `copy`，内部保存的是稳定副本：

```text
NSMutableString
      ↓ copy
NSString 副本
      ↓
外部继续修改，不影响属性
```

常用规则：

```text
NSString 属性         copy
NSMutableString 属性  strong
```

---

## 6. NSMutableString：可变字符串

```objc
NSMutableString *builder = [NSMutableString stringWithString:@"Hello"];
[builder appendString:@", "];
[builder appendFormat:@"%@!", @"Yuhui"];
[builder replaceOccurrencesOfString:@"Hello"
                         withString:@"Hi"
                            options:0
                              range:NSMakeRange(0, builder.length)];
```

```text
NSString          修改操作通常返回新对象
NSMutableString   可以原地追加、删除和替换
```

选择原则：

```text
默认使用不可变对象
确实需要原地修改时再使用可变对象
```

---

## 7. NSNumber：包装基础数值

基础数值不是 Objective-C 对象：

```objc
NSInteger age = 18;
double price = 12.5;
BOOL enabled = YES;
```

当 API 或集合需要对象时，使用 `NSNumber`：

```objc
NSNumber *ageNumber = @(age);
NSNumber *priceNumber = @(price);
NSNumber *enabledNumber = @(enabled);
```

字面量：

```objc
NSNumber *count = @10;
NSNumber *ratio = @0.75;
NSNumber *flag = @YES;
```

拆箱：

```objc
NSInteger ageValue = ageNumber.integerValue;
double priceValue = priceNumber.doubleValue;
BOOL enabledValue = enabledNumber.boolValue;
```

```text
NSInteger / double / BOOL  基础值
NSNumber                   基础值的对象包装
```

---

## 8. NSNumber 比较

不要使用 `==` 比较数值内容：

```objc
NSNumber *a = [NSNumber numberWithInteger:1000];
NSNumber *b = [NSNumber numberWithInteger:1000];
BOOL sameObject = a == b;
```

正确方式：

```objc
BOOL equal = [a isEqualToNumber:b];
NSComparisonResult result = [a compare:b];

if (result == NSOrderedAscending) {
    NSLog(@"a < b");
}
```

也可以拆箱后比较：

```objc
if (a.integerValue < b.integerValue) {
    NSLog(@"a < b");
}
```

---

## 9. NSValue 与 NSRange

`NSNumber` 专门包装数字，`NSValue` 可以包装结构体、范围和指针等值。

```objc
NSRange range = NSMakeRange(2, 5);
NSValue *rangeValue = [NSValue valueWithRange:range];
NSRange restored = rangeValue.rangeValue;
```

`NSRange`：

```text
location  起始位置
length    长度
```

查找字符串：

```objc
NSString *text = @"Objective-C";
NSRange result = [text rangeOfString:@"C"];

if (result.location != NSNotFound) {
    NSLog(@"location = %lu", (unsigned long)result.location);
}
```

不要写：

```objc
if (result.location >= 0) {
    // NSUInteger 是无符号类型，此判断没有意义
}
```

---

## 10. NSDate：表示时间点

```objc
NSDate *now = [NSDate date];
NSDate *oneMinuteLater = [now dateByAddingTimeInterval:60];
NSTimeInterval interval = [oneMinuteLater timeIntervalSinceDate:now];
```

`NSDate` 表示绝对时间点，不负责显示格式。

比较时间：

```objc
NSComparisonResult result = [now compare:oneMinuteLater];

if (result == NSOrderedAscending) {
    NSLog(@"now is earlier");
}
```

---

## 11. NSDateFormatter：日期与字符串转换

```objc
NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
formatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";

NSString *text = [formatter stringFromDate:[NSDate date]];
NSDate *date = [formatter dateFromString:@"2026-07-12 18:30:00"];
```

职责：

```text
NSDate            时间点
NSDateFormatter   时间点与文本之间的转换器
NSLocale          地区和语言格式规则
NSTimeZone        时区规则
```

注意：

```text
NSDateFormatter 创建和配置有成本。
高频场景不要每次创建。
不要在多个线程中同时修改同一个 formatter 的配置。
```

---

## 12. NSCalendar：日历语义计算

“明天”“下个月”“星期几”这类需求应使用 `NSCalendar`：

```objc
NSCalendar *calendar = [NSCalendar currentCalendar];
NSDateComponents *delta = [[NSDateComponents alloc] init];
delta.day = 1;

NSDate *tomorrow = [calendar dateByAddingComponents:delta
                                             toDate:[NSDate date]
                                            options:0];
```

读取日期组成：

```objc
NSCalendarUnit units = NSCalendarUnitYear |
                       NSCalendarUnitMonth |
                       NSCalendarUnitDay |
                       NSCalendarUnitWeekday;

NSDateComponents *parts = [calendar components:units
                                           fromDate:[NSDate date]];
```

为什么不能永远使用 `24 * 60 * 60` 表示明天？

```text
夏令时切换
时区变化
月份天数不同
闰年
日历规则
```

固定时间间隔和日历语义不是同一个概念。

---

## 13. NSURL：表达资源地址

```objc
NSURL *url = [NSURL URLWithString:@"https://example.com/users?id=1001"];

NSLog(@"scheme = %@", url.scheme);
NSLog(@"host = %@", url.host);
NSLog(@"path = %@", url.path);
NSLog(@"query = %@", url.query);
```

本地文件：

```objc
NSURL *fileURL = [NSURL fileURLWithPath:@"/tmp/profile.json"];
```

不要把复杂 URL 当普通字符串随意拼接。查询参数中可能包含空格、中文和 `&` 等特殊字符。

---

## 14. NSURLComponents：结构化构建 URL

```objc
NSURLComponents *components = [[NSURLComponents alloc] init];
components.scheme = @"https";
components.host = @"example.com";
components.path = @"/search";
components.queryItems = @[
    [NSURLQueryItem queryItemWithName:@"q" value:@"Objective-C 基础"],
    [NSURLQueryItem queryItemWithName:@"page" value:@"1"]
];

NSURL *url = components.URL;
```

```text
NSURL             已形成的 URL
NSURLComponents   URL 的结构化构建器
NSURLQueryItem    单个查询参数
```

---

## 15. NSData：二进制数据

字符串转 UTF-8 数据：

```objc
NSString *text = @"Hello Foundation";
NSData *data = [text dataUsingEncoding:NSUTF8StringEncoding];
```

数据转字符串：

```objc
NSString *restored = [[NSString alloc] initWithData:data
                                            encoding:NSUTF8StringEncoding];
```

读写文件：

```objc
NSData *fileData = [NSData dataWithContentsOfFile:@"/tmp/sample.txt"];
BOOL success = [data writeToFile:@"/tmp/output.txt" atomically:YES];
```

可变数据：

```objc
NSMutableData *buffer = [NSMutableData data];
[buffer appendData:data];
```

不要在不知道编码的情况下把任意二进制数据直接转换成 UTF-8 字符串。

---

## 16. nil 与 NSNull

```text
nil      对象指针为空，没有对象
NSNull   一个真实对象，用来表达“空值”
```

Foundation 集合不能直接保存 `nil`。需要空值占位符时使用：

```objc
NSNull *nullValue = [NSNull null];
```

JSON 解析常见处理：

```objc
id value = json[@"nickname"];

if (value == [NSNull null]) {
    value = nil;
}
```

只判断 `nil` 不够：

```objc
if (value != nil) {
    // value 仍然可能是 NSNull
}
```

---

## 17. 不可变与可变类型

| 不可变类型 | 可变类型 |
|---|---|
| `NSString` | `NSMutableString` |
| `NSData` | `NSMutableData` |
| `NSArray` | `NSMutableArray` |
| `NSDictionary` | `NSMutableDictionary` |
| `NSSet` | `NSMutableSet` |

```text
不可变对象
├── 状态稳定
├── 更容易跨模块传递
└── 减少意外修改

可变对象
├── 适合构建过程
├── 支持原地增删改
└── 共享时需要更谨慎
```

推荐：默认不可变，确实需要修改时再使用可变类型。

---

## 18. Foundation 类簇

Foundation 的公开类背后可能由不同内部类实现：

```objc
NSString *text = @"hello";
NSLog(@"%@", NSStringFromClass(text.class));
```

输出的运行时类名不一定直接是 `NSString`。

```text
公开抽象类型
      ↓
系统根据内容和创建方式
      ↓
选择内部实现类
```

开发时依赖公开 API：

```objc
[text isKindOfClass:[NSString class]]
```

不要依赖系统内部具体类名。

---

## 19. NSLog 格式化输出

| 类型 | 常见格式 |
|---|---|
| 对象 | `%@` |
| `NSInteger` | `%ld`，配合 `(long)` |
| `NSUInteger` | `%lu`，配合 `(unsigned long)` |
| `double` | `%f` |

```objc
NSString *name = @"Yuhui";
NSInteger age = 18;
NSUInteger count = 10;
double score = 95.5;

NSLog(@"name=%@ age=%ld count=%lu score=%.1f",
      name,
      (long)age,
      (unsigned long)count,
      score);
```

格式符和参数类型不匹配可能造成警告或错误输出。

---

## 20. Swift / Java 对照

| Foundation / OC | Swift | Java / Android |
|---|---|---|
| `NSString *` | `String` | `String` |
| `NSMutableString *` | 字符串构建 | `StringBuilder` |
| `NSNumber *` | `NSNumber` / 数值类型 | 数字包装类型 |
| `NSDate *` | `Date` | `Instant` / `Date` |
| `NSDateFormatter *` | `DateFormatter` | `DateTimeFormatter` |
| `NSURL *` | `URL` | `URI` / `URL` |
| `NSURLComponents *` | `URLComponents` | `Uri.Builder` |
| `NSData *` | `Data` | `byte[]` / `ByteBuffer` |
| `NSNull *` | `NSNull` | JSON null 占位对象 |

对照用于建立概念映射，不代表 API 行为完全相同。

---

## 21. 常见错误

### 错误 1：忘记字符串字面量的 `@`

```objc
NSString *name = "Yuhui";
```

正确：

```objc
NSString *name = @"Yuhui";
```

### 错误 2：使用 `==` 比较内容

```objc
if (name == @"Yuhui") { }
```

正确：

```objc
if ([name isEqualToString:@"Yuhui"]) { }
```

### 错误 3：认为 NSString 会原地修改

```objc
[name stringByAppendingString:@"!"];
```

应接收返回值：

```objc
name = [name stringByAppendingString:@"!"];
```

或使用 `NSMutableString`。

### 错误 4：只判断 nil，不判断 NSNull

```objc
if (value != nil && value != [NSNull null]) {
    // 可用值
}
```

### 错误 5：手工拼接复杂 URL

查询参数使用 `NSURLComponents + NSURLQueryItem`。

### 错误 6：用固定秒数处理所有日期需求

日历语义使用 `NSCalendar`。

### 错误 7：高频创建 NSDateFormatter

根据使用频率设计复用策略，同时避免跨线程修改共享实例。

---

## 22. 项目阅读检查顺序

```text
1. 这是基础值还是 Foundation 对象？
2. 对象是可变还是不可变？
3. NSString 属性是否应使用 copy？
4. 比较的是对象身份还是内容？
5. 值是否可能为 nil 或 NSNull？
6. 日期处理的是时间点、文本还是日历语义？
7. URL 是手工拼接还是结构化构建？
8. NSData 中保存的是文本还是任意二进制？
```

---

## 23. 最低掌握标准

```text
1. Foundation 主要解决什么问题？
2. NSString 和 NSMutableString 有什么区别？
3. 为什么 NSString 属性通常使用 copy？
4. 为什么字符串内容比较不能使用 ==？
5. NSNumber 解决了什么问题？
6. NSValue 和 NSRange 分别是什么？
7. NSDate、NSDateFormatter、NSCalendar 的职责有什么区别？
8. 为什么构建查询 URL 推荐 NSURLComponents？
9. NSData 和 NSMutableData 有什么区别？
10. nil 和 NSNull 有什么区别？
11. 为什么 Foundation 同时提供不可变和可变类型？
12. 什么是 Foundation 类簇？
```

完成本章后，下一章进入 Foundation Collection 与轻量泛型。
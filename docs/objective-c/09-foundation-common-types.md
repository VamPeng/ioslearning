# Objective-C Foundation 常用类型

## 1. 学习目标

Objective-C 语言本身只提供对象、消息、指针和基本类型。真实 iOS 项目中的字符串、数字、日期、URL、二进制数据等能力，主要来自 Foundation 框架。

学完以后，你应该能看懂并正确使用：

```text
1. Foundation 在 Objective-C 项目中的职责
2. NSString / NSMutableString 的区别
3. NSNumber 为什么能包装基础数值
4. NSValue、NSRange 和结构体包装
5. NSDate、NSCalendar、NSDateFormatter 的分工
6. NSURL、NSURLComponents 如何表达 URL
7. NSData / NSMutableData 如何保存二进制数据
8. NSNull 为什么会出现在集合或 JSON 中
9. 不可变对象和可变对象的设计意义
10. Foundation 类型与 Swift、Java 类型的大致对应关系
```

一句话：

```text
Foundation = Objective-C 开发中的基础对象库，负责字符串、数字、日期、URL、数据和常用系统抽象。
```

---

## 2. 导入 Foundation

大多数 Foundation 类型都通过下面的头文件导入：

```objc
#import <Foundation/Foundation.h>
```

一个最小的 Foundation 程序：

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

这里的几个关键点：

```text
Foundation.h   导入 Foundation 常用声明
@autoreleasepool 管理当前作用域内的自动释放对象
NSString       Foundation 字符串对象
NSLog          输出 Foundation 对象和格式化内容
```

---

## 3. NSString：不可变字符串

Objective-C 字符串字面量以 `@` 开头：

```objc
NSString *name = @"Yuhui";
```

没有 `@` 的字符串：

```objc
const char *name = "Yuhui";
```

这是 C 字符串，不是 `NSString`。

### 常用操作

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
NSString *lower = fullName.lowercaseString;
```

注意：

```text
NSString 是不可变对象。
stringByAppendingString: 不会修改原对象，而是返回新字符串。
```

错误理解：

```objc
NSString *name = @"Yu";
[name stringByAppendingString:@"hui"];
NSLog(@"%@", name); // 仍然是 Yu
```

正确写法：

```objc
name = [name stringByAppendingString:@"hui"];
```

---

## 4. 字符串比较

不能用 `==` 比较字符串内容：

```objc
NSString *a = [NSString stringWithFormat:@"user-%d", 1];
NSString *b = @"user-1";

if (a == b) {
    // 比较的是指针地址，不是字符串内容
}
```

比较内容应使用：

```objc
if ([a isEqualToString:b]) {
    NSLog(@"same content");
}
```

统一理解：

```text
==                  比较两个指针是否指向同一个对象
isEqualToString:    比较两个字符串的内容是否相等
```

在通用对象场景中还可能看到：

```objc
[a isEqual:b]
```

对于明确的字符串比较，优先使用 `isEqualToString:`，语义更清晰。

---

## 5. copy 与字符串属性

字符串属性通常声明为：

```objc
@property (nonatomic, copy) NSString *name;
```

为什么不是简单使用 `strong`？

因为传入对象可能是 `NSMutableString`：

```objc
NSMutableString *source = [NSMutableString stringWithString:@"Alice"];
user.name = source;
[source appendString:@" changed"];
```

如果属性是 `strong`，属性可能跟着可变字符串一起变化。

如果属性是 `copy`：

```text
外部传入 NSMutableString
        ↓ copy
内部保存不可变 NSString 副本
        ↓
外部继续修改，不影响内部状态
```

所以字符串属性常见规则是：

```text
NSString 属性优先 copy
NSMutableString 属性通常 strong
```

---

## 6. NSMutableString：可变字符串

需要原地修改字符串时使用 `NSMutableString`：

```objc
NSMutableString *builder = [NSMutableString stringWithString:@"Hello"];
[builder appendString:@", "];
[builder appendFormat:@"%@!", @"Yuhui"];
[builder replaceOccurrencesOfString:@"Hello"
                         withString:@"Hi"
                            options:0
                              range:NSMakeRange(0, builder.length)];

NSLog(@"%@", builder);
```

区别：

```text
NSString          修改操作通常返回新对象
NSMutableString   可以原地追加、删除和替换
```

选择原则：

```text
内容创建后不再修改        NSString
需要持续拼接或局部修改    NSMutableString
```

不要为了“可能以后会改”而默认使用可变对象。不可变对象的状态更容易推理，也更适合在多个模块之间传递。

---

## 7. NSNumber：包装基础数值

Objective-C 的基础数值不是对象：

```objc
NSInteger age = 18;
double price = 12.5;
BOOL enabled = YES;
```

但集合和许多 Foundation API 保存的是对象，因此需要 `NSNumber`：

```objc
NSNumber *ageNumber = @(age);
NSNumber *priceNumber = @(price);
NSNumber *enabledNumber = @(enabled);
```

字面量写法：

```objc
NSNumber *count = @10;
NSNumber *ratio = @0.75;
NSNumber *flag = @YES;
```

取出基础值：

```objc
NSInteger ageValue = ageNumber.integerValue;
double priceValue = priceNumber.doubleValue;
BOOL enabledValue = enabledNumber.boolValue;
```

统一理解：

```text
NSInteger / double / BOOL   基础值
NSNumber                    对基础值的对象包装
```

与 Java 类似：

| Objective-C | Java |
|---|---|
| `NSInteger` | `int` / `long` |
| `NSNumber *` | `Integer` / `Long` / `Double` |

---

## 8. NSNumber 比较

下面的写法比较的是对象地址：

```objc
NSNumber *a = [NSNumber numberWithInteger:1000];
NSNumber *b = [NSNumber numberWithInteger:1000];
BOOL sameObject = a == b;
```

比较数值应使用：

```objc
BOOL equal = [a isEqualToNumber:b];
NSComparisonResult result = [a compare:b];
```

判断大小：

```objc
if ([a compare:b] == NSOrderedAscending) {
    NSLog(@"a < b");
}
```

也可以取出基础值后比较：

```objc
if (a.integerValue < b.integerValue) {
    NSLog(@"a < b");
}
```

---

## 9. NSValue：包装结构体和指针值

`NSNumber` 专门包装数字；`NSValue` 可以包装结构体、范围、指针等值。

最常见的例子是 `NSRange`：

```objc
NSRange range = NSMakeRange(2, 5);
NSValue *rangeValue = [NSValue valueWithRange:range];
NSRange restored = rangeValue.rangeValue;
```

`NSRange` 的结构：

```text
location   起始位置
length     长度
```

例如：

```objc
NSString *text = @"Objective-C";
NSRange range = [text rangeOfString:@"C"];

if (range.location != NSNotFound) {
    NSLog(@"location = %lu", (unsigned long)range.location);
}
```

常见错误：

```objc
if (range.location >= 0) {
    // NSUInteger 是无符号类型，这个判断没有意义
}
```

正确判断：

```objc
if (range.location != NSNotFound) {
    // 找到了
}
```

---

## 10. NSDate：表示时间点

`NSDate` 表示一个绝对时间点：

```objc
NSDate *now = [NSDate date];
NSDate *tomorrow = [now dateByAddingTimeInterval:24 * 60 * 60];
NSTimeInterval interval = [tomorrow timeIntervalSinceDate:now];
```

注意：

```text
NSDate 本身不是“2026-07-12 18:30”这样的展示文本。
它表示时间点，格式化展示交给 NSDateFormatter。
```

比较时间：

```objc
NSComparisonResult result = [now compare:tomorrow];

if (result == NSOrderedAscending) {
    NSLog(@"now is earlier");
}
```

---

## 11. NSDateFormatter：日期与字符串转换

日期转字符串：

```objc
NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
formatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";

NSString *text = [formatter stringFromDate:[NSDate date]];
```

字符串转日期：

```objc
NSDate *date = [formatter dateFromString:@"2026-07-12 18:30:00"];
```

重要区分：

```text
NSDate            时间点
NSDateFormatter   时间点与文本之间的转换器
NSLocale          地区、语言和格式规则
NSTimeZone        时区规则
```

性能注意：

```text
NSDateFormatter 创建和配置有成本。
高频调用场景不要每次都创建新的 formatter。
```

线程安全方面，不要随意让一个可变的 formatter 在多个线程中同时修改配置。更稳妥的方式是限定使用线程，或为不同配置维护独立实例。

---

## 12. NSCalendar：日期组成与日历计算

“明天”“下个月”“某天是星期几”这类需求，不应只靠固定秒数计算。

```objc
NSCalendar *calendar = [NSCalendar currentCalendar];
NSDate *now = [NSDate date];

NSDateComponents *components = [[NSDateComponents alloc] init];
components.day = 1;

NSDate *tomorrow = [calendar dateByAddingComponents:components
                                             toDate:now
                                            options:0];
```

读取日期组成：

```objc
NSCalendarUnit units = NSCalendarUnitYear |
                       NSCalendarUnitMonth |
                       NSCalendarUnitDay |
                       NSCalendarUnitWeekday;

NSDateComponents *parts = [calendar components:units fromDate:now];
NSLog(@"%ld-%ld-%ld", (long)parts.year, (long)parts.month, (long)parts.day);
```

为什么不要永远使用 `24 * 60 * 60` 表示“明天”？

因为现实世界存在：

```text
夏令时切换
时区变化
日历规则
月份天数不同
闰年
```

日历语义优先交给 `NSCalendar`。

---

## 13. NSURL：表达 URL

Foundation 使用 `NSURL` 表达本地或网络资源地址：

```objc
NSURL *url = [NSURL URLWithString:@"https://example.com/users?id=1001"];

NSLog(@"scheme = %@", url.scheme);
NSLog(@"host = %@", url.host);
NSLog(@"path = %@", url.path);
NSLog(@"query = %@", url.query);
```

本地文件 URL：

```objc
NSURL *fileURL = [NSURL fileURLWithPath:@"/tmp/profile.json"];
```

不要把 URL 当成普通字符串随意拼接：

```objc
NSString *urlText = [NSString stringWithFormat:@"https://example.com/search?q=%@", keyword];
```

当 `keyword` 包含空格、`&`、中文等字符时，手工拼接容易产生错误。

---

## 14. NSURLComponents：安全构建 URL

推荐使用 `NSURLComponents` 和 `NSURLQueryItem`：

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
NSLog(@"%@", url.absoluteString);
```

职责划分：

```text
NSURL             已形成的 URL 对象
NSURLComponents   URL 各组成部分的可变构建器
NSURLQueryItem    单个查询参数
```

---

## 15. NSData：二进制数据

图片、文件、网络响应体最终都可能表现为字节数据。

字符串转数据：

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

`NSData` 是不可变数据，`NSMutableData` 可以追加和修改：

```objc
NSMutableData *buffer = [NSMutableData data];
[buffer appendData:data];
```

避免在不明确编码的情况下直接把任意二进制数据转成字符串。图片、压缩包等数据不一定是 UTF-8 文本。

---

## 16. NSNull：对象形式的空值

Objective-C 中：

```text
nil      表示对象指针为空
NSNull   表示一个真实存在的“空值对象”
```

为什么需要 `NSNull`？

Foundation 集合不能直接保存 `nil`，因为 `nil` 往往表示“没有元素”或“参数结束”。如果业务上确实需要保留一个空值占位符，就使用：

```objc
NSNull *nullValue = [NSNull null];
```

示例：

```objc
id nickname = [NSNull null];

if (nickname == [NSNull null]) {
    NSLog(@"nickname is explicitly null");
}
```

JSON 解析后经常遇到：

```objc
id value = json[@"nickname"];

if (value == [NSNull null]) {
    value = nil;
}
```

统一理解：

```text
nil      没有对象
NSNull   有对象，但这个对象表达“空”
```

---

## 17. 不可变与可变类型

Foundation 中经常存在成对类型：

| 不可变类型 | 可变类型 |
|---|---|
| `NSString` | `NSMutableString` |
| `NSData` | `NSMutableData` |
| `NSArray` | `NSMutableArray` |
| `NSDictionary` | `NSMutableDictionary` |
| `NSSet` | `NSMutableSet` |

设计意义：

```text
不可变对象
├── 状态更稳定
├── 更容易跨模块传递
├── 更容易推理
└── 减少意外修改

可变对象
├── 适合构建过程
├── 适合增删改
└── 需要更谨慎地控制共享状态
```

推荐思路：

```text
默认不可变
确实需要原地修改时再选择可变类型
```

---

## 18. Foundation 类簇

创建 Foundation 对象时，运行时真实类型可能不是公开类名：

```objc
NSString *text = @"hello";
NSLog(@"%@", NSStringFromClass(text.class));
```

输出可能是某个内部类，而不一定直接叫 `NSString`。

这类设计称为类簇：

```text
公开抽象类型 NSString
        ↓
系统根据内容、大小和创建方式
        ↓
选择内部具体实现类
```

开发时应依赖公开 API：

```objc
[text isKindOfClass:[NSString class]]
```

不要依赖系统内部具体类名，因为内部实现可能变化。

---

## 19. 格式化输出

`NSLog` 常用格式：

| 类型 | 格式 |
|---|---|
| 对象 | `%@` |
| `NSInteger` | `%ld`，通常配合 `(long)` |
| `NSUInteger` | `%lu`，通常配合 `(unsigned long)` |
| `double` | `%f` |
| `BOOL` | `%d` 或转成文本 |

示例：

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

如果格式符和参数类型不匹配，可能产生警告、错误输出甚至未定义行为。

---

## 20. 与 Swift / Java 对照

| Foundation / OC | Swift | Java / Android |
|---|---|---|
| `NSString *` | `String` | `String` |
| `NSMutableString *` | `String` / 自定义构建 | `StringBuilder` |
| `NSNumber *` | `NSNumber` / 数值类型 | 包装类型 |
| `NSDate *` | `Date` | `Instant` / `Date` |
| `NSDateFormatter *` | `DateFormatter` | `DateTimeFormatter` |
| `NSURL *` | `URL` | `URI` / `URL` |
| `NSURLComponents *` | `URLComponents` | `Uri.Builder` |
| `NSData *` | `Data` | `byte[]` / `ByteBuffer` |
| `NSNull *` | `NSNull` | JSON null 占位对象 |

注意：对照用于建立概念映射，不代表 API 行为完全相同。

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

### 错误 2：使用 `==` 比较字符串或 NSNumber 内容

```objc
if (name == @"Yuhui") { }
```

正确：

```objc
if ([name isEqualToString:@"Yuhui"]) { }
```

### 错误 3：认为 NSString 修改方法会原地修改

```objc
[name stringByAppendingString:@"!" knowingly];
```

`NSString` 是不可变对象，应接收返回值，或改用 `NSMutableString`。

### 错误 4：把 NSNull 当成 nil

```objc
if (value != nil) {
    // value 仍可能是 NSNull
}
```

应进一步判断：

```objc
if (value != nil && value != [NSNull null]) {
    // 可用值
}
```

### 错误 5：手工拼接复杂 URL

查询参数含有空格、中文或特殊字符时，优先使用 `NSURLComponents`。

### 错误 6：使用固定秒数表达所有日历计算

“24 小时后”和“日历上的明天”不是永远等价，日历语义使用 `NSCalendar`。

### 错误 7：频繁创建 NSDateFormatter

高频格式化场景应复用合理配置的 formatter，但要避免跨线程同时修改同一个实例。

---

## 22. 项目阅读检查顺序

看到 Foundation 类型时，可以按下面顺序判断：

```text
1. 这是基础值还是 Foundation 对象？
2. 对象是可变还是不可变？
3. 属性应该使用 strong 还是 copy？
4. 比较的是对象身份还是内容？
5. 数据是否可能为 nil 或 NSNull？
6. 日期处理的是时间点、文本还是日历语义？
7. URL 是手工字符串还是结构化构建？
8. NSData 中保存的是文本还是任意二进制？
```

---

## 23. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. Foundation 框架主要解决什么问题？
2. NSString 和 NSMutableString 有什么区别？
3. 为什么 NSString 属性通常使用 copy？
4. 为什么字符串内容比较不能直接使用 ==？
5. NSNumber 解决了什么问题？
6. NSValue 和 NSRange 分别是什么？
7. NSDate、NSDateFormatter、NSCalendar 的职责有什么区别？
8. 为什么构建查询 URL 推荐 NSURLComponents？
9. NSData 和 NSMutableData 有什么区别？
10. nil 和 NSNull 有什么区别？
11. 为什么 Foundation 经常同时提供不可变和可变类型？
12. 什么是 Foundation 类簇？
```

完成本章后，再进入 Collection 与轻量泛型，就能把这些 Foundation 对象组织成数组、字典和集合。
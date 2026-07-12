# Objective-C Foundation 常用类型速查

## 1. 导入 Foundation

```objc
#import <Foundation/Foundation.h>
```

最小程序：

```objc
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSLog(@"Hello Foundation");
    }
    return 0;
}
```

## 2. NSString

```objc
NSString *name = @"Yuhui";
NSString *message = [NSString stringWithFormat:@"Hello, %@", name];
NSString *full = [@"Yu" stringByAppendingString:@"hui"];

BOOL empty = name.length == 0;
BOOL equal = [name isEqualToString:@"Yuhui"];
BOOL contains = [name containsString:@"hui"];
NSString *upper = name.uppercaseString;
```

注意：

```text
==                 比较对象地址
isEqualToString:   比较字符串内容
```

字符串属性：

```objc
@property (nonatomic, copy) NSString *name;
```

## 3. NSMutableString

```objc
NSMutableString *builder = [NSMutableString stringWithString:@"Hello"];
[builder appendString:@", "];
[builder appendFormat:@"%@!", @"Yuhui"];
```

```text
NSString          不可变
NSMutableString   可原地修改
```

## 4. NSNumber

包装基础值：

```objc
NSNumber *age = @18;
NSNumber *price = @12.5;
NSNumber *enabled = @YES;
```

取出基础值：

```objc
NSInteger ageValue = age.integerValue;
double priceValue = price.doubleValue;
BOOL enabledValue = enabled.boolValue;
```

比较：

```objc
BOOL equal = [a isEqualToNumber:b];
NSComparisonResult result = [a compare:b];
```

## 5. NSValue 与 NSRange

```objc
NSRange range = NSMakeRange(2, 5);
NSValue *value = [NSValue valueWithRange:range];
NSRange restored = value.rangeValue;
```

查找：

```objc
NSRange result = [text rangeOfString:@"OC"];
if (result.location != NSNotFound) {
    NSLog(@"found");
}
```

## 6. NSDate

```objc
NSDate *now = [NSDate date];
NSDate *later = [now dateByAddingTimeInterval:60];
NSTimeInterval interval = [later timeIntervalSinceDate:now];
```

比较：

```objc
NSComparisonResult result = [now compare:later];
```

## 7. NSDateFormatter

```objc
NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
formatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";

NSString *text = [formatter stringFromDate:[NSDate date]];
NSDate *date = [formatter dateFromString:@"2026-07-12 18:30:00"];
```

```text
NSDate            时间点
NSDateFormatter   日期与字符串转换
```

## 8. NSCalendar

```objc
NSCalendar *calendar = [NSCalendar currentCalendar];
NSDateComponents *delta = [[NSDateComponents alloc] init];
delta.day = 1;

NSDate *tomorrow = [calendar dateByAddingComponents:delta
                                             toDate:[NSDate date]
                                            options:0];
```

日历语义使用 `NSCalendar`，不要一律用固定秒数。

## 9. NSURL

```objc
NSURL *url = [NSURL URLWithString:@"https://example.com/users?id=1001"];

url.scheme;
url.host;
url.path;
url.query;
url.absoluteString;
```

文件 URL：

```objc
NSURL *fileURL = [NSURL fileURLWithPath:@"/tmp/profile.json"];
```

## 10. NSURLComponents

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

## 11. NSData

字符串转数据：

```objc
NSData *data = [@"hello" dataUsingEncoding:NSUTF8StringEncoding];
```

数据转字符串：

```objc
NSString *text = [[NSString alloc] initWithData:data
                                       encoding:NSUTF8StringEncoding];
```

读写文件：

```objc
NSData *fileData = [NSData dataWithContentsOfFile:path];
BOOL success = [data writeToFile:path atomically:YES];
```

可变数据：

```objc
NSMutableData *buffer = [NSMutableData data];
[buffer appendData:data];
```

## 12. NSNull

```objc
id value = [NSNull null];

if (value == [NSNull null]) {
    value = nil;
}
```

```text
nil      没有对象
NSNull   用对象表达空值
```

## 13. 可变与不可变类型

| 不可变 | 可变 |
|---|---|
| `NSString` | `NSMutableString` |
| `NSData` | `NSMutableData` |
| `NSArray` | `NSMutableArray` |
| `NSDictionary` | `NSMutableDictionary` |
| `NSSet` | `NSMutableSet` |

原则：

```text
默认不可变；确实需要原地修改时再使用可变类型。
```

## 14. NSLog 常用格式

```objc
NSLog(@"object=%@", object);
NSLog(@"integer=%ld", (long)value);
NSLog(@"unsigned=%lu", (unsigned long)count);
NSLog(@"double=%.2f", price);
NSLog(@"bool=%@", enabled ? @"YES" : @"NO");
```

## 15. 常见错误检查

```text
字符串字面量是否写了 @
字符串/NSNumber 内容是否错误使用 == 比较
NSString 修改操作是否接收了返回值
NSString 属性是否应该使用 copy
JSON 值是否可能是 NSNull
日期需求是固定间隔还是日历语义
URL 是否在手工拼接查询参数
NSData 是否确实是 UTF-8 文本
NSDateFormatter 是否被高频重复创建
```

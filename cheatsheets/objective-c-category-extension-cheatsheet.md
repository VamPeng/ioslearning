# Objective-C Category / Extension 速查

## 1. Category 文件名

```text
NSString+Learning.h
NSString+Learning.m
```

```text
ClassName+CategoryName = 给 ClassName 添加一组方法
```

## 2. Category 声明

```objc
@interface NSString (Learning)

- (BOOL)ly_isNotEmpty;

@end
```

## 3. Category 实现

```objc
@implementation NSString (Learning)

- (BOOL)ly_isNotEmpty {
    return self.length > 0;
}

@end
```

## 4. Category 使用

```objc
#import "NSString+Learning.h"

BOOL valid = [@"hello" ly_isNotEmpty];
```

## 5. 常见命名

```text
NSString+Validation
UIColor+Hex
UIImage+Resize
UIView+Frame
UIViewController+Tracking
```

## 6. Category 注意点

```text
1. 适合添加方法
2. 不能直接添加普通 ivar
3. 属性不会自动生成存储
4. 方法名冲突危险
5. 不要轻易覆盖系统方法
```

## 7. 方法名前缀

```objc
- (BOOL)ly_isNotEmpty;
- (NSString *)ly_trimmedString;
```

用前缀降低冲突概率。

## 8. Extension 写法

```objc
@interface UserViewController ()

@property (nonatomic, strong) NSArray *users;
- (void)reloadUsers;

@end
```

通常写在 `.m` 顶部。

## 9. Extension 用途

```text
1. 私有属性
2. 私有方法声明
3. 对外隐藏内部状态
```

## 10. Category vs Extension

| 对比 | Category | Extension |
|---|---|---|
| 写法 | `ClassName (Name)` | `ClassName ()` |
| 是否命名 | 有名字 | 匿名 |
| 常见位置 | 独立 `.h/.m` | 当前 `.m` 顶部 |
| 主要用途 | 扩展已有类方法 | 私有属性/方法 |

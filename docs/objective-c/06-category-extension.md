# Objective-C Category / Extension

## 1. 学习目标

Category 和 Extension 是 OC 中扩展类能力的两种常见方式。

学完以后，你应该能看懂：

```text
1. Category 是什么，为什么老项目里很多
2. Extension 和 Category 有什么区别
3. 为什么 Category 常用于给系统类加工具方法
4. 为什么 Extension 常用于 .m 中声明私有属性和私有方法
5. Category 里为什么不能直接添加普通 ivar
6. Category 方法名冲突为什么危险
```

一句话：

```text
Category 偏向给已有类加方法，Extension 偏向在当前类内部补充私有声明。
```

---

## 2. Category 是什么

Category 可以在不修改原类源码的情况下，为已有类添加方法。

文件通常长这样：

```text
NSString+Learning.h
NSString+Learning.m
```

`+Learning` 表示这是 `NSString` 的一个 Category。

声明：

```objc
// NSString+Learning.h
#import <Foundation/Foundation.h>

@interface NSString (Learning)

- (BOOL)ly_isNotEmpty;

@end
```

实现：

```objc
// NSString+Learning.m
#import "NSString+Learning.h"

@implementation NSString (Learning)

- (BOOL)ly_isNotEmpty {
    return self.length > 0;
}

@end
```

使用：

```objc
#import "NSString+Learning.h"

BOOL valid = [@"hello" ly_isNotEmpty];
```

---

## 3. Category 常见用途

Category 常用于：

```text
1. 给系统类添加工具方法
2. 按功能拆分一个大类的方法
3. 给第三方类补充项目内需要的方法
4. 组织老项目里的 UIViewController 代码
```

例如：

```text
NSString+Validation
UIColor+Hex
UIImage+Resize
UIView+Frame
UIViewController+Tracking
```

这些名字在老项目中非常常见。

---

## 4. Category 不能直接添加普通 ivar

下面这种写法不成立：

```objc
@interface NSString (Learning) {
    NSString *_tag; // 错误
}
@end
```

Category 不能直接给类添加普通实例变量。

它可以声明方法：

```objc
@interface NSString (Learning)
- (BOOL)ly_isNotEmpty;
@end
```

也可以声明属性：

```objc
@interface NSObject (Tracking)
@property (nonatomic, copy) NSString *trackingId;
@end
```

但 Category 中声明属性不会自动生成 ivar 和 getter / setter。要真正存储值，需要 Runtime 的关联对象，这属于后续 Runtime 内容。

第一阶段记住：

```text
Category 最适合加方法，不适合当成真正的属性存储扩展。
```

---

## 5. 方法名冲突风险

Category 的方法会加到原类上。

如果多个 Category 写了同名方法：

```objc
@implementation NSString (A)
- (BOOL)isValid {
    return YES;
}
@end

@implementation NSString (B)
- (BOOL)isValid {
    return NO;
}
@end
```

最终调用哪个实现会受加载顺序影响，读代码很危险。

所以项目里常给 Category 方法加前缀：

```objc
- (BOOL)ly_isNotEmpty;
- (NSString *)ly_trimmedString;
```

不要轻易在 Category 中覆盖系统已有方法。

---

## 6. Extension 是什么

Extension 常写在 `.m` 文件顶部：

```objc
// UserViewController.m
#import "UserViewController.h"

@interface UserViewController ()

@property (nonatomic, strong) NSArray *users;
- (void)reloadUsers;

@end

@implementation UserViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self reloadUsers];
}

- (void)reloadUsers {
    self.users = @[];
}

@end
```

`@interface UserViewController ()` 这段就是匿名 Extension。

它的作用：

```text
给当前类补充私有属性和私有方法声明。
```

这些内容不放到 `.h`，外部就不应该依赖它们。

---

## 7. Extension 和 Category 的区别

| 对比点 | Category | Extension |
|---|---|---|
| 写法 | `@interface ClassName (Name)` | `@interface ClassName ()` |
| 常见文件 | 独立 `.h/.m` | 当前类 `.m` 顶部 |
| 用途 | 给已有类加方法 | 声明私有属性/方法 |
| 是否命名 | 有名字 | 匿名 |
| 是否常用于系统类 | 是 | 否 |

一句话：

```text
Category 面向扩展已有类能力。
Extension 面向隐藏当前类内部细节。
```

---

## 8. 私有属性为什么放 Extension

对外头文件只暴露外部需要知道的能力：

```objc
// UserViewController.h
@interface UserViewController : UIViewController
@end
```

内部状态放 `.m`：

```objc
// UserViewController.m
@interface UserViewController ()
@property (nonatomic, strong) NSArray *users;
@property (nonatomic, assign) BOOL loading;
@end
```

这样外部只知道这是一个 ViewController，不知道它内部如何保存 users、loading。

这和 Java / Kotlin 中的 private 字段有相似目的：

```text
减少外部依赖，降低修改内部实现的成本。
```

---

## 9. Category 拆分大类

老项目里可能看到：

```text
UserViewController.m
UserViewController+TableView.m
UserViewController+Network.m
UserViewController+Tracking.m
```

这表示把同一个类的不同行为拆到多个 Category 文件里。

优点：

```text
单个文件变短，按功能组织代码。
```

缺点：

```text
类的真实行为分散在多个文件中，查找调用关系更费劲。
```

读这类代码时，要用类名搜索：

```bash
rg "UserViewController \\("
```

找到所有 Category。

---

## 10. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. NSString+Learning.h 这种文件名表示什么？
2. Category 适合添加什么？
3. Category 为什么不能直接添加普通 ivar？
4. Category 方法名冲突为什么危险？
5. @interface UserViewController () 是什么？
6. 私有属性为什么常放在 .m 的 Extension 中？
7. Category 和 Extension 的核心区别是什么？
```

下一章进入 Protocol / Delegate，这是 UIKit 和老项目中最常见的对象通信模式。

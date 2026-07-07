# Objective-C 内存管理 ARC

## 1. 学习目标

这个节点解释 OC 代码里最容易出问题的对象生命周期。

学完以后，你应该能看懂：

```text
1. ARC 帮你自动做了什么
2. strong / weak 为什么和对象生命周期有关
3. 什么是循环引用
4. delegate 为什么通常必须 weak
5. Block 捕获 self 为什么可能造成循环引用
6. dealloc 什么时候会被调用
7. @autoreleasepool 在 main.m 中是什么作用
```

一句话：

```text
ARC = 编译器帮你插入 retain / release，但它不会自动解决对象之间互相强持有的问题。
```

---

## 2. 为什么要学内存管理

在 Swift 和现代 iOS 项目里，你很少手写释放对象的代码。但读 OC 老项目时，内存管理痕迹到处都在：

```objc
@property (nonatomic, strong) User *user;
@property (nonatomic, weak) id<UserCellDelegate> delegate;
@property (nonatomic, copy) void (^completion)(void);
```

这些修饰符不是装饰，它们决定对象会不会被持有、什么时候能释放。

对 Android / Java 开发者来说，可以先这样类比：

```text
Java / Kotlin 主要依赖 GC 自动回收不可达对象。
Objective-C ARC 主要依赖引用关系，编译器自动插入 retain / release。
```

所以 OC 里判断对象能不能释放时，要先看：

```text
谁 strong 持有了它？
这些 strong 引用什么时候断开？
是否存在两个对象互相 strong？
```

---

## 3. ARC 做了什么

ARC 全称是 Automatic Reference Counting，自动引用计数。

在 ARC 开启后，你不能再手写：

```objc
[object retain];
[object release];
[object autorelease];
```

编译器会根据代码自动插入这些内存管理操作。

你平时写：

```objc
User *user = [[User alloc] init];
self.user = user;
```

ARC 会根据局部变量、属性修饰符和作用域，自动决定什么时候持有对象、什么时候释放对象。

第一阶段不用背底层插入细节，只需要记住：

```text
ARC 自动管理引用计数。
ARC 不等于不会内存泄漏。
循环引用仍然需要开发者处理。
```

---

## 4. strong 表示持有对象

普通对象属性通常使用 `strong`：

```objc
@property (nonatomic, strong) User *user;
@property (nonatomic, strong) NSArray *items;
```

含义：

```text
只要这个属性还指向对象，对象就会被当前对象持有，不会释放。
```

示例：

```objc
User *user = [[User alloc] init];
self.user = user;
```

这里 `self.user` 会 strong 持有 `user`。即使局部变量 `user` 离开作用域，只要 `self.user` 还在指向它，对象就不会释放。

当你写：

```objc
self.user = nil;
```

当前对象就不再持有原来的 `user`。如果没有其他强引用，原来的 `user` 就可以释放。

---

## 5. weak 表示不持有对象

`weak` 表示弱引用：

```objc
@property (nonatomic, weak) id delegate;
```

含义：

```text
weak 可以指向对象，但不会让对象生命周期变长。
```

如果被 weak 指向的对象释放了，weak 属性会自动变成 `nil`。

示例：

```objc
@property (nonatomic, weak) UIViewController *owner;
```

如果 `owner` 释放了，这个属性不会变成野指针，而是自动清空。

第一阶段记住：

```text
weak 常用于 delegate、父子反向引用、避免循环引用。
```

---

## 6. copy 表示赋值时拷贝

`copy` 常用于 `NSString` 和 Block：

```objc
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) void (^completion)(void);
```

字符串使用 copy，是为了避免外部传入 `NSMutableString` 后继续修改。

Block 使用 copy，是因为早期 Block 可能在栈上，copy 后能安全保存到堆上。ARC 下很多场景会自动处理，但属性仍然习惯写成：

```objc
@property (nonatomic, copy) void (^completion)(void);
```

记忆规则：

```text
NSString 属性用 copy。
Block 属性用 copy。
普通对象属性用 strong。
delegate 属性用 weak。
基础类型用 assign。
```

---

## 7. dealloc：对象释放前的最后机会

对象释放前会调用 `dealloc`：

```objc
- (void)dealloc {
    NSLog(@"User dealloc");
}
```

ARC 下不能在 `dealloc` 里写：

```objc
[super dealloc];
```

如果你看到老代码里有 `[super dealloc]`，通常说明那段代码来自 MRC 手动内存管理时代。

`dealloc` 常用于：

```text
1. 打日志确认对象是否释放
2. 移除通知监听
3. 释放非 OC 对象资源
```

调试循环引用时，最常见的方法之一就是在类里加：

```objc
- (void)dealloc {
    NSLog(@"%@ dealloc", NSStringFromClass([self class]));
}
```

如果页面关闭后没有打印，说明对象可能没有释放。

---

## 8. 循环引用

循环引用就是两个或多个对象互相 strong 持有，导致谁都释放不了。

典型例子：

```text
ViewController strong -> UserService
UserService strong -> ViewController
```

代码可能长这样：

```objc
@interface UserService : NSObject
@property (nonatomic, strong) UIViewController *owner;
@end

@interface UserViewController : UIViewController
@property (nonatomic, strong) UserService *service;
@end
```

如果：

```objc
self.service = [[UserService alloc] init];
self.service.owner = self;
```

就形成了：

```text
self strong 持有 service
service strong 持有 self
```

页面退出后，两个对象仍然互相持有，无法释放。

解决方式通常是把反向引用改成 `weak`：

```objc
@property (nonatomic, weak) UIViewController *owner;
```

---

## 9. delegate 为什么用 weak

delegate 是最常见的反向通信关系。

```objc
@property (nonatomic, weak) id<UserCellDelegate> delegate;
```

常见结构：

```text
ViewController strong -> Cell
Cell weak -> ViewController
```

如果 Cell 的 delegate 写成 strong：

```objc
@property (nonatomic, strong) id<UserCellDelegate> delegate;
```

就可能变成：

```text
ViewController strong -> Cell
Cell strong -> ViewController
```

这就是循环引用。

所以规则非常稳定：

```text
delegate 通常写 weak。
```

如果某个 delegate 属性不是 weak，读代码时要停下来确认它是不是有特殊生命周期设计。

---

## 10. Block 捕获 self

Block 会捕获它内部使用到的变量。

```objc
self.completion = ^{
    [self reloadData];
};
```

如果 `self` strong 持有 `completion`，而 `completion` 又捕获了 `self`，就会形成：

```text
self strong -> completion block
block strong -> self
```

常见解决方式：

```objc
__weak typeof(self) weakSelf = self;
self.completion = ^{
    __strong typeof(weakSelf) self = weakSelf;
    if (!self) {
        return;
    }

    [self reloadData];
};
```

第一阶段先记住：

```text
Block 作为属性保存时通常 copy。
Block 内使用 self 时要警惕循环引用。
```

Block 的语法和更多场景会在下一章继续拆。

---

## 11. @autoreleasepool

你在 `main.m` 中会看到：

```objc
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        User *user = [[User alloc] init];
        NSLog(@"%@", user);
    }
    return 0;
}
```

`@autoreleasepool` 用于管理自动释放池。

在 App 中，系统的运行循环会自动创建和释放池。命令行程序或大量临时对象循环中，你可能会手动写：

```objc
for (NSInteger i = 0; i < 10000; i++) {
    @autoreleasepool {
        NSString *text = [NSString stringWithFormat:@"%ld", (long)i];
        NSLog(@"%@", text);
    }
}
```

第一阶段不用深入，只要知道：

```text
@autoreleasepool 是一组临时对象的释放边界。
```

---

## 12. 属性修饰符复习

| 场景 | 推荐写法 | 原因 |
|---|---|---|
| 普通对象 | `strong` | 当前对象需要持有它 |
| 字符串 | `copy` | 避免可变字符串被外部修改 |
| Block | `copy` | 保存 Block |
| delegate | `weak` | 避免循环引用 |
| 基础类型 | `assign` | 不需要对象生命周期管理 |

示例：

```objc
@property (nonatomic, strong) User *user;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) void (^completion)(void);
@property (nonatomic, weak) id<UserCellDelegate> delegate;
@property (nonatomic, assign) NSInteger count;
```

---

## 13. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. ARC 为什么不等于不会内存泄漏？
2. strong 和 weak 的区别是什么？
3. delegate 为什么通常 weak？
4. Block 捕获 self 为什么可能造成循环引用？
5. dealloc 没有被调用通常说明什么？
6. NSString 和 Block 为什么常用 copy？
7. @autoreleasepool 大概解决什么问题？
```

下一章进入 Block。Block 是理解 OC 回调、异步代码和循环引用的关键。

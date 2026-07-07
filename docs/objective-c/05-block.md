# Objective-C Block

## 1. 学习目标

Block 是 Objective-C 里的闭包。它常见于回调、异步任务、动画、枚举遍历和 API 封装。

学完以后，你应该能看懂：

```text
1. Block 类型怎么声明
2. Block 变量怎么赋值和调用
3. Block 作为参数和属性时怎么写
4. typedef 为什么能简化 Block 类型
5. Block 如何捕获外部变量
6. __block 是什么作用
7. Block 内使用 self 为什么要考虑 weak / strong
```

一句话：

```text
Block = OC 里的可传递代码块，类似 Java / Kotlin 的 lambda。
```

---

## 2. 第一个 Block

最简单的 Block：

```objc
void (^printBlock)(void) = ^{
    NSLog(@"Hello Block");
};

printBlock();
```

拆开看：

```text
void        返回值
(^printBlock) Block 变量名
(void)      参数列表
^{}         Block 内容
```

调用 Block 用普通函数调用语法：

```objc
printBlock();
```

---

## 3. 带参数和返回值的 Block

带参数：

```objc
void (^greetBlock)(NSString *) = ^(NSString *name) {
    NSLog(@"Hello, %@", name);
};

greetBlock(@"Yuhui");
```

带返回值：

```objc
NSInteger (^sumBlock)(NSInteger, NSInteger) = ^NSInteger(NSInteger a, NSInteger b) {
    return a + b;
};

NSInteger result = sumBlock(3, 5);
```

如果返回值可以推断，有时可以省略：

```objc
NSInteger (^sumBlock)(NSInteger, NSInteger) = ^(NSInteger a, NSInteger b) {
    return a + b;
};
```

第一阶段建议写完整一点，方便读代码。

---

## 4. Block 类型为什么难读

Block 类型本身比较绕：

```objc
void (^completion)(BOOL success, NSError *error);
```

你可以按这个顺序读：

```text
completion 是一个 Block。
它接收 BOOL success 和 NSError *error。
它没有返回值。
```

再看一个：

```objc
NSArray * (^filter)(NSArray *items);
```

含义：

```text
filter 是一个 Block。
它接收 NSArray *items。
它返回 NSArray *。
```

---

## 5. typedef 简化 Block

复杂 Block 通常用 `typedef` 起别名：

```objc
typedef void (^LoginCompletion)(BOOL success, NSError *error);
```

使用时：

```objc
@property (nonatomic, copy) LoginCompletion completion;

- (void)loginWithCompletion:(LoginCompletion)completion;
```

比直接写完整类型更容易读：

```objc
- (void)loginWithCompletion:(void (^)(BOOL success, NSError *error))completion;
```

项目里读到 `typedef` 时，要回到声明处看它到底接收什么参数、返回什么值。

---

## 6. Block 作为参数

常见写法：

```objc
- (void)loadUserWithCompletion:(void (^)(User *user, NSError *error))completion {
    User *user = [[User alloc] init];

    if (completion) {
        completion(user, nil);
    }
}
```

调用：

```objc
[service loadUserWithCompletion:^(User *user, NSError *error) {
    if (error) {
        NSLog(@"error = %@", error);
        return;
    }

    NSLog(@"user = %@", user);
}];
```

注意：

```text
调用 Block 前通常先判断是否为 nil。
```

否则 Block 为 nil 时直接调用会崩溃。

---

## 7. Block 作为属性

Block 作为属性时通常写 `copy`：

```objc
@property (nonatomic, copy) void (^completion)(void);
```

赋值：

```objc
self.completion = ^{
    NSLog(@"done");
};
```

调用：

```objc
if (self.completion) {
    self.completion();
}
```

常见场景：

```text
1. 页面事件回调
2. 网络请求完成回调
3. 封装组件对外暴露结果
```

---

## 8. 捕获外部变量

Block 可以使用外部变量：

```objc
NSString *name = @"Yuhui";

void (^block)(void) = ^{
    NSLog(@"name = %@", name);
};

block();
```

这叫捕获变量。

默认情况下，Block 内不能修改普通局部变量：

```objc
NSInteger count = 0;

void (^block)(void) = ^{
    count = count + 1; // 编译错误
};
```

如果确实要修改，需要 `__block`：

```objc
__block NSInteger count = 0;

void (^block)(void) = ^{
    count = count + 1;
};

block();
NSLog(@"count = %ld", (long)count);
```

第一阶段先记住：

```text
__block 允许 Block 修改外部局部变量。
```

---

## 9. 捕获 self 与循环引用

最危险的常见写法：

```objc
self.completion = ^{
    [self reloadData];
};
```

如果：

```text
self strong 持有 completion
completion 又 strong 捕获 self
```

就会循环引用。

常见写法：

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

为什么里面又转成 strong？

```text
weakSelf 可能随时变 nil。
Block 执行期间先转成 strong，可以保证这一段执行过程中 self 不会突然释放。
```

读代码时看到 `weakSelf` / `strongSelf`，基本就是在处理 Block 和 self 的生命周期问题。

---

## 10. 常见系统 API 中的 Block

GCD 异步：

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    [self.tableView reloadData];
});
```

UIView 动画：

```objc
[UIView animateWithDuration:0.25 animations:^{
    self.view.alpha = 0.5;
} completion:^(BOOL finished) {
    NSLog(@"finished = %@", finished ? @"YES" : @"NO");
}];
```

数组枚举：

```objc
[items enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
    NSLog(@"%lu: %@", (unsigned long)idx, obj);
}];
```

这些都是 Block 的典型使用场景。

---

## 11. Block 与 Java / Kotlin 类比

| Java / Kotlin | Objective-C |
|---|---|
| Lambda | Block |
| 函数类型 | Block 类型 |
| 回调接口 | Block 参数 |
| 闭包捕获变量 | Block 捕获变量 |
| 可变捕获需要限制 | `__block` |

类比可以帮助理解，但要注意 OC 的生命周期问题更显式：

```text
Block 作为属性要 copy。
Block 捕获 self 要警惕循环引用。
```

---

## 12. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. void (^completion)(void) 怎么读？
2. Block 作为属性为什么常用 copy？
3. 调用 Block 前为什么常判断是否为 nil？
4. typedef 对 Block 有什么帮助？
5. __block 解决什么问题？
6. Block 捕获 self 为什么可能循环引用？
7. weakSelf / strongSelf 这一套写法想解决什么？
```

下一章进入 Category / Extension，它们是 OC 老项目扩展类能力的常见方式。

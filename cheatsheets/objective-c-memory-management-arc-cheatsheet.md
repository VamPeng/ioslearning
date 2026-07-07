# Objective-C ARC 内存管理速查

## 1. ARC 是什么

```text
ARC = Automatic Reference Counting
编译器自动插入 retain / release / autorelease。
```

ARC 下通常不能手写：

```objc
[object retain];
[object release];
[object autorelease];
[super dealloc];
```

## 2. 常见属性规则

| 场景 | 写法 |
|---|---|
| 普通对象 | `strong` |
| 字符串 | `copy` |
| Block | `copy` |
| delegate | `weak` |
| 基础类型 | `assign` |

```objc
@property (nonatomic, strong) User *user;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) void (^completion)(void);
@property (nonatomic, weak) id<UserCellDelegate> delegate;
@property (nonatomic, assign) NSInteger count;
```

## 3. strong / weak

```text
strong = 持有对象，让对象生命周期变长
weak   = 不持有对象，对象释放后自动变 nil
```

## 4. 循环引用

危险结构：

```text
A strong -> B
B strong -> A
```

常见解决：

```objc
@property (nonatomic, weak) id delegate;
```

## 5. delegate 为什么 weak

典型结构：

```text
ViewController strong -> Cell
Cell weak -> ViewController
```

避免：

```text
ViewController strong -> Cell
Cell strong -> ViewController
```

## 6. Block 捕获 self

危险写法：

```objc
self.completion = ^{
    [self reloadData];
};
```

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

## 7. dealloc

```objc
- (void)dealloc {
    NSLog(@"%@ dealloc", NSStringFromClass([self class]));
}
```

用途：

```text
1. 确认对象是否释放
2. 移除通知
3. 释放非 OC 资源
```

## 8. @autoreleasepool

```objc
@autoreleasepool {
    NSString *text = [NSString stringWithFormat:@"value"];
    NSLog(@"%@", text);
}
```

```text
@autoreleasepool = 临时对象的释放边界。
```

## 9. 排查对象不释放

```text
1. 给对象加 dealloc 日志
2. 页面退出后观察是否打印
3. 搜索 strong 属性
4. 检查 delegate 是否 weak
5. 检查 Block 是否捕获 self
```

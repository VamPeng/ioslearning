# Objective-C Block 速查

## 1. 基本写法

```objc
void (^printBlock)(void) = ^{
    NSLog(@"Hello Block");
};

printBlock();
```

## 2. 带参数

```objc
void (^greetBlock)(NSString *) = ^(NSString *name) {
    NSLog(@"Hello, %@", name);
};

greetBlock(@"Yuhui");
```

## 3. 带返回值

```objc
NSInteger (^sumBlock)(NSInteger, NSInteger) = ^NSInteger(NSInteger a, NSInteger b) {
    return a + b;
};

NSInteger result = sumBlock(3, 5);
```

## 4. Block 类型怎么读

```objc
void (^completion)(BOOL success, NSError *error);
```

```text
completion 是一个 Block。
接收 BOOL 和 NSError *。
返回 void。
```

## 5. typedef

```objc
typedef void (^LoginCompletion)(BOOL success, NSError *error);

- (void)loginWithCompletion:(LoginCompletion)completion;
```

## 6. Block 作为参数

```objc
- (void)loadUserWithCompletion:(void (^)(User *user, NSError *error))completion {
    if (completion) {
        completion(user, nil);
    }
}
```

## 7. Block 作为属性

```objc
@property (nonatomic, copy) void (^completion)(void);
```

```text
Block 属性通常 copy。
```

## 8. 调用前判空

```objc
if (self.completion) {
    self.completion();
}
```

## 9. 捕获变量

```objc
NSString *name = @"Yuhui";

void (^block)(void) = ^{
    NSLog(@"%@", name);
};
```

## 10. 修改外部变量

```objc
__block NSInteger count = 0;

void (^block)(void) = ^{
    count++;
};
```

## 11. weak / strong self

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

## 12. 常见系统 API

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    [self.tableView reloadData];
});

[UIView animateWithDuration:0.25 animations:^{
    self.view.alpha = 0.5;
}];
```

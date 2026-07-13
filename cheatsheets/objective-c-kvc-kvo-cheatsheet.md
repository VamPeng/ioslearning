# Objective-C KVC / KVO 速查

## 1. KVC 基本读写

```objc
[user setValue:@"Alice" forKey:@"name"];
NSString *name = [user valueForKey:@"name"];
```

基础数值自动包装：

```objc
[user setValue:@18 forKey:@"age"];
NSNumber *age = [user valueForKey:@"age"];
```

## 2. Key Path

```objc
NSString *city = [user valueForKeyPath:@"address.city"];
[user setValue:@"Singapore" forKeyPath:@"address.city"];
```

```text
forKey      单个对象层级
forKeyPath  使用点号访问对象链
```

## 3. 未定义 Key

```objc
- (id)valueForUndefinedKey:(NSString *)key {
    NSLog(@"unknown read key: %@", key);
    return nil;
}

- (void)setValue:(id)value forUndefinedKey:(NSString *)key {
    NSLog(@"unknown write key: %@ value=%@", key, value);
}
```

默认行为通常会抛出 `NSUnknownKeyException`。

## 4. nil 写入基础值

```objc
- (void)setNilValueForKey:(NSString *)key {
    if ([key isEqualToString:@"age"]) {
        self.age = 0;
        return;
    }

    [super setNilValueForKey:key];
}
```

## 5. KVC 字典映射

不要无条件写入全部字段。

```objc
NSSet<NSString *> *allowedKeys = [NSSet setWithArray:@[
    @"name",
    @"age"
]];

[payload enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    if (![allowedKeys containsObject:key]) {
        return;
    }

    if (value == [NSNull null]) {
        value = nil;
    }

    [user setValue:value forKey:key];
}];
```

## 6. 批量提取属性

```objc
NSArray<NSString *> *names = [users valueForKey:@"name"];
```

## 7. 集合运算符

```objc
NSNumber *count = [users valueForKeyPath:@"@count"];
NSNumber *sum = [users valueForKeyPath:@"@sum.score"];
NSNumber *avg = [users valueForKeyPath:@"@avg.score"];
NSNumber *min = [users valueForKeyPath:@"@min.score"];
NSNumber *max = [users valueForKeyPath:@"@max.score"];

NSArray *allNames = [users valueForKeyPath:@"@unionOfObjects.name"];
NSArray *uniqueNames = [users valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

## 8. 可变集合代理

```objc
NSMutableArray *proxy = [user mutableArrayValueForKey:@"tags"];
[proxy addObject:@"ios"];
[proxy removeObject:@"old"];
```

用于让集合元素变化更符合 KVC / KVO 通知约定。

## 9. KVO 注册

```objc
static void *ProgressContext = &ProgressContext;

[task addObserver:self
       forKeyPath:@"progress"
          options:NSKeyValueObservingOptionOld |
                  NSKeyValueObservingOptionNew |
                  NSKeyValueObservingOptionInitial
          context:ProgressContext];
```

## 10. KVO 回调

```objc
- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context {
    if (context == ProgressContext) {
        NSNumber *oldValue = change[NSKeyValueChangeOldKey];
        NSNumber *newValue = change[NSKeyValueChangeNewKey];
        NSLog(@"%@ -> %@", oldValue, newValue);
        return;
    }

    [super observeValueForKeyPath:keyPath
                         ofObject:object
                           change:change
                          context:context];
}
```

## 11. KVO options

| 选项 | 作用 |
|---|---|
| `NSKeyValueObservingOptionOld` | 包含旧值 |
| `NSKeyValueObservingOptionNew` | 包含新值 |
| `NSKeyValueObservingOptionInitial` | 注册后立即回调当前值 |
| `NSKeyValueObservingOptionPrior` | 修改前也回调一次 |

判断 Prior：

```objc
BOOL isPrior = [change[NSKeyValueChangeNotificationIsPriorKey] boolValue];
```

## 12. 移除观察者

```objc
[task removeObserver:self
          forKeyPath:@"progress"
             context:ProgressContext];
```

```text
addObserver 与 removeObserver 必须对称
不要重复注册
不要未注册就移除
对象切换时先移除旧对象
```

## 13. 通知线程

KVO 通常同步回调在修改属性的线程。

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    self.progressLabel.text = @"updated";
});
```

更新 UI 时显式切主线程。

## 14. 自动通知

```objc
task.progress = 0.5;
```

通常自动触发 KVO。

直接写实例变量可能绕过：

```objc
_progress = 0.5;
```

## 15. 关闭自动通知

```objc
+ (BOOL)automaticallyNotifiesObserversForKey:(NSString *)key {
    if ([key isEqualToString:@"progress"]) {
        return NO;
    }

    return [super automaticallyNotifiesObserversForKey:key];
}
```

## 16. 手动通知

```objc
- (void)updateProgress:(double)progress {
    [self willChangeValueForKey:@"progress"];
    _progress = progress;
    [self didChangeValueForKey:@"progress"];
}
```

不要同时保留自动通知和手动通知。

## 17. 依赖 Key

```objc
+ (NSSet<NSString *> *)keyPathsForValuesAffectingProgress {
    return [NSSet setWithObjects:
        @"completedLessons",
        @"totalLessons",
        nil
    ];
}
```

```text
completedLessons ─┐
                  ├── progress
totalLessons ─────┘
```

## 18. 常见崩溃检查

```text
NSUnknownKeyException
├── Key 拼写错误
├── 属性已重命名但字符串未改
└── 外部字典字段未过滤

setNilValueForKey:
└── nil 写入 NSInteger / BOOL / double

KVO 生命周期
├── 重复注册
├── 忘记移除
├── 未注册就移除
└── 观察对象已切换
```

## 19. 选择机制

```text
动态属性访问      KVC
监听属性变化      KVO
一次异步结果      Block
一对一行为委托    Delegate
一对多广播        Notification
```

## 20. 最小记忆

```text
KVC：valueForKey / setValue:forKey
KVO：addObserver / observeValue / removeObserver
Key 是字符串，运行时才知道是否正确
KVO 回调线程跟随修改线程
注册与移除必须对称
```
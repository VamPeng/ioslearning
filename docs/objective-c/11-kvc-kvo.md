# Objective-C KVC / KVO

## 1. 学习目标

KVC（Key-Value Coding）和 KVO（Key-Value Observing）是 Foundation 提供的动态对象机制。

它们解决两个不同的问题：

```text
KVC：通过字符串 Key 读取或修改对象属性
KVO：监听某个 Key 对应的值发生变化
```

学完以后，你应该能看懂并正确使用：

```text
1. valueForKey: / setValue:forKey:
2. valueForKeyPath: / setValue:forKeyPath:
3. KVC 的属性和实例变量查找规则
4. valueForUndefinedKey: 与 setValue:forUndefinedKey:
5. setNilValueForKey:
6. KVC 集合运算符
7. addObserver:forKeyPath:options:context:
8. observeValueForKeyPath:ofObject:change:context:
9. KVO 的 old / new / initial / prior 选项
10. 自动通知、手动通知和依赖 Key
11. 观察者注册与移除的生命周期
12. KVC / KVO 的适用边界和常见崩溃点
```

一句话：

```text
KVC = 用字符串描述属性访问。
KVO = 在属性变化时接收同步通知。
```

---

## 2. 普通属性访问与 KVC

先定义一个模型：

```objc
@interface OCUser : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

@end
```

普通访问：

```objc
OCUser *user = [[OCUser alloc] init];
user.name = @"Yuhui";
user.age = 18;

NSLog(@"%@", user.name);
```

KVC 访问：

```objc
[user setValue:@"Yuhui" forKey:@"name"];
[user setValue:@18 forKey:@"age"];

NSString *name = [user valueForKey:@"name"];
NSNumber *age = [user valueForKey:@"age"];
```

对比：

```text
普通属性访问
├── 编译器知道属性名和类型
├── 重构工具更可靠
└── 类型检查更强

KVC
├── 属性名在运行时由字符串决定
├── 返回值通常是 id
├── 可以动态读写
└── 拼写错误通常到运行时才暴露
```

默认优先使用普通属性访问。只有当“属性名需要动态决定”或系统 API 明确依赖 KVC 时，才使用 KVC。

---

## 3. valueForKey: 与 setValue:forKey:

读取：

```objc
id value = [user valueForKey:@"name"];
```

写入：

```objc
[user setValue:@"Alice" forKey:@"name"];
```

基础数值属性会自动进行对象包装和拆箱：

```objc
[user setValue:@20 forKey:@"age"];
NSNumber *age = [user valueForKey:@"age"];
```

统一理解：

```text
NSInteger age
    ↓ KVC 读取
NSNumber *

NSNumber *
    ↓ KVC 写入
NSInteger age
```

因为 KVC 接口使用对象类型 `id`，所以基础数值需要经过 `NSNumber`。

---

## 4. KVC 的典型查找规则

当执行：

```objc
[user valueForKey:@"name"];
```

KVC 会根据约定查找访问方法。常见顺序可以简化理解为：

```text
getName
name
isName
_name
```

如果没有找到合适的方法，并且类允许直接访问实例变量，KVC 还会继续尝试：

```text
_name
_isName
name
isName
```

写入 `name` 时，典型查找为：

```text
setName:
_setName:
```

如果没有找到 Setter，并且允许直接访问实例变量，还会尝试相应实例变量。

是否允许直接访问实例变量由下面的方法决定：

```objc
+ (BOOL)accessInstanceVariablesDirectly {
    return YES;
}
```

`NSObject` 默认返回 `YES`。

可以关闭直接实例变量访问：

```objc
+ (BOOL)accessInstanceVariablesDirectly {
    return NO;
}
```

关闭后，如果没有访问方法，KVC 会进入未定义 Key 的处理逻辑。

> 不要在业务代码中依赖复杂的隐藏实例变量查找。公开属性最好提供明确的 Getter / Setter。

---

## 5. 未定义 Key

错误示例：

```objc
[user valueForKey:@"userName"];
```

如果模型只有 `name`，没有 `userName`，默认会触发：

```objc
- (id)valueForUndefinedKey:(NSString *)key;
```

并抛出 `NSUnknownKeyException`。

写入不存在的 Key：

```objc
[user setValue:@"Alice" forKey:@"userName"];
```

默认会触发：

```objc
- (void)setValue:(id)value forUndefinedKey:(NSString *)key;
```

可以重写并记录问题：

```objc
- (id)valueForUndefinedKey:(NSString *)key {
    NSLog(@"unknown read key: %@", key);
    return nil;
}

- (void)setValue:(id)value forUndefinedKey:(NSString *)key {
    NSLog(@"unknown write key: %@ value=%@", key, value);
}
```

但不要为了“避免崩溃”而静默吞掉所有错误。未知 Key 往往代表：

```text
1. 字符串拼写错误
2. 接口字段与模型不一致
3. 重构后字符串 Key 没有同步修改
4. 外部输入越过了允许字段范围
```

更稳妥的做法是：开发阶段暴露错误，动态映射时使用白名单。

---

## 6. nil 与基础数值属性

对象属性可以设置为 `nil`：

```objc
[user setValue:nil forKey:@"name"];
```

但基础数值属性不能直接保存 `nil`：

```objc
[user setValue:nil forKey:@"age"];
```

默认会调用：

```objc
- (void)setNilValueForKey:(NSString *)key;
```

并可能抛出异常。

可以按业务规则重写：

```objc
- (void)setNilValueForKey:(NSString *)key {
    if ([key isEqualToString:@"age"]) {
        self.age = 0;
        return;
    }

    [super setNilValueForKey:key];
}
```

这里要明确区分：

```text
nil          Objective-C 空对象指针
NSNull       集合中的空值占位对象
基础数值属性 不能保存 nil
```

动态 JSON 映射前应先处理 `NSNull`，不要直接把它写入任意属性。

---

## 7. Key Path：访问对象链

定义地址模型：

```objc
@interface OCAddress : NSObject
@property (nonatomic, copy) NSString *city;
@end

@interface OCUser : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, strong) OCAddress *address;
@end
```

普通访问：

```objc
NSString *city = user.address.city;
```

KVC Key Path：

```objc
NSString *city = [user valueForKeyPath:@"address.city"];
```

写入：

```objc
[user setValue:@"Singapore" forKeyPath:@"address.city"];
```

Key Path 的结构：

```text
address.city
│       └── 最终 Key
└── 中间对象
```

如果中间对象为 `nil`：

```objc
user.address = nil;
id city = [user valueForKeyPath:@"address.city"];
```

读取结果通常为 `nil`，因为 Objective-C 向 `nil` 发送消息不会执行实际操作。

但不要依赖复杂的空链行为构建核心业务逻辑。关键对象应显式校验。

---

## 8. KVC 与字典映射

KVC 常被用于把字典字段写入模型：

```objc
NSDictionary<NSString *, id> *payload = @{
    @"name": @"Alice",
    @"age": @20
};

[payload enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    [user setValue:value forKey:key];
}];
```

这种写法很短，但风险较高：

```text
外部字典 Key
    ↓ 直接作为 KVC Key
对象内部属性
```

如果外部数据包含意外字段，可能触发未定义 Key；如果字段类型错误，可能在运行时崩溃。

推荐使用白名单：

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

对于复杂网络模型，显式解析通常比全自动 KVC 映射更安全、更容易维护。

---

## 9. KVC 集合读取

对对象数组调用 `valueForKey:`，可以批量提取属性：

```objc
NSArray<OCUser *> *users = @[alice, bob, carol];
NSArray<NSString *> *names = [users valueForKey:@"name"];
```

效果类似：

```text
users
├── alice.name
├── bob.name
└── carol.name

        ↓

names
```

如果某个属性值为 `nil`，集合不能直接保存 `nil`，系统通常会用 `NSNull` 表达空位。

实际业务中应明确检查结果类型，不要假设所有元素都符合预期。

---

## 10. KVC 集合运算符

KVC 支持通过 Key Path 对集合进行统计和投影。

### 10.1 数量

```objc
NSNumber *count = [users valueForKeyPath:@"@count"];
```

### 10.2 数值统计

假设每个用户都有 `score`：

```objc
NSNumber *sum = [users valueForKeyPath:@"@sum.score"];
NSNumber *avg = [users valueForKeyPath:@"@avg.score"];
NSNumber *min = [users valueForKeyPath:@"@min.score"];
NSNumber *max = [users valueForKeyPath:@"@max.score"];
```

### 10.3 对象投影

```objc
NSArray *allNames = [users valueForKeyPath:@"@unionOfObjects.name"];
NSArray *uniqueNames = [users valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

常见运算符：

| 运算符 | 作用 |
|---|---|
| `@count` | 元素数量 |
| `@sum` | 求和 |
| `@avg` | 平均值 |
| `@min` | 最小值 |
| `@max` | 最大值 |
| `@unionOfObjects` | 提取对象属性，保留重复 |
| `@distinctUnionOfObjects` | 提取对象属性并去重 |

注意：

```text
1. 运算对象必须支持对应操作
2. 数值统计通常要求属性可转成 NSNumber
3. 投影属性出现 nil 时需要谨慎
4. 复杂逻辑优先使用显式遍历，便于调试和处理异常数据
```

---

## 11. mutableArrayValueForKey: 可变集合代理

如果对象有一个数组属性：

```objc
@property (nonatomic, strong) NSMutableArray<NSString *> *tags;
```

直接读取后修改：

```objc
[user.tags addObject:@"ios"];
```

这种修改是否能触发针对 `tags` 的 KVO，需要看通知方式和访问路径。

KVC 提供可变集合代理：

```objc
NSMutableArray *proxy = [user mutableArrayValueForKey:@"tags"];
[proxy addObject:@"ios"];
```

代理会把集合变更转换为 KVC/KVO 可识别的操作。

统一理解：

```text
mutableArrayValueForKey:
    ↓
返回一个代理对象
    ↓
通过代理修改集合
    ↓
系统可以产生更准确的集合变化通知
```

在简单业务中，显式封装 `addTag:`、`removeTag:` 方法通常更直观。

---

## 12. KVO 基本模型

KVO 用于监听对象某个 Key 的变化。

```text
被观察对象 Observable
        ↓ 属性变化
观察者 Observer
        ↓ 收到 change 字典
执行响应逻辑
```

示例模型：

```objc
@interface OCDownloadTask : NSObject
@property (nonatomic, assign) double progress;
@end
```

注册观察：

```objc
static void *DownloadProgressContext = &DownloadProgressContext;

[task addObserver:self
       forKeyPath:@"progress"
          options:NSKeyValueObservingOptionOld |
                  NSKeyValueObservingOptionNew
          context:DownloadProgressContext];
```

接收变化：

```objc
- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context {
    if (context == DownloadProgressContext) {
        NSNumber *oldValue = change[NSKeyValueChangeOldKey];
        NSNumber *newValue = change[NSKeyValueChangeNewKey];

        NSLog(@"progress: %@ -> %@", oldValue, newValue);
        return;
    }

    [super observeValueForKeyPath:keyPath
                         ofObject:object
                           change:change
                          context:context];
}
```

修改属性：

```objc
task.progress = 0.5;
```

观察者会收到通知。

---

## 13. KVO options

注册观察者时可以组合选项：

```objc
NSKeyValueObservingOptions options =
    NSKeyValueObservingOptionOld |
    NSKeyValueObservingOptionNew |
    NSKeyValueObservingOptionInitial;
```

常用选项：

| 选项 | 作用 |
|---|---|
| `NSKeyValueObservingOptionOld` | change 中包含旧值 |
| `NSKeyValueObservingOptionNew` | change 中包含新值 |
| `NSKeyValueObservingOptionInitial` | 注册后立即回调一次当前值 |
| `NSKeyValueObservingOptionPrior` | 值变化前也发送一次通知 |

`Initial` 很适合让观察者注册后立即同步当前状态：

```text
注册观察
    ↓
立即收到当前值
    ↓
以后继续接收变化
```

使用 `Prior` 时，可以通过下面的 Key 判断是否为变化前通知：

```objc
BOOL isPrior = [change[NSKeyValueChangeNotificationIsPriorKey] boolValue];
```

多数业务只需要 `Old | New`，或 `New | Initial`。

---

## 14. 为什么推荐使用 context

只判断字符串：

```objc
if ([keyPath isEqualToString:@"progress"]) {
    // ...
}
```

在继承层次、多个对象、多个模块同时观察时可能产生歧义。

更稳妥的方式是使用唯一 Context：

```objc
static void *DownloadProgressContext = &DownloadProgressContext;
```

注册和回调都使用相同地址：

```objc
if (context == DownloadProgressContext) {
    // 确认是当前模块注册的观察
}
```

Context 的价值：

```text
Key Path 字符串可能重复
Context 指针用于区分“是谁注册的这一条观察关系”
```

---

## 15. 移除观察者

传统 KVO 注册和移除必须对称：

```objc
[task addObserver:self
       forKeyPath:@"progress"
          options:NSKeyValueObservingOptionNew
          context:DownloadProgressContext];
```

对应移除：

```objc
[task removeObserver:self
          forKeyPath:@"progress"
             context:DownloadProgressContext];
```

推荐把注册状态显式保存：

```objc
@property (nonatomic, assign, getter=isObserving) BOOL observing;
```

```objc
- (void)startObserving {
    if (self.isObserving) {
        return;
    }

    [self.task addObserver:self
                forKeyPath:@"progress"
                   options:NSKeyValueObservingOptionNew
                   context:DownloadProgressContext];
    self.observing = YES;
}

- (void)stopObserving {
    if (!self.isObserving) {
        return;
    }

    [self.task removeObserver:self
                   forKeyPath:@"progress"
                      context:DownloadProgressContext];
    self.observing = NO;
}
```

不要：

```text
重复 addObserver
忘记 removeObserver
没有注册却调用 removeObserver
对象关系切换后仍观察旧对象
```

即使新系统在部分生命周期场景提供保护，也不应依赖系统兜底。显式、对称地管理观察关系更可靠。

---

## 16. KVO 通知发生在哪个线程

KVO 通知通常同步发生在属性被修改的线程。

```text
后台线程修改属性
        ↓
后台线程执行 KVO 回调
```

因此回调中更新 UI 时必须切回主线程：

```objc
- (void)handleProgress:(double)progress {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.progressLabel.text = [NSString stringWithFormat:@"%.0f%%", progress * 100];
    });
}
```

不要把 KVO 理解为自动切线程的事件总线。

KVO 本身只负责通知，不负责线程调度。

---

## 17. 自动通知

通过符合 KVC 约定的 Setter 修改属性时，KVO 通常可以自动发送通知：

```objc
task.progress = 0.5;
```

等价于调用：

```objc
[task setProgress:0.5];
```

但直接修改实例变量可能绕过自动通知：

```objc
_progress = 0.5;
```

所以在需要 KVO 的属性上，应通过 Setter 修改。

可以为某个 Key 关闭自动通知：

```objc
+ (BOOL)automaticallyNotifiesObserversForKey:(NSString *)key {
    if ([key isEqualToString:@"progress"]) {
        return NO;
    }

    return [super automaticallyNotifiesObserversForKey:key];
}
```

关闭后，需要手动通知。

---

## 18. 手动通知

手动通知写法：

```objc
- (void)updateProgressManually:(double)progress {
    [self willChangeValueForKey:@"progress"];
    _progress = progress;
    [self didChangeValueForKey:@"progress"];
}
```

必须成对调用：

```text
willChangeValueForKey:
        ↓
修改真实值
        ↓
didChangeValueForKey:
```

不要同时保留自动通知又额外手动通知，否则可能收到重复回调。

手动通知适用于：

```text
1. 变化不通过标准 Setter
2. 多个底层字段共同决定一次公开变化
3. 需要精确控制通知范围
```

普通属性优先使用自动通知。

---

## 19. 依赖 Key

假设模型有：

```objc
@property (nonatomic, assign) NSInteger completedLessons;
@property (nonatomic, assign) NSInteger totalLessons;
@property (nonatomic, readonly) double progress;
```

`progress` 由另外两个属性计算：

```objc
- (double)progress {
    if (self.totalLessons == 0) {
        return 0;
    }

    return (double)self.completedLessons / (double)self.totalLessons;
}
```

如果观察者监听 `progress`，修改 `completedLessons` 时，系统并不知道 `progress` 也变了。

可以声明依赖关系：

```objc
+ (NSSet<NSString *> *)keyPathsForValuesAffectingProgress {
    return [NSSet setWithObjects:
        @"completedLessons",
        @"totalLessons",
        nil
    ];
}
```

于是：

```text
completedLessons 改变 ─┐
                       ├── progress 发送变化通知
totalLessons 改变 ─────┘
```

依赖 Key 适合计算属性，但依赖关系应保持简单清晰。

---

## 20. KVO 的实现机制如何理解

经典 Objective-C KVO 常通过运行时动态能力实现。

可以概念化理解为：

```text
原对象
    ↓ 注册 KVO
运行时创建派生子类
    ↓
重写被观察属性的 Setter
    ↓
Setter 前后插入通知逻辑
```

调试时可能看到对象的真实运行时类发生变化。

但要注意：

```text
这是理解 KVO 的经典实现模型，不应把私有子类名称或内部细节当成稳定 API。
```

业务代码只依赖公开 KVO 契约，不依赖私有类名、isa 变化或内部方法实现。

更深入的动态子类、消息发送和方法替换会在 Runtime 章节继续学习。

---

## 21. KVC 与 KVO 的关系

它们经常一起出现，但职责不同：

```text
KVC
├── 定义如何通过 Key 访问值
└── 提供统一的动态属性访问约定

KVO
├── 建立观察关系
└── 在符合规则的值变化时发送通知
```

可以把它们理解为：

```text
KVC 负责“这个 Key 对应什么值”
KVO 负责“这个 Key 的值什么时候变化”
```

KVO 依赖属性符合 KVC 约定，但使用 KVC 读取属性并不等于已经建立 KVO 观察。

---

## 22. 常见错误

### 错误 1：Key 拼写错误

```objc
[user valueForKey:@"naem"];
```

可能触发 `NSUnknownKeyException`。

### 错误 2：把 nil 写入基础数值

```objc
[user setValue:nil forKey:@"age"];
```

会进入 `setNilValueForKey:`。

### 错误 3：直接把外部字典所有 Key 写入对象

```objc
[payload enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    [user setValue:value forKey:key];
}];
```

缺少字段白名单和类型校验。

### 错误 4：重复注册观察者

```objc
[self startObserving];
[self startObserving];
```

可能造成重复通知或移除关系不匹配。

### 错误 5：忘记移除观察者

观察者或被观察对象生命周期结束后仍残留关系，可能产生异常行为。

### 错误 6：没有注册却移除

```objc
[task removeObserver:self forKeyPath:@"progress"];
```

观察关系不匹配可能触发异常。

### 错误 7：回调中不转主线程直接更新 UI

KVO 回调线程跟随属性修改线程，并不保证是主线程。

### 错误 8：手动通知与自动通知同时使用

可能导致同一次变化回调两次。

### 错误 9：忘记调用 super

不能识别的 KVO 回调应继续交给父类处理：

```objc
[super observeValueForKeyPath:keyPath
                     ofObject:object
                       change:change
                      context:context];
```

---

## 23. 适用场景与边界

KVC 适合：

```text
动态字段映射
系统框架定义的 Key 访问
通用配置工具
调试和对象检查工具
简单的批量属性提取
```

KVO 适合：

```text
监听已有 Objective-C 对象属性
兼容老项目和系统框架
局部、明确的一对一状态观察
```

不适合滥用为：

```text
全局事件总线
任意跨模块通信
复杂业务状态机
无边界的数据绑定系统
```

当业务需要表达明确事件时，Delegate、Block、Notification 或显式状态管理通常更直观。

选择原则：

```text
需要动态读写属性            KVC
需要监听已有属性变化        KVO
需要表达一次操作结果        Block / Callback
需要一对一行为委托          Delegate
需要一对多广播              Notification
```

---

## 24. 与 Swift / Java / Android 对照

| Objective-C | Swift | Java / Android |
|---|---|---|
| KVC `valueForKey:` | 动态成员、反射场景；普通代码仍以属性访问为主 | Reflection / Bean Property |
| KVO | Observation、Combine、属性包装器等现代机制 | Observable、LiveData、Flow 等状态观察机制 |
| Key Path 字符串 | Swift KeyPath 是强类型设计 | 属性名字符串或反射字段名 |
| `NSNull` | `NSNull` / Optional 边界转换 | JSON null 占位 / nullable |

关键区别：

```text
Objective-C KVC Key 通常是字符串，编译期安全较弱。
Swift KeyPath 可以携带更强的类型信息。
Android LiveData / Flow 通常显式表达状态流，不等同于 KVO 的运行时属性拦截。
```

---

## 25. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. KVC 和普通属性访问有什么区别？
2. valueForKey: 和 valueForKeyPath: 有什么区别？
3. Key 不存在时为什么会出现 NSUnknownKeyException？
4. 为什么不能把 nil 写入 NSInteger 属性？
5. KVC 集合运算符可以解决什么问题？
6. KVO 注册时 old、new、initial 分别有什么作用？
7. 为什么推荐使用独立 context？
8. 为什么 addObserver 和 removeObserver 必须对称？
9. KVO 回调一定在主线程吗？
10. 自动通知和手动通知有什么区别？
11. 计算属性如何声明依赖 Key？
12. 为什么不能把任意外部字典直接通过 KVC 写入模型？
```

到这里，你已经具备阅读 Objective-C 老项目中模型映射、属性观察和系统框架绑定代码的基础。下一章进入 Runtime，理解消息发送、动态类型和方法解析。
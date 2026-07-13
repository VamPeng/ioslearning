# Lab：Objective-C KVC / KVO

## 目标

通过一个“学习进度观察器”练习：

```text
1. valueForKey: / setValue:forKey:
2. valueForKeyPath:
3. 动态字典白名单映射
4. nil 与基础数值属性
5. KVC 集合运算符
6. KVO 注册、回调与移除
7. old / new / initial
8. context 区分观察关系
9. 依赖 Key
10. KVO 回调线程
```

这个 Lab 可以在 Xcode 的 macOS Command Line Tool 中运行，也可以把类放进 iOS App 工程。

---

## 练习结构

```text
KVCKVOLab/
├── OCStudyProgress.h
├── OCStudyProgress.m
├── OCProgressObserver.h
├── OCProgressObserver.m
└── main.m
```

---

## 练习 1：创建进度模型

### OCStudyProgress.h

```objc
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OCStudyProgress : NSObject

@property (nonatomic, copy, nullable) NSString *name;
@property (nonatomic, assign) NSInteger completedLessons;
@property (nonatomic, assign) NSInteger totalLessons;
@property (nonatomic, copy) NSArray<NSString *> *tags;
@property (nonatomic, readonly) double progress;

- (instancetype)initWithName:(NSString *)name
            completedLessons:(NSInteger)completedLessons
                totalLessons:(NSInteger)totalLessons
                        tags:(NSArray<NSString *> *)tags;

- (void)applyPayload:(NSDictionary<NSString *, id> *)payload;

@end

NS_ASSUME_NONNULL_END
```

### OCStudyProgress.m

```objc
#import "OCStudyProgress.h"

@implementation OCStudyProgress

- (instancetype)initWithName:(NSString *)name
            completedLessons:(NSInteger)completedLessons
                totalLessons:(NSInteger)totalLessons
                        tags:(NSArray<NSString *> *)tags {
    self = [super init];
    if (self) {
        _name = [name copy];
        _completedLessons = completedLessons;
        _totalLessons = totalLessons;
        _tags = [tags copy];
    }
    return self;
}

- (double)progress {
    if (self.totalLessons <= 0) {
        return 0;
    }

    return (double)self.completedLessons / (double)self.totalLessons;
}

+ (NSSet<NSString *> *)keyPathsForValuesAffectingProgress {
    return [NSSet setWithObjects:
        @"completedLessons",
        @"totalLessons",
        nil
    ];
}

- (void)setNilValueForKey:(NSString *)key {
    if ([key isEqualToString:@"completedLessons"]) {
        self.completedLessons = 0;
        return;
    }

    if ([key isEqualToString:@"totalLessons"]) {
        self.totalLessons = 0;
        return;
    }

    [super setNilValueForKey:key];
}

- (void)applyPayload:(NSDictionary<NSString *, id> *)payload {
    NSSet<NSString *> *allowedKeys = [NSSet setWithArray:@[
        @"name",
        @"completedLessons",
        @"totalLessons",
        @"tags"
    ]];

    [payload enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
        if (![allowedKeys containsObject:key]) {
            NSLog(@"ignore unknown payload key: %@", key);
            return;
        }

        id normalizedValue = value == [NSNull null] ? nil : value;

        if ([key isEqualToString:@"name"] &&
            normalizedValue != nil &&
            ![normalizedValue isKindOfClass:[NSString class]]) {
            NSLog(@"invalid name: %@", normalizedValue);
            return;
        }

        if (([key isEqualToString:@"completedLessons"] ||
             [key isEqualToString:@"totalLessons"]) &&
            normalizedValue != nil &&
            ![normalizedValue isKindOfClass:[NSNumber class]]) {
            NSLog(@"invalid numeric value for %@: %@", key, normalizedValue);
            return;
        }

        if ([key isEqualToString:@"tags"] &&
            normalizedValue != nil &&
            ![normalizedValue isKindOfClass:[NSArray class]]) {
            NSLog(@"invalid tags: %@", normalizedValue);
            return;
        }

        [self setValue:normalizedValue forKey:key];
    }];
}

- (NSString *)description {
    return [NSString stringWithFormat:
        @"<OCStudyProgress name=%@ completed=%ld total=%ld progress=%.2f tags=%@>",
        self.name,
        (long)self.completedLessons,
        (long)self.totalLessons,
        self.progress,
        self.tags
    ];
}

@end
```

关键点：

```text
progress 是计算属性
completedLessons 和 totalLessons 是 progress 的依赖 Key
通过 Setter 修改依赖字段时，progress 观察者也会收到通知
外部字典必须经过 Key 白名单和类型校验
NSNull 转成 nil 后，基础数值进入 setNilValueForKey:
```

---

## 练习 2：验证 KVC

### main.m 第一部分

```objc
#import <Foundation/Foundation.h>
#import "OCStudyProgress.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        OCStudyProgress *progress = [[OCStudyProgress alloc]
            initWithName:@"Objective-C"
            completedLessons:3
            totalLessons:10
            tags:@[@"ios", @"objc"]];

        NSString *name = [progress valueForKey:@"name"];
        NSNumber *completed = [progress valueForKey:@"completedLessons"];
        NSNumber *ratio = [progress valueForKey:@"progress"];

        NSLog(@"name = %@", name);
        NSLog(@"completed = %@", completed);
        NSLog(@"progress = %@", ratio);

        [progress setValue:@4 forKey:@"completedLessons"];
        NSLog(@"updated progress = %@", [progress valueForKey:@"progress"]);
    }

    return 0;
}
```

观察：

```text
NSInteger 通过 KVC 读取后得到 NSNumber
NSNumber 通过 KVC 写入 NSInteger 属性时自动拆箱
readonly 计算属性仍然可以通过 valueForKey: 读取
```

---

## 练习 3：动态 Payload 映射

继续加入：

```objc
NSDictionary<NSString *, id> *payload = @{
    @"name": @"Objective-C Advanced",
    @"completedLessons": @7,
    @"totalLessons": @15,
    @"tags": @[@"objc", @"kvc", @"kvo"],
    @"serverInternalField": @"ignored"
};

[progress applyPayload:payload];
NSLog(@"after payload = %@", progress);
```

应观察到：

```text
允许字段被写入模型
serverInternalField 被白名单拦截
基础数值由 NSNumber 写入 NSInteger
```

测试 `NSNull`：

```objc
NSDictionary<NSString *, id> *nullPayload = @{
    @"name": [NSNull null],
    @"completedLessons": [NSNull null]
};

[progress applyPayload:nullPayload];

NSLog(@"name = %@", progress.name);
NSLog(@"completed = %ld", (long)progress.completedLessons);
```

结果：

```text
name = nil
completedLessons = 0
```

---

## 练习 4：创建观察器

### OCProgressObserver.h

```objc
#import <Foundation/Foundation.h>

@class OCStudyProgress;

NS_ASSUME_NONNULL_BEGIN

@interface OCProgressObserver : NSObject

- (void)startObservingProgress:(OCStudyProgress *)progress;
- (void)stopObserving;

@end

NS_ASSUME_NONNULL_END
```

### OCProgressObserver.m

```objc
#import "OCProgressObserver.h"
#import "OCStudyProgress.h"

static void *ProgressValueContext = &ProgressValueContext;
static void *ProgressNameContext = &ProgressNameContext;

@interface OCProgressObserver ()

@property (nonatomic, strong, nullable) OCStudyProgress *observedProgress;
@property (nonatomic, assign, getter=isObserving) BOOL observing;

@end

@implementation OCProgressObserver

- (void)startObservingProgress:(OCStudyProgress *)progress {
    if (self.isObserving && self.observedProgress == progress) {
        return;
    }

    [self stopObserving];

    self.observedProgress = progress;

    [progress addObserver:self
               forKeyPath:@"progress"
                  options:NSKeyValueObservingOptionOld |
                          NSKeyValueObservingOptionNew |
                          NSKeyValueObservingOptionInitial
                  context:ProgressValueContext];

    [progress addObserver:self
               forKeyPath:@"name"
                  options:NSKeyValueObservingOptionOld |
                          NSKeyValueObservingOptionNew
                  context:ProgressNameContext];

    self.observing = YES;
}

- (void)stopObserving {
    if (!self.isObserving || self.observedProgress == nil) {
        return;
    }

    [self.observedProgress removeObserver:self
                               forKeyPath:@"progress"
                                  context:ProgressValueContext];

    [self.observedProgress removeObserver:self
                               forKeyPath:@"name"
                                  context:ProgressNameContext];

    self.observing = NO;
    self.observedProgress = nil;
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context {
    if (context == ProgressValueContext) {
        NSNumber *oldValue = change[NSKeyValueChangeOldKey];
        NSNumber *newValue = change[NSKeyValueChangeNewKey];

        NSLog(@"progress changed: %@ -> %@ thread=%@",
              oldValue,
              newValue,
              [NSThread currentThread]);
        return;
    }

    if (context == ProgressNameContext) {
        id oldValue = change[NSKeyValueChangeOldKey];
        id newValue = change[NSKeyValueChangeNewKey];

        NSLog(@"name changed: %@ -> %@", oldValue, newValue);
        return;
    }

    [super observeValueForKeyPath:keyPath
                         ofObject:object
                           change:change
                          context:context];
}

- (void)dealloc {
    [self stopObserving];
}

@end
```

这里用两个 Context 区分两条观察关系：

```text
ProgressValueContext  → progress
ProgressNameContext   → name
```

不要只依赖字符串判断所有回调来源。

---

## 练习 5：运行 KVO

在 `main.m` 中加入：

```objc
#import "OCProgressObserver.h"
```

然后运行：

```objc
OCProgressObserver *observer = [[OCProgressObserver alloc] init];
[observer startObservingProgress:progress];

progress.completedLessons = 8;
progress.totalLessons = 20;
progress.name = @"Runtime Learning";

[observer stopObserving];

progress.completedLessons = 9;
```

预期：

```text
注册 progress 时因为 Initial 立即收到一次当前值
修改 completedLessons 后 progress 变化
修改 totalLessons 后 progress 再次变化
修改 name 后收到 name 变化
stopObserving 后不再收到通知
```

依赖链：

```text
completedLessons ─┐
                  ├── progress Getter 重新计算
                  └── progress KVO 通知

totalLessons ─────┘
```

---

## 练习 6：验证观察线程

```objc
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

dispatch_async(dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0), ^{
    progress.completedLessons = 10;
    dispatch_semaphore_signal(semaphore);
});

dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
```

在回调日志中观察 `NSThread`。

你会发现：

```text
后台线程修改属性
        ↓
KVO 回调也在后台线程执行
```

在 iOS 页面里更新 UI 时应切回主线程：

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    // 更新 UILabel / UIView
});
```

---

## 练习 7：KVC 集合运算符

创建多个进度模型：

```objc
OCStudyProgress *swift = [[OCStudyProgress alloc]
    initWithName:@"Swift"
    completedLessons:12
    totalLessons:12
    tags:@[@"ios", @"swift"]];

OCStudyProgress *objc = [[OCStudyProgress alloc]
    initWithName:@"Objective-C"
    completedLessons:11
    totalLessons:15
    tags:@[@"ios", @"objc"]];

OCStudyProgress *core = [[OCStudyProgress alloc]
    initWithName:@"Core Concepts"
    completedLessons:5
    totalLessons:10
    tags:@[@"ios", @"concept"]];

NSArray<OCStudyProgress *> *items = @[swift, objc, core];
```

批量提取：

```objc
NSArray<NSString *> *names = [items valueForKey:@"name"];
NSLog(@"names = %@", names);
```

统计：

```objc
NSNumber *count = [items valueForKeyPath:@"@count"];
NSNumber *average = [items valueForKeyPath:@"@avg.progress"];
NSNumber *maximum = [items valueForKeyPath:@"@max.progress"];

NSLog(@"count = %@", count);
NSLog(@"average = %@", average);
NSLog(@"maximum = %@", maximum);
```

去重投影：

```objc
NSArray<NSString *> *uniqueNames =
    [items valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

---

## 练习 8：观察未定义 Key

错误调用：

```objc
[progress setValue:@"wrong" forKey:@"courseName"];
```

默认会触发 `NSUnknownKeyException`。

练习要求：

```text
1. 不要直接在主流程中保留这段崩溃代码
2. 使用断点观察异常调用栈
3. 检查 Key 字符串和模型属性
4. 思考为什么白名单比吞掉异常更可靠
```

可选：临时重写方法用于日志实验：

```objc
- (void)setValue:(id)value forUndefinedKey:(NSString *)key {
    NSLog(@"undefined key: %@ value=%@", key, value);
}
```

实验结束后恢复严格行为，避免未知字段被静默忽略。

---

## 练习 9：观察关系切换

创建两个对象：

```objc
OCStudyProgress *first = [[OCStudyProgress alloc]
    initWithName:@"First"
    completedLessons:1
    totalLessons:10
    tags:@[]];

OCStudyProgress *second = [[OCStudyProgress alloc]
    initWithName:@"Second"
    completedLessons:2
    totalLessons:10
    tags:@[]];
```

切换观察对象：

```objc
[observer startObservingProgress:first];
first.completedLessons = 3;

[observer startObservingProgress:second];
first.completedLessons = 4;
second.completedLessons = 5;
```

预期：

```text
切换时先移除 first 的观察关系
first 后续变化不再通知
second 的变化继续通知
```

这验证了 `startObservingProgress:` 中先调用 `stopObserving` 的必要性。

---

## 进阶任务

### 任务 1：增加状态文本

添加只读属性：

```objc
@property (nonatomic, copy, readonly) NSString *statusText;
```

规则：

```text
progress == 0       未开始
0 < progress < 1    学习中
progress >= 1       已完成
```

然后声明：

```objc
+ (NSSet<NSString *> *)keyPathsForValuesAffectingStatusText;
```

让 `statusText` 依赖 `progress`，并观察它的变化。

### 任务 2：增加安全更新方法

添加：

```objc
- (void)completeNextLesson;
```

要求：

```text
completedLessons 不超过 totalLessons
统一通过 Setter 修改
确保 progress KVO 正常触发
```

### 任务 3：加入集合代理

将 `tags` 改为可变集合，并通过：

```objc
NSMutableArray *proxy = [progress mutableArrayValueForKey:@"tags"];
```

增加和删除标签，观察集合变化通知。

### 任务 4：封装观察器状态

增加断言或日志，确保：

```text
不能重复注册同一对象
没有注册时 stopObserving 不执行 remove
切换对象时旧关系先解除
```

---

## 完成标准

完成 Lab 后，你需要能回答：

```text
1. 为什么 KVC 读取 NSInteger 会得到 NSNumber？
2. Key 拼写错误会进入哪个方法？
3. NSNull 为什么不能直接写入所有属性？
4. 为什么外部 Payload 需要 Key 白名单？
5. progress 为什么会在 completedLessons 变化时通知？
6. NSKeyValueObservingOptionInitial 有什么效果？
7. Context 如何区分不同观察关系？
8. 为什么 stopObserving 必须检查注册状态？
9. 后台线程修改属性时 KVO 在哪里回调？
10. KVC 集合运算符适合处理什么统计？
```

建议重点调试以下链路：

```text
setCompletedLessons:
        ↓
依赖 Key progress
        ↓
KVO Setter 拦截与通知
        ↓
observeValueForKeyPath:
        ↓
change old / new
```

下一章进入 Runtime 后，可以继续解释 KVO 动态派生类和消息发送机制。
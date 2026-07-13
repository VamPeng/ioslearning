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

这个 Lab 可以在 Xcode 的 macOS Command Line Tool 中运行，也可以把这些类放进 iOS App 工程。

---

## 工程结构

```text
KVCKVOLab/
├── OCStudyProgress.h
├── OCStudyProgress.m
├── OCProgressObserver.h
├── OCProgressObserver.m
└── main.m
```

---

## 1. 创建学习进度模型

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

这里建立了两条关键链路：

```text
Payload
   ↓ 白名单与类型检查
setValue:forKey:
   ↓
模型属性
```

```text
completedLessons ─┐
                  ├── progress
 totalLessons ─────┘
```

`progress` 是计算属性，通过依赖 Key 声明，让它在两个基础字段变化时也产生 KVO 通知。

---

## 2. 创建观察器

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
        id oldValue = change[NSKeyValueChangeOldKey];
        id newValue = change[NSKeyValueChangeNewKey];

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

设计要点：

```text
ProgressValueContext  → progress 观察关系
ProgressNameContext   → name 观察关系
observing             → 防止重复注册或错误移除
observedProgress      → 明确当前被观察对象
```

---

## 3. 完整运行示例

### main.m

```objc
#import <Foundation/Foundation.h>
#import "OCStudyProgress.h"
#import "OCProgressObserver.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        OCStudyProgress *progress = [[OCStudyProgress alloc]
            initWithName:@"Objective-C"
            completedLessons:3
            totalLessons:10
            tags:@[@"ios", @"objc"]];

        // 1. KVC 读取
        NSString *name = [progress valueForKey:@"name"];
        NSNumber *completed = [progress valueForKey:@"completedLessons"];
        NSNumber *ratio = [progress valueForKey:@"progress"];

        NSLog(@"name = %@", name);
        NSLog(@"completed = %@", completed);
        NSLog(@"progress = %@", ratio);

        // 2. KVC 写入
        [progress setValue:@4 forKey:@"completedLessons"];
        NSLog(@"updated progress = %@", [progress valueForKey:@"progress"]);

        // 3. 动态 Payload 映射
        NSDictionary<NSString *, id> *payload = @{
            @"name": @"Objective-C Advanced",
            @"completedLessons": @7,
            @"totalLessons": @15,
            @"tags": @[@"objc", @"kvc", @"kvo"],
            @"serverInternalField": @"ignored"
        };

        [progress applyPayload:payload];
        NSLog(@"after payload = %@", progress);

        // 4. 注册观察
        OCProgressObserver *observer = [[OCProgressObserver alloc] init];
        [observer startObservingProgress:progress];

        progress.completedLessons = 8;
        progress.totalLessons = 20;
        progress.name = @"Runtime Learning";

        // 5. 移除观察并验证不再回调
        [observer stopObserving];
        progress.completedLessons = 9;

        // 6. 线程实验前重新注册
        [observer startObservingProgress:progress];

        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

        dispatch_async(dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0), ^{
            progress.completedLessons = 10;
            dispatch_semaphore_signal(semaphore);
        });

        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        [observer stopObserving];
    }

    return 0;
}
```

必须注意执行顺序：

```text
stopObserving
    ↓
线程实验前重新 startObservingProgress:
    ↓
后台线程修改属性
    ↓
后台线程收到 KVO 回调
    ↓
实验结束再次 stopObserving
```

如果在 iOS 页面更新 UI，回调中应切换主线程：

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    // 更新 UILabel / UIView
});
```

---

## 4. 验证 NSNull 与基础数值

```objc
NSDictionary<NSString *, id> *nullPayload = @{
    @"name": [NSNull null],
    @"completedLessons": [NSNull null]
};

[progress applyPayload:nullPayload];

NSLog(@"name = %@", progress.name);
NSLog(@"completed = %ld", (long)progress.completedLessons);
```

预期：

```text
name = nil
completedLessons = 0
```

调用链：

```text
NSNull
  ↓ normalize
nil
  ↓ setValue:forKey:
setNilValueForKey:
  ↓
completedLessons = 0
```

---

## 5. KVC 集合运算符

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
```

统计：

```objc
NSNumber *count = [items valueForKeyPath:@"@count"];
NSNumber *average = [items valueForKeyPath:@"@avg.progress"];
NSNumber *maximum = [items valueForKeyPath:@"@max.progress"];
```

去重投影：

```objc
NSArray<NSString *> *uniqueNames =
    [items valueForKeyPath:@"@distinctUnionOfObjects.name"];
```

---

## 6. 观察关系切换

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

[observer startObservingProgress:first];
first.completedLessons = 3;

[observer startObservingProgress:second];
first.completedLessons = 4;
second.completedLessons = 5;

[observer stopObserving];
```

预期：

```text
切换时先移除 first 的观察关系
first 后续变化不再通知
second 的变化继续通知
```

---

## 7. 未定义 Key 实验

下面的代码默认会触发 `NSUnknownKeyException`：

```objc
[progress setValue:@"wrong" forKey:@"courseName"];
```

练习方式：

```text
1. 不要把崩溃代码保留在正常主流程
2. 设置 All Objective-C Exceptions 断点
3. 观察 valueForUndefinedKey: 或 setValue:forUndefinedKey:
4. 检查 Key 拼写与模型属性
```

可临时重写用于实验：

```objc
- (void)setValue:(id)value forUndefinedKey:(NSString *)key {
    NSLog(@"undefined key: %@ value=%@", key, value);
}
```

实验结束后建议恢复严格行为，不要让未知字段被静默吞掉。

---

## 8. 进阶任务

### 任务 1：状态文本依赖

增加：

```objc
@property (nonatomic, copy, readonly) NSString *statusText;
```

规则：

```text
progress == 0       未开始
0 < progress < 1    学习中
progress >= 1       已完成
```

实现：

```objc
+ (NSSet<NSString *> *)keyPathsForValuesAffectingStatusText;
```

并观察 `statusText`。

### 任务 2：安全推进课程

增加：

```objc
- (void)completeNextLesson;
```

要求：

```text
completedLessons 不超过 totalLessons
统一通过 Setter 修改
progress KVO 正常触发
```

### 任务 3：集合代理

把标签存储改为可变集合，并通过：

```objc
NSMutableArray *proxy = [progress mutableArrayValueForKey:@"tags"];
```

增加和删除标签，观察集合变化通知。

### 任务 4：Payload 错误数据

分别传入：

```text
name = NSNumber
totalLessons = NSString
tags = NSDictionary
未知 Key
```

确认模型不会被错误类型污染。

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

建议重点调试：

```text
setCompletedLessons:
        ↓
依赖 Key progress
        ↓
KVO 通知
        ↓
observeValueForKeyPath:
        ↓
change old / new
```

下一章进入 Runtime 后，可以继续解释 KVO 的动态派生类、消息发送和方法替换机制。
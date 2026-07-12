# Objective-C Foundation Collection 与轻量泛型

## 1. 学习目标

Foundation Collection 是 Objective-C 项目中组织对象数据的核心工具。本章重点解决：

```text
1. 应该使用数组、字典还是集合？
2. 不可变集合和可变集合有什么区别？
3. 轻量泛型能提供什么类型信息，又不能保证什么？
```

学完以后，你应该能正确使用：

```text
NSArray / NSMutableArray
NSDictionary / NSMutableDictionary
NSSet / NSMutableSet
NSOrderedSet / NSMutableOrderedSet
轻量泛型
遍历、排序、过滤、复制
nil / NSNull
```

一句话：

```text
Foundation Collection = 使用不同数据结构组织对象。
轻量泛型 = 为编译器、调用者和 Swift 补充元素类型信息。
```

---

## 2. 集合保存对象

Foundation 集合直接保存 Objective-C 对象：

```objc
NSArray *values = @[
    @"Yuhui",
    @18,
    [NSDate date]
];
```

基础数值需要包装为 `NSNumber`：

```objc
NSInteger age = 18;
BOOL enabled = YES;

NSArray *values = @[
    @(age),
    @(enabled)
];
```

结构体通常使用 `NSValue`：

```objc
NSRange range = NSMakeRange(2, 5);
NSValue *value = [NSValue valueWithRange:range];
NSArray<NSValue *> *ranges = @[value];
```

```text
NSInteger / BOOL / double     基础值
NSNumber                      数值对象包装
NSRange / CGPoint             结构体值
NSValue                       通用值包装
```

---

## 3. NSArray：有序、可重复、不可变

```objc
NSArray<NSString *> *names = @[
    @"Alice",
    @"Bob",
    @"Alice"
];
```

特点：

```text
有顺序
允许重复
支持下标访问
创建后不能增删元素
```

常用访问：

```objc
NSString *first = names.firstObject;
NSString *last = names.lastObject;
NSString *second = names[1];
NSUInteger count = names.count;
BOOL contains = [names containsObject:@"Bob"];
NSUInteger index = [names indexOfObject:@"Bob"];
```

数组下标越界会产生运行时异常：

```objc
NSString *value = names[10];
```

安全访问：

```objc
NSUInteger index = 10;
if (index < names.count) {
    NSString *value = names[index];
    NSLog(@"%@", value);
}
```

---

## 4. NSArray 创建方式

字面量：

```objc
NSArray<NSString *> *names = @[@"Alice", @"Bob"];
```

工厂方法：

```objc
NSArray<NSString *> *names = [NSArray arrayWithObjects:@"Alice", @"Bob", nil];
```

旧式 `arrayWithObjects:` 使用 `nil` 作为结束标记：

```objc
NSString *nickname = nil;
NSArray *values = [NSArray arrayWithObjects:@"Alice", nickname, @"Bob", nil];
```

这里会在 `nickname` 处结束，后面的 `Bob` 不会进入数组。新代码优先使用字面量，并显式处理空值。

---

## 5. NSMutableArray：可变有序集合

```objc
NSMutableArray<NSString *> *names = [NSMutableArray array];

[names addObject:@"Alice"];
[names addObject:@"Bob"];
[names insertObject:@"Carol" atIndex:1];
names[0] = @"Updated";
[names removeObject:@"Bob"];
[names removeObjectAtIndex:0];
[names addObjectsFromArray:@[@"David", @"Eve"]];
[names removeAllObjects];
```

```text
NSArray           集合结构不可修改
NSMutableArray    可以增删、插入、替换和清空
```

不可变数组只保证集合结构不可变，不保证其中元素的内部状态不可变。

---

## 6. 不可变集合不等于元素不可变

```objc
NSMutableString *name = [NSMutableString stringWithString:@"Alice"];
NSArray<NSMutableString *> *names = @[name];

[name appendString:@" changed"];
NSLog(@"%@", names.firstObject);
```

`NSArray` 不能增删元素，但它持有的 `NSMutableString` 仍然可以变化。

---

## 7. NSDictionary：Key-Value 映射

```objc
NSDictionary<NSString *, id> *user = @{
    @"name": @"Yuhui",
    @"age": @18,
    @"enabled": @YES
};
```

读取：

```objc
NSString *name = user[@"name"];
NSNumber *age = user[@"age"];
id missing = user[@"missing"]; // nil
```

```objc
NSUInteger count = user.count;
NSArray *keys = user.allKeys;
NSArray *values = user.allValues;
```

重要区别：

```text
字典找不到 Key       返回 nil
数组下标越界          通常抛出异常
```

---

## 8. 字典 Key 的约束

字典 Key 必须符合 `NSCopying`。常见 Key：

```text
NSString
NSNumber
NSDate
```

```objc
NSDictionary<NSString *, NSString *> *headers = @{
    @"Content-Type": @"application/json",
    @"Accept": @"application/json"
};
```

自定义对象作为 Key 时，需要正确实现：

```text
NSCopying
isEqual:
hash
```

普通业务代码优先使用稳定、不可变的字符串或数字作为 Key。

---

## 9. NSMutableDictionary

```objc
NSMutableDictionary<NSString *, id> *user = [NSMutableDictionary dictionary];

user[@"name"] = @"Yuhui";
user[@"age"] = @18;
[user setObject:@YES forKey:@"enabled"];

user[@"name"] = @"Updated";
[user removeObjectForKey:@"enabled"];
[user removeAllObjects];
```

使用下标赋值 `nil` 会删除 Key：

```objc
user[@"nickname"] = nil;
```

需要表达“Key 存在，但值为空”时使用：

```objc
user[@"nickname"] = [NSNull null];
```

---

## 10. nil 与 NSNull

集合不能直接保存 `nil`：

```objc
NSString *nickname = nil;
NSArray *values = @[@"Alice", nickname]; // 运行时异常
```

使用 `NSNull` 占位：

```objc
NSArray *values = @[
    @"Alice",
    nickname ?: [NSNull null]
];
```

读取：

```objc
id value = values[1];
if (value == [NSNull null]) {
    NSLog(@"empty value");
}
```

```text
nil        没有对象
NSNull     一个真实存在的空值占位对象
```

---

## 11. NSSet：无序、唯一集合

```objc
NSSet<NSString *> *tags = [NSSet setWithArray:@[
    @"ios",
    @"swift",
    @"ios"
]];
```

最终只保留两个不同元素。

```objc
NSUInteger count = tags.count;
BOOL contains = [tags containsObject:@"ios"];
NSArray<NSString *> *array = tags.allObjects;
```

集合关系：

```objc
NSSet<NSString *> *a = [NSSet setWithArray:@[@"ios", @"swift"]];
NSSet<NSString *> *b = [NSSet setWithArray:@[@"swift", @"objc"]];

BOOL intersects = [a intersectsSet:b];
BOOL subset = [a isSubsetOfSet:b];
```

---

## 12. NSMutableSet 与集合运算

```objc
NSMutableSet<NSString *> *tags = [NSMutableSet set];
[tags addObject:@"ios"];
[tags addObject:@"swift"];
[tags addObject:@"ios"];
[tags removeObject:@"swift"];
```

并集：

```objc
NSMutableSet *unionResult = [a mutableCopy];
[unionResult unionSet:b];
```

交集：

```objc
NSMutableSet *intersection = [a mutableCopy];
[intersection intersectSet:b];
```

差集：

```objc
NSMutableSet *difference = [a mutableCopy];
[difference minusSet:b];
```

---

## 13. NSOrderedSet：有序且唯一

```objc
NSOrderedSet<NSString *> *items = [NSOrderedSet orderedSetWithArray:@[
    @"A",
    @"B",
    @"A"
]];
```

结果是 `A, B`。

```objc
NSString *first = items.firstObject;
NSString *second = items[1];
NSUInteger index = [items indexOfObject:@"B"];
```

动态修改使用 `NSMutableOrderedSet`。

---

## 14. 集合选择

| 需求 | 推荐类型 |
|---|---|
| 有序列表，允许重复 | `NSArray` |
| 动态增删的有序列表 | `NSMutableArray` |
| Key-Value 查询 | `NSDictionary` |
| 动态修改 Key-Value | `NSMutableDictionary` |
| 唯一成员集合 | `NSSet` |
| 动态唯一集合 | `NSMutableSet` |
| 有序且唯一 | `NSOrderedSet` |

```text
是否通过 Key 查询？
├── 是：NSDictionary
└── 否
    ↓
是否要求元素唯一？
├── 是
│   ├── 需要顺序：NSOrderedSet
│   └── 不需要顺序：NSSet
└── 否：NSArray
```

---

## 15. 快速遍历

数组：

```objc
for (NSString *name in names) {
    NSLog(@"%@", name);
}
```

字典：

```objc
for (NSString *key in user) {
    id value = user[key];
    NSLog(@"%@ = %@", key, value);
}
```

带下标和停止条件：

```objc
[names enumerateObjectsUsingBlock:^(NSString *name, NSUInteger index, BOOL *stop) {
    NSLog(@"%lu: %@", (unsigned long)index, name);

    if ([name isEqualToString:@"Bob"]) {
        *stop = YES;
    }
}];
```

---

## 16. 遍历过程中不要修改原集合

错误：

```objc
for (NSString *name in names) {
    if (name.length == 0) {
        [names removeObject:name];
    }
}
```

可能触发：

```text
Collection was mutated while being enumerated
```

方式一：先收集待删除元素：

```objc
NSMutableArray<NSString *> *invalid = [NSMutableArray array];

for (NSString *name in names) {
    if (name.length == 0) {
        [invalid addObject:name];
    }
}

[names removeObjectsInArray:invalid];
```

方式二：反向按下标删除：

```objc
for (NSInteger index = (NSInteger)names.count - 1; index >= 0; index--) {
    NSString *name = names[(NSUInteger)index];
    if (name.length == 0) {
        [names removeObjectAtIndex:(NSUInteger)index];
    }
}
```

必须在减一之前把 `count` 转为有符号整数，避免空数组时发生无符号下溢。

---

## 17. 排序

字符串排序：

```objc
NSArray<NSString *> *sorted = [names sortedArrayUsingSelector:@selector(compare:)];
```

数字排序：

```objc
NSArray<NSNumber *> *numbers = @[@3, @1, @2];
NSArray<NSNumber *> *sorted = [numbers sortedArrayUsingComparator:^NSComparisonResult(
    NSNumber *left,
    NSNumber *right
) {
    return [left compare:right];
}];
```

对象排序：

```objc
NSArray<OCUser *> *sortedUsers = [users sortedArrayUsingComparator:^NSComparisonResult(
    OCUser *left,
    OCUser *right
) {
    return [left.name compare:right.name];
}];
```

排序方法返回新数组，原数组不变。

---

## 18. 过滤与查找

`NSPredicate` 的 Block 接口接收 `id`，在 Block 内执行类型检查或转换：

```objc
NSArray<NSNumber *> *numbers = @[@1, @2, @3, @4];
NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(
    id object,
    NSDictionary<NSString *, id> *bindings
) {
    if (![object isKindOfClass:[NSNumber class]]) {
        return NO;
    }

    NSNumber *value = object;
    return value.integerValue % 2 == 0;
}];

NSArray<NSNumber *> *evenNumbers = [numbers filteredArrayUsingPredicate:predicate];
```

查找：

```objc
NSUInteger index = [names indexOfObject:@"Bob"];
if (index != NSNotFound) {
    NSLog(@"found at %lu", (unsigned long)index);
}
```

```objc
NSUInteger index = [names indexOfObjectPassingTest:^BOOL(
    NSString *name,
    NSUInteger index,
    BOOL *stop
) {
    return [name hasPrefix:@"A"];
}];
```

---

## 19. copy 与 mutableCopy

```objc
NSArray *source = @[@"A", @"B"];
NSArray *copied = [source copy];
NSMutableArray *mutable = [source mutableCopy];
```

可变集合转不可变快照：

```objc
NSMutableArray *source = [NSMutableArray arrayWithObject:@"A"];
NSArray *snapshot = [source copy];
```

```text
copy          通常得到不可变集合
mutableCopy   通常得到可变集合
```

集合复制默认通常是浅复制：

```objc
NSMutableString *name = [NSMutableString stringWithString:@"Alice"];
NSArray *source = @[name];
NSArray *copied = [source copy];

[name appendString:@" changed"];
NSLog(@"%@", copied.firstObject);
```

新集合仍然引用原来的元素对象。

---

## 20. 集合属性的内存语义

不可变集合属性通常使用 `copy`：

```objc
@property (nonatomic, copy) NSArray<OCUser *> *users;
@property (nonatomic, copy) NSDictionary<NSString *, OCUser *> *userMap;
```

这样可以阻止外部传入的可变集合继续改变内部集合结构。

需要内部修改时：

```objc
@property (nonatomic, strong) NSMutableArray<OCUser *> *mutableUsers;
```

推荐边界：

```text
内部维护 NSMutableArray
对外暴露 NSArray 快照
通过方法控制增删操作
```

---

## 21. 轻量泛型

没有类型标注：

```objc
NSArray *users;
NSDictionary *userMap;
```

加入轻量泛型：

```objc
NSArray<OCUser *> *users;
NSDictionary<NSString *, OCUser *> *userMap;
NSSet<NSString *> *tags;
```

作用：

```text
编译器提供更准确的类型检查和补全
头文件直接表达元素类型
Swift 桥接得到更准确的集合类型
```

Swift 侧通常类似：

```swift
let users: [OCUser]
let userMap: [String: OCUser]
let tags: Set<String>
```

---

## 22. 轻量泛型的限制

```objc
NSMutableArray<NSString *> *names = [NSMutableArray array];
[names addObject:@"Alice"];
[names addObject:@18]; // 通常产生类型警告
```

轻量泛型主要是编译期标注。通过弱类型 API、强制转换、旧代码或运行时动态调用，仍可能进入错误类型。

```text
轻量泛型提高安全性和可读性
但不能替代运行时输入校验
```

外部 JSON、第三方 SDK 和旧代码边界必须检查真实对象类型。

---

## 23. 动态字典安全读取

```objc
NSDictionary<NSString *, id> *payload = @{
    @"name": @"Yuhui",
    @"age": @18,
    @"nickname": [NSNull null]
};
```

```objc
id rawName = payload[@"name"];
if ([rawName isKindOfClass:[NSString class]]) {
    NSString *name = rawName;
    NSLog(@"%@", name);
}
```

```objc
id rawNickname = payload[@"nickname"];
if (rawNickname != nil &&
    rawNickname != [NSNull null] &&
    [rawNickname isKindOfClass:[NSString class]]) {
    NSString *nickname = rawNickname;
    NSLog(@"%@", nickname);
}
```

```text
内部强类型模型      使用明确轻量泛型
JSON / 动态字典     使用 id，并执行类型检查
```

---

## 24. 自定义轻量泛型类

```objc
@interface OCBox<ObjectType> : NSObject

@property (nonatomic, strong) ObjectType value;

- (instancetype)initWithValue:(ObjectType)value;

@end
```

使用：

```objc
OCBox<NSString *> *nameBox = [[OCBox alloc] initWithValue:@"Yuhui"];
NSString *name = nameBox.value;

OCBox<NSNumber *> *ageBox = [[OCBox alloc] initWithValue:@18];
NSNumber *age = ageBox.value;
```

轻量泛型主要帮助公开接口表达；Objective-C 运行时仍然基于动态对象模型。

---

## 25. 与 Swift / Java 对照

| Objective-C | Swift | Java / Android |
|---|---|---|
| `NSArray<T *> *` | `[T]` | `List<T>` |
| `NSMutableArray<T *> *` | 可变变量中的 `Array` | `ArrayList<T>` |
| `NSDictionary<K, V> *` | `[K: V]` | `Map<K, V>` |
| `NSMutableDictionary<K, V> *` | 可变 `Dictionary` | `HashMap<K, V>` |
| `NSSet<T *> *` | `Set<T>` | `Set<T>` |
| `NSOrderedSet<T *> *` | 无直接标准对应 | 部分接近 `LinkedHashSet<T>` |
| `id` | `Any` | `Object` |
| `NSNull` | `NSNull` | JSON null 占位对象 |

概念可对照，但底层实现和完整语义不一定相同。

---

## 26. 常见错误

### 错误 1：集合字面量中出现 nil

```objc
NSString *nickname = nil;
NSArray *values = @[@"Alice", nickname];
```

修正：

```objc
NSArray *values = @[@"Alice", nickname ?: [NSNull null]];
```

### 错误 2：数组下标越界

```objc
id value = values[values.count];
```

最大有效下标是 `count - 1`。

### 错误 3：遍历时修改集合

不要在快速遍历过程中直接增删原集合。

### 错误 4：把动态字典当成固定模型

```objc
NSString *age = payload[@"age"];
```

真实值可能是 `NSNumber`、`NSNull` 或其他类型。

### 错误 5：认为 copy 会深复制元素

```text
集合 copy 通常只复制容器
内部元素对象仍可能共享
```

### 错误 6：把轻量泛型当成运行时强约束

外部动态数据仍需检查 `isKindOfClass:`。

---

## 27. 阅读项目代码的检查顺序

```text
1. 是 NSArray、NSDictionary 还是 NSSet？
2. 是不可变还是 NSMutable 可变版本？
3. 是否声明了轻量泛型？
4. 属性使用 copy 还是 strong？
5. 集合来自内部模型还是外部 JSON？
6. 是否可能包含 NSNull？
7. 遍历时是否同时修改集合？
8. 是否错误地用字典长期代替业务模型？
```

---

## 28. 最低掌握标准

```text
1. NSArray、NSDictionary、NSSet 分别适合什么场景？
2. NSArray 和 NSMutableArray 的区别是什么？
3. Foundation Collection 为什么不能直接保存 nil？
4. nil 和 NSNull 有什么区别？
5. 为什么遍历 NSMutableArray 时不能直接删除元素？
6. copy 和 mutableCopy 分别得到什么集合？
7. 集合 copy 为什么通常不是深复制？
8. NSArray<OCUser *> 的泛型标注有什么作用？
9. 轻量泛型为什么不能替代运行时检查？
10. JSON 字典中的 id 数据如何安全读取？
```

完成标准：

```text
能为业务数据选择正确集合类型
能处理可变集合、nil、NSNull 和越界
能用轻量泛型表达集合元素类型
能识别外部动态数据中的类型风险
```

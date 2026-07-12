# Objective-C Foundation Collection 与轻量泛型

## 1. 学习目标

Foundation Collection 是 Objective-C 项目中组织对象数据的核心工具。本章重点解决三个问题：

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
集合遍历、过滤、排序和复制
nil / NSNull 在集合中的处理
```

一句话：

```text
Foundation Collection = 用不同的数据结构组织对象；轻量泛型 = 给编译器和 Swift 补充元素类型信息。
```

---

## 2. 集合只能直接保存对象

Foundation 集合保存的是 Objective-C 对象：

```objc
NSArray *values = @[
    @"Yuhui",
    @18,
    [NSDate date]
];
```

基础值需要先包装成对象：

```objc
NSInteger age = 18;
BOOL enabled = YES;

NSArray *values = @[
    @(age),
    @(enabled)
];
```

结构体通常使用 `NSValue` 包装：

```objc
NSRange range = NSMakeRange(2, 5);
NSValue *value = [NSValue valueWithRange:range];
NSArray *ranges = @[value];
```

统一理解：

```text
NSInteger / BOOL / double     基础值
NSNumber                      数值对象包装
NSRange / CGPoint             结构体值
NSValue                       通用值包装
```

---

## 3. NSArray：有序、可重复、不可变

`NSArray` 适合表示一个有顺序的对象列表：

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
允许重复元素
通过下标访问
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

注意下标越界：

```objc
NSString *value = names[10]; // 运行时异常
```

安全访问通常先判断：

```objc
NSUInteger index = 10;
if (index < names.count) {
    NSString *value = names[index];
    NSLog(@"%@", value);
}
```

---

## 4. NSArray 常用创建方式

字面量：

```objc
NSArray<NSString *> *names = @[@"Alice", @"Bob"];
```

工厂方法：

```objc
NSArray<NSString *> *names = [NSArray arrayWithObjects:@"Alice", @"Bob", nil];
```

从另一个数组创建：

```objc
NSArray<NSString *> *copy = [NSArray arrayWithArray:names];
```

注意旧式 `arrayWithObjects:` 使用 `nil` 作为参数结束标记：

```objc
NSString *nickname = nil;
NSArray *values = [NSArray arrayWithObjects:@"Alice", nickname, @"Bob", nil];
```

最终数组只有 `Alice`，因为遇到 `nil` 后参数列表提前结束。

因此新代码优先使用数组字面量，并在数据可能为空时显式处理。

---

## 5. NSMutableArray：可变有序集合

需要动态增删元素时使用 `NSMutableArray`：

```objc
NSMutableArray<NSString *> *names = [NSMutableArray array];

[names addObject:@"Alice"];
[names addObject:@"Bob"];
[names insertObject:@"Carol" atIndex:1];
[names removeObject:@"Bob"];
[names removeObjectAtIndex:0];
```

替换元素：

```objc
names[0] = @"Updated";
```

批量追加：

```objc
[names addObjectsFromArray:@[@"David", @"Eve"]];
```

清空：

```objc
[names removeAllObjects];
```

区别：

```text
NSArray           创建后集合结构不可修改
NSMutableArray    可以增删、插入、替换和清空
```

这里的“不可变”指的是集合结构不可变，不代表数组内部对象的状态一定不可变。

---

## 6. 不可变集合不等于元素不可变

例如：

```objc
NSMutableString *name = [NSMutableString stringWithString:@"Alice"];
NSArray<NSMutableString *> *names = @[name];

[name appendString:@" changed"];
NSLog(@"%@", names.firstObject);
```

虽然 `names` 是不可变数组，但它保存的对象仍然可以被修改。

统一理解：

```text
NSArray 不可变
    ↓
不能改变数组的元素数量和位置
    ↓
但数组持有的可变对象仍然可能改变内部状态
```

---

## 7. NSDictionary：Key-Value 映射

`NSDictionary` 适合通过唯一 Key 查找 Value：

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
id missing = user[@"missing"]; // 返回 nil
```

常用属性：

```objc
NSUInteger count = user.count;
NSArray *keys = user.allKeys;
NSArray *values = user.allValues;
```

判断 Key 是否存在：

```objc
id value = user[@"nickname"];
if (value != nil) {
    NSLog(@"%@", value);
}
```

注意：

```text
字典查不到 Key 时返回 nil。
数组下标越界时通常直接抛出异常。
```

---

## 8. NSDictionary 的 Key 约束

字典 Key 必须符合 `NSCopying` 协议。最常见的 Key 类型是：

```text
NSString
NSNumber
NSDate
```

字符串 Key 最常用：

```objc
NSDictionary<NSString *, NSString *> *headers = @{
    @"Content-Type": @"application/json",
    @"Accept": @"application/json"
};
```

字典创建时会复制 Key，因此自定义对象作为 Key 时，必须正确实现 `NSCopying`，同时还要正确实现 `isEqual:` 和 `hash`。

普通业务代码中，优先使用稳定、不可变的字符串或数字作为 Key。

---

## 9. NSMutableDictionary：可变键值映射

```objc
NSMutableDictionary<NSString *, id> *user = [NSMutableDictionary dictionary];

user[@"name"] = @"Yuhui";
user[@"age"] = @18;
[user setObject:@YES forKey:@"enabled"];
```

修改和删除：

```objc
user[@"name"] = @"Updated";
[user removeObjectForKey:@"enabled"];
[user removeAllObjects];
```

特殊行为：

```objc
user[@"nickname"] = nil;
```

对可变字典使用下标语法赋值 `nil`，等价于删除这个 Key，而不是保存空值。

需要表达“Key 存在，但值为空”时使用：

```objc
user[@"nickname"] = [NSNull null];
```

---

## 10. nil 与 NSNull

Foundation Collection 不能直接保存 `nil`：

```objc
NSString *nickname = nil;
NSArray *values = @[@"Alice", nickname]; // 运行时异常
```

因为 `nil` 表示“没有对象”，无法作为一个真实元素存进集合。

需要保存空值占位时使用：

```objc
NSArray *values = @[
    @"Alice",
    [NSNull null]
];
```

读取时判断：

```objc
id value = values[1];
if (value == [NSNull null]) {
    NSLog(@"empty value");
}
```

统一理解：

```text
nil        没有对象
NSNull     一个真实存在的空值占位对象
```

---

## 11. NSSet：无序、唯一集合

`NSSet` 适合表达“不重复成员集合”：

```objc
NSSet<NSString *> *tags = [NSSet setWithArray:@[
    @"ios",
    @"swift",
    @"ios"
]];
```

最终只保留两个不同元素。

常用操作：

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

选择原则：

```text
需要顺序、允许重复      NSArray
通过 Key 查 Value       NSDictionary
只关心唯一成员          NSSet
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
NSMutableSet *result = [a mutableCopy];
[result unionSet:b];
```

交集：

```objc
NSMutableSet *result = [a mutableCopy];
[result intersectSet:b];
```

差集：

```objc
NSMutableSet *result = [a mutableCopy];
[result minusSet:b];
```

---

## 13. NSOrderedSet：有序且唯一

当你既需要顺序，又要求元素唯一时，可以使用 `NSOrderedSet`：

```objc
NSOrderedSet<NSString *> *items = [NSOrderedSet orderedSetWithArray:@[
    @"A",
    @"B",
    @"A"
]];
```

结果保持：

```text
A, B
```

常用访问：

```objc
NSString *first = items.firstObject;
NSString *second = items[1];
NSUInteger index = [items indexOfObject:@"B"];
```

动态修改使用 `NSMutableOrderedSet`。

它不如 `NSArray`、`NSDictionary`、`NSSet` 常见，但在“有序去重”场景中很合适。

---

## 14. 集合快速遍历

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

集合：

```objc
for (NSString *tag in tags) {
    NSLog(@"%@", tag);
}
```

需要下标时：

```objc
[names enumerateObjectsUsingBlock:^(NSString *name, NSUInteger index, BOOL *stop) {
    NSLog(@"%lu: %@", (unsigned long)index, name);

    if ([name isEqualToString:@"Bob"]) {
        *stop = YES;
    }
}];
```

字典 Block 遍历：

```objc
[user enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    NSLog(@"%@ = %@", key, value);
}];
```

---

## 15. 遍历过程中不要直接修改集合

错误示例：

```objc
NSMutableArray<NSString *> *names = [NSMutableArray arrayWithArray:@[
    @"Alice",
    @"",
    @"Bob"
]];

for (NSString *name in names) {
    if (name.length == 0) {
        [names removeObject:name];
    }
}
```

这可能触发：

```text
Collection was mutated while being enumerated
```

安全方式一：先记录待删除对象：

```objc
NSMutableArray<NSString *> *invalid = [NSMutableArray array];

for (NSString *name in names) {
    if (name.length == 0) {
        [invalid addObject:name];
    }
}

[names removeObjectsInArray:invalid];
```

安全方式二：反向按下标删除：

```objc
for (NSInteger index = names.count - 1; index >= 0; index--) {
    NSString *name = names[(NSUInteger)index];
    if (name.length == 0) {
        [names removeObjectAtIndex:(NSUInteger)index];
    }
}
```

---

## 16. 排序

字符串数组排序：

```objc
NSArray<NSString *> *sorted = [names sortedArrayUsingSelector:@selector(compare:)];
```

使用 Comparator：

```objc
NSArray<NSNumber *> *numbers = @[@3, @1, @2];

NSArray<NSNumber *> *sorted = [numbers sortedArrayUsingComparator:^NSComparisonResult(
    NSNumber *left,
    NSNumber *right
) {
    return [left compare:right];
}];
```

对象数组排序：

```objc
NSArray<OCUser *> *sortedUsers = [users sortedArrayUsingComparator:^NSComparisonResult(
    OCUser *left,
    OCUser *right
) {
    return [left.name compare:right.name];
}];
```

原数组不会改变，排序方法返回新数组。

---

## 17. 过滤与查找

使用 `NSPredicate` 过滤：

```objc
NSArray<NSNumber *> *numbers = @[@1, @2, @3, @4];
NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(
    NSNumber *value,
    NSDictionary *bindings
) {
    return value.integerValue % 2 == 0;
}];

NSArray<NSNumber *> *evenNumbers = [numbers filteredArrayUsingPredicate:predicate];
```

查找对象下标：

```objc
NSUInteger index = [names indexOfObject:@"Bob"];
if (index != NSNotFound) {
    NSLog(@"found at %lu", (unsigned long)index);
}
```

根据条件查找：

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

## 18. copy 与 mutableCopy

不可变数组复制：

```objc
NSArray *source = @[@"A", @"B"];
NSArray *copied = [source copy];
```

获得可变副本：

```objc
NSMutableArray *mutable = [source mutableCopy];
[mutable addObject:@"C"];
```

可变集合转不可变：

```objc
NSMutableArray *mutable = [NSMutableArray arrayWithObject:@"A"];
NSArray *snapshot = [mutable copy];
```

常见理解：

```text
copy          通常得到不可变集合
mutableCopy   通常得到可变集合
```

但集合复制默认通常是浅复制：

```text
新集合对象
    ↓
仍然引用原来的元素对象
```

示例：

```objc
NSMutableString *name = [NSMutableString stringWithString:@"Alice"];
NSArray *source = @[name];
NSArray *copied = [source copy];

[name appendString:@" changed"];
NSLog(@"%@", copied.firstObject);
```

复制集合不等于深复制每个元素。

---

## 19. 集合属性的内存语义

常见不可变集合属性：

```objc
@property (nonatomic, copy) NSArray<OCUser *> *users;
@property (nonatomic, copy) NSDictionary<NSString *, OCUser *> *userMap;
```

这样可以避免外部传入可变集合后继续修改集合结构：

```objc
NSMutableArray *source = [NSMutableArray arrayWithObject:user];
controller.users = source;
[source removeAllObjects];
```

如果属性是 `copy`，内部数组结构不会受外部后续修改影响。

需要暴露可变集合时：

```objc
@property (nonatomic, strong) NSMutableArray<OCUser *> *mutableUsers;
```

但公开可变集合会增加状态管理难度。更稳妥的方式通常是：

```text
内部维护 NSMutableArray
对外暴露 NSArray 快照
通过方法控制增删操作
```

---

## 20. 轻量泛型

没有泛型标注：

```objc
NSArray *users;
NSDictionary *userMap;
```

编译器只知道它们是集合，不知道内部元素类型。

加入轻量泛型：

```objc
NSArray<OCUser *> *users;
NSDictionary<NSString *, OCUser *> *userMap;
NSSet<NSString *> *tags;
```

好处：

```text
1. 编译器能够提供更准确的类型检查和补全
2. 阅读接口时可以直接知道元素类型
3. Swift 调用 Objective-C 时能获得更精确的桥接类型
```

Swift 侧通常会获得类似：

```swift
let users: [OCUser]
let userMap: [String: OCUser]
let tags: Set<String>
```

---

## 21. 轻量泛型不是完整运行时类型约束

下面声明了字符串数组：

```objc
NSMutableArray<NSString *> *names = [NSMutableArray array];
```

正常添加：

```objc
[names addObject:@"Alice"];
```

添加错误类型通常会出现编译器警告：

```objc
[names addObject:@18];
```

但 Objective-C 的轻量泛型主要是编译期标注，不像 Java 泛型或 Swift 泛型那样提供完整、强约束的类型系统能力。

通过弱类型 API、强制转换或运行时动态调用，仍可能把错误类型放进集合。

因此：

```text
轻量泛型提高安全性和可读性
但不能替代运行时输入校验
```

网络 JSON、第三方 SDK 和旧代码边界仍然要检查真实对象类型。

---

## 22. id、泛型与运行时检查

异构字典经常声明为：

```objc
NSDictionary<NSString *, id> *payload = @{
    @"name": @"Yuhui",
    @"age": @18,
    @"tags": @[@"ios", @"swift"]
};
```

读取后应根据真实类型判断：

```objc
id rawName = payload[@"name"];

if ([rawName isKindOfClass:[NSString class]]) {
    NSString *name = rawName;
    NSLog(@"%@", name);
}
```

处理 `NSNull`：

```objc
id rawNickname = payload[@"nickname"];

if (rawNickname != nil && rawNickname != [NSNull null]) {
    if ([rawNickname isKindOfClass:[NSString class]]) {
        NSString *nickname = rawNickname;
        NSLog(@"%@", nickname);
    }
}
```

常见边界：

```text
自己维护的强类型模型          使用明确轻量泛型
JSON / 动态字典              使用 id，并执行类型检查
```

---

## 23. 自定义轻量泛型类

Objective-C 也可以为自定义类声明轻量泛型：

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

实现文件通常写成：

```objc
@implementation OCBox

- (instancetype)initWithValue:(id)value {
    self = [super init];
    if (self) {
        _value = value;
    }
    return self;
}

@end
```

这里再次体现：泛型主要帮助头文件接口表达，运行时实现仍然基于 Objective-C 动态对象模型。

---

## 24. 常见集合选择

| 需求 | 推荐类型 |
|---|---|
| 有序列表，允许重复 | `NSArray` |
| 动态增删的有序列表 | `NSMutableArray` |
| Key-Value 查询 | `NSDictionary` |
| 动态修改 Key-Value | `NSMutableDictionary` |
| 唯一成员集合 | `NSSet` |
| 动态唯一集合 | `NSMutableSet` |
| 有序且唯一 | `NSOrderedSet` |

判断顺序：

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

## 25. 与 Swift / Java 对照

| Objective-C | Swift | Java / Android |
|---|---|---|
| `NSArray<T *> *` | `[T]` | `List<T>` |
| `NSMutableArray<T *> *` | `Array` 的可变变量 | `ArrayList<T>` |
| `NSDictionary<K, V> *` | `[K: V]` | `Map<K, V>` |
| `NSMutableDictionary<K, V> *` | 可变 `Dictionary` | `HashMap<K, V>` |
| `NSSet<T *> *` | `Set<T>` | `Set<T>` |
| `NSOrderedSet<T *> *` | 无直接标准对应 | `LinkedHashSet<T>` 的部分语义 |
| `id` | `Any` | `Object` |
| `NSNull` | `NSNull` | JSON null 占位对象 |

注意：这些对照用于建立概念映射，不代表底层实现和语义完全相同。

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

有效最大下标是：

```text
count - 1
```

### 错误 3：遍历时修改集合

```objc
for (id value in mutableValues) {
    [mutableValues removeObject:value];
}
```

应先收集待删除项，或反向按下标删除。

### 错误 4：把 NSDictionary 当成固定类型模型

```objc
NSString *age = payload[@"age"];
```

真实值可能是 `NSNumber`、`NSNull` 或其他类型。动态数据边界必须检查类型。

### 错误 5：认为 copy 会深复制元素

```text
集合 copy 通常只复制集合容器
内部元素对象仍可能共享
```

### 错误 6：把轻量泛型当成运行时强约束

```text
NSArray<NSString *> 主要提供编译期类型信息
运行时仍需防御外部脏数据
```

---

## 27. 阅读项目代码的检查顺序

看到一个集合属性时，按下面顺序判断：

```text
1. 是 NSArray、NSDictionary 还是 NSSet？
2. 是不可变还是 NSMutable 可变版本？
3. 是否声明了轻量泛型？
4. 属性使用 copy 还是 strong？
5. 集合来源是内部构造还是外部 JSON？
6. 元素是否可能包含 NSNull？
7. 遍历时是否可能同时修改集合？
8. 是否错误地依赖字典代替业务模型？
```

---

## 28. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. NSArray、NSDictionary、NSSet 分别适合什么场景？
2. NSArray 和 NSMutableArray 的核心区别是什么？
3. Foundation Collection 为什么不能直接保存 nil？
4. nil 和 NSNull 有什么区别？
5. 为什么遍历 NSMutableArray 时不能直接删除元素？
6. copy 和 mutableCopy 分别得到什么集合？
7. 集合 copy 为什么通常不是深复制？
8. NSArray<OCUser *> 的泛型标注有什么作用？
9. 轻量泛型为什么不能完全替代运行时检查？
10. JSON 字典中的 id 数据应该如何安全读取？
```

完成标准：

```text
能为业务数据选择正确集合类型
能正确处理可变集合、nil、NSNull 和越界问题
能用轻量泛型表达集合元素类型
能识别外部动态数据中的类型风险
```

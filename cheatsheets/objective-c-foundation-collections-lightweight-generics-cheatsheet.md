# Objective-C Foundation Collection 与轻量泛型速查

## 1. 类型选择

| 需求 | 类型 |
|---|---|
| 有序、允许重复 | `NSArray` |
| 可增删的有序列表 | `NSMutableArray` |
| Key-Value 查询 | `NSDictionary` |
| 可修改的 Key-Value | `NSMutableDictionary` |
| 唯一成员 | `NSSet` |
| 可修改的唯一成员 | `NSMutableSet` |
| 有序且唯一 | `NSOrderedSet` |

## 2. NSArray

```objc
NSArray<NSString *> *names = @[@"Alice", @"Bob"];

NSString *first = names.firstObject;
NSString *second = names[1];
NSUInteger count = names.count;
BOOL contains = [names containsObject:@"Bob"];
NSUInteger index = [names indexOfObject:@"Bob"];
```

安全下标：

```objc
if (index < names.count) {
    NSString *value = names[index];
}
```

## 3. NSMutableArray

```objc
NSMutableArray<NSString *> *names = [NSMutableArray array];

[names addObject:@"Alice"];
[names insertObject:@"Bob" atIndex:0];
names[0] = @"Updated";
[names removeObject:@"Alice"];
[names removeObjectAtIndex:0];
[names removeAllObjects];
```

## 4. NSDictionary

```objc
NSDictionary<NSString *, id> *user = @{
    @"name": @"Yuhui",
    @"age": @18
};

NSString *name = user[@"name"];
id missing = user[@"missing"]; // nil
```

## 5. NSMutableDictionary

```objc
NSMutableDictionary<NSString *, id> *user = [NSMutableDictionary dictionary];

user[@"name"] = @"Yuhui";
user[@"age"] = @18;
[user removeObjectForKey:@"age"];
[user removeAllObjects];
```

下标赋值 `nil` 会删除 Key：

```objc
user[@"nickname"] = nil;
```

保存空值占位：

```objc
user[@"nickname"] = [NSNull null];
```

## 6. NSSet

```objc
NSSet<NSString *> *tags = [NSSet setWithArray:@[
    @"ios",
    @"swift",
    @"ios"
]];

BOOL contains = [tags containsObject:@"ios"];
NSArray<NSString *> *array = tags.allObjects;
```

集合运算：

```objc
NSMutableSet *result = [a mutableCopy];
[result unionSet:b];       // 并集
[result intersectSet:b];   // 交集
[result minusSet:b];       // 差集
```

## 7. NSOrderedSet

```objc
NSOrderedSet<NSString *> *items = [NSOrderedSet orderedSetWithArray:@[
    @"A", @"B", @"A"
]];

NSString *first = items.firstObject;
NSString *second = items[1];
```

## 8. nil 与 NSNull

错误：

```objc
NSString *nickname = nil;
NSArray *values = @[@"Alice", nickname];
```

正确：

```objc
NSArray *values = @[
    @"Alice",
    nickname ?: [NSNull null]
];
```

判断：

```objc
if (value == [NSNull null]) {
    // 空值占位
}
```

## 9. 快速遍历

```objc
for (NSString *name in names) {
    NSLog(@"%@", name);
}
```

带下标：

```objc
[names enumerateObjectsUsingBlock:^(NSString *name, NSUInteger index, BOOL *stop) {
    NSLog(@"%lu: %@", (unsigned long)index, name);
}];
```

字典：

```objc
[user enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    NSLog(@"%@ = %@", key, value);
}];
```

## 10. 遍历时删除

不要在快速遍历过程中直接修改原集合。

反向删除：

```objc
for (NSInteger index = names.count - 1; index >= 0; index--) {
    NSString *name = names[(NSUInteger)index];
    if (name.length == 0) {
        [names removeObjectAtIndex:(NSUInteger)index];
    }
}
```

## 11. 排序

```objc
NSArray<NSString *> *sorted = [names sortedArrayUsingSelector:@selector(compare:)];
```

```objc
NSArray<NSNumber *> *sorted = [numbers sortedArrayUsingComparator:^NSComparisonResult(
    NSNumber *left,
    NSNumber *right
) {
    return [left compare:right];
}];
```

## 12. 过滤

```objc
NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(
    NSNumber *value,
    NSDictionary *bindings
) {
    return value.integerValue % 2 == 0;
}];

NSArray<NSNumber *> *evenNumbers = [numbers filteredArrayUsingPredicate:predicate];
```

## 13. copy / mutableCopy

```objc
NSArray *source = @[@"A", @"B"];
NSArray *snapshot = [source copy];
NSMutableArray *mutable = [source mutableCopy];
```

```text
copy          通常得到不可变集合
mutableCopy   通常得到可变集合
默认通常是浅复制，内部元素可能仍然共享
```

## 14. 轻量泛型

```objc
NSArray<OCUser *> *users;
NSDictionary<NSString *, OCUser *> *userMap;
NSSet<NSString *> *tags;
```

作用：

```text
编译期类型提示
更准确的代码补全
更清晰的头文件接口
更准确的 Swift 桥接
```

限制：

```text
轻量泛型不是完整运行时类型约束
外部 JSON 和动态数据仍需 isKindOfClass: 检查
```

## 15. 动态数据安全读取

```objc
id rawName = payload[@"name"];

if ([rawName isKindOfClass:[NSString class]]) {
    NSString *name = rawName;
}
```

```objc
id rawNickname = payload[@"nickname"];

if (rawNickname != nil &&
    rawNickname != [NSNull null] &&
    [rawNickname isKindOfClass:[NSString class]]) {
    NSString *nickname = rawNickname;
}
```

## 16. 常见检查

```text
1. 是否选对 NSArray / NSDictionary / NSSet？
2. 是否真的需要 NSMutable 可变集合？
3. 数组访问是否可能越界？
4. 集合中是否可能出现 NSNull？
5. 是否在遍历过程中修改集合？
6. 是否声明了明确的轻量泛型？
7. copy 是否被误认为深复制？
8. 外部动态数据是否检查了真实类型？
```

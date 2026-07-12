# Lab：Objective-C Foundation Collection 与轻量泛型

## 目标

通过一个“用户资料仓库”练习：

```text
1. NSArray / NSMutableArray
2. NSDictionary / NSMutableDictionary
3. NSSet / NSMutableSet
4. 轻量泛型
5. 排序、过滤和查找
6. nil / NSNull
7. copy / mutableCopy
8. 集合遍历时的安全修改
```

这个 Lab 可以在 Xcode 的 macOS Command Line Tool 中运行，也可以把这些类放进 iOS App 工程。

---

## 练习结构

```text
CollectionsLab/
├── OCUser.h
├── OCUser.m
├── OCUserRepository.h
├── OCUserRepository.m
└── main.m
```

---

## 练习 1：创建用户模型

### OCUser.h

```objc
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OCUser : NSObject

@property (nonatomic, copy) NSString *userId;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, copy) NSArray<NSString *> *tags;

- (instancetype)initWithUserId:(NSString *)userId
                          name:(NSString *)name
                          tags:(NSArray<NSString *> *)tags;

@end

NS_ASSUME_NONNULL_END
```

### OCUser.m

```objc
#import "OCUser.h"

@implementation OCUser

- (instancetype)initWithUserId:(NSString *)userId
                          name:(NSString *)name
                          tags:(NSArray<NSString *> *)tags {
    self = [super init];
    if (self) {
        _userId = [userId copy];
        _name = [name copy];
        _tags = [tags copy];
    }
    return self;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<OCUser id=%@ name=%@ tags=%@>",
            self.userId,
            self.name,
            self.tags];
}

@end
```

观察：

```text
userId / name 使用 copy，避免外部 NSMutableString 后续修改
数组属性使用 copy，保存不可变集合快照
tags 使用 NSArray<NSString *> 表达元素类型
```

---

## 练习 2：声明用户仓库

### OCUserRepository.h

```objc
#import <Foundation/Foundation.h>
#import "OCUser.h"

NS_ASSUME_NONNULL_BEGIN

@interface OCUserRepository : NSObject

@property (nonatomic, copy, readonly) NSArray<OCUser *> *users;

- (void)addOrReplaceUser:(OCUser *)user;
- (nullable OCUser *)userForId:(NSString *)userId;
- (void)removeUserForId:(NSString *)userId;
- (NSArray<OCUser *> *)usersWithTag:(NSString *)tag;
- (NSArray<OCUser *> *)sortedUsersByName;
- (NSSet<NSString *> *)allTags;

@end

NS_ASSUME_NONNULL_END
```

接口表达了：

```text
外部只能读取 NSArray 快照
内部是否使用 NSMutableArray 不属于公开接口
userForId: 可能返回 nil
集合元素通过轻量泛型明确
```

---

## 练习 3：实现数组与字典索引

### OCUserRepository.m

```objc
#import "OCUserRepository.h"

@interface OCUserRepository ()

@property (nonatomic, strong) NSMutableArray<OCUser *> *mutableUsers;
@property (nonatomic, strong) NSMutableDictionary<NSString *, OCUser *> *userMap;

@end

@implementation OCUserRepository

- (instancetype)init {
    self = [super init];
    if (self) {
        _mutableUsers = [NSMutableArray array];
        _userMap = [NSMutableDictionary dictionary];
    }
    return self;
}

- (NSArray<OCUser *> *)users {
    return [self.mutableUsers copy];
}

- (void)addOrReplaceUser:(OCUser *)user {
    OCUser *oldUser = self.userMap[user.userId];

    if (oldUser != nil) {
        NSUInteger index = [self.mutableUsers indexOfObjectIdenticalTo:oldUser];
        if (index != NSNotFound) {
            self.mutableUsers[index] = user;
        }
    } else {
        [self.mutableUsers addObject:user];
    }

    self.userMap[user.userId] = user;
}

- (OCUser *)userForId:(NSString *)userId {
    return self.userMap[userId];
}

- (void)removeUserForId:(NSString *)userId {
    OCUser *user = self.userMap[userId];
    if (user == nil) {
        return;
    }

    [self.mutableUsers removeObjectIdenticalTo:user];
    [self.userMap removeObjectForKey:userId];
}

- (NSArray<OCUser *> *)usersWithTag:(NSString *)tag {
    NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(
        OCUser *user,
        NSDictionary<NSString *, id> *bindings
    ) {
        return [user.tags containsObject:tag];
    }];

    return [self.mutableUsers filteredArrayUsingPredicate:predicate];
}

- (NSArray<OCUser *> *)sortedUsersByName {
    return [self.mutableUsers sortedArrayUsingComparator:^NSComparisonResult(
        OCUser *left,
        OCUser *right
    ) {
        return [left.name localizedCaseInsensitiveCompare:right.name];
    }];
}

- (NSSet<NSString *> *)allTags {
    NSMutableSet<NSString *> *tags = [NSMutableSet set];

    for (OCUser *user in self.mutableUsers) {
        [tags addObjectsFromArray:user.tags];
    }

    return [tags copy];
}

@end
```

这里同时维护两种结构：

```text
NSMutableArray
├── 保留用户展示顺序
└── 支持遍历和排序

NSMutableDictionary
├── userId → OCUser
└── 支持快速按 ID 查询
```

一个业务模型可以同时使用多种集合结构，但必须保证它们同步更新。

---

## 练习 4：运行仓库

### main.m

```objc
#import <Foundation/Foundation.h>
#import "OCUserRepository.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        OCUserRepository *repository = [[OCUserRepository alloc] init];

        OCUser *alice = [[OCUser alloc] initWithUserId:@"1001"
                                                  name:@"Alice"
                                                  tags:@[@"ios", @"swift"]];

        OCUser *bob = [[OCUser alloc] initWithUserId:@"1002"
                                                name:@"Bob"
                                                tags:@[@"ios", @"objc"]];

        OCUser *carol = [[OCUser alloc] initWithUserId:@"1003"
                                                  name:@"Carol"
                                                  tags:@[@"backend", @"swift"]];

        [repository addOrReplaceUser:alice];
        [repository addOrReplaceUser:bob];
        [repository addOrReplaceUser:carol];

        NSLog(@"all users = %@", repository.users);
        NSLog(@"user 1002 = %@", [repository userForId:@"1002"]);
        NSLog(@"ios users = %@", [repository usersWithTag:@"ios"]);
        NSLog(@"sorted users = %@", [repository sortedUsersByName]);
        NSLog(@"all tags = %@", [repository allTags]);
    }
    return 0;
}
```

预期：

```text
仓库中有三个用户
可以通过 userId 找到 Bob
ios 标签对应 Alice 和 Bob
名字排序后为 Alice、Bob、Carol
allTags 中每个标签只出现一次
```

---

## 练习 5：验证替换逻辑

继续添加相同 ID 的新对象：

```objc
OCUser *updatedBob = [[OCUser alloc] initWithUserId:@"1002"
                                               name:@"Bobby"
                                               tags:@[@"ios", @"objc", @"runtime"]];

[repository addOrReplaceUser:updatedBob];

NSLog(@"count = %lu", (unsigned long)repository.users.count);
NSLog(@"updated = %@", [repository userForId:@"1002"]);
```

应满足：

```text
用户总数仍然是 3
userId=1002 对应 Bobby
数组和字典中的对象都已经更新
```

如果只更新字典、不更新数组，会出现两个数据源不一致的问题。

---

## 练习 6：处理动态字典和 NSNull

模拟接口数据：

```objc
NSDictionary<NSString *, id> *payload = @{
    @"id": @"2001",
    @"name": @"David",
    @"nickname": [NSNull null],
    @"tags": @[@"ios", @"network"]
};
```

安全读取：

```objc
id rawId = payload[@"id"];
id rawName = payload[@"name"];
id rawTags = payload[@"tags"];
id rawNickname = payload[@"nickname"];

if (![rawId isKindOfClass:[NSString class]] ||
    ![rawName isKindOfClass:[NSString class]] ||
    ![rawTags isKindOfClass:[NSArray class]]) {
    NSLog(@"invalid payload");
    return 1;
}

NSString *userId = rawId;
NSString *name = rawName;
NSArray *rawTagArray = rawTags;
NSMutableArray<NSString *> *tags = [NSMutableArray array];

for (id item in rawTagArray) {
    if ([item isKindOfClass:[NSString class]]) {
        [tags addObject:item];
    }
}

NSString *nickname = nil;
if (rawNickname != [NSNull null] &&
    [rawNickname isKindOfClass:[NSString class]]) {
    nickname = rawNickname;
}

NSLog(@"id=%@ name=%@ nickname=%@ tags=%@",
      userId,
      name,
      nickname ?: @"<empty>",
      tags);
```

关键点：

```text
NSDictionary<NSString *, id> 只声明 Key 是字符串
Value 仍然可能是任意对象
网络数据必须检查 isKindOfClass:
NSNull 必须先排除再按目标类型使用
```

---

## 练习 7：观察浅复制

```objc
NSMutableString *mutableName = [NSMutableString stringWithString:@"Alice"];
NSArray<NSMutableString *> *source = @[mutableName];
NSArray<NSMutableString *> *snapshot = [source copy];

[mutableName appendString:@" changed"];

NSLog(@"source = %@", source);
NSLog(@"snapshot = %@", snapshot);
```

观察：

```text
source 和 snapshot 是不同集合对象
但它们持有同一个 NSMutableString 元素
元素修改后，两个集合看到的内容都会变化
```

结论：

```text
集合 copy 默认通常是浅复制
```

---

## 练习 8：修复遍历时删除

错误版本：

```objc
NSMutableArray<NSString *> *names = [NSMutableArray arrayWithArray:@[
    @"Alice",
    @"",
    @"Bob",
    @""
]];

for (NSString *name in names) {
    if (name.length == 0) {
        [names removeObject:name];
    }
}
```

改为反向删除：

```objc
for (NSInteger index = names.count - 1; index >= 0; index--) {
    NSString *name = names[(NSUInteger)index];

    if (name.length == 0) {
        [names removeObjectAtIndex:(NSUInteger)index];
    }
}

NSLog(@"%@", names);
```

结果：

```text
Alice, Bob
```

---

## 进阶任务

### 任务 1：增加分页查询

为仓库增加：

```objc
- (NSArray<OCUser *> *)usersFromIndex:(NSUInteger)index
                                limit:(NSUInteger)limit;
```

要求：

```text
不能数组越界
index 超出范围时返回空数组
limit 超出剩余数量时只返回剩余部分
```

提示：

```objc
NSRange range = NSMakeRange(index, actualLength);
NSArray *page = [self.mutableUsers subarrayWithRange:range];
```

### 任务 2：增加标签索引

维护：

```objc
NSMutableDictionary<NSString *, NSMutableSet<OCUser *> *> *usersByTag;
```

目标：

```text
通过标签快速找到用户
新增、替换和删除用户时同步维护索引
```

### 任务 3：消除外部可变数据影响

测试下面代码：

```objc
NSMutableArray<NSString *> *tags = [NSMutableArray arrayWithObject:@"ios"];
OCUser *user = [[OCUser alloc] initWithUserId:@"3001"
                                        name:@"Eve"
                                        tags:tags];

[tags addObject:@"changed-outside"];
NSLog(@"%@", user.tags);
```

确认 `OCUser` 内部使用 `copy` 后，外部修改不会改变用户的标签数组结构。

---

## 完成标准

你需要能回答：

```text
1. 仓库为什么同时维护 NSMutableArray 和 NSMutableDictionary？
2. 对外为什么返回 NSArray 快照而不是 NSMutableArray？
3. addOrReplaceUser: 为什么必须同步更新数组和字典？
4. NSSet 为什么适合汇总所有标签？
5. NSDictionary<NSString *, id> 为什么仍然需要运行时类型检查？
6. NSNull 与 nil 有什么区别？
7. 集合 copy 为什么不会自动深复制元素？
8. 为什么不能在快速遍历过程中直接删除原集合元素？
9. NSArray<OCUser *> 的轻量泛型提供了什么帮助？
10. 轻量泛型为什么不能保证网络输入一定正确？
```

完成结果：

```text
能设计一个同时支持顺序遍历和 ID 查询的仓库
能安全处理外部动态字典
能使用轻量泛型表达集合边界
能正确处理可变集合、复制、NSNull 和遍历修改问题
```

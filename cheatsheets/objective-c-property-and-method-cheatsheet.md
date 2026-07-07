# Objective-C 属性与方法速查

## 1. property 结构

```objc
@property (nonatomic, copy) NSString *name;
```

```text
nonatomic  = 非原子访问
copy       = 赋值时拷贝
NSString * = 属性类型
name       = 属性名
```

## 2. 常见属性修饰符

| 修饰符 | 常见用途 | 含义 |
|---|---|---|
| `strong` | 普通对象 | 强引用，持有对象 |
| `weak` | delegate | 弱引用，不持有对象 |
| `copy` | NSString / Block | 拷贝对象 |
| `assign` | NSInteger / BOOL / CGFloat | 基础类型直接赋值 |

## 3. 常见写法

```objc
@property (nonatomic, copy) NSString *name;
@property (nonatomic, strong) NSArray *items;
@property (nonatomic, weak) id delegate;
@property (nonatomic, assign) NSInteger age;
@property (nonatomic, assign) BOOL selected;
```

## 4. NSString 为什么用 copy

```objc
@property (nonatomic, copy) NSString *title;
```

原因：

```text
避免外部传入 NSMutableString 后继续修改，影响属性内部保存的值。
```

## 5. delegate 为什么用 weak

```objc
@property (nonatomic, weak) id delegate;
```

原因：

```text
delegate 是回调关系，通常不应该被当前对象强持有。
```

## 6. 点语法本质

```objc
user.name = @"Yuhui";
```

近似等价：

```objc
[user setName:@"Yuhui"];
```

```objc
NSString *name = user.name;
```

近似等价：

```objc
NSString *name = [user name];
```

## 7. self.name 和 _name

```text
self.name = 走 setter
_name     = 直接访问 ivar
```

常见习惯：

```objc
- (instancetype)initWithName:(NSString *)name {
    self = [super init];
    if (self) {
        _name = [name copy];
    }
    return self;
}

- (void)updateName:(NSString *)name {
    self.name = name;
}
```

## 8. readonly / readwrite

```objc
@property (nonatomic, readonly, copy) NSString *identifier;
```

含义：

```text
外部只能读取，不能写入。
```

内部重新声明为可写：

```objc
@interface User ()
@property (nonatomic, readwrite, copy) NSString *identifier;
@end
```

## 9. 方法声明

```objc
- (void)updateName:(NSString *)name age:(NSInteger)age;
```

拆解：

```text
-                实例方法
(void)           返回值
updateName:      第一段方法名
(NSString *)name 第一个参数
age:             第二段方法名
(NSInteger)age   第二个参数
```

完整方法名：

```text
updateName:age:
```

## 10. 类方法 / 实例方法

```objc
- (void)printInfo;       // 实例方法
+ (User *)defaultUser;   // 类方法
```

调用：

```objc
[user printInfo];
[User defaultUser];
```

## 11. 返回值示例

```objc
- (BOOL)isAdult {
    return self.age >= 18;
}

- (NSString *)displayName {
    return self.name;
}
```

## 12. Android 类比

| Android / Java / Kotlin | Objective-C |
|---|---|
| 字段 / 属性 | `@property` |
| getter | `- (Type)name` |
| setter | `- (void)setName:(Type)name` |
| `this.name` | `self.name` |
| 成员变量 | ivar，例如 `_name` |
| static 方法 | `+` 类方法 |
| 成员方法 | `-` 实例方法 |


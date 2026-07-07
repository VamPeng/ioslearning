# Objective-C Protocol / Delegate

## 1. 学习目标

Protocol 和 Delegate 是 OC 老项目与 UIKit 中最常见的解耦通信方式。

学完以后，你应该能看懂：

```text
1. @protocol 如何声明一组方法
2. required / optional 是什么
3. id<ProtocolName> 怎么读
4. delegate 属性为什么通常 weak
5. respondsToSelector: 为什么常和 optional 方法一起出现
6. delegate 和 Block 各适合什么场景
```

一句话：

```text
Protocol 定义能力，Delegate 把事件回调给外部对象处理。
```

---

## 2. Protocol 是什么

Protocol 类似 Java / Kotlin 中的接口。

声明：

```objc
@protocol UserCellDelegate <NSObject>

- (void)userCellDidTapFollowButton:(UserCell *)cell;

@end
```

含义：

```text
任何遵守 UserCellDelegate 的对象，都应该实现 userCellDidTapFollowButton:。
```

一个类声明遵守协议：

```objc
@interface UserViewController : UIViewController <UserCellDelegate>
@end
```

实现协议方法：

```objc
@implementation UserViewController

- (void)userCellDidTapFollowButton:(UserCell *)cell {
    NSLog(@"follow tapped");
}

@end
```

---

## 3. id<ProtocolName> 怎么读

delegate 属性常写成：

```objc
@property (nonatomic, weak) id<UserCellDelegate> delegate;
```

拆解：

```text
id                  任意 OC 对象
<UserCellDelegate>  这个对象需要遵守 UserCellDelegate 协议
delegate            属性名
```

所以 `id<UserCellDelegate>` 的意思是：

```text
一个遵守 UserCellDelegate 协议的任意对象。
```

如果你想限制具体类型，也可以写：

```objc
@property (nonatomic, weak) UIViewController<UserCellDelegate> *delegate;
```

但实际项目中 `id<ProtocolName>` 更常见。

---

## 4. required 和 optional

Protocol 方法默认是 required：

```objc
@protocol LoginServiceDelegate <NSObject>

- (void)loginServiceDidLogin;

@end
```

也可以显式写：

```objc
@protocol LoginServiceDelegate <NSObject>

@required
- (void)loginServiceDidLogin;

@optional
- (void)loginServiceDidLogout;

@end
```

含义：

```text
required = 遵守协议的类应该实现
optional = 可以实现，也可以不实现
```

UIKit 里大量 delegate / dataSource 都使用 optional 方法。

---

## 5. respondsToSelector:

调用 optional 方法前，要先判断 delegate 是否实现：

```objc
if ([self.delegate respondsToSelector:@selector(loginServiceDidLogout)]) {
    [self.delegate loginServiceDidLogout];
}
```

如果不判断，delegate 没实现这个 optional 方法时就可能崩溃。

`@selector(loginServiceDidLogout)` 表示方法选择器。

带参数的方法：

```objc
@selector(userCellDidTapFollowButton:)
```

注意冒号也是方法名的一部分。

---

## 6. Delegate 模式

一个 Cell 不应该直接知道 ViewController 具体怎么处理点击。它只需要把事件告诉 delegate。

```objc
// UserCell.h
@protocol UserCellDelegate;

@interface UserCell : UITableViewCell

@property (nonatomic, weak) id<UserCellDelegate> delegate;

@end

@protocol UserCellDelegate <NSObject>

- (void)userCellDidTapFollowButton:(UserCell *)cell;

@end
```

Cell 内部：

```objc
- (void)followButtonTapped {
    [self.delegate userCellDidTapFollowButton:self];
}
```

ViewController：

```objc
@interface UserViewController () <UserCellDelegate>
@end

@implementation UserViewController

- (void)userCellDidTapFollowButton:(UserCell *)cell {
    NSIndexPath *indexPath = [self.tableView indexPathForCell:cell];
    NSLog(@"tap row = %@", indexPath);
}

@end
```

这就是：

```text
Cell 负责发现事件。
ViewController 负责决定怎么处理事件。
```

---

## 7. delegate 为什么 weak

典型关系：

```text
ViewController strong -> Cell
Cell weak -> ViewController(delegate)
```

如果 delegate 是 strong：

```text
ViewController strong -> Cell
Cell strong -> ViewController
```

就会循环引用。

所以 delegate 属性通常写：

```objc
@property (nonatomic, weak) id<UserCellDelegate> delegate;
```

这一点和 ARC 章节直接相关。

---

## 8. DataSource 也是一种协议关系

UITableView 有两个非常典型的协议：

```objc
@property (nonatomic, weak) id<UITableViewDelegate> delegate;
@property (nonatomic, weak) id<UITableViewDataSource> dataSource;
```

粗略理解：

```text
delegate   = 事件、布局、选择等行为回调
dataSource = 数据数量和 Cell 内容
```

比如：

```objc
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section;

- (UITableViewCell *)tableView:(UITableView *)tableView
         cellForRowAtIndexPath:(NSIndexPath *)indexPath;
```

这些都是协议方法。

---

## 9. Delegate 和 Block 怎么选

| 场景 | 更常用 |
|---|---|
| 一个简单结果回调 | Block |
| 多个事件、多次回调 | Delegate |
| UIKit 风格组件 | Delegate / DataSource |
| 一次性异步请求 | Block |
| 需要清晰描述一组能力 | Protocol |

例子：

```text
登录完成：Block 很合适。
TableView 提供数据和处理交互：Delegate / DataSource 更合适。
```

老项目中两者都会大量出现。读代码时先看对象关系：

```text
Block 是否被属性保存？
Delegate 是否 weak？
事件是一次性的还是长期多事件？
```

---

## 10. 最低掌握标准

学完这一章后，你至少要能回答：

```text
1. @protocol 声明了什么？
2. id<UserCellDelegate> 怎么读？
3. required 和 optional 有什么区别？
4. optional 方法调用前为什么要 respondsToSelector:？
5. delegate 为什么通常 weak？
6. UITableViewDelegate 和 UITableViewDataSource 分别大概负责什么？
7. Delegate 和 Block 的使用场景有什么区别？
```

下一章进入 Swift 互操作。它帮助你读懂 OC / Swift 混编项目。

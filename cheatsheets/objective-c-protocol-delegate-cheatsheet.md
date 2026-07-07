# Objective-C Protocol / Delegate 速查

## 1. Protocol 声明

```objc
@protocol UserCellDelegate <NSObject>

- (void)userCellDidTapFollowButton:(UserCell *)cell;

@end
```

## 2. 遵守协议

```objc
@interface UserViewController : UIViewController <UserCellDelegate>
@end
```

## 3. 实现协议方法

```objc
- (void)userCellDidTapFollowButton:(UserCell *)cell {
    NSLog(@"follow tapped");
}
```

## 4. delegate 属性

```objc
@property (nonatomic, weak) id<UserCellDelegate> delegate;
```

```text
id<UserCellDelegate> = 任意遵守 UserCellDelegate 的对象。
```

## 5. required / optional

```objc
@protocol LoginServiceDelegate <NSObject>

@required
- (void)loginServiceDidLogin;

@optional
- (void)loginServiceDidLogout;

@end
```

## 6. optional 调用前判断

```objc
if ([self.delegate respondsToSelector:@selector(loginServiceDidLogout)]) {
    [self.delegate loginServiceDidLogout];
}
```

带参数 selector：

```objc
@selector(userCellDidTapFollowButton:)
```

## 7. delegate 为什么 weak

```text
ViewController strong -> Cell
Cell weak -> ViewController
```

避免循环引用。

## 8. UITableView 常见协议

```objc
@property (nonatomic, weak) id<UITableViewDelegate> delegate;
@property (nonatomic, weak) id<UITableViewDataSource> dataSource;
```

```text
delegate   = 事件和行为回调
dataSource = 数据来源
```

## 9. Delegate vs Block

| 场景 | 选择 |
|---|---|
| 一次性结果 | Block |
| 多个事件 | Delegate |
| UIKit 组件 | Delegate / DataSource |
| 清晰描述能力 | Protocol |

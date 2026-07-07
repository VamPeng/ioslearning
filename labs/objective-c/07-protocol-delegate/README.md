# Lab：Objective-C Protocol / Delegate

## 目标

通过一个 `DownloadTask` 练习：

```text
1. 声明 Protocol
2. 使用 required / optional
3. 声明 weak delegate
4. 用 id<ProtocolName> 表达协议对象
5. 调用 optional 方法前使用 respondsToSelector:
6. 理解 delegate 适合多个事件回调
```

---

## 练习 1：声明 DownloadTask

### DownloadTask.h

```objc
#import <Foundation/Foundation.h>

@class DownloadTask;

@protocol DownloadTaskDelegate <NSObject>

@required
- (void)downloadTaskDidStart:(DownloadTask *)task;
- (void)downloadTaskDidFinish:(DownloadTask *)task;

@optional
- (void)downloadTask:(DownloadTask *)task didUpdateProgress:(double)progress;
- (void)downloadTask:(DownloadTask *)task didFailWithMessage:(NSString *)message;

@end

@interface DownloadTask : NSObject

@property (nonatomic, weak) id<DownloadTaskDelegate> delegate;
@property (nonatomic, copy, readonly) NSString *identifier;

- (instancetype)initWithIdentifier:(NSString *)identifier;
- (void)start;
- (void)simulateFailure;

@end
```

---

## 练习 2：实现 DownloadTask

### DownloadTask.m

```objc
#import "DownloadTask.h"

@interface DownloadTask ()

@property (nonatomic, readwrite, copy) NSString *identifier;

@end

@implementation DownloadTask

- (instancetype)initWithIdentifier:(NSString *)identifier {
    self = [super init];
    if (self) {
        _identifier = [identifier copy];
    }
    return self;
}

- (void)start {
    [self.delegate downloadTaskDidStart:self];

    if ([self.delegate respondsToSelector:@selector(downloadTask:didUpdateProgress:)]) {
        [self.delegate downloadTask:self didUpdateProgress:0.5];
    }

    [self.delegate downloadTaskDidFinish:self];
}

- (void)simulateFailure {
    if ([self.delegate respondsToSelector:@selector(downloadTask:didFailWithMessage:)]) {
        [self.delegate downloadTask:self didFailWithMessage:@"network error"];
    }
}

@end
```

---

## 练习 3：创建控制器对象

### DownloadViewController.h

```objc
#import <Foundation/Foundation.h>
#import "DownloadTask.h"

@interface DownloadViewController : NSObject <DownloadTaskDelegate>

- (void)run;

@end
```

### DownloadViewController.m

```objc
#import "DownloadViewController.h"

@interface DownloadViewController ()

@property (nonatomic, strong) DownloadTask *task;

@end

@implementation DownloadViewController

- (void)run {
    self.task = [[DownloadTask alloc] initWithIdentifier:@"task-001"];
    self.task.delegate = self;

    [self.task start];
    [self.task simulateFailure];
}

- (void)downloadTaskDidStart:(DownloadTask *)task {
    NSLog(@"start: %@", task.identifier);
}

- (void)downloadTask:(DownloadTask *)task didUpdateProgress:(double)progress {
    NSLog(@"progress: %.0f%%", progress * 100);
}

- (void)downloadTaskDidFinish:(DownloadTask *)task {
    NSLog(@"finish: %@", task.identifier);
}

- (void)downloadTask:(DownloadTask *)task didFailWithMessage:(NSString *)message {
    NSLog(@"fail: %@, message = %@", task.identifier, message);
}

- (void)dealloc {
    NSLog(@"DownloadViewController dealloc");
}

@end
```

---

## 练习 4：main.m 调用

```objc
#import <Foundation/Foundation.h>
#import "DownloadViewController.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        DownloadViewController *controller = [[DownloadViewController alloc] init];
        [controller run];
    }
    return 0;
}
```

---

## 练习 5：观察 optional

临时删除 `DownloadViewController.m` 中这个方法：

```objc
- (void)downloadTask:(DownloadTask *)task didUpdateProgress:(double)progress {
    NSLog(@"progress: %.0f%%", progress * 100);
}
```

再次运行。

观察：

```text
1. 程序不会崩溃
2. didUpdateProgress 不会打印
3. 因为 DownloadTask 调用前使用了 respondsToSelector:
```

---

## 完成标准

你需要能回答：

```text
1. DownloadTaskDelegate 是什么？
2. id<DownloadTaskDelegate> 怎么读？
3. required 和 optional 有什么区别？
4. optional 方法为什么要先 respondsToSelector:？
5. task.delegate 为什么 weak？
6. DownloadViewController 为什么 strong 持有 task？
7. Delegate 为什么适合 DownloadTask 这种多事件回调？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C。

目录大致为：

```text
ProtocolDelegateLab/
├── main.m
├── DownloadTask.h
├── DownloadTask.m
├── DownloadViewController.h
└── DownloadViewController.m
```

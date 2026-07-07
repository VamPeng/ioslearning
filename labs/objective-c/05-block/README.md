# Lab：Objective-C Block

## 目标

通过一个 `LoginService` 练习：

```text
1. 声明 Block 类型
2. 使用 typedef 简化 Block
3. Block 作为方法参数
4. Block 作为属性
5. 调用 Block 前判空
6. 使用 __block 修改外部变量
7. 使用 weak / strong self 避免循环引用
```

---

## 练习 1：声明 LoginService

### LoginService.h

```objc
#import <Foundation/Foundation.h>

typedef void (^LoginCompletion)(BOOL success, NSString *message);

@interface LoginService : NSObject

@property (nonatomic, copy) LoginCompletion savedCompletion;

- (void)loginWithName:(NSString *)name completion:(LoginCompletion)completion;
- (void)saveCompletionAndRunLater:(LoginCompletion)completion;
- (void)runSavedCompletion;

@end
```

---

## 练习 2：实现 LoginService

### LoginService.m

```objc
#import "LoginService.h"

@implementation LoginService

- (void)loginWithName:(NSString *)name completion:(LoginCompletion)completion {
    if (name.length == 0) {
        if (completion) {
            completion(NO, @"name is empty");
        }
        return;
    }

    if (completion) {
        completion(YES, [NSString stringWithFormat:@"welcome %@", name]);
    }
}

- (void)saveCompletionAndRunLater:(LoginCompletion)completion {
    self.savedCompletion = completion;
}

- (void)runSavedCompletion {
    if (self.savedCompletion) {
        self.savedCompletion(YES, @"saved completion called");
    }
}

- (void)dealloc {
    NSLog(@"LoginService dealloc");
}

@end
```

---

## 练习 3：main.m 调用

```objc
#import <Foundation/Foundation.h>
#import "LoginService.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        LoginService *service = [[LoginService alloc] init];

        [service loginWithName:@"Yuhui" completion:^(BOOL success, NSString *message) {
            NSLog(@"success = %@, message = %@", success ? @"YES" : @"NO", message);
        }];

        [service loginWithName:@"" completion:^(BOOL success, NSString *message) {
            NSLog(@"success = %@, message = %@", success ? @"YES" : @"NO", message);
        }];

        __block NSInteger callbackCount = 0;
        [service loginWithName:@"Tom" completion:^(BOOL success, NSString *message) {
            callbackCount++;
            NSLog(@"callback count = %ld", (long)callbackCount);
        }];

        [service saveCompletionAndRunLater:^(BOOL success, NSString *message) {
            NSLog(@"later: %@", message);
        }];
        [service runSavedCompletion];
    }

    return 0;
}
```

---

## 练习 4：观察 self 捕获

创建一个 `LoginViewModel`。

### LoginViewModel.h

```objc
#import <Foundation/Foundation.h>

@interface LoginViewModel : NSObject

- (void)start;

@end
```

### LoginViewModel.m

```objc
#import "LoginViewModel.h"
#import "LoginService.h"

@interface LoginViewModel ()

@property (nonatomic, strong) LoginService *service;

@end

@implementation LoginViewModel

- (instancetype)init {
    self = [super init];
    if (self) {
        _service = [[LoginService alloc] init];
    }
    return self;
}

- (void)start {
    __weak typeof(self) weakSelf = self;
    [self.service saveCompletionAndRunLater:^(BOOL success, NSString *message) {
        __strong typeof(weakSelf) self = weakSelf;
        if (!self) {
            return;
        }

        [self handleMessage:message];
    }];
}

- (void)handleMessage:(NSString *)message {
    NSLog(@"view model handle: %@", message);
}

- (void)dealloc {
    NSLog(@"LoginViewModel dealloc");
}

@end
```

在 `main.m` 中：

```objc
LoginViewModel *viewModel = [[LoginViewModel alloc] init];
[viewModel start];
```

然后把 `start` 临时改成直接使用 `self`：

```objc
- (void)start {
    [self.service saveCompletionAndRunLater:^(BOOL success, NSString *message) {
        [self handleMessage:message];
    }];
}
```

观察 `LoginViewModel dealloc` 是否还会打印。

---

## 完成标准

你需要能回答：

```text
1. LoginCompletion 是什么类型？
2. Block 作为参数时怎么调用？
3. Block 作为属性为什么用 copy？
4. 调用 completion 前为什么要判断是否为 nil？
5. __block 在 callbackCount 上解决了什么问题？
6. LoginViewModel 为什么需要 weakSelf / strongSelf？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C。

目录大致为：

```text
BlockLab/
├── main.m
├── LoginService.h
├── LoginService.m
├── LoginViewModel.h
└── LoginViewModel.m
```

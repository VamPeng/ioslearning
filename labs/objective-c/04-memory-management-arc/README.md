# Lab：Objective-C ARC 内存管理

## 目标

通过 `Owner`、`Pet`、`TaskRunner` 三个类观察：

```text
1. strong 如何持有对象
2. weak 如何避免循环引用
3. dealloc 如何帮助判断对象是否释放
4. Block 捕获 self 为什么可能危险
5. @autoreleasepool 的基本使用方式
```

完成后你应该能解释：

```text
1. owner.pet 为什么会让 pet 存活
2. pet.owner 为什么应该 weak
3. dealloc 日志什么时候出现
4. completion block 为什么可能和 self 互相持有
```

---

## 练习 1：创建 Owner 和 Pet

### Owner.h

```objc
#import <Foundation/Foundation.h>

@class Pet;

@interface Owner : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, strong) Pet *pet;

- (instancetype)initWithName:(NSString *)name;

@end
```

### Owner.m

```objc
#import "Owner.h"

@implementation Owner

- (instancetype)initWithName:(NSString *)name {
    self = [super init];
    if (self) {
        _name = [name copy];
    }
    return self;
}

- (void)dealloc {
    NSLog(@"Owner dealloc: %@", self.name);
}

@end
```

### Pet.h

```objc
#import <Foundation/Foundation.h>

@class Owner;

@interface Pet : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, weak) Owner *owner;

- (instancetype)initWithName:(NSString *)name;

@end
```

### Pet.m

```objc
#import "Pet.h"

@implementation Pet

- (instancetype)initWithName:(NSString *)name {
    self = [super init];
    if (self) {
        _name = [name copy];
    }
    return self;
}

- (void)dealloc {
    NSLog(@"Pet dealloc: %@", self.name);
}

@end
```

---

## 练习 2：观察 weak 关系

### main.m

```objc
#import <Foundation/Foundation.h>
#import "Owner.h"
#import "Pet.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Owner *owner = [[Owner alloc] initWithName:@"Yuhui"];
        Pet *pet = [[Pet alloc] initWithName:@"Lucky"];

        owner.pet = pet;
        pet.owner = owner;

        NSLog(@"owner = %@, pet = %@", owner.name, owner.pet.name);
    }

    NSLog(@"autoreleasepool ended");
    return 0;
}
```

运行后应该看到 `Owner dealloc` 和 `Pet dealloc`。

---

## 练习 3：制造循环引用

把 `Pet.h` 中的 owner 临时改成 strong：

```objc
@property (nonatomic, strong) Owner *owner;
```

再次运行。

观察：

```text
1. Owner dealloc 是否还会打印
2. Pet dealloc 是否还会打印
```

如果没有打印，说明：

```text
Owner strong -> Pet
Pet strong -> Owner
```

形成循环引用。

练习完成后，把 `owner` 改回 `weak`。

---

## 练习 4：Block 捕获 self

### TaskRunner.h

```objc
#import <Foundation/Foundation.h>

@interface TaskRunner : NSObject

@property (nonatomic, copy) void (^completion)(void);

- (void)start;
- (void)finish;

@end
```

### TaskRunner.m

```objc
#import "TaskRunner.h"

@implementation TaskRunner

- (void)start {
    __weak typeof(self) weakSelf = self;
    self.completion = ^{
        __strong typeof(weakSelf) self = weakSelf;
        if (!self) {
            return;
        }

        [self finish];
    };
}

- (void)finish {
    NSLog(@"Task finished");
}

- (void)dealloc {
    NSLog(@"TaskRunner dealloc");
}

@end
```

在 `main.m` 中调用：

```objc
TaskRunner *runner = [[TaskRunner alloc] init];
[runner start];

if (runner.completion) {
    runner.completion();
}
```

然后把 `start` 临时改成危险写法：

```objc
- (void)start {
    self.completion = ^{
        [self finish];
    };
}
```

观察 `TaskRunner dealloc` 是否还会打印。

---

## 完成标准

你需要能回答：

```text
1. strong 和 weak 在对象释放上有什么区别？
2. owner.pet 和 pet.owner 为什么不能都 strong？
3. dealloc 没有打印通常意味着什么？
4. Block 为什么会捕获 self？
5. weakSelf / strongSelf 的写法解决什么问题？
6. @autoreleasepool 在这个命令行程序中起什么作用？
```

---

## 建议执行方式

可以在 Xcode 中创建一个 macOS Command Line Tool 项目，语言选择 Objective-C。

目录大致为：

```text
ARCLab/
├── main.m
├── Owner.h
├── Owner.m
├── Pet.h
├── Pet.m
├── TaskRunner.h
└── TaskRunner.m
```

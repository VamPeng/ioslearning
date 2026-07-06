# Lab：Objective-C 基础语法练习

## 目标

通过一个最小 OC 命令行程序，练习：

```text
1. 定义 OC 类
2. 声明 property
3. 创建对象
4. 调用实例方法
5. 使用 NSArray / NSDictionary
6. 使用 NSLog 打印
```

## 练习 1：User 类

### User.h

```objc
#import <Foundation/Foundation.h>

@interface User : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;

- (void)printInfo;

@end
```

### User.m

```objc
#import "User.h"

@implementation User

- (void)printInfo {
    NSLog(@"name = %@, age = %ld", self.name, (long)self.age);
}

@end
```

### main.m

```objc
#import <Foundation/Foundation.h>
#import "User.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        User *user = [[User alloc] init];
        user.name = @"Yuhui";
        user.age = 18;
        [user printInfo];
    }
    return 0;
}
```

## 练习 2：数组遍历

```objc
NSArray *names = @[@"Tom", @"Jack", @"Yuhui"];

for (NSString *name in names) {
    NSLog(@"name = %@", name);
}
```

## 练习 3：字典取值

```objc
NSDictionary *user = @{
    @"name": @"Yuhui",
    @"age": @18
};

NSString *name = user[@"name"];
NSNumber *age = user[@"age"];

NSLog(@"name = %@, age = %@", name, age);
```

## 完成标准

你需要能够解释：

```text
1. User.h 和 User.m 分别负责什么
2. @property 声明了什么
3. [[User alloc] init] 做了什么
4. [user printInfo] 为什么叫消息发送
5. NSString * 为什么带星号
6. NSArray 和 NSDictionary 分别类比 Android 的什么结构
7. NSLog 中 %@ 和 %ld 分别是什么意思
```

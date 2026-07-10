# iOS 核心编程概念教程

> Core Programming Concepts · Swift / Objective-C 对照 · 基于 iOS 学习主干生成

## 学习路线

1. 先建立统一模型
2. 面向对象 OOP
3. 属性、方法、协议与 Delegate
4. ARC 内存管理
5. 闭包、Block 与回调
6. 错误处理
7. 并发与异步
8. 函数式编程基础
9. 生命周期：App、ViewController、SwiftUI View
10. 综合练习：Profile 页面最小闭环

---

## 00. 先建立统一模型 (Mental Model)
**优先级：** 必学  
**建议时间：** 35 min

### 为什么要学
后面的 OOP、ARC、错误处理、并发不是孤立语法，它们都在回答四个问题：状态放在哪里？谁持有谁？失败怎么传？异步结束后谁更新 UI？

### 学习目标
- 能区分值类型与引用类型，以及复制和共享的差异。
- 能把一个 App 拆成 UI、State、Async Work、Persistence 四块。
- 能判断一段代码最可能出错的位置：生命周期、线程、错误路径、状态流。

iOS 编程的核心不只是会写语法，而是能控制对象、状态和异步任务之间的关系。先把心智模型建立起来，后面的细节就不会散。

### 值类型与引用类型
```swift
struct UserValue {
    var name: String
}

final class UserObject {
    var name: String

    init(name: String) {
        self.name = name
    }
}

var a = UserValue(name: "A")
var b = a
b.name = "B"
print(a.name) // A：值类型复制

let x = UserObject(name: "A")
let y = x
y.name = "B"
print(x.name) // B：引用类型共享同一个对象
```

> **第一阶段记忆：** 值类型适合表达数据；引用类型适合表达有身份、有生命周期、需要共享状态的对象。Swift 新项目优先使用 struct / enum / protocol，需要对象身份、继承、UIKit/NSObject 互操作时再使用 class。

### 最低掌握标准
- 看到 class 先问：这里是否真的需要共享身份？
- 看到 var 状态先问：谁是唯一数据源？
- 看到异步回调先问：完成后在哪个线程/Actor 更新 UI？

---

## 01. 面向对象 OOP (Object-Oriented Programming)
**优先级：** 必学  
**建议时间：** 70 min

### 为什么要学
UIKit、Objective-C 老项目、很多系统 API 都是对象模型。不会 OOP，就很难读懂 Controller、Service、Delegate、DataSource 这些结构。

### 学习目标
- 能解释类、对象、属性、方法、初始化、继承、多态。
- 能判断何时使用 class，何时使用 struct + protocol。
- 能读懂 Objective-C 的 .h / .m 类组织方式。

OOP 的核心不是“把所有东西都写成类”，而是把有身份和行为的概念封装成对象，让外部通过清晰接口使用它。

### Swift：类、协议、多态
```swift
protocol Trackable {
    var id: UUID { get }
}

final class Lesson: Trackable {
    let id = UUID()
    private(set) var title: String
    private(set) var isFinished = false

    init(title: String) {
        self.title = title
    }

    func finish() {
        isFinished = true
    }
}

func printID(_ item: Trackable) {
    print(item.id)
}
```

### Objective-C：.h 声明 + .m 实现
```objc
// Lesson.h
#import <Foundation/Foundation.h>

@interface Lesson : NSObject
@property (nonatomic, copy, readonly) NSString *title;
@property (nonatomic, assign, readonly) BOOL finished;

- (instancetype)initWithTitle:(NSString *)title;
- (void)finish;
@end

// Lesson.m
#import "Lesson.h"

@interface Lesson ()
@property (nonatomic, copy, readwrite) NSString *title;
@property (nonatomic, assign, readwrite) BOOL finished;
@end

@implementation Lesson
- (instancetype)initWithTitle:(NSString *)title {
    self = [super init];
    if (self) {
        _title = [title copy];
    }
    return self;
}

- (void)finish {
    self.finished = YES;
}
@end
```

> **怎么学：** 第一轮不要钻 Runtime。先能读懂：声明在哪里、实现在哪里、对象怎么创建、属性如何暴露、方法如何调用。Runtime、动态派发、消息转发放到进阶阶段。

### 最低掌握标准
- class 是模板，对象是实例。
- 封装是把可变状态藏起来，只暴露必要接口。
- 协议/接口让调用方依赖能力，不依赖具体类。

---

## 02. 属性、方法、协议与 Delegate (Properties, Methods, Protocols & Delegate)
**优先级：** 必学  
**建议时间：** 65 min

### 为什么要学
这是读懂 iOS 系统 API 的基础。UITableViewDelegate、URLSessionDelegate、UIViewController、SwiftUI ViewModel 都离不开“数据 + 行为 + 通信”的拆分。

### 学习目标
- 能读懂属性修饰符、getter/setter、实例方法、类方法/静态方法。
- 能使用 protocol 定义能力边界。
- 能区分 delegate 与 closure callback 的适用场景。

属性保存对象状态，方法表达对象行为，协议定义一组能力，Delegate 是把事件交回外部对象处理的一种长期通信关系。

### Swift：delegate 必须 weak，协议需要 class-bound
```swift
protocol LoginViewDelegate: AnyObject {
    func loginViewDidTapSubmit(_ view: LoginView)
}

final class LoginView {
    weak var delegate: LoginViewDelegate?

    func submitButtonTapped() {
        delegate?.loginViewDidTapSubmit(self)
    }
}
```

### Objective-C：id<ProtocolName> + weak delegate
```objc
@protocol UserCellDelegate <NSObject>
- (void)userCellDidTapFollowButton:(UserCell *)cell;
@end

@interface UserCell : UITableViewCell
@property (nonatomic, weak) id<UserCellDelegate> delegate;
@end
```

> **Delegate vs Closure：** Delegate 适合长期、多事件、双向的对象协作；Closure/Block 适合一次性结果回调，例如网络完成、按钮点击、动画完成。

### 最低掌握标准
- delegate 通常 weak，因为它经常是反向引用。
- 协议描述能力，不应该泄漏太多实现细节。
- 一个闭包能表达清楚的单次事件，不一定要设计成 delegate。

---

## 03. ARC 内存管理 (Automatic Reference Counting)
**优先级：** 必学  
**建议时间：** 90 min

### 为什么要学
iOS App 很多疑难问题不是语法错，而是对象没释放、页面泄漏、闭包强捕获 self、delegate 错用 strong。ARC 自动管理引用计数，但不会自动消除循环引用。

### 学习目标
- 能解释 strong、weak、unowned、copy 的差异。
- 能识别对象互相强持有导致的循环引用。
- 能用 deinit/dealloc、Memory Graph、日志观察对象释放。

ARC 会跟踪引用计数并在对象不再被强引用时释放对象。你不用手写 retain/release，但你仍然要设计正确的引用方向。

### Swift：闭包捕获 self 的安全写法
```swift
final class ProfileViewModel {
    var onReload: (() -> Void)?
}

final class ProfileViewController: UIViewController {
    private let viewModel = ProfileViewModel()

    override func viewDidLoad() {
        super.viewDidLoad()

        viewModel.onReload = { [weak self] in
            guard let self else { return }
            self.render()
        }
    }

    private func render() {
        // update UI
    }

    deinit {
        print("ProfileViewController deinit")
    }
}
```

### Objective-C：属性修饰符记忆表
```objc
@property (nonatomic, strong) User *user;              // 持有普通对象
@property (nonatomic, copy) NSString *name;              // 防止可变字符串外部修改
@property (nonatomic, copy) void (^completion)(void);    // 保存 Block
@property (nonatomic, weak) id<UserCellDelegate> delegate; // 避免循环引用
@property (nonatomic, assign) NSInteger count;           // 基础类型
```

> **常见泄漏结构：** ViewController strong 持有 ViewModel；ViewModel strong 持有 closure；closure 又 strong 捕获 ViewController。这种链条需要用 [weak self] 或拆掉其中一个强引用。

### 最低掌握标准
- ARC 不是 GC；引用循环不会自动解决。
- delegate 通常 weak；Block/Closure 作为属性要警惕捕获 self。
- 页面关闭后 deinit/dealloc 不打印，优先怀疑强引用链没有断。

---

## 04. 闭包、Block 与回调 (Closures, Blocks & Callbacks)
**优先级：** 必学  
**建议时间：** 75 min

### 为什么要学
闭包是 SwiftUI、动画、网络回调、异步封装、函数式 API 的核心。OC 中 Block 同样是老项目读代码的重点。

### 学习目标
- 能把闭包看成可传递、可保存、可执行的代码块。
- 能读懂 escaping closure、capture list、Result callback。
- 能把 Objective-C Block 类型拆开读。

闭包/Block 的难点通常不在语法，而在“什么时候执行、谁持有它、它捕获了谁”。

### Swift：一次性异步回调
```swift
struct User {
    let name: String
}

enum LoginError: Error {
    case invalidPassword
}

func login(completion: @escaping (Result<User, LoginError>) -> Void) {
    // 模拟网络完成
    completion(.success(User(name: "Yuhui")))
}

login { result in
    switch result {
    case .success(let user):
        print(user.name)
    case .failure(let error):
        print(error)
    }
}
```

### Objective-C：typedef 简化 Block
```objc
typedef void (^LoginCompletion)(BOOL success, NSError *error);

@property (nonatomic, copy) LoginCompletion completion;

- (void)loginWithCompletion:(LoginCompletion)completion {
    if (completion) {
        completion(YES, nil);
    }
}
```

> **读法：** void (^completion)(BOOL success, NSError *error) 可以读成：completion 是一个 Block，接收 BOOL 和 NSError * 两个参数，没有返回值。

### 最低掌握标准
- 闭包作为属性保存时，很容易形成生命周期问题。
- 调用可选 Block 前要判断 nil；Swift 可选闭包用 completion?()。
- 捕获列表 [weak self] 是为了打断 self 与闭包之间的强引用环。

---

## 05. 错误处理 (Error Handling)
**优先级：** 必学  
**建议时间：** 70 min

### 为什么要学
真实 App 一定会失败：网络失败、JSON 不符合预期、权限被拒、数据库写入失败。错误处理决定 App 是可恢复还是直接崩。

### 学习目标
- 能区分 nil、throw、Result、assert/precondition 的使用边界。
- 能写出 do/try/catch 的业务错误处理。
- 能把错误转成 UI 可显示的状态。

错误处理的目标不是把所有错误吞掉，而是让预期内的失败有明确类型、有明确处理路径。

### Swift：throw + do/try/catch
```swift
enum APIError: Error, LocalizedError {
    case badStatus(Int)
    case decodingFailed

    var errorDescription: String? {
        switch self {
        case .badStatus(let code): return "服务器状态异常：\(code)"
        case .decodingFailed: return "数据解析失败"
        }
    }
}

func parse(statusCode: Int, data: Data) throws -> String {
    guard (200..<300).contains(statusCode) else {
        throw APIError.badStatus(statusCode)
    }

    guard let text = String(data: data, encoding: .utf8) else {
        throw APIError.decodingFailed
    }

    return text
}

do {
    let text = try parse(statusCode: 200, data: Data("OK".utf8))
    print(text)
} catch {
    print(error.localizedDescription)
}
```

### Objective-C：NSError ** 常见模式
```objc
- (BOOL)saveUser:(User *)user error:(NSError **)error {
    if (user.name.length == 0) {
        if (error) {
            *error = [NSError errorWithDomain:@"UserError"
                                         code:1001
                                     userInfo:@{NSLocalizedDescriptionKey: @"name is empty"}];
        }
        return NO;
    }
    return YES;
}
```

> **选择规则：** 没有值用 Optional；可恢复失败用 throws 或 Result；程序员错误用 assertion/precondition；不应该发生但必须兜底的生产问题要记录日志并给用户安全状态。

### 最低掌握标准
- 不要用空字符串或 -1 代表业务错误。
- catch 后至少要转成日志、UI 状态、重试入口之一。
- 网络层抛技术错误，业务层转换成用户能理解的消息。

---

## 06. 并发与异步 (Concurrency & Async/Await)
**优先级：** 必学  
**建议时间：** 110 min

### 为什么要学
网络、图片加载、数据库、文件读写都不能阻塞主线程。现代 Swift 首选 async/await；读老代码时还会遇到 GCD、OperationQueue、Block 回调。

### 学习目标
- 能区分同步、异步、并发、并行。
- 能用 async/await 写可读的异步流程。
- 能保证 UI 更新发生在主线程或 MainActor。
- 能理解取消、任务生命周期和数据竞争的基本风险。

并发的第一原则：耗时任务离开主线程，UI 状态回到主线程/MainActor。async/await 让异步代码看起来像同步流程，但它仍然会挂起、恢复和取消。

### Swift：async/await + MainActor
```swift
struct FeedItem: Identifiable {
    let id = UUID()
    let title: String
}

protocol FeedService {
    func fetchFeed() async throws -> [FeedItem]
}

@MainActor
final class FeedViewModel {
    private let service: FeedService
    private(set) var items: [FeedItem] = []
    private(set) var errorMessage: String?

    init(service: FeedService) {
        self.service = service
    }

    func reload() async {
        do {
            items = try await service.fetchFeed()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

### Objective-C：GCD 回到主队列更新 UI
```objc
dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    NSArray *items = [self.service loadItems];

    dispatch_async(dispatch_get_main_queue(), ^{
        self.items = items;
        [self.tableView reloadData];
    });
});
```

> **不要这样：** 不要在主线程做大 JSON 解析、图片解码、数据库批量读写。不要在后台线程直接改 UIKit 或 SwiftUI 状态。

### 最低掌握标准
- async 函数可能挂起，await 后执行上下文要确认。
- UI 状态更新放到 MainActor。
- Task 要考虑视图消失后的取消和重复请求。

---

## 07. 函数式编程基础 (Functional Programming)
**优先级：** 建议  
**建议时间：** 55 min

### 为什么要学
Swift 标准库、SwiftUI、Combine、序列处理大量使用 map/filter/reduce、不可变数据转换、函数作为值。掌握基础后代码会更短、更安全。

### 学习目标
- 能使用 map、compactMap、filter、reduce、sorted 处理集合。
- 能用纯函数把业务转换逻辑从 UI 中抽出来。
- 能判断何时函数式写法会降低可读性。

函数式编程在 iOS 入门阶段只需抓住一个点：把“修改过程”尽量变成“输入到输出的转换”。

### Swift：集合转换
```swift
struct User {
    let name: String
    let isActive: Bool
    let score: Int
}

let users = [
    User(name: "Ana", isActive: true, score: 90),
    User(name: "Ben", isActive: false, score: 70),
    User(name: "Cai", isActive: true, score: 88)
]

let activeNames = users
    .filter { $0.isActive }
    .sorted { $0.score > $1.score }
    .map { $0.name }

let totalScore = users.reduce(0) { partial, user in
    partial + user.score
}
```

> **可读性规则：** 如果链式调用超过 3～4 步，或者闭包里出现复杂 if/guard，优先拆成命名函数。函数式不是炫技，而是让数据流更清楚。

### 最低掌握标准
- map 改变元素形状，filter 保留满足条件的元素，reduce 折叠成一个结果。
- 优先 let 和不可变模型，减少意外状态修改。
- 业务转换函数应尽量不依赖 UI 和全局状态。

---

## 08. 生命周期：App、ViewController、SwiftUI View (Lifecycle)
**优先级：** 建议  
**建议时间：** 80 min

### 为什么要学
生命周期决定代码应该放在哪里。数据请求、订阅、通知、资源释放、页面刷新，如果放错时机就会重复请求、闪烁、泄漏或状态错乱。

### 学习目标
- 能说明 App / Scene / ViewController / SwiftUI View 生命周期差异。
- 能判断 viewDidLoad、viewWillAppear、viewDidDisappear、task、onAppear 的使用场景。
- 能在页面消失时取消或停止不再需要的工作。

UIKit 的 ViewController 是对象，生命周期方法比较明确；SwiftUI 的 View 是值，body 会反复计算，所以副作用不能随便写在 body 里。

### SwiftUI：用 .task 绑定异步加载到视图生命周期
```swift
@Observable
final class ProfileViewModel {
    var names: [String] = []

    @MainActor
    func reload() async {
        // await service.fetch...
        names = ["Ana", "Ben", "Cai"]
    }
}

struct ProfileView: View {
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        List(viewModel.names, id: \.self) { name in
            Text(name)
        }
        .task {
            await viewModel.reload()
        }
    }
}
```

### UIKit：常见生命周期放置规则
```swift
final class ProfileViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // 一次性 UI 初始化、绑定 ViewModel、注册 cell
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // 每次页面将显示时刷新轻量状态
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        // 停止 timer、取消临时任务、暂停动画
    }
}
```

> **第一阶段边界：** SwiftUI 优先学 .task / onAppear / onDisappear / @State / @Binding / @Observable；UIKit 项目再系统补 view controller lifecycle、delegate/dataSource、Auto Layout。

### 最低掌握标准
- 不要把网络请求直接写进 SwiftUI body。
- viewDidLoad 只会在视图加载时执行一次，不等于每次页面出现。
- 页面消失时，长任务、通知、timer、闭包引用都要检查。

---

## 09. 综合练习：Profile 页面最小闭环 (Mini Project)
**优先级：** 必做  
**建议时间：** 120 min

### 为什么要学
核心概念必须落到小项目里。这个练习把协议、OOP、错误处理、并发、生命周期、ARC 安全写法串起来。

### 学习目标
- 用 protocol 抽象服务层，便于替换 Mock。
- 用 async throws 表达网络成功/失败。
- 用 ViewModel 保存 UI 状态。
- 用 SwiftUI .task 触发加载。

### 综合示例：Service + ViewModel + View
```swift
import SwiftUI
import Observation

struct Profile: Identifiable {
    let id = UUID()
    let name: String
}

enum ProfileError: Error, LocalizedError {
    case offline

    var errorDescription: String? {
        switch self {
        case .offline: return "网络不可用，请稍后重试"
        }
    }
}

protocol ProfileService {
    func fetchProfiles() async throws -> [Profile]
}

struct MockProfileService: ProfileService {
    func fetchProfiles() async throws -> [Profile] {
        try await Task.sleep(for: .milliseconds(300))
        return [Profile(name: "Ana"), Profile(name: "Ben")]
    }
}

@Observable
@MainActor
final class ProfileViewModel {
    private let service: ProfileService
    var profiles: [Profile] = []
    var isLoading = false
    var errorMessage: String?

    init(service: ProfileService) {
        self.service = service
    }

    func reload() async {
        isLoading = true
        defer { isLoading = false }

        do {
            profiles = try await service.fetchProfiles()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct ProfileListView: View {
    @State private var viewModel = ProfileViewModel(service: MockProfileService())

    var body: some View {
        List(viewModel.profiles) { profile in
            Text(profile.name)
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert("加载失败", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { isPresented in
                if !isPresented { viewModel.errorMessage = nil }
            }
        )) {
            Button("重试") {
                Task { await viewModel.reload() }
            }
            Button("取消", role: .cancel) {
                viewModel.errorMessage = nil
            }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
        .task {
            await viewModel.reload()
        }
    }
}
```

> **复盘这个练习：** OOP 体现在 Service/ViewModel 的对象边界；Protocol 让 Mock 可替换；async throws 负责异步与失败；ViewModel 管状态；.task 绑定生命周期；@MainActor 保证 UI 状态更新安全。

### 最低掌握标准
- 把 MockProfileService 改成随机抛错，确认 UI 能显示错误。
- 给 reload 增加取消检查 Task.isCancelled。
- 把 ProfileViewModel 改成闭包回调版本，练习 [weak self]。

---

## 练习任务总表
| 任务 | 目标 | 验收标准 |
|---|---|---|
| OOP 建模 | 创建 Course / Lesson / Progress 模型 | 能解释 class、struct、protocol 的选择理由 |
| ARC 排查 | 制造并修复一个闭包循环引用 | 页面关闭后 deinit/dealloc 能打印 |
| 错误处理 | Mock API 随机成功/失败 | UI 不崩溃，能显示错误并重试 |
| 并发 | 用 async/await 加载数据 | 主线程不卡顿，UI 更新在 MainActor |
| 生命周期 | 记录 UIKit/SwiftUI 页面事件 | 能说明请求、订阅、取消分别放在哪里 |

## 参考来源

- VamPeng/ioslearning: https://github.com/VamPeng/ioslearning
- Stanford CS193p 2025: https://cs193p.stanford.edu/
- Swift 官方文档：ARC / Error Handling / Concurrency: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/
- Kodeco iOS & Swift Learning Paths: https://www.kodeco.com/ios/paths

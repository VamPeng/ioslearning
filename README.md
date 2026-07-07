# iOS Learning

这是一个用于系统学习 iOS 开发的知识库。

当前采用“Markdown 源内容 + 前端学习 App”结构：

```text
Vite App = 学习入口 / 搜索 / 目录 / Markdown 阅读体验
Markdown = 具体知识正文 / 代码解释 / 复习资料
Labs     = 可运行练习 / Demo 任务
HTML     = 旧版路线图页面 / 可对照资料
```

## 目录结构

```text
ioslearning/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── routing.js
│   └── styles.css
├── roadmap/
│   └── oc-roadmap.html
├── docs/
│   └── objective-c/
│       ├── 00-overview.md
│       ├── 01-basic-syntax.md
│       ├── 02-class-and-object.md
│       ├── 03-property-and-method.md
│       ├── 04-memory-management-arc.md
│       ├── 05-block.md
│       ├── 06-category-extension.md
│       ├── 07-protocol-delegate.md
│       └── 08-swift-interop.md
├── cheatsheets/
│   ├── objective-c-basic-syntax-cheatsheet.md
│   ├── objective-c-class-and-object-cheatsheet.md
│   ├── objective-c-property-and-method-cheatsheet.md
│   ├── objective-c-memory-management-arc-cheatsheet.md
│   ├── objective-c-block-cheatsheet.md
│   ├── objective-c-category-extension-cheatsheet.md
│   ├── objective-c-protocol-delegate-cheatsheet.md
│   └── objective-c-swift-interop-cheatsheet.md
└── labs/
    └── objective-c/
        ├── 01-basic-syntax/
        │   └── README.md
        ├── 02-class-and-object/
        │   └── README.md
        ├── 03-property-and-method/
        │   └── README.md
        ├── 04-memory-management-arc/
        │   └── README.md
        ├── 05-block/
        │   └── README.md
        ├── 06-category-extension/
        │   └── README.md
        ├── 07-protocol-delegate/
        │   └── README.md
        └── 08-swift-interop/
            └── README.md
```

## 使用方式

### 开发预览

```bash
npm install
npm run dev
```

然后打开终端显示的本地地址，例如：

```text
http://127.0.0.1:5173/
```

### 构建离线版本

```bash
npm run build
```

构建后会生成：

```text
dist/index.html
```

这个文件会内联 JavaScript 和 CSS，适合直接双击或用 Chrome 打开。Markdown 内容会在构建时打包进前端资源里，不需要浏览器运行时再读取本地 `.md` 文件。

### 验证

```bash
npm run verify
```

当前验证会检查路由解析、Vite 配置、Markdown 打包入口、`.gitignore`、开发记录和构建产物是否已经内联资源。

## 当前阶段

```text
Objective-C
├── 基础语法
│   ├── .h / .m 文件结构
│   ├── @interface / @implementation
│   ├── 对象与指针
│   ├── 消息发送语法
│   ├── 属性 property
│   ├── NSString / NSArray / NSDictionary
│   ├── nil
│   └── NSLog
│
├── 类与对象
│   ├── @interface 类声明
│   ├── @implementation 类实现
│   ├── NSObject
│   ├── alloc / init
│   ├── initWith...
│   ├── self / super
│   ├── 继承
│   ├── ivar
│   └── 类方法 / 实例方法
│
├── 属性与方法
│   ├── nonatomic / atomic
│   ├── strong / weak / copy / assign
│   ├── getter / setter
│   ├── 点语法本质
│   ├── self.property / _ivar
│   ├── readonly / readwrite
│   ├── 方法声明拆解
│   └── 类方法 / 实例方法深化
│
├── ARC 内存管理
│   ├── ARC 自动引用计数
│   ├── strong / weak 生命周期
│   ├── copy 与 Block 属性
│   ├── dealloc 观察释放
│   ├── 循环引用
│   ├── weak delegate
│   ├── Block 捕获 self
│   └── @autoreleasepool
│
├── Block
│   ├── Block 基本语法
│   ├── 参数与返回值
│   ├── typedef 简化类型
│   ├── Block 作为参数
│   ├── Block 作为属性
│   ├── 捕获外部变量
│   ├── __block
│   └── weakSelf / strongSelf
│
├── Category / Extension
│   ├── Category 文件命名
│   ├── 给已有类添加方法
│   ├── Category 方法名前缀
│   ├── Category 属性限制
│   ├── 方法名冲突
│   ├── Extension 私有属性
│   └── 大类拆分阅读方式
│
├── Protocol / Delegate
│   ├── @protocol
│   ├── id<ProtocolName>
│   ├── required / optional
│   ├── respondsToSelector:
│   ├── weak delegate
│   ├── UITableViewDelegate
│   ├── UITableViewDataSource
│   └── Delegate 与 Block 选择
│
└── Swift 互操作
    ├── Bridging Header
    ├── ProjectName-Swift.h
    ├── @objc / @objcMembers
    ├── NSObject 暴露边界
    ├── Foundation 类型桥接
    ├── nullability
    ├── 轻量泛型
    └── Block / Closure 桥接
```

## Objective-C 当前学习顺序

```text
00-overview
↓
01-basic-syntax
↓
02-class-and-object
↓
03-property-and-method
↓
04-memory-management-arc
↓
05-block
↓
06-category-extension
↓
07-protocol-delegate
↓
08-swift-interop
```

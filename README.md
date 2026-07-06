# iOS Learning

这是一个用于系统学习 iOS 开发的知识库。

当前采用双载体结构：

```text
HTML    = 学习路线 / 知识树 / 节点导航
Markdown = 具体知识正文 / 代码解释 / 复习资料
Labs     = 可运行练习 / Demo 任务
```

## 目录结构

```text
ioslearning/
├── index.html
├── roadmap/
│   └── oc-roadmap.html
├── docs/
│   └── objective-c/
│       ├── 00-overview.md
│       ├── 01-basic-syntax.md
│       └── 02-class-and-object.md
├── cheatsheets/
│   ├── objective-c-basic-syntax-cheatsheet.md
│   └── objective-c-class-and-object-cheatsheet.md
└── labs/
    └── objective-c/
        ├── 01-basic-syntax/
        │   └── README.md
        └── 02-class-and-object/
            └── README.md
```

## 使用方式

1. 先打开 `index.html`，选择学习方向。
2. 在 HTML 路线图中定位知识节点。
3. 点击节点进入对应 Markdown 正文。
4. 完成 Markdown 末尾的练习任务。
5. 使用 cheatsheet 快速复习。

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
└── 类与对象
    ├── @interface 类声明
    ├── @implementation 类实现
    ├── NSObject
    ├── alloc / init
    ├── initWith...
    ├── self / super
    ├── 继承
    ├── ivar
    └── 类方法 / 实例方法
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

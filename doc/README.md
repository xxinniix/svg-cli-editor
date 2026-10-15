# PJ1 Phase 1：TypeScript CLI SVG 编辑器

## 项目概述

本项目是一个基于 TypeScript 的命令行 SVG 编辑器。用户通过 `svg>` 提示符输入命令，完成 SVG 文档的创建、读取、保存，以及基础图形的创建、编辑、分组、删除、图层调整、结构查看和撤销重做。

本阶段实现的内置图形：

- `rect`
- `circle`
- `ellipse`
- `line`
- `text`
- `g`（分组）

`box` 属于后续插件阶段功能，本阶段未实现。

## 运行与验证

安装依赖并启动 CLI：

```bash
npm install
npm run cli

编译源代码：

npm run build

对源代码和测试代码执行TypeScript类型检查：

npx tsc -p tsconfig.test.json

运行全部自动化测试：
npm run test

当前开发环境：

- Node.js
- TypeScript 5.9.3
- Git + GitHub
- Vitest

命令总览

类别	命令
文档	init [width] [height]、read <file>、save <file>、canvas [width] [height]
创建	create <type> <id> <parameters...> [attribute=value ...]
编辑	move <id> <dx> <dy>、scale <id> <factor>、set <id> <attribute> <value>、delete <id>
分组	addto <id> <groupId>、group <newGroupId> <id...>、ungroup <groupId>
图层	front <id>、back <id>
查看	show、tree、canvas、help
历史	undo、redo
退出	exit、quit

以#开头的输入行会被视为注释并忽略。所有用户可见错误均以error:开头；错误命令不会改变已有文档状态。

## 架构方案

### 模块划分

| 模块 | 目录 | 职责 |
| --- | --- | --- |
| CLI | `src/cli/` | REPL 输入输出、命令文本解析、参数校验、用户可见错误与提示 |
| 应用层 | `src/app/` | 协调当前文档、命令历史、文件读写和领域模型 |
| 领域模型 | `src/model/` | `SvgDocument`、图形类层次、父子关系、SVG 序列化和图形操作语义 |
| 编辑命令 | `src/commands/` | Command 模式的具体编辑操作，以及 undo/redo 历史管理 |
| SVG 读写 | `src/io/` | UTF-8 SVG 文件读写、受支持 SVG 元素解析、缺失 ID 自动生成 |
| 测试 | `test/` | 模型、命令、CLI 和 SVG 读写的自动化测试 |

- SvgFileStore 负责文件系统层面的 UTF-8 读取与写入。
- SvgParser 负责将受支持的 SVG 元素、属性、文字和嵌套分组重建为 SvgDocument。
- SvgDocument 不依赖终端、文件系统或命令行文本。

### 组件图

@startuml
skinparam componentStyle rectangle

[CLI / REPL] as cli
[Editor] as app
[CommandHistory and commands] as commands
[SvgFileStore and SvgParser] as io
[SvgDocument and Shape hierarchy] as model

cli --> app
app --> commands
app --> io
app --> model
commands --> model
io --> model
@enduml

###图形结构图

@startuml
abstract class Shape {
  +getId()
  +getType()
  +move(dx, dy)
  +scale(factor)
  +setAttribute(name, value)
  +toSvg()
  +describe()
}

Shape <|-- Rect
Shape <|-- Circle
Shape <|-- Ellipse
Shape <|-- Line
Shape <|-- Text
Shape <|-- Group

Group "1" o-- "*" Shape : children
SvgDocument "1" o-- "*" Shape : rootShapes
@enduml

### 设计模式与面向对象设计

Command模式： CreateShapeCommand、MoveCommand、ScaleCommand、DeleteShapeCommand、SetAttributeCommand、MoveToGroupCommand、GroupShapesCommand、UngroupCommand 和 ReorderShapeCommand 都实现统一命令接口。CommandHistory 管理撤销栈和重做栈；执行新编辑命令会清空重做记录。
Composite模式： Shape 是抽象图形，五种基础图形是叶子，Group 是可包含子图形的组合对象。因此叶子和分组都能通过多态统一执行移动、缩放、SVG 序列化和结构描述。
Factory模式： ShapeFactory 集中创建不同类型图形，避免在 Editor 或 CLI 中散布图形类型判断。
封装与多态： 图形的几何数据和属性保存在各自类内部，只能通过方法修改。外部代码不直接访问公共几何字段。
文件读写分离： SvgFileStore 与 SvgParser 位于 io 层；领域模型不处理文件路径或 XML 文本。

### 依赖方向规则

依赖方向如下：

cli -> app -> commands / io / model
commands -> model
io -> model
model -> 无其他业务模块

### 变化点假设

| 可能变化 | 当前应对方式 |
| 新增图形类型 | 扩展 `Shape` 子类与 `ShapeFactory`，并补充测试 |
| 新增命令 | 在 CLI 注册处理器，在 `Editor` 中协调；编辑命令实现 Command 接口 |
| 新增 SVG 属性 | 由具体图形类维护允许属性，避免自由属性表 |
| SVG 读写规则变化 | 修改 `io` 层，不让 XML 文本进入领域模型 |
| 缺失图形 ID 的导入文件 | 自动生成唯一 ID，并通过 CLI 输出 warning |
| 后续插件图形 `box` | 本阶段明确不实现，不提前引入插件机制 |

## 与 AI 协作的过程记录

1. 根据作业说明确认 Phase 1 范围：内置图形为 rect、circle、ellipse、line、text、g；box 不属于本阶段。
2. AI 协助划分 CLI、应用层、模型层、命令层和 I/O 层，并确定 Command + Composite 的总体架构。
3. 初次编译提示缺少 Node 类型后，启用 Node 类型定义，而非通过手写 process 或 require 声明绕过类型检查。
4. TypeScript 严格模式提示命令参数数组下标可能不存在，因此在 CommandRunner 中显式验证参数数量和 undefined 情况。
5. 手工验证 exit 与 quit 的 REPL 关闭流程，确认命令会打印 bye 并正常退出。
6. 初次测试文件被误放在 src/，导致 TypeScript 编译产物中包含测试，Vitest 重复执行。随后将测试移动到 test/ 并清理可再生的 dist/。
7. 新增 tsconfig.test.json，使 src/ 和 test/ 都能接受独立类型检查，同时保持构建产物不含测试文件。
8. Text 初版序列化多出一个空格；自动化测试发现问题后，改为直接模板字符串序列化，保证文字内容不被改变。
9. 实现 Group 时，将父容器关系放入 Shape 基类，并由 Group 维护子节点和循环引用保护。
10. 实现 SvgDocument 的顶层图形树管理、全局 ID 唯一性、嵌套查找、删除、恢复和完整 SVG 序列化。
11. 实现 ShapeFactory，集中图形名称到具体图形类的创建分派，并覆盖未知类型、非法数字和参数数量错误。
12. 接入 create、show 与带引号文字解析；错误属性输入不会改变已有文档。
13. 引入 EditorCommand、CommandHistory 以及创建、移动、缩放命令，实现 undo/redo。
14. 实现可撤销的 delete，并补充恢复原父容器和原顺序的能力；同时为 SVG 根节点 viewBox 加入回归测试。
15. 实现可撤销的 set，覆盖几何属性、样式属性和文字内容的修改与恢复。
16. 实现可撤销的 addto，并防止将分组加入自身或其后代而形成循环。
17. 实现 group，记录原父容器和顺序，使撤销与重做可以准确恢复树结构。
18. 实现 ungroup，保证子图形按原顺序回到原父容器。
19. 实现 tree，通过图形多态 describe() 递归输出文档结构。
20. 实现 front 和 back，仅调整同级图形顺序，并保存原索引以支持撤销与重做。
21. 实现 save <file>，新增 UTF-8 文件写入、覆盖保存和相关自动化测试。
22. 实现 read <file>，新增受支持 SVG 子集解析、嵌套分组恢复、缺失 ID 警告、读取失败保留旧文档和读取后清空历史。
23. VS Code 无法使用 TypeScript 7 的传统 tsserver.js 布局，因此将项目 TypeScript 版本固定为 5.9.3；随后重新执行构建、类型检查和测试确认环境正常。

## 一致性自查

### 模块划分

- src/cli/、src/app/、src/model/、src/commands/、src/io/ 和 test/ 均已存在，和架构方案一致。
- Shape 为抽象基类；Rect、Circle、Ellipse、Line、Text、Group 均为独立类文件。
- Group 同时是 Shape，能够包含其他图形，符合 Composite 设计。
- 编辑操作通过命令对象进入 CommandHistory；init 与成功 read 会清空历史，因此它们之后 undo 会报告 error: nothing to undo。
- SvgDocument 在添加、恢复和读取图形时保持全局 ID 唯一性。
- read 会先完整解析新文件，成功后才替换当前文档；解析失败不会破坏旧文档。

### 依赖方向

抽样检查结果：

- src/cli/CommandRunner.ts 依赖 src/app/Editor.ts。
- src/app/Editor.ts 依赖 src/commands/、src/io/ 和 src/model/。
- src/commands/ 与 src/io/ 只依赖 src/model/。
- src/model/ 不依赖 CLI、应用层、命令层或 I/O 层。

目前未发现反向依赖。

## 功能完整性和质量保证

当前已完成的保障：

- npm run build 使用 TypeScript 严格检查并通过。
- npx tsc -p tsconfig.test.json 对源代码和测试代码共同执行类型检查并通过。
- Vitest 共覆盖 21 个测试文件、64 个自动化测试，全部通过。
- 自动化测试覆盖基础图形、Group、SvgDocument、ShapeFactory、SVG 保存与读取、SVG 解析、缺失 ID 自动生成、CLI 参数校验、创建、删除、移动、缩放、属性修改、分组、取消分组、图层顺序、树结构、循环引用保护、undo/redo、错误处理和读取失败保持原文档。
- 手工验证了 init、canvas、create、带引号文本、set、show、tree、save、read、保存后读取并恢复分组/样式/文字、move、scale、delete、addto、group、ungroup、front、back、undo、redo、# 注释行和 exit。
- 每个功能阶段均以 Git 小步提交并推送到远程仓库。

已知边界：
- read 面向本项目支持的 SVG 子集；不支持 path、滤镜、动画、CSS 样式表或任意第三方 SVG 元素。
不支持的元素或属性会返回 error:，且不会替换当前文档。
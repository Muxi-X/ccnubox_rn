# 华师匣子移动客户端架构设计

本文档阐述华师匣子客户端的整体软件架构、技术选型考量、分层模型以及原生运行时拓展机制。

---

## 1. 架构总览

应用采用 **React Native 0.85 + Expo SDK 56** 作为核心基座，全面采用 React Native **New Architecture**（新架构，Fabric 渲染器与 TurboModules，JS 运行时由 Hermes 驱动）。

```text
┌─────────────────────────────────────────────────────────────┐
│                       Expo Router v56                       │
│     (基于文件系统的分层路由导航、Deep Linking、Typed Routes)      │
├─────────────────────────────────────────────────────────────┤
│                    业务模块层 (src/modules/)                 │
│      CourseTable   │   MainPage   │ Notification │ Setting  │
├─────────────────────────────────────────────────────────────┤
│                    基础组件层 (src/components/)              │
│       Modal  │  Picker  │  Button  │ AnimatedView │ ...     │
├──────────────────────────────┬──────────────────────────────┤
│      状态管理 (Zustand 5)     │     网络与数据层 (src/request) │
│  Auth, Course, Time, Visual  │ OpenAPI Gen / Typed Request  │
├──────────────────────────────┴──────────────────────────────┤
│                 跨平台原生桥接与配置插件                      │
│  - 本地模块: modules/ccnubox-widget (Android AppWidget)     │
│  - 目标工程: targets/widget (iOS WidgetKit & Live Activity) │
│  - Config Plugins: plugins/ (权限净化、Scheme声明、UI定制)    │
├─────────────────────────────────────────────────────────────┤
│                    React Native 0.85 Core                   │
│             Hermes Engine + New Architecture (Fabric)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心技术栈与选型理由

| 技术 / 库           | 版本         | 核心作用与选型考量                                                                           |
| :------------------ | :----------- | :------------------------------------------------------------------------------------------- |
| **Expo SDK**        | `^56.0.21`   | 现代跨平台基座，提供成熟的 Prebuild 机制、Config Plugins 与原生能力抽象。                    |
| **React Native**    | `0.85.3`     | 全面开启 New Architecture（TurboModules + Fabric），获得近原生的并发渲染性能与流畅手势响应。 |
| **React**           | `19.2.3`     | 最新的 React 运行时，支持并发特性与更高效的状态派发机制。                                    |
| **Expo Router**     | `~56.2.20`   | 基于文件系统的路由框架，开箱即用支持 Typed Routes、深度链接以及嵌套布局。                    |
| **Zustand**         | `^5.0.0`     | 极简、低开销的响应式状态管理，具备清晰的选择器订阅机制与便捷的持久化中间件。                 |
| **OpenAPI / Axios** | `1.17.0`     | 契约驱动的网络层，以标准 YAML 为中心全自动推断请求与响应的 TypeScript 类型。                 |
| **Oxlint & Oxfmt**  | 现代化工具链 | Rust 编写的代码分析与格式化工具，在毫秒级完成全仓库规则审计，保证团队代码质量。              |

---

## 3. 目录与分层原则

1. **路由与页面 (`src/app/`)**：
   - 遵循 Expo Router 规范，只承担页面容器、参数解析、骨架渲染及顶层错误边界职责。
   - 禁止在 `src/app/` 中书写复杂的业务渲染组件或重度逻辑，页面逻辑应收敛在 `src/modules/` 中。
2. **业务模块 (`src/modules/`)**：
   - 包含高聚合度的业务逻辑、业务组件与子视图模型。
   - 例如课表视图计算、双向手势画布 `TimetableScrollView` 位于 `src/modules/courseTable/`。
3. **通用 UI 组件 (`src/components/`)**：
   - 纯受控或仅含局部交互状态的 UI 基础设施，无特定业务感知。
4. **状态仓储 (`src/store/`)**：
   - 使用 Zustand 定义各个领域的全局状态切片，严格分离内存态与持久化态。
5. **网络请求 (`src/request/`)**：
   - 遵循契约优先原则，业务代码仅导入自动类型推导的 `request` 与各子 API 封装。
6. **主题与视觉体系 (`src/styles/`)**：
   - 多端样式映射，支持深浅主题及 Android / iOS 平台特异性视觉策略。

---

## 4. 主题与视觉方案架构

- **多轴设计**：
  主题系统通过 `useVisualScheme` 支持三维度的解耦定制：
  1. 颜色模式：`light`（浅色） / `dark`（深色），支持跟随系统。
  2. 布局策略：`ios` 风格 / `android` 风格。
  3. 图标策略：`ios` 扁平圆润风格 / `android` Material 线性风格。
- **动态分发**：
  提供 `layoutSelect<T>` 与 `iconStyleSelect<T>`，根据当前激活的策略实现组件或图标的无缝动态分发。

---

## 5. 原生扩展与 Config Plugins 机制

为了在保持 Expo Prebuild 敏捷特性的同时引入高度定制的原生能力，项目采用了两大原生扩展策略：

1. **本地原生 Expo Module (`modules/ccnubox-widget`)**：
   - 遵循 Expo Modules API 规范，编写原生 Kotlin 代码，无需侵入全局 `android/` 主工程代码即可获得独立的编译单元，并在 JS 侧通过 `requireOptionalNativeModule` 零冗余载入。
2. **Apple Targets 扩展 (`targets/widget`)**：
   - 通过 `@bacons/apple-targets` 插件在 prebuild 时直接动态合入 Xcode 独立 Target 工程，实现 Swift / WidgetKit 桌面小组件与 Live Activity 的完全原生构建。
3. **Config Plugins (`plugins/`)**：
   - `./plugins/config-android-url-scheme.js`：注入 `<queries>` 标签保障微信/支付宝 Scheme 调起。
   - `./plugins/ios-disable-liquid-glass.js`：适配 iOS 26 新视觉特性的透明度控制。
   - `./plugins/remove-unused-ios-permissions.js`：剔除未使用的 iOS 权限描述以避免审核阻碍。

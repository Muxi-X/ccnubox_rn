# ccnubox_rn

华师匣子移动客户端（React Native / Expo）

## 项目简述

- 基于 **React Native 0.85** + **Expo SDK 56** 构建，开启 React Native **New Architecture**（新架构，Fabric 渲染器与 TurboModules，Hermes 引擎）。
- 状态管理采用 **Zustand (v5)** 配合 `persist` 和 `createJSONStorage` 中间件实现数据持久化。
- 网络请求层基于 **OpenAPI / Swagger** 规范自动生成完整 TypeScript 类型定义（`openapi-typescript`），搭配类型安全客户端 `createRequestClient`，实现长短 Token 自动无缝静默刷新与并发防抖。
- 消息推送集成 **JPush**（通过 Expo 插件 `mx-jpush-expo` 注入，支持华为、小米、OPPO、VIVO、荣耀等主流 Android 厂商推送通道）。
- 桌面小组件（Widget）：
  - **iOS**：基于 `@bacons/apple-targets` 构建 Widget Extension（Swift / WidgetKit），支持桌面课表组件与实时活动（Live Activity），通过 App Group 共享数据。
  - **Android**：基于自定义本地 Expo Module（`modules/ccnubox-widget`）结合 AppWidgetProvider，提供 2x2 与 4x2 规格的今日课表桌面微件。
- 采用 **EAS (Expo Application Services)** 进行跨平台构建与发布，支持自建私有化 EAS Update (OTA) 服务与静态资源加速。
- 国际化（i18n）：支持简体中文与英文切换（`languages/zh-CN.json`、`languages/en-US.json`）。

## 专题文档导航

为方便系统性查阅各专项技术的实现细节与操作规范，项目维护了以下专题文档：

- 🌐 [核心领域模型全景 (Domain Context)](CONTEXT.md)：学期、教学周对齐规则、课表桶模型、电费与绩点模型等业务上下文。
- 🏛️ [系统整体架构设计](docs/architecture.md)：New Architecture 运行时机制、分层原则、文件路由及多端主题自适应。
- 📱 [桌面小组件与实时活动指南](docs/widgets.md)：iOS WidgetKit / Live Activity 与 Android AppWidget 跨端数据同步全解析。
- 🔔 [消息推送与厂商通道集成](docs/push-notifications.md)：JPush 插件化装配、厂商通道参数、冷启动深链接桥接与跳转。
- 🔌 [网络请求与 OpenAPI 规范驱动](docs/api-and-request.md)：接口代码全自动生成、泛型 Client、双 Token 静默刷新队列。
- 🚀 [构建打包与 OTA 热更新运维](docs/release-and-ota.md)：私有化 OTA 服务器、EAS Build Profiles、`runtimeVersion` 约束与自动化 CD。
- 🔒 [敏感权限清单与来源合规](docs/permissions.md)：运行时权限收敛、弹窗交互范式、Android Photo Picker 及 Config Plugins 规则。

## 项目结构

```text
.
├── .github/                      # GitHub Actions 工作流 (CI、Lint、OTA 发布等)
├── .husky/                       # Git 提交校验钩子
├── android/                      # Android 原生工程
├── ios/                          # iOS 原生工程
├── languages/                    # 国际化语言包 (zh-CN.json, en-US.json)
├── modules/                      # 本地原生 Expo 模块
│   └── ccnubox-widget/           # Android 桌面小组件原生模块
├── patches/                      # 依赖补丁文件 (patch-package)
├── plugins/                      # Expo 自定义 Config Plugins
│   ├── config-android-url-scheme.js    # Android 外部 Scheme/包名声明插件
│   ├── ios-disable-liquid-glass.js     # iOS 导航栏毛玻璃外观定制插件
│   └── remove-unused-ios-permissions.js # 移除未使用的 iOS 权限声明
├── scripts/                      # 构建与辅助脚本
│   ├── genapi.js                 # 从后端端点拉取 OpenAPI 并生成 TS 类型的脚本
│   └── prebuild.js               # 交互式预构建并触发 EAS Build 脚本
├── src/                          # 应用源代码
│   ├── app/                      # Expo Router 文件路由与页面
│   │   ├── (courseTable)/        # 课表相关页面 (添加课程、编辑课程等)
│   │   ├── (mainPage)/           # 首页功能页面 (空闲教室、蹭课、校历、成绩、电费、地图等)
│   │   ├── (setting)/            # 设置与个人中心页面 (关于、协议、反馈、主题等)
│   │   ├── (tabs)/               # 底部 Tab 导航 (首页、课表、消息通知、我的)
│   │   ├── auth/                 # 登录与引导页面
│   │   ├── _layout.tsx           # 全局路由根布局
│   │   └── index.tsx             # 应用入口跳转中转
│   ├── assets/                   # 项目静态资源 (图标、图片、字体、更新配置等)
│   │   ├── data/                 # 本地数据文件 (updateInfo.json 等)
│   │   ├── fonts/                # 自定义字体
│   │   ├── icons/                # SVG 图标组件与图标集
│   │   └── images/               # 图片资源
│   ├── components/               # 通用基础 UI 组件
│   │   ├── animatedView/         # 基础动效封装 (Fade, Opacity, Scale, Slide)
│   │   ├── button/               # 按钮组件 (支持 Loading 与 Android 原生 Ripple)
│   │   ├── divider/              # 分割线
│   │   ├── image/                # 增强图片组件
│   │   ├── loading/              # 加载状态组件
│   │   ├── modal/                # 弹窗组件 (支持函数式调用与 ModalTrigger)
│   │   ├── navi/                 # 底部导航栏相关组件
│   │   ├── pagination/           # 分页指示组件
│   │   ├── picker/               # 选择器组件 (单列/多列)
│   │   ├── pickerView/           # 选择器内部滚动视图
│   │   ├── portal/               # 全局挂载 Portal 组件
│   │   ├── scraper/              # 数据抓取/爬取交互组件
│   │   ├── searchBar/            # 搜索栏组件
│   │   ├── skeleton/             # 骨架屏组件
│   │   ├── slider/               # 滑块组件
│   │   ├── tabs/                 # 标签栏组件
│   │   ├── text/ & typography/   # 文本与排版组件
│   │   ├── toast/                # 吐司提示组件
│   │   └── view/                 # 容器视图组件
│   ├── constants/                # 全局常量定义 (API URL, 权限文案, 课表配置等)
│   ├── hooks/                    # 通用自定义 React Hooks
│   ├── mock/                     # 本地 Mock 数据
│   ├── modules/                  # 核心业务组件与业务逻辑模块
│   │   ├── courseTable/          # 课表模块 (课表视图、手势滚动容器、周次选择器等)
│   │   ├── mainPage/             # 首页模块 (微服务入口网格、卡片等)
│   │   ├── notification/         # 通知推送与消息列表模块
│   │   └── setting/              # 设置页相关业务组件
│   ├── request/                  # 网络请求层
│   │   ├── api/                  # 业务接口封装 (课表、电费、成绩、通知、反馈等)
│   │   ├── createRequestClient.ts# OpenAPI 泛型请求客户端实现
│   │   ├── feedbackRequest.ts    # 反馈系统独立请求客户端
│   │   ├── openapi.yaml          # 主服务 OpenAPI 规范文档
│   │   ├── openapi.feedback.yaml # 反馈服务 OpenAPI 规范文档
│   │   ├── schema.d.ts           # 自动生成的主服务 TypeScript 类型
│   │   ├── schema.feedback.d.ts  # 自动生成的反馈服务 TypeScript 类型
│   │   └── index.ts              # 主服务 request 客户端与双 Token 拦截器
│   ├── secret/                   # 敏感加密与加解密逻辑
│   ├── store/                    # Zustand 全局状态仓库 (认证、课表、主题、通知等)
│   ├── styles/                   # 主题样式系统 (深浅主题、Android/iOS 布局样式映射)
│   ├── themeBasedComponents/     # 针对 Android / iOS 平台定制的主题组件
│   ├── types/                    # 全局 TypeScript 类型声明
│   └── utils/                    # 工具函数库 (权限弹窗、日期处理、存储、系统 UI 等)
├── targets/                      # Apple 平台 Target 扩展工程
│   └── widget/                   # iOS WidgetKit 小组件源码 (Swift)
├── app.config.ts                 # 动态 Expo 配置脚本 (环境变量加载、插件动态装配)
├── app.json                      # 基础 Expo 配置文件
├── babel.config.js               # Babel 配置
├── eas.json                      # EAS 构建与环境发布配置
├── metro.config.js               # Metro 打包配置 (含 SVG 转换与模块解析)
├── package.json                  # 项目依赖与 Scripts
└── tsconfig.json                 # TypeScript 编译配置
```

## 开发环境版本基准

- **Node.js**: >= 20.0.0 (推荐 Node 22，CI 运行环境为 Node 22)
- **pnpm**: >= 9.0.0 (推荐使用 `pnpm@11.6.0`)
- **React**: 19.2.3
- **React Native**: 0.85.3 (New Architecture 开启)
- **Expo SDK**: 56 (56.0.21)
- **TypeScript**: ~6.0.3
- **Gradle**: 8.13 (Android Gradle Plugin 8.13.2)
- **Android SDK**: `compileSdkVersion 35`, `targetSdkVersion 34/35`, `minSdkVersion 24`
- **JDK**: 17+
- **iOS Deployment Target**: 16.4+
- **Xcode**: 16+

## 开发调试流程

### 1. 环境准备

1. 克隆代码仓库后，安装项目依赖：

   ```bash
   pnpm install
   ```

2. 拉取远程 EAS 环境变量（若有权限），或在项目根目录创建 `.env.local` 配置文件：

   ```bash
   eas env:pull --environment development
   ```

   可参考 `.env.example` 配置 `API_BASE_URL`、`JPUSH_APP_KEY` 等关键环境变量。

### 2. 本地调试模式

- **Expo Dev Client 调试（推荐）**：
  由于项目包含原生 JPush、小组件、自定义 Config Plugins 等原生模块，推荐在原生 Dev Client 环境下调试：

  ```bash
  # 启动 Metro 调试服务
  pnpm start

  # 启动并构建运行到 Android 设备/模拟器
  pnpm android

  # 启动并构建运行到 iOS 设备/模拟器
  pnpm ios
  ```

- **纯 Expo Go 调试（部分原生功能不可用）**：

  ```bash
  pnpm start:go
  ```

### 3. 原生工程预构建 (Prebuild)

当修改了 `app.json`、`app.config.ts`、`plugins/` 或 `targets/` 等配置后，需要重新生成原生工程代码：

```bash
# 完整重新预构建原生工程
pnpm prebuild

# 或者仅更新特定平台且不自动安装依赖
npx expo prebuild --platform ios --no-install
npx expo prebuild --platform android --no-install
```

## 配置文件体系

任何关于配置文件的修改都应该在对应的 Git Commit Message 中清晰声明，以便溯源。

### `app.json` & `app.config.ts`

- `app.json` 维护静态应用基础元数据（包名、版本号、应用权限声明、静态插件列表等）。
- `app.config.ts` 在构建时动态读取环境变量（通过 `dotenv-flow`），负责：
  - 动态注入自建私有化 OTA 服务配置（Manifest URL、Channel、App ID 与 Branch Surfing 参数）。
  - 条件启用代码签名（Code Signing）：绑定 `certs/certificate.pem` 公钥与 `rsa-v1_5-sha256` 算法。
  - 动态注入 JPush 厂商通道参数、切换生产/开发推送环境（`aps-environment`）。
  - 加载 `src/assets/data/updateInfo.json` 到全局 `extra`。

### `eas.json`

- 配置 EAS 构建流程与发布 Profile，包含：
  - `development`：用于本地与真机联调的 Development Client 构建包，配置 `DISABLE_CODE_SIGNING: "true"` 方便免签调试。
  - `test`：测试环境构建包，发布到内测分发渠道，启用代码签名验证。
  - `preview`：针对 Android 的独立 APK 预览包。
  - `production`：正式生产环境构建，生成发布到应用商店的安装包，启用代码签名验证。
  - `simulator`：用于 iOS 模拟器架构的构建。

## 常用脚本指令

| 命令                | 说明                                                                        |
| :------------------ | :-------------------------------------------------------------------------- |
| `pnpm start`        | 启动 Metro 开发服务器（指定 `--dev-client`）                                |
| `pnpm start:go`     | 以 Expo Go 模式启动 Metro                                                   |
| `pnpm android`      | 编译并在 Android 模拟器/真机上启动应用                                      |
| `pnpm ios`          | 编译并在 iOS 模拟器/真机上启动应用                                          |
| `pnpm web`          | 启动 Web 端预览                                                             |
| `pnpm lint`         | 使用 `oxlint` 运行代码静态检查                                              |
| `pnpm lint:fix`     | 使用 `oxlint` 自动修复可修复的 Lint 问题                                    |
| `pnpm format`       | 使用 `oxfmt` 格式化代码                                                     |
| `pnpm format:check` | 使用 `oxfmt` 检查代码格式                                                   |
| `pnpm prebuild`     | 执行 `expo prebuild` 生成 iOS/Android 原生工程                              |
| `pnpm build`        | 运行 `scripts/prebuild.js`，支持交互式构建与选择发布至 EAS                  |
| `pnpm genapi`       | 运行 `scripts/genapi.js`，拉取后端接口文档并生成 TypeScript 类型            |
| `pnpm ota:prod`     | 加载 `EXPO_TOKEN` 并发布生产分支热更新 (`eoas publish --branch production`) |
| `pnpm ota:prev`     | 加载 `EXPO_TOKEN` 并发布预览分支热更新 (`eoas publish --branch preview`)    |

## 核心技术实现与代码规范

### 1. 代码质量与 Git 规范

- 本项目使用 **Oxlint** 和 **Oxfmt** 进行极速的代码检查与格式化，通过 Husky + Lint-staged 在 Git pre-commit 阶段自动化执行。
- Commit 规范遵循 Conventional Commits，由 `@commitlint/cli` 进行强制校验。

### 2. 接口与网络请求层

- **自动化类型生成**：运行 `pnpm genapi` 会自动拉取主服务和反馈服务的 OpenAPI 规范，生成类型定义文件 `src/request/schema.d.ts` 和 `src/request/schema.feedback.d.ts`。
- **类型安全请求客户端**：位于 `src/request/`，通过 `createRequestClient<paths>(axiosInstance)` 构建具有严格端点路径与参数校验的请求实例：

  ```ts
  import { request } from '@/request';

  // 路径与参数均具备完整类型提示与智能推断
  const data = await request.get('/course/table', {
    params: { query: { semester: '2024-2025-1' } },
  });
  ```

- **双 Token 认证与自动无缝续期**：
  - 用户登录后，`shortToken` 和 `longToken` 被持久化保存在安全存储（`expo-secure-store`）中。
  - 请求拦截器默认自动注入 `Authorization: Bearer <shortToken>`。
  - 当接口返回 `401` 时，响应拦截器通过防抖队列自动请求 `/users/refresh_token` 换取新 `shortToken`，静默重发原失败请求；若长 Token 失效或刷新失败，自动拦截并重定向到 `/auth/login`。

### 3. 主题与视觉方案系统 (`useVisualScheme`)

- 位于 `src/styles/` 与 `src/store/visualScheme.ts`，基于 Zustand 集中管理全局视觉风格。
- **多维度定制**：
  - `themeName`：`'light'` \| `'dark'`，支持 `isAutoTheme` 自动跟随系统外观。
  - `layoutName`：`'ios'` \| `'android'` 布局风格。
  - `iconStyleName`：`'ios'` \| `'android'` 图标展示策略。
- **使用与切换方法**：

  ```ts
  import useVisualScheme from '@/store/visualScheme';

  // 读取当前样式
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);

  // 切换主题与布局
  const { changeTheme, changeLayout, changeIconStyle, setAutoTheme } =
    useVisualScheme();
  ```

- 支持 `layoutSelect` 与 `iconStyleSelect` 辅助函数，可根据用户当前布局风格无缝按需派发组件与图标实现。

### 4. 敏感权限申请与合规

- 针对 Android / iOS 隐私合规要求，应用实现了全局统一的权限申请与弹窗机制（`src/utils/requestPermission.ts`）。
- 在调用系统授权窗口前，统一展示用途说明对话框；经用户确认后才调起系统授权框，确认状态按用途持久化（key 前缀 `@ccnubox/permission-purpose/`）。
- 详见专门文档：[敏感权限清单与来源](docs/permissions.md)。

### 5. 桌面小组件与系统微件

- **iOS 桌面小组件 & 实时活动**：
  - 代码位于 `targets/widget/`，采用 Swift 语言原生编写。
  - 使用 App Groups 容器（`group.release-20240916`）在主 App 与 Widget 间共享最近课表与下节课提醒数据。
- **Android AppWidget 桌面微件**：
  - 本地原生模块位于 `modules/ccnubox-widget/`，提供 2x2 与 4x2 两种布局尺寸。
  - JS 侧通过 `requireOptionalNativeModule('CcnuboxWidget')` 调用 `updateCourseData(data)` 同步课表数据至 Android 原生微件。

## 构建、发布与更新

### 1. OTA 热更新 (EAS Update 与自建服务器)

应用基于自建私有化 OTA 服务器（`https://ota-api.muxixyz.com/manifest`）进行 JavaScript 层热更新，并启用 RSA 代码签名保障下发安全：

```bash
# 1. 确保 Git 工作区干净（提交或暂存未提交修改）
git status
# git commit -am "feat: ..." 或 git stash

# 2. 拉取 EAS 环境变量确保本地有 EXPO_TOKEN 环境变量
eas env:pull development

# 3. 一键发布到正式生产通道 (production)
pnpm ota:prod

# 4. 或一键发布到预览通道 (preview)
pnpm ota:prev
```

- **自动化 CI 发布**：
  修改 `src/assets/data/updateInfo.json` 中的更新内容和版本并推送到 GitHub `main` 分支时，GitHub Actions（`test_update.yml`）会自动触发热更新发布到 `test` 分支。
- **`runtimeVersion` 严格一致性**：
  OTA 更新仅在客户端原生工程的 `runtimeVersion` 与 OTA 包的 `runtimeVersion` 严格一致时才会被客户端下载与应用。

  ```json
  {
    "expo": {
      "version": "3.2.0",
      "runtimeVersion": "3.2.0"
    }
  }
  ```

  如果改动了原生代码、原生依赖或更新了 Android / iOS 原生配置，必须递增版本号并打包发布新的原生应用安装包。详细运维说明参见 [构建发布与 OTA 热更新运维指南](docs/release-and-ota.md)。

### 2. 原生打包 (EAS Build)

```bash
# 交互式引导构建（推荐）
pnpm run build

# 手动触发 Android 打包
eas build -p android --profile production

# 手动触发 iOS 打包
eas build -p ios --profile production
```

### 3. 上传到 App Store / TestFlight

```bash
# 提交最近一次构建好的 iOS 产物
eas submit -p ios --latest
```

_注：在 `eas.json` 中，发布到应用商店的 profile 对应的 `distribution` 应配置为 `"store"`。_

# 构建发布与 OTA 热更新运维指南 (Release & OTA)

华师匣子采用 Expo Application Services (EAS) 结合团队自建私有化 OTA 服务器（Self-hosted OTA Server）与代码签名（Code Signing）的现代化架构，实现高可靠的安装包构建与秒级 JavaScript 热更新下发。

---

## 1. 架构总览

```text
代码仓库 (GitHub)
   │
   ├─► 变更涉及原生依赖/原生工程配置 ──► 原生打包 (EAS Build) ──► 生成 APK / IPA ──► 上架商店 / 分发
   │
   └─► 仅变更 JS/TS 代码与静态资源 ──► 热更新 (EAS Update) ──► 私有化 OTA 服务器 (ota-api) ──► 客户端秒级热更 (代码签名校验)
```

---

## 2. OTA 热更新机制与私有化服务器

### 2.1 自建私有化服务器配置

为了突破境外网络访问限制、保障高校网络环境下的更新可用率及极速下发，项目切换为完全自建的私有化 OTA 服务：

- **Manifest 服务端点 (Update URL)**：`https://ota-api.muxixyz.com/manifest`
- **请求头规范 (Request Headers)**：
  - `expo-channel-name`: 通道名称（如 `production`、`test`）。
  - `expo-app-id`: 应用唯一标识（`65d670f0-9625-4631-9603-f4b11f44e621`）。
  - `xprem-branch`: 分支动态指定（Branch Surfing 特性，留空即默认由服务端 channel 分配对应 branch）。

### 2.2 动态配置与代码签名体系 (Code Signing)

自建 OTA 服务全面启用了基于 RSA 非对称加密的代码签名验证，确保从网络端拉取的 Manifest 与更新资产未被劫持或篡改。

#### 1. 签名密钥与证书

- **公钥证书**：`certs/certificate.pem`（构建时固化进客户端 App 二进制产物中）。
- **算法与 Key ID**：`alg: 'rsa-v1_5-sha256'`, `keyid: 'main'`。
- **私钥 (Private Key)**：由发布者或 CI 服务持有，在发布热更时通过 `--private-key-path` 提供，严禁提交至公共代码库。

#### 2. `app.config.ts` 动态策略

`app.config.ts` 负责在构建与发布时动态判定是否启用代码签名：

- **自动启用条件**：处于 EAS Build 环境（`EAS_BUILD === 'true'`）、命令行携带 `--private-key-path` 参数、或显式设置环境变量 `ENABLE_CODE_SIGNING === 'true'`。
- **排除条件**：显式设置 `DISABLE_CODE_SIGNING === 'true'`（例如在 `eas.json` 的 `development` profile 中禁用，以便于本地日常调试免去签名要求）。

```typescript
const codeSigningConfig = enableCodeSigning
  ? {
      codeSigningMetadata: { keyid: 'main', alg: 'rsa-v1_5-sha256' },
      codeSigningCertificate: './certs/certificate.pem',
    }
  : {};
```

### 2.3 原生冷启动与更新策略优化

为了兼顾“秒开体验”与“自动静默更新”，原生工程采用以下关键策略：

| 配置项 (iOS / Android)                             | 设定值   | 机制与收益说明                                                                                             |
| :------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------- |
| `EXUpdatesCheckOnLaunch` / `checkAutomatically`    | `ALWAYS` | 每次应用冷启动时自动向自建 OTA 服务请求最新 Manifest。                                                     |
| `EXUpdatesLaunchWaitMs` / `fallbackToCacheTimeout` | `0`      | **零毫秒阻塞**。应用冷启动立即使用内嵌包或已落盘缓存渲染首屏，完全不阻塞用户交互，新热更包在后台异步下载。 |
| `ENABLE_BSDIFF_PATCH_SUPPORT`                      | `true`   | 原生启用 bsdiff 差分补丁算法，更新仅下载二进制差异包，显著削减下发流量。                                   |

### 2.4 客户端运行时架构与状态机

#### 1. 响应式更新状态机 (`Updates.useUpdates()`)

设置中的检查更新页面（`src/app/(setting)/checkUpdate.tsx`）直接订阅 `expo-updates` 的响应式 Hook，提供平滑的多态交互：

- **版本标识**：区分当前运行的是内嵌包 (`isEmbeddedLaunch`) 还是已生效的 OTA 包，展示 `Update ID` 后 8 位短哈希。
- **三态流转**：
  1. `检查更新`：静默后台拉取最新清单。
  2. `下载更新`：显示精准百分比进度条（由 `downloadProgress` 驱动）。
  3. `重启生效`：`isUpdatePending` 为真时，引导用户一键触发 `Updates.reloadAsync()` 即刻应用新版本。
- **异常兜底与降级监控**：自动捕获 `checkError`、`downloadError`，并监听 `currentlyRunning.isEmergencyLaunch` 紧急降级模式。

#### 2. 日志追踪与远程诊断 (`src/utils/easUpdate.ts`)

- **运行环境快照**：`getUpdatesBasicInfo()` 提取当前更新模块的详细参数（Channel、RuntimeVersion、LaunchDuration 等）。
- **原生日志回溯**：`reportUpdatesLogs(maxAgeMs)` 调用原生 `readLogEntriesAsync` 读取底层更新流水，并通过系统 `logger` 上报，冷启动入口与更新页均已自动埋点。

---

## 3. `runtimeVersion` 严格匹配法则

**核心铁律**：客户端只拉取并执行与自身二进制构建完全匹配的 `runtimeVersion` 的热更新包。

```json
{
  "expo": {
    "version": "3.2.0",
    "runtimeVersion": "3.2.0"
  }
}
```

- **仅修改纯前端代码 (JS/TS/图片等静态资源)**：无需变动 `runtimeVersion`，直接发布 OTA。
- **修改了原生依赖、修改了 `app.json` 原生插件配置、升级了 Expo SDK 或更改了原生桥接代码**：必须递增 `runtimeVersion` 与 `version`，并重新进行原生打包（EAS Build）。

---

## 4. 热更新发布流程与 CI 规范

### 4.1 命令行一键发布 (`eoas publish`)

针对自建 OTA 服务，项目通过 `eoas publish` 进行版本发布，并在 `package.json` 中提供了便捷的脚本指令：

> **⚠️ 发布前重要前提 (Git 工作区干净约束)**：
> 在执行 OTA 发布前，**必须先将 Git 工作区中所有未提交的修改提交（Commit）或暂存（Stash）**，确保工作区处于 Clean 状态，以避免未验证的代码混入线上并保障每次热更版本都能准确追溯对应的 Git Commit。

```bash
# 1. 确保 Git 工作区无未提交改动
git status
# 若有改动请先提交或暂存：
# git commit -am "feat: ..." 或 git stash

# 2. 拉取 EAS 环境变量确保本地有 EXPO_TOKEN 环境变量
eas env:pull development

# 3. 一键发布至正式生产分支 (production)
pnpm run ota:prod

# 4. 或一键发布至预览分支 (preview)
pnpm run ota:prev
```

底层实际执行的指令对应为：

- `production` 分支：`eoas publish --branch production`
- `preview` 分支：`eoas publish --branch preview`

_注意：脚本在执行发布命令前会自动加载 `.env` 及本地 `.env.local` 中的环境变量，确保 `EXPO_TOKEN` 鉴权就绪后再发起发布。_

### 4.2 自动 CI 发布与更新日志维护

热更新元数据由 `src/assets/data/updateInfo.json` 统筹维护：

```json
{
  "otaVersion": "3.2.0",
  "updateTime": "2026-09-08",
  "newFeatures": ["新特性说明..."],
  "fixedIssues": ["修复问题说明..."],
  "knownIssues": []
}
```

- `updateInfo.json` 的内容会在构建时由 `app.config.ts` 动态装载到应用全局 `extra.updateInfo` 中。
- 向 GitHub `main` 分支提交包含 `src/assets/data/updateInfo.json` 的修改时，GitHub Actions（`test_update.yml`）会自动触发 EAS Update 发布到 `test` 测试通道。

---

## 5. 原生工程构建 (EAS Build)

### 5.1 Build Profiles (`eas.json`)

| Profile 名    | 平台          | 分发模式                        | 用途与签名策略                                                                             |
| :------------ | :------------ | :------------------------------ | :----------------------------------------------------------------------------------------- |
| `development` | Android / iOS | `internal`                      | 本地与真机联调包，包含 Expo Dev Client，配置 `DISABLE_CODE_SIGNING: "true"` 方便免签调试。 |
| `simulator`   | iOS           | 本地构建                        | 生成供 iOS 模拟器使用的 `.app` 产物。                                                      |
| `test`        | Android / iOS | `store` (iOS) / `apk` (Android) | 测试渠道构建，iOS 走 TestFlight，Android 输出独立 APK，启用代码签名校验。                  |
| `preview`     | Android       | `internal`                      | 预览测试包，输出独立 APK。                                                                 |
| `production`  | Android / iOS | `store` (iOS) / `apk` (Android) | 正式发布渠道构建，用于发布 App Store / 应用市场，启用代码签名校验。                        |

### 5.2 交互式一键构建脚本 (`pnpm run build`)

运行交互式脚本，按提示选择目标平台（Android / iOS / All）与目标环境（开发 / 测试 / 正式）：

```bash
pnpm run build
```

---

## 6. 上传与分发 (EAS Submit)

### 6.1 iOS 提交到 App Store / TestFlight

```bash
# 提交最新构建好的 iOS 安装包到 App Store Connect
eas submit -p ios --latest
```

_注意：在执行 submit 前，必须确保 `eas.json` 对应 profile 的 `distribution` 设置为 `"store"`。_

### 6.2 版本号递增规范

- **iOS**：每次提交 App Store / TestFlight，必须在 `app.json` 中递增 `ios.buildNumber`（如从 `"26"` 改为 `"27"`）。
- **Android**：每次发布新 APK，必须在 `app.json` 中递增 `android.versionCode`。
- 修改后运行以下命令同步至原生工程配置：
  ```bash
  npx expo prebuild --no-install
  ```

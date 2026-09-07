# 构建发布与 OTA 热更新运维指南 (Release & OTA)

华师匣子采用 Expo Application Services (EAS) 结合自建私有化 EAS Update 服务器的混合架构，实现高可靠的安装包构建与秒级 JavaScript 热更新下发。

---

## 1. 架构总览

```text
代码仓库 (GitHub)
   │
   ├─► 变更涉及原生依赖/原生工程配置 ──► 原生打包 (EAS Build) ──► 生成 APK / IPA ──► 上架商店 / 分发
   │
   └─► 仅变更 JS/TS 代码与静态资源 ──► 热更新 (EAS Update) ──► 私有化 OTA 服务器 ──► 客户端秒级热更
```

---

## 2. OTA 热更新机制与私有化服务器

### 2.1 自建私有化服务器配置

为保障境内高校网络环境下 OTA 更新的高可用与极速下发，项目配置了自建的私有化 OTA 服务与静态资源加速：

- **Update URL**：`https://ota.ccnubox.muxixyz.com/65d670f0-9625-4631-9603-f4b11f44e621`
- **Asset Host Override**：`assets.ota.ccnubox.muxixyz.com`
- **Manifest Host Override**：`ota.ccnubox.muxixyz.com`

### 2.2 `runtimeVersion` 严格匹配法则

**核心铁律**：客户端只拉取并执行与自身二进制构建完全匹配的 `runtimeVersion` 的热更新包。

```json
{
  "expo": {
    "version": "3.1.10",
    "runtimeVersion": "3.1.8"
  }
}
```

- **仅修改纯前端代码**：无需变动 `runtimeVersion`，直接发布 OTA。
- **修改了原生依赖、修改了 `app.json` 原生插件配置、或升级了 SDK**：必须递增 `runtimeVersion` 与 `version`，重新进行原生应用打包。

### 2.3 自动 CI 发布与更新日志维护

热更新元数据由 `src/assets/data/updateInfo.json` 统筹维护：

```json
{
  "otaVersion": "3.1.11",
  "updateTime": "2026-08-31",
  "newFeatures": ["新特性说明..."],
  "fixedIssues": ["修复问题说明..."],
  "knownIssues": []
}
```

当向 GitHub `main` 分支提交包含 `src/assets/data/updateInfo.json` 的修改时，GitHub Actions（`test_update.yml`）会自动触发 EAS Update 发布到 `test` 测试通道。

---

## 3. 原生工程构建 (EAS Build)

### 3.1 Build Profiles (`eas.json`)

| Profile 名    | 平台          | 分发模式                        | 用途说明                                                      |
| :------------ | :------------ | :------------------------------ | :------------------------------------------------------------ |
| `development` | Android / iOS | `internal`                      | 生成包含 Expo Dev Client 的测试包，支持本地断点与实时热重载。 |
| `simulator`   | iOS           | 本地构建                        | 生成供 iOS 模拟器使用的 `.app` 产物。                         |
| `test`        | Android / iOS | `store` (iOS) / `apk` (Android) | 测试渠道构建，iOS 走 TestFlight，Android 输出独立 APK。       |
| `production`  | Android / iOS | `store` (iOS) / `apk` (Android) | 正式发布渠道构建，用于发布应用商店。                          |

### 3.2 交互式一键构建脚本 (`pnpm run build`)

运行交互式脚本，按提示选择目标平台（Android / iOS / All）与目标环境（开发 / 测试 / 正式）：

```bash
pnpm run build
```

---

## 4. 上传与分发 (EAS Submit)

### 4.1 iOS 提交到 App Store / TestFlight

```bash
# 提交最新构建好的 iOS 安装包到 App Store Connect
eas submit -p ios --latest
```

_注意：在执行 submit 前，必须确保 `eas.json` 对应 profile 的 `distribution` 设置为 `"store"`。_

### 4.2 版本号递增规范

- **iOS**：每次提交 App Store / TestFlight，必须在 `app.json` 中递增 `ios.buildNumber`（如从 `"25"` 改为 `"26"`）。
- **Android**：每次发布新 APK，必须在 `app.json` 中递增 `android.versionCode`。
- 修改后运行以下命令同步原生工程：
  ```bash
  npx expo prebuild --no-install
  ```

# 敏感权限清单与来源

## 统一申请规则

运行时权限与敏感数据访问必须通过 `src/utils/requestPermission.ts` 统一调度，文案与 Purpose ID 统一定义在 `src/constants/PERMISSIONS.ts` 中。

模块提供两类调用模式：

1. **系统运行时权限申请 (`requestPermission`)**：用于需要系统授权弹窗的场景（如保存图片到相册、开启系统通知推送）。调用方提供权限查询、授权判断、系统请求函数以及对应的用途说明（`PermissionPurpose`）。
2. **敏感动作用途提示 (`runPermissionAction`)**：用于无须显式运行时权限但仍涉及敏感用户数据交互的场景（如 Android Photo Picker 选择图片）。

该模块负责在系统弹窗或系统选择器出现前渲染统一用途说明 Modal、等待用户确认、保持说明直到系统交互结束，并通过 Promise 队列串行化并发申请，避免系统弹窗相互覆盖或冲突。

每种用途在用户点击“继续”后持久化确认状态（存储 Key 前缀为 `@ccnubox/permission-purpose/`，同时向前兼容旧版 `@ccnubox/sensitive-permission-purpose/`），后续再次触发时不再重复弹窗；若用户点击“取消”或关闭弹窗，则不会持久化确认状态。

### 当前业务入口与用途映射

| 业务场景         | 调起方式              | 涉及权限 / 系统能力                               | PERMISSION_PURPOSES 项    |
| :--------------- | :-------------------- | :------------------------------------------------ | :------------------------ |
| **反馈上传图片** | `runPermissionAction` | 系统 Photo Picker（不申请运行时媒体库读取权限）   | `feedbackImage`           |
| **课表背景图片** | `runPermissionAction` | 系统 Photo Picker（不申请运行时媒体库读取权限）   | `courseTableBackground`   |
| **保存课表截图** | `requestPermission`   | 相册写入权限（`expo-media-library`）              | `saveCourseTable`         |
| **开启消息推送** | `requestPermission`   | 通知权限（`expo-notifications` / `jpush`）        | `pushNotification`        |
| **座位预约扫码** | `requestPermission`   | 相机权限（`CAMERA` / `NSCameraUsageDescription`） | `scanSeatQrCode`          |
| **校园地图**     | 系统/WebView 自带触发 | 仅在使用期间定位权限（WebView 内部定位服务）      | 由系统及 WebView 页面管理 |

## 冗余权限来源与管控策略

`app.json` 中的 `android.permissions` 仅描述应用显式声明的权限，但 Expo Config Plugins 在解析构建配置时会自动合并依赖库声明的权限：

- `expo-media-library` 默认会添加 `READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE` 和 `READ_MEDIA_VISUAL_USER_SELECTED`；未配置 `granularPermissions` 时还会自动添加全量音视频和图片读取权限。
- `expo-image-picker` 在 `microphonePermission` 未显式设为 `false` 时会添加 `RECORD_AUDIO`，且可能写入相机相关声明。
- `android/app/src/main/AndroidManifest.xml`、`ios/ccnubox/Info.plist` 是 `expo prebuild` 生成的原生工程产物，不应作为长期权限配置的唯一维护地；手动在产物中删除的声明会在下一次执行 prebuild 时被覆盖。

### 权限收敛与防护策略

1. **最小权限文案与细粒度限制**：
   在 `app.json` 中配置 `expo-media-library` 插件的最小权限文案，并显式指定 `granularPermissions: ["photo"]`；图片读取和旧版 Android 相册写入所需的基础权限由插件按需保留。
2. **硬件权限精准管控与防护**：
   相机权限（`android.permission.CAMERA` 与 iOS `NSCameraUsageDescription`）仅按需声明用于图书馆座位扫码签到与预约；在 `app.json` 中将 `expo-image-picker` 的 `cameraPermission` 明确配置为该扫码用途文案，同时将 `microphonePermission` 显式设为 `false`，阻止录音权限（`RECORD_AUDIO`）进入最终产物。
3. **精准声明必要权限**：
   `android.permissions` 中只保留应用业务确实必需且无法由依赖自动补充的权限（如定位权限 `ACCESS_COARSE_LOCATION`、`ACCESS_FINE_LOCATION`，通知权限 `POST_NOTIFICATIONS`，以及自启动广播 `RECEIVE_BOOT_COMPLETED`）。
4. **移除 iOS 冗余 Face ID 声明**：
   通过自定义插件 `./plugins/remove-unused-ios-permissions.js`，在构建时从生成的 iOS `Info.plist` 中移除 `expo-secure-store` 自动注入的 `NSFaceIDUsageDescription`，避免应用因未实际使用 Face ID 导致的 App Store 审核被拒。
5. **Android 软件包可见性与 URL Scheme 配置**：
   通过自定义插件 `./plugins/config-android-url-scheme.js`，向 AndroidManifest `<queries>` 节点注入微信（`com.tencent.mm`, `weixin`）、支付宝（`com.eg.android.AlipayGphone`, `alipays`）以及系统 `tel` / `sms` 的包名与 Intent Scheme，保证在 Android 11+ 上正常调起第三方应用。
6. **Android 权限移除机制 (`tools:node="remove"`)**：
   如果第三方依赖的原生 Manifest 强制加入了无法通过配置关闭的权限，应在 `android.blockedPermissions` 中声明，Expo prebuild 会在最终 Manifest 节点上添加 `tools:node="remove"`。
7. **Release 环境审计原则**：
   React Native 的 Debug 依赖可能会包含 `SYSTEM_ALERT_WINDOW`，但在 Release 打包时不会注入。权限合规性审计均应以 Release 最终合并生成的 Manifest 和 Info.plist 为准。
8. **Prebuild 验证要求**：
   任何涉及权限配置的修改均应重新运行 `npx expo prebuild`，并核查生成的 `AndroidManifest.xml` 与 `Info.plist`，确保没有意外多余的权限被合入。

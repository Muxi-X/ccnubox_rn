# 敏感权限清单与来源

## 统一申请规则

运行时敏感权限必须通过 `src/utils/requestSensitivePermission.ts`
申请。调用方只提供：

- 当前权限查询函数；
- 系统权限申请函数；
- 如何判断已授权；
- 对应的用途说明文案。

该模块负责在系统权限框出现前渲染用途说明、等待用户确认、保持说明直到系统请求结束，并串行化并发申请。每种用途在用户点击“继续”后持久化确认状态，后续不再重复展示；点击“取消”不会记录确认状态。

当前业务入口：

- 反馈上传图片：通过系统 Photo Picker 选择图片，不申请媒体库读取权限；
- 课表背景图片：通过系统 Photo Picker 选择图片，不申请媒体库读取权限；
- 保存课表截图：相册写入权限；
- 开启消息推送：通知权限。
- 校园地图：使用期间定位权限。

## 冗余权限的来源

`android.permissions` 只描述应用显式声明的权限，但 Expo config
plugin 会在解析配置时继续合并权限：

- `expo-media-library` 总是添加
  `READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE` 和
  `READ_MEDIA_VISUAL_USER_SELECTED`；未配置 `granularPermissions`
  时还会默认添加图片、视频、音频读取权限。
- `expo-image-picker` 在 `microphonePermission` 未设为 `false` 时添加
  `RECORD_AUDIO`，并可能写入相机相关声明。
- `android/app/src/main/AndroidManifest.xml`、`ios/ccnubox/Info.plist`
  是 prebuild 产物，不应作为长期权限配置的唯一来源；手动删除产物中的声明会在下一次 prebuild 时被恢复。

因此配置采取以下策略：

1. 在 `app.json` 为图片插件指定最小用途文案，并只请求
   `granularPermissions: ["photo"]`；图片读取和旧版 Android 相册写入所需的基础权限由插件保留。
2. 将 `expo-image-picker` 的 `cameraPermission` 和 `microphonePermission` 设为
   `false`，由官方插件阻止相机和录音权限进入最终 Manifest。
3. 从 `android.permissions`
   中移除没有业务用途的显式权限；该数组只用于添加应用确实需要且依赖没有自动声明的权限。
4. 运行 `remove-unused-ios-permissions`，移除 `expo-secure-store`
   自动加入但应用没有使用的 Face ID 权限说明。

Android 的 `expo-image-picker` 使用系统 Photo
Picker。选取反馈图片和课表背景时，先展示必须确认的用途说明，再直接打开 Photo
Picker；不调用
`requestMediaLibraryPermissionsAsync`。系统只向应用提供用户主动选择的图片。

如果后续依赖的原生 Manifest 自动加入了无法通过其配置关闭的权限，应优先在
`android.blockedPermissions` 中声明。Expo 会在最终 Manifest 中生成
`tools:node="remove"`；不需要为此维护自定义 Android 权限过滤插件。

React Native 的 debug 依赖会声明
`SYSTEM_ALERT_WINDOW`，但 release 依赖不会。权限审计应以 release 合并后的 Manifest 为准。

修改权限配置后，应重新运行 prebuild 并检查生成的 Android Manifest 和 iOS
Info.plist；不要只修改生成文件。

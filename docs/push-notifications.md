# 消息推送与厂商通道集成指南 (JPush)

华师匣子使用极光推送（JPush）作为底层推送服务基座，并在 Android 端深度集成了主流厂商系统级推送通道，以保障通知在后台与息屏状态下的高到达率。

---

## 1. 架构总览

```text
JPush 云端控制台 / 校园后台推送服务
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   [iOS APNs 通道]        [Android 厂商通道]
        │             (华为/小米/OPPO/VIVO/荣耀/极光自建)
        │                       │
        ▼                       ▼
   系统通知栏展示           系统通知栏展示
        │                       │
        └───────────┬───────────┘
                    ▼
           用户点击通知栏消息
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
     [应用冷启动]          [应用在前台/后台]
         │                     │
  JPushColdStartBridge      onNotificationOpened 事件
  原生暂存并延迟消费               │
         │                     ▼
         └──────────► 统一深链接解析 (useJPush)
                               │
                               ▼
                        Expo Router 路由跳转
                     (如 /courseTable/addCourse)
```

---

## 2. 原生工程配置与插件机制

推送能力通过 Expo Config Plugin `mx-jpush-expo` 自动注入原生工程，无需手动修改 `AndroidManifest.xml` 或 `AppDelegate`。

### 2.1 动态配置 (`app.config.ts`)

在 `app.config.ts` 中，插件动态读取构建环境注入的 JPush 密钥与各厂商参数：

- `JPUSH_APP_KEY`：极光 AppKey。
- `JPUSH_CHANNEL`：推送渠道标识（默认为 `coursetable`）。
- `JPUSH_PKGNAME`：包名（`com.muxixyz.ccnubox`）。
- **厂商通道参数**：
  - 小米：`JPUSH_XIAOMI_APP_ID`、`JPUSH_XIAOMI_APP_KEY`
  - VIVO：`JPUSH_VIVO_APP_ID`、`JPUSH_VIVO_APP_KEY`
  - OPPO：`JPUSH_OPPO_APP_ID`、`JPUSH_OPPO_APP_KEY`、`JPUSH_OPPO_APP_SECRET`
  - 荣耀：`JPUSH_HONOR_APP_ID`
  - 华为：开启 AGConnect 插件与 `agconnect-services.json`

---

## 3. 冷启动通知点击桥接 (`JPushColdStartBridge`)

### 3.1 核心痛点

当应用处于彻底关闭状态（进程不存在）时，用户点击通知栏唤醒应用，此时 React Native JS 引擎尚未完成初始化，JPush JS 层的事件监听器未能注册，导致“点击通知拉起应用但无法跳转到指定页面”。

### 3.2 解决方案

在 iOS 端实现了原生桥接模块 `ios/ccnubox/JPushColdStartBridge.m`：

1. 原生层在 `didReceiveRemoteNotification` 捕获到启动意图时，将通知载荷暂存在静态内存队列中。
2. JS 端在 `useJPush.ts` 启动时，主动调用 `consumeNativeInitialJPushOpened()` 检查并消费冷启动暂存消息。
3. 待 Expo Router 导航树就绪（`setPushNavigationReady(true)`）后，执行受控的延迟深链接跳转。

---

## 4. 深度链接协议与跳转规则

通知 Payload 支持通过 `extras` 字段指定应用内跳转行为：

| 字段名    | 格式示例                      | 解析逻辑                                                        |
| :-------- | :---------------------------- | :-------------------------------------------------------------- |
| `url`     | `ccnubox://tabs/schedule`     | 标准 App Custom Scheme，支持打开应用内任意已注册路由。          |
| `path`    | `/setting/feedback`           | 相对路径形式，自动补全协议头后通过 Expo Router 进行替换或推入。 |
| `http(s)` | `https://ccnubox.muxixyz.com` | 外部 Web 页面，自动调用内置 WebView 或外部浏览器打开。          |

---

## 5. 本地调试与排错清单

1. **获取 RegistrationID**：
   应用成功初始化后会在控制台输出 `JPush Registration ID: xxxxxxxxx`。只有成功获取到 RegistrationID，设备才算在极光平台成功注册。
2. **通知权限检查**：
   必须先通过 `src/utils/pushSubscription.ts` 获得系统通知授权，否则 JPush 会主动跳过初始化流程。
3. **厂商通道联调**：
   测试厂商通道推送时，Android 必须使用 Release 签名打包或配置了正式 Keystore 签名的 Debug 包（因为华为、小米等厂商要求校验签名证书指纹）。

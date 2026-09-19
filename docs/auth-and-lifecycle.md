# 应用生命周期、认证状态机与安全规范指南 (Auth & Lifecycle)

本文档阐述华师匣子客户端的启动生命周期分发、分级存储安全策略、双 Token 自动续期状态机、注销合规流程以及全局异常监控机制。

---

## 1. 启动生命周期与路由分发状态机 (`src/app/index.tsx`)

应用在原生 SplashScreen 呈现期间完成本地数据水合、错误监听器注入以及认证态鉴权，整个生命周期流转图如下：

```text
               应用冷启动 (Cold Launch)
                         │
                         ▼
             原生 SplashScreen 保持常驻
                         │
                         ▼
        等待 Zustand 数据水合 (useCourse.hydrated)
                         │
                         ▼
              执行全局初始化与监控挂载:
        - setupGlobalErrorHandler() (全局未处理异常捕获)
        - reportUpdatesLogs()       (OTA更新日志采集)
        - SplashScreen.hideAsync()  (隐藏原生启动图)
                         │
                         ▼
              从 SecureStore 异步读取凭据
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        longToken 存在        longToken 不存在
              │                     │
              ▼                     ▼
       直接路由重定向至        检查 firstLaunch 标志
        router.replace         ┌────┴────────────┐
          ('/(tabs)')          ▼                 ▼
                          首次启动            非首次启动
                          (null)              ('false')
                               │                 │
                               ▼                 ▼
                          写入 firstLaunch  重定向至登录页
                          并进入引导轮播页   router.replace
                          router.replace   ('/auth/login')
                         ('/auth/guide')
```

---

## 2. 分级存储架构与安全隔离

应用对存储数据进行了严格的安全分级，防止用户敏感信息泄露：

| 存储介质                      | 底层实现                                                      | 数据内容                                                                | 安全与持久化策略                                                     |
| :---------------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **安全密钥库 (SecureStore)**  | iOS Keychain<br>Android KeyStore + EncryptedSharedPreferences | 1. `shortToken`<br>2. `longToken`<br>3. `user` (学号与密码凭据)         | 强加密物理隔离；应用卸载或系统清除数据时按平台规则清除；跨进程安全。 |
| **通用持久化 (AsyncStorage)** | 平台标准文件/SQLite 数据库                                    | 课表数据桶 (`course-store`)、外观配置、寝室绑定、自习室收藏、宫格排序等 | 纯业务缓存与偏好配置，不保存任何未加密账号凭据与访问令牌。           |
| **内存状态 (In-Memory)**      | Zustand Store / React State                                   | 全局 Portal 挂载节点、网络请求总线 (`requestBus`)、导航右侧按钮         | 应用进程退出后即刻销毁，无任何持久化残留。                           |

---

## 3. 认证状态机与双 Token 自动无缝轮转

华师匣子接入华中师范大学统一身份认证系统。为了在保障安全的同时避免用户频繁被迫重新登录，系统设计了双 Token 静默刷新机制。

### 3.1 登录流程 (`/auth/login`)

1. **隐私前置校验**：用户必须勾选同意《用户协议》与《隐私政策》，未勾选时禁止发起网络请求。
2. **凭据提交与令牌派发**：
   - 携带学号与密码向 `/users/login_ccnu` 发起请求。
   - 响应成功后，服务端在响应标头中返回短期访问令牌（`x-jwt-token`）与长期刷新令牌（`x-refresh-token`）。
   - 分别将 `shortToken` 和 `longToken` 存入 `SecureStore`，并将凭据同步至 `useUserStore`。

### 3.2 401 响应拦截与防抖并发队列 (`src/request/index.ts`)

```text
发起业务 API 请求 (Authorization: Bearer <shortToken>)
                  │
                  ▼
          服务端返回 401 Unauthorized
                  │
                  ▼
         是否已有刷新队列正在执行？
                  │
          ┌───────┴───────┐
       [否]               [是]
          │                 │
          ▼                 ▼
创建 refreshingPromise    等待当前 refreshingPromise 完成
向 /users/refresh_token 换取新 shortToken
          │
     ┌────┴───────────────────────────┐
  [成功]                            [失败]
     │                                │
     ▼                                ▼
更新 SecureStore.shortToken     清除本地 Token 与登录凭据
自动重新发送因 401 中断的原请求    强制重定向至 /auth/login
```

---

## 4. 退出登录与账号注销合规

为了严格遵循各大应用商店与国家个人信息保护合规规范，客户端提供了“退出登录”与“永久注销账号”两套完整的生命周期终结方案：

### 4.1 退出登录 (Logout - `src/constants/SETTING.tsx`)

- **触发方式**：个人中心 -> 设置 -> 退出登录 -> 二次确认弹窗。
- **清除范围**：
  1. 异步从 `SecureStore` 物理删除 `shortToken` 与 `longToken`。
  2. 清理 `useUserStore` 中的登录密码，但保留已填写的学号，方便下次一键回填。
  3. 清理已缓存的离线课表数据（`courses`）。
- **跳转**：一键切换根路由到 `/auth/login`。

### 4.2 账号注销 (Account Deactivation - `src/app/(setting)/signOff.tsx`)

- **触发方式**：个人中心 -> 设置 -> 注销账号 -> 强警示页面。
- **操作前提**：强制要求用户二次输入登录密码，确认本人意愿。
- **执行流程**：
  1. 向服务端接口发起 `deactivate(password)` 注销请求，服务端同步抹除该学号关联的云端配置、推送订阅与历史记录。
  2. 服务端确认后，客户端执行全量数据擦除：
     ```ts
     await Promise.all([
       AsyncStorage.multiRemove(['courses']),
       deleteItemAsync('longToken'),
       deleteItemAsync('shortToken'),
       deleteItemAsync('user'),
     ]);
     useUserStore.setState({ student_id: '', password: '' });
     ```
  3. 彻底清除 Modal 状态并引导重定向至 `/auth/login`。

---

## 5. 全局异常监控与诊断上报 (`errorHandler.ts` & `easUpdate.ts`)

为了快速定位线上偶发崩溃与热更新兼容性异常，客户端在顶层挂载了统一的容错与追踪总线：

### 5.1 JS 未处理异常捕获 (`setupGlobalErrorHandler`)

通过 React Native 底层 `ErrorUtils.setGlobalHandler` 接管全局异常：

- **开发环境**：在终端与控制台输出格式化堆栈，便于实时调试。
- **生产环境**：捕获未捕获的运行时异常（`error.message`、`error.stack`、`platform`、`osVersion`），并通过静默通道调用 `errorLogger('frontend', 'js_error', errorInfo)` 上报至团队监控后台。

### 5.2 OTA 运行日志回溯 (`reportUpdatesLogs`)

冷启动时自动调用 `expo-updates` 的原生 `readLogEntriesAsync` 提取底层热更新加载日志。当检测到更新异常或处于 `isEmergencyLaunch` 降级启动模式时，自动打包上报，帮助运维团队迅速定位热更新补丁引发的问题。

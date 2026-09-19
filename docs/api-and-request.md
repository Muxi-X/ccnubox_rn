# 网络请求与 OpenAPI 规范驱动 (API Architecture)

华师匣子移动端的网络通信层采用契约驱动（Contract-First）的设计理念，以 OpenAPI / Swagger 规范为事实标准，实现端到端的 TypeScript 强类型保障。

---

## 1. 架构流转图

```text
后端服务 (Main API / Feedback API)
        │
        ▼ 暴露 /swag /openapi 规范
scripts/genapi.js (pnpm run genapi)
        │
        ├── 写入 src/request/openapi.yaml & openapi.feedback.yaml
        │
        ▼ openapi-typescript 解析
生成类型文件: src/request/schema.d.ts & schema.feedback.d.ts
        │
        ▼
createRequestClient<paths>(axiosInstance) (src/request/createRequestClient.ts)
        │
        ├────────────────────────────────┐
        ▼                                ▼
主服务客户端: request               反馈客户端: feedbackRequest
(自动挂载长短Token无缝刷新拦截器)    (独立 Feishu / Feedback Token 适配)
```

---

## 2. API 类型全自动生成 (`pnpm run genapi`)

### 2.1 脚本职责 (`scripts/genapi.js`)

1. 通过 `dotenv-flow` 自动加载 `.env` 或 `.env.local` 中的 API 访问凭据。
2. 支持 Basic Auth 交互式提示输入（若未配置环境变量）。
3. 拉取两个关键微服务的 OpenAPI 规范：
   - **CCNUBox 主服务**：拉取 `/swag` 端点，生成 `src/request/schema.d.ts`。
   - **反馈与工单服务**：拉取 `/openapi` 端点，清洗多余字段并生成 `src/request/schema.feedback.d.ts`。
4. 调用 `pnpm format` 自动格式化生成的类型定义文件。

### 2.2 运行方式

```bash
pnpm run genapi
```

---

## 3. 泛型请求客户端 (`createRequestClient`)

通过 TypeScript 高级类型推导，使普通的 Axios 实例获得端点级的参数提示、路径补全与返回类型推导：

```ts
import { request } from '@/request';

// 1. GET 请求示例（自动推导 Query 参数类型与 200 响应结构）
const response = await request.get('/course/table', {
  params: {
    query: {
      year: '2025-2026',
      semester: '1',
    },
  },
});

// 2. POST 请求示例（自动推导 Request Body 结构）
const res = await request.post('/course/note', {
  body: {
    course_id: '10001',
    note: '周三记得交实验报告',
  },
});
```

---

## 4. 双 Token 认证与静默自动刷新

### 4.1 令牌模型

- **shortToken (短期访问令牌)**：
  保存在 `expo-secure-store` 中，用于每一次业务请求的 `Authorization: Bearer <shortToken>` 标头。
- **longToken (长效刷新令牌)**：
  保存在 `expo-secure-store` 中，仅在短 Token 失效时用于向 `/users/refresh_token` 换取新的短 Token。

### 4.2 401 拦截与请求重放机制

`src/request/installRequestInterceptors.ts` 负责两个客户端共用的 token 注入、请求计数和 401 重试流程；各客户端保留自己的 token 读取与刷新方式。

1. `isToken: false` 跳过自动 token 注入；其余请求读取对应 token，去除首尾空白后写入 `Authorization`。
2. 首次收到 `401 Unauthorized` 时标记 `_retry`，尝试刷新并重放原请求。重放再次返回 401 时直接拒绝，不再刷新。
3. 主服务的短 token 刷新仍由 `src/request/index.ts` 管理。并发请求共用正在执行的刷新 Promise；刷新成功后写入 `shortToken`，失败时跳转 `/auth/login`。
4. 配置 `otherToken` 的请求沿用其 `refresh` 与 `onRefreshError`。反馈客户端没有可用的 `refresh` 时直接返回原 401，不跳转主服务登录页。

重放请求仍会经过请求拦截器，按原有优先级重新读取显式 token 或本地缓存。重放失败不视为刷新失败，不会再次触发 `onRefreshError`。

---

## 5. 请求总线监控 (`requestBus`)

在 `src/store/currentRequests.ts` 中维护了一个轻量级的内存级请求总线：

- 两个客户端共用同一个总线，每次进入请求拦截器时调用 `requestRegister()`，增加 `totalRequestNum`。
- 响应成功或失败时调用 `requestComplete()`，增加 `resolvedRequestNum`；读取 token 失败、尚未发出 HTTP 请求时也会完成计数。
- 两个计数相等且一秒内没有新请求时，总线将计数归零，并通过 `globalEventBus` 发出 `request_complete` 事件。
- 401 重放单独计数。主服务通过原始 `axios.get` 发出的短 token 刷新请求不进入这组拦截器，不计入总线。

## 6. 请求层回归测试

使用 Node.js 22 执行：

```bash
pnpm run test:request
```

测试通过 `request` 和 `feedbackRequest` 公开入口调用真实 Axios，仅替换 HTTP adapter、原生依赖和服务地址。覆盖查询参数、token 优先级、401 重试、刷新失败回调、登录跳转以及请求计数；不连接真实后端。该命令也在 CI 中执行。

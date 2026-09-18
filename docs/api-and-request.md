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

在 `src/request/index.ts` 中实现了完整的防抖重试队列：

1. 当请求收到 `401 Unauthorized` 时，系统拦截该错误。
2. 若当前已有刷新 Promise 在进行中，其他 401 请求将等待同一个刷新 Promise，避免同时发起多次刷新调用。
3. 刷新成功后，更新本地 `shortToken` 缓存，使用新 Token 自动重放原失败请求。
4. 若刷新失败或长 Token 已过期，系统自动中断队列并重定向用户至 `/auth/login`。

---

## 5. 请求总线监控 (`requestBus`)

在 `src/store/currentRequests.ts` 中维护了一个轻量级的内存级请求总线：

- 任何通过 `axiosInstance` 发起的请求在发出时调用 `requestRegister()`（计数 +1）。
- 在响应或错误返回时调用 `requestComplete()`（计数 -1）。
- 全局 UI（例如全局下拉刷新指示器、页面 Loading 遮罩）可随时通过订阅 `requestBus` 获取当前应用是否仍有后台网络活动。

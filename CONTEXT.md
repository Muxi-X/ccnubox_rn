# 华师匣子核心领域全景 (Domain Context)

本文档定义华师匣子移动客户端（CCNUBox Mobile）的核心领域模型、术语体系与业务规则，作为系统功能实现与智能体协作的基础上下文。

---

## 1. 核心领域术语表 (Glossary)

| 领域术语       | 英文对照         | 含义与业务规则                                                                                                                                             |
| :------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **学年**       | `Year`           | 学术年度标识，格式通常为 `YYYY-YYYY`（例如 `2025-2026`）。                                                                                                 |
| **学期**       | `Semester`       | 学年内的学期阶段，通常为 `1`（秋季学期）、`2`（春季学期）或 `3`（暑期学期）。组合键如 `2025-2026-1`。                                                      |
| **开学日期**   | `SchoolTime`     | 学期第一周开始的时间戳。业务规则统一将周一作为自然周的第一天，开学日期所在周视为教学周第 1 周。                                                            |
| **放假日期**   | `HolidayTime`    | 学期结束并进入假期的起始时间戳。                                                                                                                           |
| **教学周**     | `Teaching Week`  | 从开学第一周（Week 1）起算的教学进度周数，由当前时间戳结合 `SchoolTime` 动态计算得来，取值范围为 `[1, MaxWeek]`。                                          |
| **当前周**     | `Current Week`   | 当前自然时间对应的教学周。若在假期中，则标记为假期状态或限制在学期有效周次范围内。                                                                         |
| **选中周**     | `Selected Week`  | 用户在课表视图上主动滑动或选择查看的特定周次。                                                                                                             |
| **课程**       | `Course`         | 教学课程实例，包含课程名、任课教师、上课教室、星期几（day: 1~7）、起始节次（startSection）、结束节次（totalSection / duration）以及开课周次列表（weeks）。 |
| **自定义课程** | `Custom Course`  | 学生自行添加的个人日程或非教务系统统一排课的内容，由本地唯一 ID 标识，支持增删改查。                                                                       |
| **课程备注**   | `Course Note`    | 针对某门课程添加的个人备注或备忘录。                                                                                                                       |
| **课表存储桶** | `Course Bucket`  | 以 `year_semester` 为作用域的数据隔离存储单元，保存各学期的课程列表、拉取时间（`fetchedAt`）及最后刷新时间（`lastRefreshTime`）。                          |
| **寝室电费**   | `Electricity`    | 学生宿舍用电额度查询服务，包含电量余额、房间架构（校区-楼栋-单元-房间号）、标准电价及电费预警设置。                                                        |
| **成绩与绩点** | `Grade & GPA`    | 学生的学业成绩记录，包含课程学分、成绩原始分、折算绩点（GPA）以及加权平均绩点。                                                                            |
| **空闲教室**   | `Free Classroom` | 查询指定教学楼、星期、节次没有被排课的教室资源，用于学生自习或活动借用。                                                                                   |
| **蹭课系统**   | `Space Lesson`   | 按院系、教师、课程名全校检索课程并查看其上课时间和地点。                                                                                                   |

---

## 2. 核心领域逻辑与计算规则

### 2.1 周次与自然周对齐计算

- **自然周归一化**：
  学期开学日所在的自然周周一为起点计算教学周：
  $$\text{Week} = \left\lfloor \frac{\text{CurrentTimestamp} - \text{StartOfWeek}(\text{SchoolTime})}{7 \times 24 \times 3600 \times 1000} \right\rfloor + 1$$
- **周次边界约束**：
  若当前时间早于开学日，当前周归约为第 1 周；若超出学期最大周（通常为 20~25 周，容错上限 60 周），则做上限截断。

### 2.2 课表数据流与多端同步

```text
教务系统 API / 本地缓存
        │
        ▼
   [useCourse] Store (分学期 Bucket 缓存持久化)
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
课表主视图渲染             updateCourseWidgetData()
(TimetableScrollView)             │
                         ┌────────┴────────┐
                         ▼                 ▼
                   [iOS Platform]    [Android Platform]
                         │                 │
                  ExtensionStorage    CcnuboxWidget Module
                  (App Group 共享)    (SharedPreferences 存入)
                         │                 │
                  WidgetKit 刷新     广播 ACTION_UPDATE_WIDGET
                  (小组件 + 灵动岛)   (2x2 / 4x2 桌面微件)
```

### 2.3 认证与双 Token 状态机

- **Token 体系**：
  - `shortToken`：JWT 短令牌，请求 API 时注入 `Authorization: Bearer <shortToken>`，生命周期较短。
  - `longToken`：长刷新令牌，持久化保存在安全存储（`expo-secure-store`）中。
- **自动无缝续期**：
  - 遇到 HTTP 401 响应时，系统通过 Promise 互斥队列调用 `/users/refresh_token` 请求新短 Token。
  - 换取成功后静默替换本地短 Token，并重放之前失败的并发请求。
  - 换取失败或长 Token 不存在，清除认证状态并强制导航至 `/auth/login`。

---

## 3. 全局状态 (Zustand Stores) 拓扑与存储规划

| Store 模块        | 文件路径                       | 持久化方式      | 存储 Key             | 核心职责                                                |
| :---------------- | :----------------------------- | :-------------- | :------------------- | :------------------------------------------------------ |
| `useAuth`         | `src/store/auth.ts`            | SecureStore     | `auth`               | 保存登录学号、长短 Token、用户基本信息及认证状态        |
| `useTimeStore`    | `src/store/time.ts`            | AsyncStorage    | `time-store`         | 保存当前学年、当前学期、选中周次、开学与放假时间戳      |
| `useCourse`       | `src/store/course.ts`          | AsyncStorage    | `course-store`       | 保存分学期的课程数据存储桶、当前活跃学期、课程分类标签  |
| `useVisualScheme` | `src/store/visualScheme.ts`    | AsyncStorage    | `visualScheme`       | 保存全局主题模式、自动跟随系统设置、多端布局与图标定制  |
| `useElectricity`  | `src/store/electricity.ts`     | AsyncStorage    | `electricity-store`  | 保存绑定的宿舍房间信息、历史房间列表与预警阈值          |
| `useNotification` | `src/store/notification.ts`    | AsyncStorage    | `notification-store` | 保存系统通知列表、未读消息计数与分类过滤配置            |
| `usePortalStore`  | `src/store/portal.ts`          | 内存状态 (None) | -                    | 全局 Portal 视图层挂载节点管理（Modal、ActionSheet 等） |
| `requestBus`      | `src/store/currentRequests.ts` | 内存状态 (None) | -                    | 活跃网络请求计数器，供全局加载指示器与诊断工具订阅      |

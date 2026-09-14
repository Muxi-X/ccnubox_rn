# 校园微服务与数据体系架构指南 (Campus Services)

华师匣子集成了针对华中师范大学在校师生的全套校园微应用生态，包括寝室电费充值与预警、成绩查询与学分绩点（GPA）计算、空闲自习室与蹭课系统、校历日程、部门黄页及校园网站导航。本文档详细记录各微服务的核心架构、业务数据流与交互机制。

---

## 1. 微应用网格与动态排序体系 (`useGridOrder`)

首页采用模块化微服务入口网格（位于 `src/app/(tabs)/index.tsx` 与 `src/app/(mainPage)/more.tsx`），支持用户依据使用习惯自由拖拽调整图标显示次序。

```text
┌─────────────────────────────────────────────────────────────┐
│                       首页核心微应用网格                      │
│   [电费查询]   [成绩查询]   [空闲教室]   [蹭课查询]            │
│   [学分绩计算] [校历日程]   [校园地图]   [部门黄页]            │
│   [常用网站]   [座位预约]   ...          [更多微应用] (末位固化)│
└─────────────────────────────────────────────────────────────┘
```

### 1.1 拖拽持久化与“更多”锚定算法

- **轻量级持久化 (`partialize`)**：
  在 `src/store/gridOrder.ts` 中，为避免将包含组件图标引用、本地化标题等易变的静态配置完整落盘，仅将应用的唯一标识序列 `{ key: string }[]` 持久化至 `AsyncStorage`（Key: `grid-order-storage`）。
- **静态配置合并 (`buildGridDataWithOrder`)**：
  应用启动或 Store 水合（Rehydrate）时，将持久化的 Key 数组与最新的 `getMainPageApplications()` 注册列表对齐，自动补全后续新增应用，剔除已下线服务。
- **“更多”入口末位固化 (`ensureMoreLast`)**：
  算法严格保证 `key === 'grid-13'`（更多）始终锚定在网格最后一个元素，避免用户因误操作导致微应用管理入口丢失。

---

## 2. 寝室电费服务体系 (`useElectricityStore`)

学生宿舍用电系统通过对接后勤电控平台，提供电费余额秒查、四级宿舍架构定位与低电量提醒功能。

### 2.1 四级树形架构定位

```text
校区 (Area) ──► 楼栋 (Building) ──► 单元/楼层 (Unit) ──► 房间号 (Room / room_id)
```

- **数据层接口 (`src/request/api/electricity/`)**：
  - `getArchitecture`：递归拉取各校区（东区、南区、西区、元宝山、国交等）楼栋架构树。
  - `getRoomInfo`：提交 `room_id` 获取当前可用余额、历史度数及当前电表状态。
  - `queryElectricityPrice` / `setElectricityPrice`：获取与自定义标准电费单价。
- **本地存储与解绑**：
  用户绑定的宿舍信息通过 `useElectricityStore`（`src/store/electricity.ts`）持久化在 `AsyncStorage`（Key: `electricity-storage`）中，切换宿舍或搬寝时可一键清空绑定。

---

## 3. 成绩查询与 GPA 学分绩点计算引擎

成绩服务位于 `src/app/(mainPage)/scoreInquiry.tsx` 与 `src/app/(mainPage)/scoreCalculation.tsx`，支持按学年学期筛选或跨学期汇总成绩，并内置学分绩计算器。

### 3.1 学分绩 (GPA) 计算算法

在 `scoreCalculation.tsx` 中，系统支持动态全选、反选或勾选特定科目子集进行加权平均分实时推导：

$$\text{AverageScore} = \frac{\sum_{i \in \text{Selected}} \left( \text{Score}_i \times \text{Credit}_i \right)}{\sum_{i \in \text{Selected}} \text{Credit}_i}$$

- **多态成绩折算**：
  教务系统中包含百分制（如 `88`）与五级制（优、良、中、及格、不及格）成绩。系统在数据适配层统一转换为用于加权计算的标准分。
- **成绩明细展开 (`queryGradeDetail`)**：
  点击任意科目可查看其成绩构成（平时成绩占比、期末成绩占比、原始分、任课教师与考核方式）。

---

## 4. 空闲教室与全校蹭课系统

### 4.1 空闲教室时段碰撞检测

空闲自习室功能（`src/app/(mainPage)/classroom.tsx`）允许学生筛选指定教学楼（如 7 号楼、8 号楼、10 号楼等）、特定星期与指定节次：

1. **时段过滤**：前端支持单选或组合多个节次区间（上午 1-2 节、3-4 节；下午 5-6 节、7-8 节；晚间 9-10 节、11-12 节）。
2. **星标收藏 (`useClassroomStarStore`)**：
   - 常用自习室可一键添加至星标（`starredClassrooms`），保存在 `AsyncStorage`（Key: `classroom-star-storage`）。
   - 在 `classroomStar.tsx` 页面直接展示星标教室的实时占用情况。
3. **免责与提示弹窗 (`useClassroomWarningStore`)**：
   记录用户首次进入教室模块的温馨提示阅读状态，避免临时调课或活动借用引发的自习冲突。

### 4.2 全校蹭课检索 (`spaceLesson.tsx`)

支持根据院系专业全景树（`courseTree`）下钻，或按课程名称、任课教师模糊搜索全校排课数据：

- 展示授课教师、开课院系、上课周次与上课教室。
- 支持一键将蹭课日程添加为个人自定义日程并同步至本地课表。

---

## 5. 校园信息基础设施服务

### 5.1 华师校历与事件总线 (`src/store/events.ts` & `calendar.tsx`)

- **学期日历对齐**：直观以月历形式呈现全学期教学周分布，标注中秋、国庆、元旦、寒暑假等节假日调休与重要校历节点。
- **事件驱动**：通过 `useEvents` 统一缓存校历大事件，供首页横幅（Banner）与日历组件消费。

### 5.2 部门通讯录与黄页导航 (`departments.tsx` & `websites.tsx`)

- **部门电话一键拨打**：校医院、教务处、保卫处、学工部等部门电话提供一键调起系统拨号盘能力（受 Android `<queries>` 与 iOS Scheme 保护）。
- **内网网站聚合与通用 WebView 容器 (`webview.tsx`)**：
  校园办事大厅、图书馆借阅系统、研究生系统等通过通用 `webview.tsx` 容器打开，自动注入用户 Agent、响应式标题栏与加载指示器。

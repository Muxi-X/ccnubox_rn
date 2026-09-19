# 课表核心算法与视图引擎架构指南 (Timetable Engine)

华师匣子的课表系统是客户端最核心、使用频次最高的业务模块。由于高校排课存在单双周、重叠课程、跨节次、长短学期及复杂的节假日调休，课表模块在周次计算、手势画布性能、多课程冲突检测以及外观渲染上进行了深度定制与优化。

---

## 1. 领域模型与周次计算算法

### 1.1 自然周归一化与开学周对齐 (`semesterWeeks.ts`)

为了严格对齐高校“周一为每周第一天”的教学习惯，系统统一将开学日期归一化为其所在自然周的周一 00:00:00：

```ts
// src/utils/semesterWeeks.ts
export const getWeekMonday = (timestampOrDate: number | Date): Date => {
  const date = new Date(
    typeof timestampOrDate === 'number' && timestampOrDate < 1e11
      ? timestampOrDate * 1000
      : timestampOrDate
  );
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 是周日, 1 是周一, ..., 6 是周六
  const diffToMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diffToMonday);
  return date;
};
```

教学周核心推导公式如下：

$$\text{CurrentWeek} = \left\lfloor \frac{\text{Now} - \text{StartOfWeek}(\text{SchoolTime})}{7 \times 24 \times 3600 \times 1000} \right\rfloor + 1$$

- **学期周数动态计算 (`calculateSemesterWeekCount`)**：
  若提供了有效的开学时间 `schoolTime` 与放假时间 `holidayTime`，学期总周数由二者跨越的自然周向上取整得出；若未配置或数据异常，则平滑降级为默认值（20 周）。
- **越界截断保护 (`clampWeekToSemester`)**：
  将计算出的当前周严格限定在 $[1, \text{TotalWeeks}]$ 区间内，避免跨学期或假期由于负数/极大数导致的数组越界与渲染崩溃。

---

## 2. 课表存储桶与防御性数据清洗 (`useCourse` & `courseData.ts`)

### 2.1 分学期存储桶设计 (Course Bucket)

为了支持离线秒开、历史学期回溯以及多学期数据隔离，`useCourse`（`src/store/course.ts`）以 `year_semester`（例如 `2024-2025-1`）为复合主键，设计了分学期缓存桶：

```ts
interface CourseBucket {
  courses: courseType[];
  fetchedAt: number; // 本地获取/写入时间戳
  lastRefreshTime: number; // 远端教务系统最后同步时间戳
}
```

- **秒开策略**：切入课表页面时，优先命中对应学期存储桶中的本地缓存直接完成首屏渲染，无需等待任何网络阻塞。
- **后台增量拉取**：若当前桶不存在或用户主动下拉刷新，异步调起教务接口获取全量课表数据，清洗后覆写对应存储桶并触发小组件同步。

### 2.2 防御性数据清洗 (`sanitizeCourseList`)

由于教务系统返回的历史数据可能存在缺失字段、脏字符串或旧版本 JSON 序列化差异，`src/utils/courseData.ts` 实现了全量防御性校验：

- **节次字符串解析 (`parseClassWhen`)**：将 `1-2`、`3-4` 等节次字符串转换为标准区间 `{ startSection, endSection, duration }`。
- **开课周列表容错**：自动兼容字符串化 JSON 数组（如 `"[1, 2, 3]"`）与原生数字数组，并剔除超出正常学期周次限制（容错上限 60 周）的异常周。
- **自定义日程隔离**：学生手动添加的课程被打上 `is_custom: true` 标记，由系统自动生成唯一 ID，与教务系统排课合并展示。

---

## 3. 双向手势滚动画布引擎 (`TimetableScrollView`)

课表主视图需要同时支持纵向浏览全天各节次（通常为 12 或 14 节）以及横向查看星期一至星期日，同时要求顶部星期行与左侧节次列在滚动时保持视口吸附。

传统的 `ScrollView` 嵌套存在严重的手势争抢、卡顿和性能瓶颈。华师匣子基于 `react-native-gesture-handler` 的 **Pan 手势** 与 `react-native-reanimated` 的 **UI 线程驱动**，从底层构建了高性能的双向滚动画布：

```text
┌─────────────────┬────────────────────────────────────────────────────────┐
│  左上角固定原点   │  StickyTop 表头 (只跟随 X 轴横向平移，Y 轴强制吸顶固定)  │
│ (Corner，双向固定)│  [周一  周二  周三  周四  周五  周六  周日]              │
├─────────────────┼────────────────────────────────────────────────────────┤
│                 │                                                        │
│   StickyLeft    │                 CourseContent 网格画布                 │
│   节次时间轴     │           (支持 X 轴与 Y 轴自由二维平移)                │
│ (只跟随 Y 轴滚动, │                                                        │
│  X 轴强制吸左)   │                                                        │
│                 │                                                        │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### 3.1 核心手势与平移推导

1. **共享值与 UI 线程计算**：
   使用 `useSharedValue(0)` 分别记录 `translateX` 与 `translateY`，整个手势平移动画完全运行在 UI 原生渲染线程，规避 JS Bridge 跨线程通讯延迟。
2. **三向吸附映射 (`useAnimatedStyle`)**：
   - **内容画布**：同时应用 `transform: [{ translateX }, { translateY }]`。
   - **顶部表头 (`stickyTop`)**：只应用 `transform: [{ translateX }]`，确保仅横向滑动，纵向永久吸顶。
   - **左侧时间轴 (`stickyLeft`)**：只应用 `transform: [{ translateY }]`，确保仅纵向滑动，横向永久吸左。
   - **原点交点 (`corner`)**：不应用任何平移变换，永久锁定在坐标系 $(0, 0)$。
3. **边界约束与阻尼回弹**：
   在手势拖拽至视口边界时计算阻尼衰减系数，释放手势（`onEnd`）后通过 `withTiming` 快速平滑回弹至最大合法滑动区间。

### 3.2 下拉刷新与手势防冲突

- **手势意图识别**：在 `PanGesture` 的触摸开始阶段计算初始横向与纵向移动比率。若横向位移显著，判定为周次切换或横向滑动，立即通过 `shouldRefresh.value = false` 屏蔽下拉刷新，防止横向手势误触发刷新。
- **Lottie 动效与触感反馈**：集成 `renovate.json` 矢量动画，下拉位移跨越 `REFRESH_THRESHOLD` 时通过 `runOnJS` 触发轻触震动反馈（`Haptics`），松开后自动调起教务刷新。

---

## 4. 课程重叠检测与冲突层叠卡片 (`CourseContent`)

在高校实际排课中，同一星期、同一节次可能被排入多门课程（例如单双周轮转课程、实验选修重叠课或学生手动添加的日程）。

### 4.1 碰撞区间检测算法

对于任意课程 $A$ 与课程 $B$，它们在同一天（`day` 相同）发生时间重叠的充要条件为：

$$\neg \left( B.\text{endSection} < A.\text{startSection} \;\lor\; B.\text{startSection} > A.\text{endSection} \right)$$

`CourseContent.tsx` 在渲染当前单元格时，通过 `slotCourses` 过滤出与当前节次产生任何重叠的所有候选课程。

### 4.2 非本周重叠防背景重叠加深优化

由于非本周课程默认使用半透明背景渲染，如果多门非本周课程以半透明层叠绘制在同一坐标区域，会导致叠加后的透明度变高、颜色异常加深，破坏界面美观：

```ts
// 规避非本周重叠时的颜色变深问题
const isCoveredAndNotInCurrWeek = useMemo(() => {
  return slotCourses.some(c => {
    if (!currRange || c.id === props.id) return false;
    const range = parseClassWhen(c.class_when);
    if (!range) return false;
    // 判断是否被同时间段完全覆盖，且当前课程非本周
    const isFullCovers =
      range.startSection <= currRange.startSection &&
      range.endSection >= currRange.endSection &&
      (range.startSection < currRange.startSection ||
        range.endSection > currRange.endSection);

    const isCoveringRendered = visibleIdSet.has(c.id);
    return !props.isThisWeek && isFullCovers && isCoveringRendered;
  });
}, [slotCourses, props.id, props.isThisWeek, currRange, visibleIdSet]);
```

### 4.3 多课程折角标识与详情交互 (`ModalContent`)

当单元格检测到多门重叠课程时：

1. **视觉标记**：卡片右上角展示专属的“多课程折角”或数字角标，提示用户此处存在多门排课。
2. **多态弹窗**：点击卡片调起全局 Modal，列出重叠冲突的所有课程卡片。
3. **操作入口**：在弹窗内可横向滑动浏览重叠课程，并支持直接进行“添加备注”、“编辑日程”或“删除课程”操作。

---

## 5. 课表外观与个性化渲染系统 (`useCourseTableAppearance`)

课表支持高度可定制的外观系统，配置数据持久化存储于 `AsyncStorage`（Key: `course-table-appearance-store`）：

| 配置字段                | 类型                  | 取值范围                            | 作用与交互效果                           |
| :---------------------- | :-------------------- | :---------------------------------- | :--------------------------------------- |
| `backgroundUri`         | `string \| undefined` | 本地文件 URI                        | 用户自定义相册导入的课表背景图片。       |
| `backgroundMode`        | `string`              | `'cover' \| 'contain' \| 'stretch'` | 背景图片填充缩放模式。                   |
| `backgroundScrollable`  | `boolean`             | `true \| false`                     | 背景图是否跟随手势平移（视差滚动效果）。 |
| `foregroundOpacity`     | `number`              | `0 ~ 100` (%)                       | 前台课程卡片不透明度，支持透出底层背景。 |
| `backgroundMaskOpacity` | `number`              | `0 ~ 100` (%)                       | 背景暗色遮罩层浓度，保障文字阅读对比度。 |
| `backgroundBlurRadius`  | `number`              | `0 ~ 30` (px)                       | 背景图高斯毛玻璃模糊半径。               |

---

## 6. 桌面端与系统微件同步流

课表数据的变更会自动通过 `src/utils/updateWidget.ts` 广播并写入系统原生小组件容器：

- **iOS**：将当周课程序列化后写入 App Group（`group.release-20240916`）并刷新 WidgetKit / Live Activity 时间线。
- **Android**：提取今日课程并调用原生模块 `CcnuboxWidget.updateCourseData()`，通知 2x2 与 4x2 桌面微件更新视图。
  详细跨端同步细节参见 [桌面小组件与实时活动指南](widgets.md)。

# 桌面小组件与实时活动 (Widgets & Live Activities)

华师匣子同时支持 iOS 与 Android 平台的系统级桌面小组件，实现随时查看当日日程与近期课表。本文档详细记录其原生实现、数据交互通道与生命周期调度。

---

## 1. 架构总览

```text
React Native 业务层 (JS)
      │
      ▼
updateCourseWidgetData(courses) (src/utils/updateWidget.ts)
      │
      ├── Platform.OS === 'ios'
      │     │
      │     ▼
      │   serializeCoursesForAppleWidget(courses)
      │     │
      │     ▼
      │   ExtensionStorage('group.release-20240916').set('courseTable', data)
      │     │
      │     ▼
      │   ExtensionStorage.reloadWidget()
      │     │
      │     ▼
      │   iOS WidgetKit (targets/widget/widgets.swift)
      │   - 桌面课表组件 (Widget)
      │   - 灵动岛 / 锁屏实时活动 (Live Activity)
      │
      └── Platform.OS === 'android'
            │
            ▼
          buildAndroidWidgetCourseData(courses, currentWeek)
            │
            ▼
          CcnuboxWidget.updateCourseData(jsonString) (modules/ccnubox-widget)
            │
            ▼
          SharedPreferences (WIDGET_PREFERENCES)
            │
            ▼
          发送系统广播: ACTION_UPDATE_WIDGET
            │
            ▼
          - RecentClassesProvider2x2 (2x2 桌面微件)
          - RecentClassesProvider4x2 (4x2 桌面微件)
          - ScheduleRemoteViewsFactory (远程列表视图刷新)
```

---

## 2. iOS WidgetKit 与实时活动 (Live Activity)

### 2.1 工程结构与 Target 管理

iOS 侧的小组件工程位于 `targets/widget/`，通过 `@bacons/apple-targets` 插件在执行 `npx expo prebuild` 时动态加入主 Xcode 工程中。

- `targets/widget/expo-target.config.js`：声明 Target 类型为 `widget`，并绑定主工程的 App Group 权限。
- `targets/widget/widgets.swift`：定义 `WidgetBundle`，导出课表小组件。
- `targets/widget/CourseLiveActivity.swift`：实现 iOS 灵动岛与锁屏界面的 Live Activity 实时活动展示。
- `targets/widget/index.swift`：小组件逻辑入口与 TimelineProvider 时间线生成逻辑。

### 2.2 跨进程数据共享：App Groups

- **Group ID**：`group.release-20240916`
- **共享容器**：在主应用与 Extension 扩展进程之间，通过标准 `UserDefaults(suiteName: "group.release-20240916")` 交换课程数据。
- **更新调用**：
  在 JS 侧使用 `@bacons/apple-targets` 提供的 `ExtensionStorage` 工具类完成数据写入与即时通知：
  ```ts
  import { ExtensionStorage } from '@bacons/apple-targets';

  const extensionStorage = new ExtensionStorage('group.release-20240916');
  extensionStorage.set('courseTable', serializeCoursesForAppleWidget(courses));
  ExtensionStorage.reloadWidget();
  ```

---

## 3. Android AppWidget 桌面微件

### 3.1 本地 Expo 模块 (`modules/ccnubox-widget`)

Android 侧采用自定义本地 Expo 原生模块实现：

- `modules/ccnubox-widget/expo-module.config.json`：注册 `CcnuboxWidgetModule`。
- `CcnuboxWidgetModule.kt`：对外暴露异步原生方法 `updateCourseData(text: String)`：
  1. 将 JS 传入的当前周课程数据存入专属的 `SharedPreferences("CcnuboxWidgetPrefs")`。
  2. 发送自定义显式广播 `com.muxixyz.ccnubox.widgets.UPDATE_WIDGET`。

### 3.2 微件布局与规格

| 微件类型         | 类名                       | 布局文件                        | 说明                                                                       |
| :--------------- | :------------------------- | :------------------------------ | :------------------------------------------------------------------------- |
| **2x2 课表微件** | `RecentClassesProvider2x2` | `recent_classes_widget_2x2.xml` | 展示下一节课的课程名称、上课地点与具体节次。                               |
| **4x2 课表微件** | `RecentClassesProvider4x2` | `recent_classes_widget_4x2.xml` | 基于 `ListView` 与 `ScheduleRemoteViewsFactory` 滚动展示今日全天课程列表。 |

### 3.3 数据刷新时机

1. **应用启动与前后台切换**：在 `src/app/(tabs)/_layout.tsx` 中进入应用主 Tab 时自动触发更新。
2. **课表网络请求成功**：从教务系统拉取到新学期或更新课程数据后触发。
3. **用户自定义课程变动**：在添加、编辑或删除个人课程与备注后触发。
4. **Android 系统定时更新**：通过 `updatePeriodMillis` 配置周期性更新，并在设备开机（`RECEIVE_BOOT_COMPLETED`）后恢复微件状态。

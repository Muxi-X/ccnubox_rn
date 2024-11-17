# ccnubox_rn

华师匣子rn版

# 项目简述

- `react-native` + `expo` 重构华师匣子
- 状态管理采用 `zustand`及其中间件
- 消息推送目前采用插件注入的方式集成，`JPush`，插件地
  址：[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)
- 采用 `eas`进行远程包管理和更新发布

# 项目结构

```text
.
├── README.md
├── android             # 打包后安卓产物
├── app                 # 路由
├── app.json            # 权限等配置，详情见下文【打包发布】部分
├── assets              # 附带图片、文件，目前存有图片与更新信息
├── babel.config.js
├── components          # 组件栏
│    ├── animatedView   # 动画组件
│    ├── button         # button
│    ├── divider        # 分割线
│    ├── modal          # modal
│    ├── navi           # 下方tabbar
│    ├── pagination     # 分页器
│    ├── picker         # 选择器
│    ├── scraper        # 爬虫组件，目前能爬研究生
│    ├── scrollView     # 全方向滚动组件
│    └── skeleton       # 骨架屏
├── module              # 页面实现及相关组件
│    ├── courseTable
│    ├── guide
│    ├── login
│    ├── mainPage
│    ├── notification
│    └── setting
├── constants           # config 文件
├── dist                # expo 运行需要
├── eas.json            # eas 配置文件，详情见下文【打包发布】部分
├── expo-env.d.ts
├── hooks               # 自定义 hook
├── index.js
├── ios                 # ios 打包后产物
├── metro.config.js     # metro bundler 配置文件
├── node_modules
├── package.json
├── plugin.js           # mx-jpush-plugin 兜底版本
├── pnpm-lock.yaml
├── react-native.config.js
├── request             # 请求部分
├── scripts             # 脚本部分
├── secret              # google 密钥，目前可以删除
├── store               # 全局 store
├── styles              # 主题样式配置文件
├── tsconfig.json
├── types
└── utils               # 工具函数/垃圾桶，不知道放哪就放这

```

# 推荐开发调试方法

- [集成 android studio(android调试)](https://docs.expo.dev/workflow/android-studio-emulator/)
- [集成 expo-orbit(ios调试)](https://docs.expo.dev/workflow/ios-simulator/)
- 若要测试 `mx-jpush-expo`等消息通知内容，请参
  考[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)的文档

# 项目基建以及代码规范

本仓库并未严格限制 `eslint`，请先熟悉现有基建，再着手开发 **_保证代码质量_**

## 颜色主题自定义

样式注册在 `styles`文件夹中进行，采用全局 `store`设计

#### styles结构

- 与主题无关的通用样式存于 `common.ts`中

```ts
/** 与主题无关通用样式 */
export const commonStyles = StyleSheet.create({
  fontExtraLarge: {
    fontSize: 26,
  },
  fontLarge: {
    fontSize: 20,
  },
  // ...
});
export const commonColors: Partial<ColorType> = {
  gray: '#ccc',
};
```

#### 样式注册

其余主题新开文件，并在 `index`注册主题通过 `geneStyleSheet`方法生成， 分为两部
分：`样式`和 `布局` 目前布局只有 `android`和 `ios`两套，后续有增加再做适配

```ts
// default.ts
import { SubThemeType } from '@/styles/types';
import { geneStyleSheet } from '@/utils/geneStyleSheet';

const defaultCommonStyles: Partial<SubThemeType> = {};

/** 默认样式 */
export const defaultStyles = geneStyleSheet({
  android: {
    ...defaultCommonStyles,
  },
  ios: {
    ...defaultCommonStyles,
  },
});
```

`subThemeType`负责特定领域样式，示例定义目前如下,有需要可以增加：

```ts
export type ConfigurableThemeNames =
  | 'text_style'
  | 'border_style'
  | 'button_style'
  | 'navbar_style'
  | 'navbar_icon_active_style';
```

#### 样式使用：

```ts
const currentStyle = useVisualScheme(state => state.currentStyle);
// ...
return <Button style={currentStyle?.button_style} />
```

### 样式切换

```ts
const { currentStyle, changeTheme, changeLayoutStyle } = useVisualScheme(
  ({ currentStyle, changeTheme, changeLayoutStyle }) => ({
    currentStyle,
    changeLayoutStyle,
    changeTheme,
  })
);
```

## 简单动画效果封装

基础动画效果封装，若有复杂效果请自行设计位于 `animatedView`中，用法基本相同，均
继承于类型 `BaseAnimatedProps`：

```ts
export interface BaseAnimatedProps extends ViewProps {
  /**
   * 是否触发动画
   */
  trigger?: boolean;
  /**
   * 应用动画的组件
   */
  children: ReactNode;
  /**
   * 动画时长
   */
  duration?: number;
  /**
   * 延迟
   */
  delay?: number;
  /**
   * 动画结束监听
   */
  onAnimationEnd?: () => void;
}
```

- `AnimatedOpacity`以及 `AnimatedFade`拥有 `toVisible`属性，代表渐入/渐出
- `AnimatedFade`具有 `direction`属性，可选 `horizontal`或 `vertical`，代表动画方
  向基础用法：

```tsx
<AnimatedFade
  direction="vertical"
  distance={10}
  duration={450}
  trigger={reachedLastPage}
>
  <Button
    style={[styles.start_button, currentStyle?.button_style]}
    onPress={handleStart}
  >
    开始使用
  </Button>
</AnimatedFade>
```

## Button组件

由于 `antd`的 `Button`的 `active`颜色配置要通过配置他自身的 `config`进行，这样再
加一层 `config`会略显臃肿，因此干脆实现了简单的 `Button`组件带有 `loading`和
`ripple(在android中的点击特效)`效果

## ScrollView组件

由于安卓 `ScrollView`不支持双向同时滚动，因此通过 `gesture-handler`自行实现了
`ScrollView`，未来可能单独拉成外部包，定义如下：

```tsx
export interface ScrollableViewProps {
  /**
   * 滚动监听
   * @param evt
   */
  onScroll?: (evt: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void;
  /**
   * 滚动到最上端监听
   */
  onScrollToTop?: () => void;
  /**
   * 滚动到最下端监听
   */
  onScrollToBottom?: () => void;
  /**
   * 滚动内容
   */
  children?: ReactElement;
  /**
   * 下方固定栏彩蛋
   */
  stickyBottom?: ReactNode;
  /**
   * 左侧固定栏
   */
  stickyLeft?: ReactNode;
  /**
   * 上方固定栏
   */
  stickyTop?: ReactNode;
}
```

## CourseTable组件

基于 `scrollView`组件搭建的课表组件，由于约定式路由不允许 `component`在 `app`中
出现，因此移动到外部，之后可能会移动

> - 目前没有具体样式，需要自行修改

刷新函数含有两个参数：`handleSuccess`，`handleFail` 刷新成功时调用 success，失败
则是 fail，fail 相比于 success 会有失败的 toast 提示

```text
 onRefresh={(handleSuccess, handleFail) => {
   setTimeout(() => {
         alert(666);
         handleSuccess();
     }, 7000);
 }}
```

## Modal 组件

建议使用 `ModalTrigger`组件，通过 `triggerComponent`定义触发弹窗元素或者直接使用
`Modal.show()`方法调用

> Modal.show 会在全局 portal 建立新对象用完即删除若要满足关闭 modal 仍能记住之前
> 的状态，则需要通过 ModalTrigger 等其他方法 `mode`分为两种模式:

- 底部：有渐变、动画为滑入
- 中部：无渐变、动画为放大

```tsx
<ModalTrigger
  title={title}
  onConfirm={handleConfirm}
  onClose={onClose}
  onCancel={onCancel}
  mode={mode}
  triggerComponent={children}
  style={style}
></ModalTrigger>
```

# 常用指令

## build（打包->注入极光推送sdk->部署到expo）

```bash
  pnpm run build
```

## update（热更新）

```bash
 eas update --branch production --message "wdigets test_1"
```

# 更新须知

- 热更新更新通知位于 `assets/data/updateInfo.json`中，每次热更新手动更新其中的版
  本号以及更新内容

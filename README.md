# ccnubox_rn

华师匣子 v3.0

## 项目简述

- `react-native` + `expo` 重构华师匣子
- 状态管理采用 `zustand` 及其中间件
- 消息推送目前采用插件注入的方式集成，`JPush`，插件地址：[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)
- 采用 `eas` 进行远程包管理和更新发布

## 项目结构

```text
.
├── README.md
├── android/                        # 安卓原生配置
│   ├── app/                       # 主应用配置
├── assets/                        # 项目静态资源
│   └── images/                    # 图片资源
├── ios/                          # iOS原生配置
├── scripts/                      # 项目脚本
├── src/                          # 源代码目录
│   ├── app/                      # App路由及页面
│   │   ├── (courseTable)/       # 课程表相关页面
│   │   ├── (mainPage)/          # 主页相关页面
│   │   ├── (setting)/           # 设置相关页面
│   │   ├── (tabs)/              # 底部标签页
│   │   └── auth/                # 登录相关页面
│   ├── assets/
│   │   ├── data/               # 应用数据
│   │   ├── fonts/              # 字体文件
│   │   └── images/             # 图片资源
│   ├── components/             # 通用组件
│   │   ├── animatedView/       # 动画组件
│   │   ├── button/            # 按钮组件
│   │   ├── divider/           # 分割线组件
│   │   ├── image/             # 图片组件
│   │   ├── modal/             # 弹窗组件
│   │   ├── navi/              # 导航组件
│   │   ├── pagination/        # 分页组件
│   │   ├── picker/            # 选择器组件
│   │   ├── portal/            # Portal组件
│   │   ├── scraper/          # 数据抓取组件
│   │   ├── scrollView/       # 滚动视图组件
│   │   ├── skeleton/         # 骨架屏组件
│   │   ├── text/             # 文本组件
│   │   ├── toast/            # 提示组件
│   │   └── view/             # 视图组件
│   ├── constants/            # 常量定义
│   ├── hooks/               # 自定义Hooks
│   ├── mock/               # 模拟数据
│   ├── module/             # 业务模块
│   │   ├── courseTable/    # 课程表模块
│   │   ├── guide/         # 引导模块
│   │   ├── login/         # 登录模块
│   │   ├── mainPage/      # 主页模块
│   │   ├── notification/  # 通知模块
│   │   ├── selectStyle/   # 样式选择模块
│   │   ├── selectTheme/   # 主题选择模块
│   │   └── setting/       # 设置模块
│   ├── request/           # 网络请求
│   │   └── api/          # API定义
│   ├── secret/           # 敏感配置
│   ├── store/            # 状态管理
│   ├── styles/           # 样式定义
│   ├── themeBasedComponents/ # 主题组件
│   │   ├── android/      # 安卓主题组件
│   │   └── ios/          # iOS主题组件
│   ├── types/            # TypeScript类型定义 (📚 详见类型系统文档)
│   └── utils/            # 工具函数/垃圾桶
├── docs/                 # 项目文档
│   ├── TYPE_SYSTEM.md          # 类型系统规范
│   ├── TYPE_SYSTEM_REFACTOR.md # 类型系统重构说明
│   ├── TYPE_SYSTEM_MIGRATION.md # 类型迁移指南
│   └── TYPE_SYSTEM_SUMMARY.md  # 类型改造总结
├── app.json              # Expo配置
├── babel.config.js       # Babel配置
├── eas.json             # EAS构建配置
├── index.js             # 入口文件
├── metro.config.js      # Metro配置
├── package.json         # 项目依赖
├── plugin.js            # JPush插件配置
└── tsconfig.json        # TypeScript配置
```

## TypeScript 类型系统

项目使用 TypeScript 进行类型管理，建立了完善的类型系统。详细文档请查看：

- **[类型系统规范](./docs/TYPE_SYSTEM.md)** - 类型定义标准和组织结构
- **[类型系统重构说明](./docs/TYPE_SYSTEM_REFACTOR.md)** - 改进内容和代码示例
- **[类型迁移指南](./docs/TYPE_SYSTEM_MIGRATION.md)** - 代码迁移步骤和常见场景
- **[类型改造总结](./docs/TYPE_SYSTEM_SUMMARY.md)** - 完整的改造报告

## 开发环境版本

- **Node.js**: >=18.0.0
- **pnpm**: >=9.14.4
- **React**: 18.2.0
- **React Native**: 0.74.5
- **Expo**: 51.0.38
- **Gradle**: 8.6
- **Android SDK**: 34 (compileSdkVersion)
- **Android Build Tools**: 34.0.0
- **JDK**: 17
- **TypeScript**: ~5.3.3

## 推荐开发调试方法

- [集成 android studio(android调试)](https://docs.expo.dev/workflow/android-studio-emulator/)
- [集成 expo-orbit(ios调试)](https://docs.expo.dev/workflow/ios-simulator/)
- 若要测试 `mx-jpush-expo`
  等消息通知内容，请参考[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)的文档

## 开发环境搭建

拉取代码后先运行 `eas env:pull` 并选择一个环境，开发时尽量使用 `development`
环境。

拉取代码后运行 `pnpm install` 安装依赖，此时即满足 `Expo Go` 开发环境。

在 `ios/` 目录下运行 `pod install` 能够成功时，运行 `pnpm ios`
可以启动 iOS 的 development build 开发环境，用于调试 iOS 原生行为。

在配置好 `ANDROID_HOME` 等 Android SDK 环境后，运行 `pnpm android`
可以启动 Android 的 development build 环境。

## 配置文件

任何关于配置文件的修改都应该声明在对应 git commit 的 commit
message 中，以便后续追查与回溯。

### app.json & app.config.ts

这两个是用来配置 app 信息的，json 是静态的，ts 是动态的，被使用时静态配置文件内容会被传入到 ts 配置文件中，并被动态配置文件中的处理函数手动处理。

### eas.json

这个配置文件用于配置 eas 云平台构建和发布应用时的行为。

## 项目基建以及代码规范

本仓库并未严格限制 `eslint`，请先熟悉现有基建，再着手开发 **_保证代码质量_**

### 接口

项目采用长短token方式登录时 缓存了 shortToken 和 longToken 请求已经都封装好了都在
`request/request.ts` 里面默认请求头添加的都是shortToken去发送请求

### 颜色主题自定义

样式注册在 `styles` 文件夹中进行，采用全局 `store` 设计

#### styles 结构

- 与主题无关的通用样式存于`common.ts`中

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

其余主题新开文件，并在 `index`注册主题通过
`geneStyleSheet`方法生成， 分为两部分：`布局`和 `样式` 目前布局有 `android`和
`ios`两套，样式分为`dark`和`light` 后续有增加再做适配

```ts
// default.ts
import { SubThemeType } from '@/styles/types';
import { geneStyleSheet } from '@/utils';

const defaultCommonStyles: Partial<SubThemeType> = {};

/** 默认样式 */
export const defaultStyles = geneStyleSheet({
  dark: {
    ...defaultCommonStyles,
  },
  light: {
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

#### 样式使用

```ts
const currentStyle = useVisualScheme(state => state.currentStyle);
// ...
return <Button style={currentStyle?.button_style} />
```

#### 样式切换

```ts
const { currentStyle, changeTheme, changeLayoutStyle } = useVisualScheme(
  ({ currentStyle, changeTheme, changeLayoutStyle }) => ({
    currentStyle,
    changeLayoutStyle,
    changeTheme,
  })
);
```

### 组件

#### 简单动画效果封装

基础动画效果封装，若有复杂效果请自行设计位于`animatedView`中，用法基本相同，均继承于类型`BaseAnimatedProps`：

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

- `AnimatedOpacity`以及`AnimatedFade`拥有`toVisible`属性，代表渐入/渐出
- `AnimatedFade`具有`direction`属性，可选`horizontal`或`vertical`，代表动画方向基础用法：

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

#### Button组件

由于`antd`的`Button`的`active`颜色配置要通过配置他自身的`config`进行，这样再加一层`config`会略显臃肿，因此干脆实现了简单的`Button`组件带有`loading`和`ripple(在android中的点击特效)`效果

#### ScrollView组件

由于安卓`ScrollView`不支持双向同时滚动，因此通过`gesture-handler`自行实现了`ScrollView`，未来可能单独拉成外部包，定义如下：

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

#### CourseTable组件

基于`scrollView`组件搭建的课表组件，由于约定式路由不允许`component`在`app`中出现，因此移动到外部，之后可能会移动

> - 目前没有具体样式，需要自行修改

刷新函数含有两个参数：`handleSuccess`，`handleFail`
刷新成功时调用 success，失败则是 fail，fail 相比于 success 会有失败的 toast 提示

```text
 onRefresh={(handleSuccess, handleFail) => {
   setTimeout(() => {
         alert(666);
         handleSuccess();
     }, 7000);
 }}
```

#### Portal 组件

类似于`ReactDom-Portal`的简化版,用于将某组件提升至root层

```tsx
<Portal>
  <View></View>
</Portal>
```

#### Picker 组件

封装的选择器,分为 PickerView 与 Picker 两部分

- PickerView 不带 Modal
- Picker 为 Portal 与 PickerView 的结合目前黑夜样式待修改

#### Modal 组件

建议直接使用`Modal.show()`方法调用或者使用 `ModalTrigger`组件，通过
`triggerComponent`定义触发弹窗元素

> Modal.show 会在全局 portal 建立新对象用完即删除若要满足关闭 modal 仍能记住之前的状态，则需要通过 ModalTrigger 等其他方法
> `mode`分为两种模式:

- 底部：有渐变、动画为滑入
- 中部：无渐变、动画为放大

**API 方法：**

- `Modal.show(props)` - 显示Modal
- `Modal.clear()` - 清除所有Modal

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

## 常用指令

### env

```bash
eas env:pull # 运行后可以选择 development 或 production 环境
```

### build（打包->注入极光推送sdk->部署到expo）

```bash
  pnpm run build
	# 单独触发 Android 平台打包
	eas build -p android
	# 单独触发 production 分支打包
	eas build -e production
```

### 生成API类型定义

```bash
# pull 过 development 环境的 env 后可以自动输入 Basic Auth 的验证信息
pnpm run genapi
```

### 修改资源文件

修改了资源文件以后需要运行以下命令以生成各平台的资源文件，并重新进行原生应用打包。

```bash
pnpm exec expo prebuild # 生成资源文件供原生 app 打包
```

## 更新须知

### eas update（OTA 热更新）

```bash
eas update --branch production --message "wdigets test_1"
```

> 如无特殊需要，尽量避免手动发布 OTA 更新。

热更新更新通知位于
`assets/data/updateInfo.json`中，每次热更新手动更新其中的版本号以及更新内容并推送到 GitHub，将触发 CD 自动发布 test 通道的 OTA。

如果修改了原生代码，需要更新版本号并重新打包原生应用安装包，此时需要发布新的原生安装包作为更新包。

版本号更新示例：

```json
{
  "expo": {
    "name": "华师匣子",
    "slug": "ccnubox",
    "version": "3.0.0", // update to 3.0.1
    "runtimeVersion": "3.0.0" // sync this with version field, update to 3.0.2
  }
}
```

ota 更新只有 runtimeVersion 在 ota 更新包与拉取更新的客户端相同时，才会被客户端下载，这是为了保证不会因 js 代码与客户端原生代码版本不匹配导致程序崩溃，为了便于区分，请保持 runtimeVersion 与 version 的值相同。

### 上传到 appstore / testflight

```zsh
eas submit -p ios --latest # 上传最后一次构建的
# 这里要注意eas.json 中 distribution 要修改为 "store" 这样数字签名证书才可以生效
```

### iOS 打包

```bash
eas build -p ios --profile test
```

#### 注意事项

要更新buildNumber 需要更新app.json 中的buildNumber然后执行

```bash
npx expo prebuild --platform ios --no-install
```

然后再重新打包 才可以submit

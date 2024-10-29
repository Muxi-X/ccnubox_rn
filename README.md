# ccnubox_rn
华师匣子rn版

# 项目简述
- `react-native` + `expo` 重构华师匣子
- 状态管理采用`zustand`及其中间件
- 消息推送目前采用插件注入的方式集成，`JPush`，插件地址：[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)
- 采用`eas`进行远程包管理和更新发布

# 推荐开发调试方法
- [集成 android studio(android调试)](https://docs.expo.dev/workflow/android-studio-emulator/)
- [集成 expo-orbit(ios调试)](https://docs.expo.dev/workflow/ios-simulator/)
- 若要测试`mx-jpush-expo`等消息通知内容，请参考[mx-jpush-expo](https://github.com/konodioda727/JPush-Expo)的文档

# 项目基建以及代码规范
本仓库并未严格限制`eslint`，请先熟悉现有基建，再着手开发
***保证代码质量***

## 颜色主题自定义
样式注册在`styles`文件夹中进行，采用全局`store`设计
#### styles结构
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
其余主题新开文件，并在`index`注册
主题通过`geneStyleSheet`方法生成， 分为两部分：`样式`和`布局`
目前布局只有`android`和`ios`两套，后续有增加再做适配
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
  | 'navbar_icon_style';
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
- 热更新更新通知位于 `assets/data/updateInfo.json`中，每次热更新手动更新其中的版本号以及更新内容
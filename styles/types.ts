import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
/** 布局类型 */
export type layoutStyleType = 'android' | 'ios';
/** 可配置style名 */
export type ConfigurableThemeNames =
  | 'text_style'
  | 'border_style'
  | 'button_style'
  | 'navbar_style'
  | 'navbar_icon_style';
/** 完整themem应有配置类型 */
export type ThemeType = {
  [key in layoutStyleType]: Partial<SubThemeType>;
};
/** 单个布局配置类型 */
export type SubThemeType = {
  [key in ConfigurableThemeNames]: ViewStyle | TextStyle | ImageStyle;
};

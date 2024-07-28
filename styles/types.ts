import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
/** 布局类型 */
export type layoutStyleType = 'android' | 'ios';
/** 可配置style名 */
export type ConfigurableThemeNames =
  | 'default_text_style'
  | 'default_border_color'
  | 'background';
/** 完整themem应有配置类型 */
export type ThemeType = {
  [key in layoutStyleType]: SubThemeType;
};
/** 单个布局配置类型 */
export type SubThemeType = {
  [key in ConfigurableThemeNames]: ViewStyle | TextStyle | ImageStyle;
};

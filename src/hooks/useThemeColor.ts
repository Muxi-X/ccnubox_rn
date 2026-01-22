/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName:
    | 'text'
    | 'background'
    | 'tint'
    | 'icon'
    | 'tabIconDefault'
    | 'tabIconSelected'
) {
  const theme = useVisualScheme(state => state.themeName);
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const Colors = {
      light: {
        text: commonColors.textLight!,
        background: commonColors.white!,
        tint: commonColors.tintColorLight!,
        icon: commonColors.iconLight!,
        tabIconDefault: commonColors.iconLight!,
        tabIconSelected: commonColors.tintColorLight!,
      },
      dark: {
        text: commonColors.textDark!,
        background: commonColors.backgroundDark!,
        tint: commonColors.white!,
        icon: commonColors.iconDark!,
        tabIconDefault: commonColors.iconDark!,
        tabIconSelected: commonColors.white!,
      },
    };

    return Colors[theme][colorName];
  }
}

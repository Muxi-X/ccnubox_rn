import Button from '@/components/button';
import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function SelectStyle() {
  const { currentStyle, themeName, changeTheme } = useVisualScheme(
    ({ currentStyle, layoutName, changeTheme, changeLayout, themeName }) => ({
      currentStyle,
      changeTheme,
      themeName,
      layoutName,
      changeLayout,
    })
  );
  return (
    <View>
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          changeTheme(themeName === 'dark' ? 'light' : 'dark');
        }}
      >
        切换模式
      </Button>
    </View>
  );
}

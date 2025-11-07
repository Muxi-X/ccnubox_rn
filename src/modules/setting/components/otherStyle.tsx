import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function OtherStyle() {
  const { currentStyle, themeName, changeTheme, isAutoTheme, setAutoTheme } =
    useVisualScheme();
  const isApplied = (layout: string) => layout === themeName;
  return (
    <ThemeBasedView style={{ flex: 1, paddingVertical: 20 }}></ThemeBasedView>
  );
}

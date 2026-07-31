import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { TextStyle, TouchableOpacity } from 'react-native';

import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

/**
 * 跨平台通用返回按钮
 * 不依赖 CurrentComponents，避免主题系统未初始化时回退到原生样式
 */
const BackButton = () => {
  const pathname = usePathname();
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const handleBack = () => {
    if (pathname.endsWith('electricityBillinBalance')) {
      router.replace('/');
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handleBack}>
      <Ionicons
        name="arrow-back-outline"
        size={commonStyles.fontLarge.fontSize}
        color={(currentStyle?.text_style as TextStyle)?.color ?? '#1D1D23'}
      />
    </TouchableOpacity>
  );
};

export default BackButton;

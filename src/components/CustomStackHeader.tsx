import { useRouter, usePathname } from 'expo-router';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

type Props = {
  title: string;
  showBack?: boolean;
  headerRight?: React.ReactNode;
};

/**
 * 纯 JS 渲染的 Header，配合 Stack headerShown: false 使用
 * 不依赖原生 UINavigationBar，彻底避开 iOS 26 液态玻璃
 */
const CustomStackHeader = ({ title, showBack, headerRight }: Props) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const headerBg = useVisualScheme(
    state => state.currentStyle?.header_background_style
  );
  const textStyle = useVisualScheme(
    state => state.currentStyle?.text_style as TextStyle
  );

  const hasBack = showBack ?? true;

  const handleBack = () => {
    if (pathname.endsWith('electricityBillinBalance')) {
      router.replace('/');
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }, headerBg]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {hasBack ? (
            <TouchableOpacity onPress={handleBack} hitSlop={8}>
              <Ionicons
                name="arrow-back-outline"
                size={commonStyles.fontLarge.fontSize}
                color={textStyle?.color ?? '#1D1D23'}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.center}>
          <Text
            style={[textStyle, commonStyles.fontLarge]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View style={styles.sideRight}>{headerRight ?? null}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
    paddingHorizontal: 16,
  },
  side: {
    width: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    width: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomStackHeader;

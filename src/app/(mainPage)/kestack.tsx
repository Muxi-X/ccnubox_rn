import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

import Text from '@/components/text';
import View from '@/components/view';

import KestackQR from '@/assets/images/kestackqr.png';

export default function Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>木犀课栈</Text>
      <Text>使用微信识别下方二维码前往木犀课栈小程序</Text>
      <Image
        source={KestackQR as ImageSourcePropType}
        style={styles.image}
      ></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'semibold',
  },
  image: {
    width: 260,
    height: 260,
  },
});

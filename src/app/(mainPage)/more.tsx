import { Link } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

import Text from '@/components/text';
import View from '@/components/view';

import MuxiLogo from '@/assets/images/mx-logo.png';
import { commonColors } from '@/styles/common';

export default function More() {
  return (
    <View style={styles.container}>
      <Image source={MuxiLogo} style={styles.image}></Image>
      <Text style={styles.text}>更多功能敬请期待</Text>
      <Link
        href="/feedback/writefeedback"
        style={{ color: commonColors.purple }}
      >
        有新建议？点我反馈
      </Link>
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
  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
  // link: {
  // 	color:
  // },
});

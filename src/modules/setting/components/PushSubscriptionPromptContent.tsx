import { StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

const PushSubscriptionPromptContent = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, currentStyle?.text_style]}>
        订阅后将会收到消息提醒
      </Text>
      <Text style={[styles.caption, currentStyle?.notification_text_style]}>
        消息示例
      </Text>
      <Text style={[styles.example, currentStyle?.text_style]}>
        【订阅消息】您订阅的校园服务内容有更新
      </Text>
      <Text style={[styles.hint, currentStyle?.notification_text_style]}>
        可在设置-消息推送中退订
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  caption: {
    fontSize: 15,
    textAlign: 'center',
  },
  example: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PushSubscriptionPromptContent;

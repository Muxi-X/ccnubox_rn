import * as Sentry from '@sentry/react-native';
import React from 'react';
import { Alert, Button, View } from 'react-native';

interface SentryTestButtonProps {
  style?: any;
}

const SentryTestButton: React.FC<SentryTestButtonProps> = ({ style }) => {
  const testSentryError = () => {
    try {
      // 捕获一个测试错误
      Sentry.captureException(new Error('这是一个 Sentry 测试错误'));
      Alert.alert('成功', 'Sentry 测试错误已发送');
    } catch (error) {
      Alert.alert('错误', '发送 Sentry 错误时出现问题');
    }
  };

  const testSentryMessage = () => {
    try {
      // 发送一个测试消息
      Sentry.captureMessage('Sentry 测试消息', 'info');
      Alert.alert('成功', 'Sentry 测试消息已发送');
    } catch (error) {
      Alert.alert('错误', '发送 Sentry 消息时出现问题');
    }
  };

  const testCrash = () => {
    // 故意触发一个未捕获的错误
    throw new Error('这是一个故意的崩溃测试');
  };

  return (
    <View style={[{ padding: 20, gap: 10 }, style]}>
      <Button title="测试 Sentry 错误捕获" onPress={testSentryError} />
      <Button title="测试 Sentry 消息" onPress={testSentryMessage} />
      <Button title="测试应用崩溃" onPress={testCrash} color="#ff6b6b" />
    </View>
  );
};

export default SentryTestButton;

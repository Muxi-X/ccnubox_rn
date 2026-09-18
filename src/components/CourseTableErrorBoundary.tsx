import { Button } from '@ant-design/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { log } from '@/utils/logger';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export default class CourseTableErrorBoundary extends React.Component<
  Props,
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    log.error('课表渲染异常:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <Text>课表解析异常</Text>
        <Text>已保护其他页面，你可以重新加载课表。</Text>
        <Button
          type="primary"
          onPress={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
        >
          重新加载
        </Button>
      </View>
    );
  }
}

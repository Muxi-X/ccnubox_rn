import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { LoadingProps } from './type';

const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  color = '#847AF2',
  size = 'large',
  containerStyle,
  textStyle,
}) => {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={[styles.text, currentStyle?.text_style, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default Loading;

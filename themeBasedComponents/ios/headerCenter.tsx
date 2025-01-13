import React from 'react';
import { StyleSheet, Text } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';

export const HeaderCenter: React.FC<{ title: string }> = ({ title }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <Text
      style={[
        currentStyle?.header_text_style,
        commonStyles.TabBarPadding,
        commonStyles.fontLarge,
      ]}
    >
      {title}
    </Text>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
});
export default HeaderCenter;

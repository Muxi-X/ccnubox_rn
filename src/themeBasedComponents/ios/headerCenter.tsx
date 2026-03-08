import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';

const HeaderCenter: React.FC<{ title: string }> = ({ title }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={styles.container}>
      <Text
        style={[
          currentStyle?.header_text_style,
          commonStyles.TabBarPadding,
          commonStyles.fontLarge,
          {position: "relative"}
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
});
export default HeaderCenter;

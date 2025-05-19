import * as React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';
import { router } from 'expo-router';

const HeaderCenter: React.FC<{ title: string }> = ({ title }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={router.back}
        style={{
          position: 'absolute',
          left: 20,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name="arrow-back-outline"
          size={commonStyles.fontLarge.fontSize}
          color={(currentStyle?.text_style as TextStyle).color}
        />
      </TouchableOpacity>
      <Text
        style={[
          currentStyle?.header_text_style as TextStyle,
          commonStyles.TabBarPadding,
          commonStyles.fontLarge,
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
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
  },
});
export default HeaderCenter;

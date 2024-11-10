import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextStyle,
  StyleSheet,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

export const HeaderLeft: React.FC<{ title: string }> = ({ title }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={router.back}>
        <Ionicons
          name="arrow-back-outline"
          size={commonStyles.fontLarge.fontSize}
          color={(currentStyle?.text_style as TextStyle).color}
        />
      </TouchableOpacity>
      <Text
        style={[
          currentStyle?.header_text_style,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
export default HeaderLeft;

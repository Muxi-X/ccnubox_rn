import { Href, useRouter } from 'expo-router';
import * as React from 'react';
import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

interface ItemProps {
  icon: { uri: string };
  text: string;
  url: Href;
}
function SettingItem({ icon, text, url }: ItemProps) {
  const currentScheme = useVisualScheme(state => state.currentStyle);
  const navigation = useRouter();
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate(url);
      }}
    >
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.icon} />
      </View>
      <Text style={[styles.title, currentScheme?.text_style as TextStyle]}>{text}</Text>
      <Text style={styles.arrow}>➔</Text>
    </TouchableOpacity>
  );
}

export default SettingItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    // backgroundColor: '#fff',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#8a72f4', // 修改图标颜色
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

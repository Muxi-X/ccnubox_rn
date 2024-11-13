import { router, useNavigation } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface ItemProps {
  icon: string;
  text: string;
  url: string;
}
function SettingItem({ icon, text, url }: ItemProps) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        // 或者，如果使用 `navigation.navigate` 方法
        navigation.navigate(url as never);
      }}
    >
      <View style={styles.iconContainer}>
        <Image source={require(icon)} style={styles.icon} />
      </View>
      <Text style={styles.title}>{text}</Text>
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
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

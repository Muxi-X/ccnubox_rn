import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import ItemList from './ItemList';

export const SearchAdd: React.FC = () => {
  const list = [
    {
      name: '计算机基础',
      teacher: '王老师',
      score: 2,
      classroom: '9337',
      time: '3-4节',
      week: '周三',
    },
  ];

  return (
    <View>
      <View style={styles.searchContainer}>
        <MaterialIcons
          style={{ marginHorizontal: 10 }}
          name="search"
          size={24}
          color="#666"
        />
        <TextInput
          selectionColor="#75757B"
          placeholder="请输入课程名称/教师名称"
          placeholderTextColor="#75757B"
        />
      </View>
      <ItemList buttonText="添加" list={list} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#9379F6',
    opacity: 0.3,
    display: 'flex',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 30,
  },
});

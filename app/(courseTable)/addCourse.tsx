import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Nabvar from './component/Navbar';
import { AddComponent } from './component/AddComponent';
import ItemList from './component/ItemList';
import Nabvar from './component/Navbar';

export default function AddCourse() {
  const [pattern, setPattern] = React.useState(0);

  return (
    <View style={styles.container}>
      <Nabvar
        navText={['自主添加', '搜索添加']}
        pattern={pattern}
        setPattern={setPattern}
      />
      {pattern === 0 ? <AddPage /> : <SearchPage />}
    </View>
  );
}

const AddPage: React.FC = () => {
  return (
    <View style={styles.addContainer}>
      <AddComponent pageText="course" buttonText="添加课程" />
    </View>
  );
};

const SearchPage: React.FC = () => {
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
      <View
        style={{
          backgroundColor: '#9379F6',
          opacity: 0.3,
          display: 'flex',
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 20,
          marginBottom: 30,
        }}
      >
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
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  addContainer: {
    paddingHorizontal: 20,
  },
  addText: {
    fontSize: 24,
    fontWeight: '900',
  },
  card: {
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#D8D8D8',
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

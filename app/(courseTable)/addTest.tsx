import { View } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

import { AddComponent } from './component/AddComponent';
import ItemList from './component/ItemList';
import Nabvar from './component/Navbar';

export default function AddTest() {
  const route = useRouter(); // 获取 route 参数
  const [pattern, setPattern] = React.useState<number>(0);
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

  // const courseData = route.courseData;
  return (
    <>
      <Nabvar
        navText={['设置考试信息', '自定义考试信息']}
        pattern={pattern}
        setPattern={setPattern}
      ></Nabvar>
      <View
        style={{
          margin: 20,
        }}
      >
        {pattern === 0 ? (
          <ItemList list={list} buttonText={'设置'} />
        ) : (
          <AddComponent buttonText="添加" pageText="test" />
        )}
      </View>
    </>
  );
}

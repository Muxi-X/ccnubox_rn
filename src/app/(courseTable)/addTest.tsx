import { View } from '@ant-design/react-native';
import React, { useState } from 'react';

import TabBar from '@/components/tabbar';

import ItemList from './components/ItemList';
import { ManualAdd } from './components/ManualAdd';

export default function AddTest() {
  const [pattern, setPattern] = useState<number>(0);
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
      <TabBar
        navText={['设置考试信息', '自定义考试信息']}
        pattern={pattern}
        setPattern={setPattern}
      ></TabBar>
      <View
        style={{
          margin: 20,
        }}
      >
        {pattern === 0 ? (
          <ItemList list={list} buttonText="设置" />
        ) : (
          <ManualAdd buttonText="添加" pageText="test" />
        )}
      </View>
    </>
  );
}

import { View } from '@ant-design/react-native';
import React from 'react';

import TabBar from '@/components/tabs';

import { CourseForm } from '@/modules/courseTable/components/CourseForm';
import ItemList from '@/modules/courseTable/components/ItemList';

// TODO)) 这整个功能还没对接
export default function AddTest() {
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
        tabs={[
          {
            title: '设置考试信息',
          },
          {
            title: '自定义考试信息',
          },
        ]}
      ></TabBar>
      <View
        style={{
          margin: 20,
        }}
      >
        <ItemList list={list} buttonText="设置" />
        <CourseForm submitText="添加" pageText="test" mode="create" />
      </View>
    </>
  );
}

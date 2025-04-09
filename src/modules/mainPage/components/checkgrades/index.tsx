import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Picker from '@/components/picker';

import useVisualScheme from '@/store/visualScheme';

const yearOptions = [
  {
    value: '2024',
    label: '2024',
  },
  {
    value: '2023',
    label: '2023',
  },
  {
    value: '2022',
    label: '2022',
  },
  {
    value: '2021',
    label: '2021',
  },
];

const semesterOptions = [
  {
    value: '第一学期',
    label: '第一学期',
  },
  {
    value: '第二学期',
    label: '第二学期',
  },
];
//课程性质
// const courseTypeOptions = [
//   {
//     value: '全部',
//     label: '全部',
//   },
//   {
//     value: '其他',
//     label: '其他',
//   },
// ];

const CheckGrades = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [selectedYear, setSelectedYear] = useState(['2024']);
  const [selectedSemester, setSelectedSemester] = useState(['第一学期']);
  //  const [selectedCourseType, setSelectedCourseType] = useState(['全部']);

  const YearPickerTrigger = (
    <View style={[styles.item, styles.itemBorder]}>
      <Image
        style={{ width: 35, height: 35, marginRight: 34 }}
        source={require('../../../../assets/images/xuenian.png')}
      />
      <View>
        <Text
          style={{
            marginBottom: 1,
            fontSize: 14,
            color: currentStyle?.text_style?.color,
          }}
        >
          选择学年
        </Text>
        <Text style={{ color: '#969696', fontSize: 12 }}>
          {selectedYear[0]}
        </Text>
      </View>
    </View>
  );

  const SemesterPickerTrigger = (
    <View style={[styles.item, styles.itemBorder]}>
      <Image
        style={{ width: 35, height: 35, marginRight: 34 }}
        source={require('../../../../assets/images/xueqi.png')}
      />
      <View>
        <Text
          style={[
            {
              marginBottom: 1,
              fontSize: 14,
              color: currentStyle?.text_style?.color,
            },
          ]}
        >
          选择学期
        </Text>
        <Text style={{ color: '#969696', fontSize: 12 }}>
          {selectedSemester[0]}
        </Text>
      </View>
    </View>
  );

  // const CourseTypePickerTrigger = (
  //   <View style={[styles.item, styles.itemBorder]}>
  //     <Image
  //       style={{ width: 35, height: 35, marginRight: 34 }}
  //       source={require('../../../../assets/images/zhonglei.png')}
  //     />
  //     <Text
  //       style={{
  //         marginBottom: 1,
  //         fontSize: 14,
  //         color: currentStyle?.text_style?.color,
  //       }}
  //     >
  //       选择课程种类
  //     </Text>
  //     <Text style={{ color: '#969696', fontSize: 12 }}>
  //       {selectedCourseType[0]}
  //     </Text>
  //   </View>
  // );

  return (
    <View>
      <Picker
        mode="bottom"
        data={[yearOptions]}
        defaultValue={selectedYear}
        onConfirm={val => setSelectedYear(val)}
        onClose={() => {}}
        showCancel={true}
        confirmText="确认"
        cancelText="取消"
        titleDisplayLogic={(picked, _data) => String(picked[0])}
        children={YearPickerTrigger}
      />

      <Picker
        mode="bottom"
        data={[semesterOptions]}
        defaultValue={selectedSemester}
        onConfirm={val => setSelectedSemester(val)}
        onClose={() => {}}
        showCancel={true}
        confirmText="确认"
        cancelText="取消"
        titleDisplayLogic={(picked, _data) => String(picked[0])}
        children={SemesterPickerTrigger}
      />

      {/* <Picker
        mode="bottom"
        data={[courseTypeOptions]}
        defaultValue={selectedCourseType}
        onConfirm={val => setSelectedCourseType(val)}
        onClose={() => {}}
        showCancel={true}
        confirmText="确认"
        cancelText="取消"
        titleDisplayLogic={(picked, _data) => String(picked[0])}
        children={CourseTypePickerTrigger}
      /> */}

      <TouchableOpacity
        style={{
          width: 309,
          height: 46,
          backgroundColor: '#7878F8',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          borderRadius: 10,
          marginTop: 26,
        }}
        onPress={() => {
          const semesterNum = selectedSemester[0] === '第一学期' ? 1 : 2;
          router.push({
            pathname: '/scoreCalculation',
            params: {
              year: selectedYear[0],
              semester: semesterNum,
              // type: selectedCourseType[0] || '全部',
            },
          });
        }}
      >
        <Text style={{ color: '#FFFFFF' }}>查询</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckGrades;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8D8D8',
  },
});

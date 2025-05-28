import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MultiPicker from '@/components/picker/multiPicker';

import useVisualScheme from '@/store/visualScheme';

import { generateSemesterOptions } from '@/utils/generateSemesterOptions';

import { COURSE_TYPE_OPTIONS } from './constants';

const CheckGrades = () => {
  const semesterOptions = generateSemesterOptions();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [selectedCourseType, setSelectedCourseType] = useState<
    (number | string)[]
  >(COURSE_TYPE_OPTIONS.map(option => option.value));
  const [selectedSemester, setSelectedSemester] = useState<(number | string)[]>(
    semesterOptions.flatMap(option => option.map(item => item.value))
  );
  const SemesterPickerTrigger = (
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
          选择学期（已选{selectedSemester.length}个）
        </Text>
        <Text
          style={{ color: '#969696', fontSize: 12, width: 260 }}
          numberOfLines={2}
        >
          {selectedSemester
            .map(
              semester =>
                semesterOptions[0].find(option => option.value === semester)
                  ?.label
            )
            .join('，')}
        </Text>
      </View>
    </View>
  );

  const CourseTypePickerTrigger = (
    <View style={styles.item}>
      <Image
        style={{ width: 35, height: 35, marginRight: 34 }}
        source={require('../../../../assets/images/xueqi.png')}
      />
      <View style={{ display: 'flex' }}>
        <Text
          style={[
            {
              marginBottom: 1,
              fontSize: 14,
              color: currentStyle?.text_style?.color,
            },
          ]}
        >
          选择课程种类
        </Text>
        <Text style={{ color: '#969696', fontSize: 12, width: 260 }}>
          {selectedCourseType.join('，')}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      <MultiPicker
        mode="bottom"
        data={semesterOptions}
        defaultValue={selectedSemester}
        onConfirm={val => setSelectedSemester(val)}
        onClose={() => {}}
        showCancel={true}
        confirmText="确认"
        cancelText="取消"
        titleDisplayLogic={(_val, _data) => '请选择学期'}
      >
        {SemesterPickerTrigger}
      </MultiPicker>

      <MultiPicker
        mode="bottom"
        data={[COURSE_TYPE_OPTIONS]}
        defaultValue={selectedCourseType}
        onConfirm={val => setSelectedCourseType(val)}
        onClose={() => {}}
        showCancel={true}
        confirmText="确认"
        cancelText="取消"
        titleDisplayLogic={(_val, _data) => '请选择课程性质'}
      >
        {CourseTypePickerTrigger}
      </MultiPicker>

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
          router.push({
            pathname: '/(mainPage)/scoreCalculation',
            params: {
              semester: JSON.stringify(selectedSemester),
              courseType: JSON.stringify(selectedCourseType),
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
    paddingVertical: 10,
    minHeight: 70,
    alignItems: 'center',
  },
  itemBorder: {
    borderBottomWidth: 0.5,
    borderStyle: 'solid',
    borderColor: '#D8D8D880',
  },
});

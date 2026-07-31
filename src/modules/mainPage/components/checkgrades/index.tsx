import { Toast } from '@ant-design/react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MultiPicker from '@/components/picker/multiPicker';
import type { PickerDataType } from '@/components/picker/types';

import useCourse from '@/store/course';
import useVisualScheme from '@/store/visualScheme';

import { queryGradeType } from '@/request/api/grade';
import { querySemesterList } from '@/request/api/semester';
import { generateSemesterOptions } from '@/utils/generateSemesterOptions';

const formatCourseType = (types: string[]) => {
  return types.map(type => ({ label: type, value: type }));
};

const CheckGrades = () => {
  const { courseCategories, updatecourseCategories } = useCourse();
  const [loading, setLoading] = useState(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [semesterOptions, setSemesterOptions] = useState<PickerDataType>([[]]);
  const [courseType, setCourseType] = useState<PickerDataType>([
    formatCourseType(courseCategories),
  ]);
  const [selectedCourseType, setSelectedCourseType] =
    useState<(number | string)[]>(courseCategories);
  const [selectedSemester, setSelectedSemester] = useState<(number | string)[]>(
    []
  );

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const [gradeTypeRes, semesterListRes] = await Promise.all([
          queryGradeType(),
          querySemesterList(),
        ]);

        if (
          gradeTypeRes.code !== 0 ||
          !gradeTypeRes.data?.kcxzmc ||
          semesterListRes.code !== 0 ||
          !semesterListRes.data
        ) {
          throw new Error('成绩筛选接口返回无效数据');
        }

        const courseTypes = gradeTypeRes.data.kcxzmc;
        const options = generateSemesterOptions(semesterListRes.data);
        setSelectedCourseType(courseTypes);
        setCourseType([formatCourseType(courseTypes)]);
        updatecourseCategories(courseTypes);
        setSemesterOptions(options);
        setSelectedSemester(
          options.flatMap(option => option.map(item => item.value))
        );
      } catch {
        Toast.fail('获取成绩筛选条件失败');
      } finally {
        setLoading(false);
      }
    };

    void fetchFilters();
  }, [updatecourseCategories]);

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
                semesterOptions[0]?.find(option => option.value === semester)
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7878F8" />
          <Text style={[styles.loadingText, currentStyle?.text_style]}>
            加载中...
          </Text>
        </View>
      ) : (
        <>
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
            data={courseType}
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
        </>
      )}
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

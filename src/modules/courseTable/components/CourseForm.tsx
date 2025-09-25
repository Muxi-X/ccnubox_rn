import { Button, Input, WhiteSpace } from '@ant-design/react-native';
import * as React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Image from '@/components/image';
import Modal from '@/components/modal';
import Picker from '@/components/picker';
import MultiPicker from '@/components/picker/multiPicker';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { courseType } from '@/modules/courseTable/components/courseTable/type';
import { addCourse } from '@/request/api/course';
import { percent2px } from '@/utils';

interface FormItem {
  icon: any;
  title: string;
  value: string;
  type: 'input' | 'picker';
}

export interface CourseFormData {
  name: string;
  weeks: number[];
  day: number;
  dur_class: string;
  where: string;
  teacher: string;
  credit?: number;
}

interface CourseFormProps {
  buttonText?: string; // backward-compat
  submitText?: string; // preferred
  pageText: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  onSubmit?: (data: CourseFormData) => Promise<void>;
  courseData?: courseType;
}

export const CourseForm = (props: CourseFormProps) => {
  const text = props.pageText === 'test' ? '考试' : '上课';
  const submitText = props.submitText || props.buttonText || '提交';
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { semester, year } = useTimeStore();
  const { addCourse: addCourseToStore } = useCourse();

  const [formData, setFormData] = React.useState<CourseFormData>(() => {
    if (props.courseData) {
      const cd = props.courseData;
      return {
        name: cd.classname || '',
        weeks:
          cd.weeks && cd.weeks.length > 0
            ? cd.weeks
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        day: cd.day || 1,
        dur_class: cd.class_when || '1-2',
        where: cd.where || '',
        teacher: cd.teacher || '',
        credit: cd.credit ?? 3,
      };
    }
    return {
      name: '',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      day: 1,
      dur_class: '1-2',
      where: '',
      teacher: '',
      credit: 3,
    };
  });

  React.useEffect(() => {
    if (props.courseData) {
      const cd = props.courseData;
      setFormData({
        name: cd.classname || '',
        weeks:
          cd.weeks && cd.weeks.length > 0
            ? cd.weeks
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        day: cd.day || 1,
        dur_class: cd.class_when || '1-2',
        where: cd.where || '',
        teacher: cd.teacher || '',
        credit: cd.credit ?? 3,
      });
    }
  }, [props.courseData]);
  const [loading, setLoading] = React.useState(false);

  const items: FormItem[] = [
    {
      icon: require('@/assets/images/week.png'), // eslint-disable-line @typescript-eslint/no-require-imports
      title: '选择周次',
      value:
        formData.weeks.length > 0
          ? `${Math.min(...formData.weeks)}-${Math.max(...formData.weeks)}周`
          : '1-18周',
      type: 'picker',
    },
    {
      icon: require('@/assets/images/time.png'), // eslint-disable-line @typescript-eslint/no-require-imports
      title: `${text}时间`,
      value: `周${['一', '二', '三', '四', '五', '六', '日'][formData.day - 1]}${formData.dur_class}节`,
      type: 'picker',
    },
    {
      icon: require('@/assets/images/location.png'), // eslint-disable-line @typescript-eslint/no-require-imports
      title: 'location',
      value: formData.where || `输入${text}地点`,
      type: 'input',
    },
    {
      icon: require('@/assets/images/teacher.png'), // eslint-disable-line @typescript-eslint/no-require-imports
      title: 'teacher',
      value: formData.teacher || '输入教师',
      type: 'input',
    },
  ];

  const weeksToBitmask = (weeks: number[]): number => {
    return weeks.reduce((mask, w) => mask | (1 << (w - 1)), 0);
  };

  const createAndCacheCourse = (
    data: CourseFormData,
    curSemester: string,
    curYear: string
  ): courseType => {
    const weeksMask = weeksToBitmask(data.weeks);
    const courseId = `Class:${data.name}:${curYear}:${curSemester}:${data.day}:${data.dur_class}:${data.teacher}:${data.where}:${weeksMask}`;
    const weekDuration =
      data.weeks.length === 1
        ? `第${data.weeks[0]}周`
        : `第${Math.min(...data.weeks)}-${Math.max(...data.weeks)}周`;

    const courseData: courseType = {
      id: courseId,
      classname: data.name,
      teacher: data.teacher || '未知教师',
      where: data.where || '未知地点',
      day: data.day,
      class_when: data.dur_class,
      weeks: data.weeks,
      week_duration: weekDuration,
      credit: data.credit || 0,
      semester: curSemester,
      year: curYear,
    };

    addCourseToStore(courseData);

    return courseData;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Modal.show({
        title: '提示',
        children: '请输入课程名称',
        mode: 'middle',
        showCancel: false,
        confirmText: '确定',
      });
      return;
    }
    if (formData.weeks.length === 0) {
      Modal.show({
        title: '提示',
        children: '请选择周次',
        mode: 'middle',
        showCancel: false,
        confirmText: '确定',
      });
      return;
    }

    setLoading(true);
    try {
      if (props.onSubmit) {
        await props.onSubmit(formData);
        return;
      }

      // default create behavior
      const data = {
        ...formData,
        semester: semester || '1',
        year: year || new Date().getFullYear().toString(),
      } as any;

      await addCourse(data);

      createAndCacheCourse(
        formData,
        semester || '1',
        year || new Date().getFullYear().toString()
      );

      Modal.show({
        title: '成功',
        children: props.mode === 'edit' ? '已保存' : '课程添加成功',
        mode: 'middle',
        showCancel: false,
        confirmText: '确定',
        onConfirm: () => {
          if (props.mode !== 'edit') {
            setFormData({
              name: '',
              weeks: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              ],
              day: 1,
              dur_class: '1-2',
              where: '',
              teacher: '',
              credit: 3,
            });
          }
          props.onSuccess?.();
        },
      });
    } catch {
      Modal.show({
        title: '错误',
        children:
          props.mode === 'edit' ? '保存失败，请重试' : '添加课程失败，请重试',
        mode: 'middle',
        showCancel: false,
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.addContainer}>
        <Input
          inputStyle={styles.addText}
          allowClear
          placeholder={`请输入${props.pageText === 'test' ? '考试' : '课程'}名称`}
          placeholderTextColor={currentStyle?.placeholder_text_style?.color}
          value={formData.name}
          onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
        />
        <WhiteSpace size="lg" />
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.icon} style={styles.icon} />
              {item.type === 'picker' ? (
                item.title === '选择周次' ? (
                  <MultiPicker
                    data={[
                      [...Array(18).keys()].map(i => ({
                        value: i + 1,
                        label: `第${i + 1}周`,
                      })),
                    ]}
                    defaultValue={[
                      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                      18,
                    ]}
                    onConfirm={values => {
                      const selectedWeeks = values.map(v => parseInt(v));
                      setFormData(prev => ({ ...prev, weeks: selectedWeeks }));
                    }}
                    titleDisplayLogic={() =>
                      formData.weeks.length > 0
                        ? `${Math.min(...formData.weeks)}-${Math.max(...formData.weeks)}周`
                        : '1-18周'
                    }
                  >
                    <View style={{ width: percent2px(70) }}>
                      <View>
                        <Text
                          style={[
                            { fontSize: 16, height: 20 },
                            currentStyle?.text_style,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, color: '#75757B' }}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  </MultiPicker>
                ) : (
                  <Picker
                    titleDisplayLogic={() =>
                      `周${['一', '二', '三', '四', '五', '六', '日'][formData.day - 1]}${formData.dur_class}节`
                    }
                    connectors={[
                      {
                        content: '到',
                        columnIndex: 1,
                      },
                    ]}
                    data={[
                      [...Array(7).keys()].map(i => ({
                        value: i + 1,
                        label: ['一', '二', '三', '四', '五', '六', '日'][i],
                      })),
                      // 课程开始时间
                      [...Array(12).keys()].map(i => ({
                        value: i + 1,
                        label: `第${i + 1}节`,
                      })),
                      // 课程结束时间
                      [...Array(12).keys()].map(i => ({
                        value: i + 1,
                        label: `第${i + 1}节`,
                      })),
                    ]}
                    onConfirm={values => {
                      const [day, startClass, endClass] = values;
                      const startClassNum = parseInt(startClass, 10);
                      const endClassNum = parseInt(endClass, 10);

                      // 开始时间晚于结束时间提示
                      if (startClassNum > endClassNum) {
                        Modal.show({
                          title: '小提示',
                          children: '课程开始时间不能晚于结束时间，请重新选择',
                          mode: 'middle',
                          showCancel: false,
                          confirmText: '确定',
                        });
                        return;
                      }

                      const dur_class = `${startClass}-${endClass}`;
                      setFormData(prev => ({
                        ...prev,
                        day: parseInt(day),
                        dur_class: dur_class,
                      }));
                    }}
                  >
                    <View style={{ width: percent2px(70) }}>
                      <View>
                        <Text
                          style={[
                            { fontSize: 16, height: 20 },
                            currentStyle?.text_style,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, color: '#75757B' }}>
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  </Picker>
                )
              ) : (
                <Input
                  placeholder={item.value}
                  placeholderTextColor="#75757B"
                  allowClear
                  value={
                    item.title === 'location'
                      ? formData.where
                      : item.title === 'teacher'
                        ? formData.teacher
                        : ''
                  }
                  onChangeText={text => {
                    if (item.title === 'location') {
                      setFormData(prev => ({ ...prev, where: text }));
                    } else if (item.title === 'teacher') {
                      setFormData(prev => ({ ...prev, teacher: text }));
                    }
                  }}
                />
              )}
            </View>
          )}
        ></FlatList>
        <WhiteSpace size="lg" />
        <Button
          type="primary"
          style={styles.button}
          loading={loading}
          onPress={handleSubmit}
        >
          {submitText}
        </Button>
      </View>
    </>
  );
};
export default CourseForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  addContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  addText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#D8D8D8',
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },
  button: {
    height: 50,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
  },
});

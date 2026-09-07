import { Button, Input, WhiteSpace } from '@ant-design/react-native';
import * as React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import Image from '@/components/image';
import Modal from '@/components/modal';
import Picker from '@/components/picker';
import MultiPicker from '@/components/picker/multiPicker';
import { courseType } from '@/modules/courseTable/components/courseTable/type';
import { addCourse } from '@/request/api/course';
import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';
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

const MAX_CLASS_PERIOD = 12;

const getTimePickerValue = (
  day: number,
  duration: string
): [number, number, number] => {
  const [rawStart, rawEnd] = duration.split('-').map(Number);
  const start = Math.min(Math.max(rawStart || 1, 1), MAX_CLASS_PERIOD);
  const end = Math.min(Math.max(rawEnd || start, start), MAX_CLASS_PERIOD);

  return [day || 1, start, end];
};

interface CourseFormProps {
  buttonText?: string; // backward-compat
  submitText?: string; // preferred
  pageText: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  onSubmit?: (_data: CourseFormData) => Promise<void>;
  courseData?: courseType;
}

export const CourseDataForm = (props: CourseFormProps) => {
  const text = props.pageText === 'test' ? '考试' : '上课';
  const submitText = props.submitText || props.buttonText || '提交';
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { semester, year } = useTimeStore();
  const { addCourse: addCourseToStore } = useCourse();
  const calendarWeekCount = useTimeStore(state => state.getSemesterWeekCount());
  const maxCachedWeek = useCourse(state =>
    state.courses.reduce(
      (maximum, course) =>
        Math.max(maximum, ...(Array.isArray(course.weeks) ? course.weeks : [])),
      0
    )
  );
  const pickerWeekCount = Math.max(18, calendarWeekCount, maxCachedWeek);
  const defaultWeeks = React.useMemo(
    () => Array.from({ length: pickerWeekCount }, (_, index) => index + 1),
    [pickerWeekCount]
  );

  const [formData, setFormData] = React.useState<CourseFormData>(() => {
    if (props.courseData) {
      const cd = props.courseData;
      return {
        name: cd.classname || '',
        weeks: cd.weeks && cd.weeks.length > 0 ? cd.weeks : defaultWeeks,
        day: cd.day || 1,
        dur_class: cd.class_when || '1-2',
        where: cd.where || '',
        teacher: cd.teacher || '',
        credit: cd.credit ?? 3,
      };
    }
    return {
      name: '',
      weeks: defaultWeeks,
      day: 1,
      dur_class: '1-2',
      where: '',
      teacher: '',
      credit: 3,
    };
  });
  const [timePickerValue, setTimePickerValue] = React.useState<
    [number, number, number]
  >(() => getTimePickerValue(formData.day, formData.dur_class));

  React.useEffect(() => {
    if (props.courseData) {
      const cd = props.courseData;
      setFormData({
        name: cd.classname || '',
        weeks: cd.weeks && cd.weeks.length > 0 ? cd.weeks : defaultWeeks,
        day: cd.day || 1,
        dur_class: cd.class_when || '1-2',
        where: cd.where || '',
        teacher: cd.teacher || '',
        credit: cd.credit ?? 3,
      });
      setTimePickerValue(
        getTimePickerValue(cd.day || 1, cd.class_when || '1-2')
      );
    }
  }, [defaultWeeks, props.courseData]);
  const [loading, setLoading] = React.useState(false);

  const selectedStartClass = timePickerValue[1];
  const endClassOptions = React.useMemo(
    () =>
      Array.from(
        { length: MAX_CLASS_PERIOD - selectedStartClass + 1 },
        (_, index) => {
          const value = selectedStartClass + index;
          return { value, label: `第${value}节` };
        }
      ),
    [selectedStartClass]
  );

  const items: FormItem[] = [
    {
      icon: require('@/assets/images/week.png'), // eslint-disable-line @typescript-eslint/no-require-imports
      title: '选择周次',
      value:
        formData.weeks.length > 0
          ? `${Math.min(...formData.weeks)}-${Math.max(...formData.weeks)}周`
          : `1-${pickerWeekCount}周`,
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
      note: '',
      nature: '自定义课程',
      is_official: false, // 自主添加而非教务系统的课
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
    if (!props.onSubmit && (!semester || !year)) {
      Modal.show({
        title: '提示',
        children: '学期信息尚未加载，请稍后重试',
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
        semester,
        year,
        is_official: false, // 自主添加而非教务系统的课
      } as any;

      await addCourse(data);

      createAndCacheCourse(formData, semester, year);

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
              weeks: defaultWeeks,
              day: 1,
              dur_class: '1-2',
              where: '',
              teacher: '',
              credit: 3,
            });
            setTimePickerValue([1, 1, 2]);
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
          inputStyle={[currentStyle?.text_style, styles.addText]}
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
                      [...Array(pickerWeekCount).keys()].map(i => ({
                        value: i + 1,
                        label: `第${i + 1}周`,
                      })),
                    ]}
                    defaultValue={
                      formData.weeks.length > 0 ? formData.weeks : defaultWeeks
                    }
                    onConfirm={values => {
                      const selectedWeeks = values.map(v => parseInt(v));
                      setFormData(prev => ({ ...prev, weeks: selectedWeeks }));
                    }}
                    titleDisplayLogic={selectedWeeks => {
                      if (!selectedWeeks || selectedWeeks.length === 0) {
                        return '请选择周次';
                      }
                      const numWeeks = selectedWeeks
                        .map(v => Number(v))
                        .sort((a, b) => a - b);
                      return numWeeks.length === 1
                        ? `第${numWeeks[0]}周`
                        : `${numWeeks[0]}-${numWeeks[numWeeks.length - 1]}周`;
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
                  </MultiPicker>
                ) : (
                  <Picker
                    defaultValue={[
                      formData.day,
                      parseInt(formData.dur_class.split('-')[0], 10) || 1,
                      parseInt(formData.dur_class.split('-')[1], 10) || 2,
                    ]}
                    controlledValue={timePickerValue}
                    titleDisplayLogic={pickerVal => {
                      const day = pickerVal[0] ?? formData.day;
                      const start =
                        pickerVal[1] ??
                        parseInt(formData.dur_class.split('-')[0], 10) ??
                        1;
                      const end =
                        pickerVal[2] ??
                        parseInt(formData.dur_class.split('-')[1], 10) ??
                        2;
                      const dayLabel =
                        ['一', '二', '三', '四', '五', '六', '日'][
                          Number(day) - 1
                        ] ?? '一';
                      return `周${dayLabel}第${start}-${end}节`;
                    }}
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
                      endClassOptions,
                    ]}
                    onColumnChange={(values, changedIndex) => {
                      const day = Number(values[0]);
                      const startClass = Number(values[1]);
                      const currentEndClass = Number(values[2]);
                      const endClass =
                        changedIndex === 1 && currentEndClass < startClass
                          ? startClass
                          : currentEndClass;

                      setTimePickerValue([day, startClass, endClass]);
                    }}
                    onCancel={() => {
                      setTimePickerValue(
                        getTimePickerValue(formData.day, formData.dur_class)
                      );
                    }}
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
                      setTimePickerValue([
                        parseInt(day, 10),
                        startClassNum,
                        endClassNum,
                      ]);
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
                  inputStyle={currentStyle?.text_style}
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
export default CourseDataForm;

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

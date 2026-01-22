import { View } from '@ant-design/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Modal from '@/components/modal';

import useCourse from '@/store/course';

import { CourseDataForm } from '@/modules/courseTable/components/CourseDataForm';
import { updateCourse } from '@/request/api/course';

export default function EditCourse() {
  const router = useRouter();
  const { id: _id } = useLocalSearchParams<{ id?: string }>();
  const course = useCourse(state => state.courses.find(c => c.id === _id));
  const updateCourses = useCourse(state => state.updateCourses);
  return (
    <View
      style={{
        margin: 20,
      }}
    >
      <CourseDataForm
        pageText="course"
        submitText="保存编辑"
        mode="edit"
        courseData={course}
        onSubmit={async data => {
          if (!course) return;
          const weeksToBitmask = (weeks: number[]) =>
            weeks.reduce((mask, w) => mask | (1 << (w - 1)), 0);
          const payload = {
            classId: course.id,
            credit: data.credit,
            day: data.day,
            dur_class: data.dur_class,
            name: data.name,
            semester: course.semester,
            teacher: data.teacher,
            weeks: data.weeks,
            where: data.where,
            year: course.year,
          };
          updateCourse(payload)
            .then(res => {
              if (res.code === 0) {
                updateCourses(
                  useCourse.getState().courses.map(c =>
                    c.id === course.id
                      ? {
                          ...c,
                          id: `Class:${data.name}:${course.year}:${course.semester}:${data.day}:${data.dur_class}:${data.teacher}:${data.where}:${weeksToBitmask(data.weeks)}`,
                          classname: data.name,
                          teacher: data.teacher,
                          where: data.where,
                          day: data.day,
                          class_when: data.dur_class,
                          weeks: data.weeks,
                          week_duration:
                            data.weeks.length === 1
                              ? `第${data.weeks[0]}周`
                              : `第${Math.min(...data.weeks)}-${Math.max(...data.weeks)}周`,
                          credit: data.credit || 0,
                          is_official: c.is_official,
                        }
                      : c
                  )
                );
                router.back();
                Modal.show({
                  title: '编辑成功',
                  children: '编辑已保存',
                  mode: 'middle',
                  showCancel: false,
                });
              }
            })
            .catch(err => {
              if (err.response.data.code === 50001) {
                Modal.show({
                  title: '编辑失败',
                  children: '从教务系统导入的课程不支持编辑',
                  mode: 'middle',
                  showCancel: false,
                });
              }
            });
        }}
      />
    </View>
  );
}

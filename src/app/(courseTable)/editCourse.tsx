import { View } from '@ant-design/react-native';

import { ManualAdd } from '@/modules/courseTable/components/ManualAdd';

// TODO)) 编辑课程还没做
export default function EditCourse() {
  // const route = useRouter(); // 获取 route 参数

  // const courseData = route.courseData;
  return (
    <View
      style={{
        margin: 20,
      }}
    >
      <ManualAdd pageText="course" buttonText="保存编辑" />
    </View>
  );
}

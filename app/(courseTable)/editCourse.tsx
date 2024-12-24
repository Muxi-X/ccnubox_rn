import { View } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { AddComponent } from './component/AddComponent';

export default function EditCourse() {
  const route = useRouter(); // 获取 route 参数

  // const courseData = route.courseData;
  return (
    <>
      <View
        style={{
          margin: 20,
        }}
      >
        <AddComponent pageText="course" buttonText="保存编辑" />
      </View>
    </>
  );
}

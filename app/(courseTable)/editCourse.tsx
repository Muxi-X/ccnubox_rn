import { View } from "@ant-design/react-native";
import { AddComponent } from "./addCourse";
import { useRouter } from "expo-router";

export default function EditCourse() {
    const route = useRouter();  // 获取 route 参数

    // const courseData = route.courseData;
  return (
    <>
      <View
      style={{
        margin: 20
      }}>
        <AddComponent buttonText="保存编辑" />
      </View>
    </>
  );
}
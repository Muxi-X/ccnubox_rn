import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

export default function SpaceLesson() {
  // const [classInfo, setClassInfo] = useState([]);
  return (
    <View>
      <View
        style={{
          backgroundColor: '#9379F6',
          opacity: 0.3,
          display: 'flex',
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 20,
          marginBottom: 30,
        }}
      >
        <MaterialIcons
          style={{ marginHorizontal: 10 }}
          name="search"
          size={24}
          color="#666"
        />
        <TextInput
          selectionColor="#75757B"
          placeholder="请输入课程名称/教师名称"
          placeholderTextColor="#75757B"
        />
      </View>
      {/* <ItemList buttonText="添加" /> */}
    </View>
  );
}

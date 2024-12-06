import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import useVisualScheme from '@/store/visualScheme';
import useThemeBasedComponents from '@/store/themeBasedComponents';

export default function addCourse() {
  const [pattern, setPattern] = React.useState(1);

  return (
    <View style={styles.container}>
      <Nabvar pattern={pattern} setPattern={setPattern} />
      {pattern === 1 ? <AddPage/>:<SearchPage/>}
    </View>
  );
}

const Nabvar = ({ setPattern, pattern }: { setPattern: React.Dispatch<React.SetStateAction<number>>, pattern: number }) => {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const currentComponents = useThemeBasedComponents(state => state.currentComponents);

  return (
    <View style={[styles.navbar]}>
      <TouchableOpacity onPress={() => setPattern(1)}>
        <View style={[
          styles.navbarItem,
          pattern === 1 && styles.activeBar
        ]}>
          <Text
          style={[styles.navbarText,
          pattern === 1 && {
            color: '#9379F6',
          }
          ]}>自主添加</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPattern(2)}>
        <View style={[
          styles.navbarItem,
          pattern === 2 && styles.activeBar
          ]}>
          <Text
          style={[
          styles.navbarText,
          pattern === 2 && {
            color: '#9379F6',
          }
          ]}>搜索添加</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const AddPage: React.FC = () => {
  return (
    <View style={
      styles.addContainer
    }>
      <AddComponent buttonText="添加课程"/>
    </View>
  )
}

const SearchPage: React.FC = () => {
  const list = [
    {
      name: '计算机基础',
      teacher: '王老师',
      score: 2,
      classroom: '9337',
      time: '3-4节',
      week: '周三',
    },
  ];

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
        <MaterialIcons style={{ marginHorizontal: 10 }} name="search" size={24} color="#666" />
        <TextInput
        selectionColor={'#75757B'}
        placeholder="请输入课程名称/教师名称"
        placeholderTextColor="#75757B"/>
      </View>
      {list.length === 0 ? (
        <Text>没有课程安排</Text>
      ) : (
        list.map((item, index) => (
          <View
            key={index}
            style={styles.card}
          >
            <View
              style={styles.icon}
            >
              <MaterialIcons name="event" size={24} color="#666" />
            </View>
            <View style={{ marginLeft: 10, flex: 8 }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      paddingRight: 15,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    {item.teacher}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                }}
              >
                <View>
                  <Text style={{ fontSize: 12, color: '#75757B', marginTop: 5 }}>
                    {item.score}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{ fontSize: 12, color: '#75757B', marginTop: 5 }}
                  >{`@${item.classroom}`}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: '#75757B' }}>
                    {`${item.week} ${item.time}`}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#7878F8',
                paddingVertical: 10,
                borderRadius: 5, // 圆角按钮
                shadowOpacity: 0.1,
                shadowRadius: 5,
                height: 40,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16, // 调整字体大小
                }}
              >
                添加
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export const AddComponent = (props: { buttonText: string }) => {
  const { buttonText } = props;
  return (
    <>
      <View>
        <TextInput
        style={styles.addText}
        selectionColor={'#75757B'}
        placeholder="请输入课程名称"
        placeholderTextColor="#75757B"/>
      </View>
      <View
       style={
        styles.card
       }>
        <View
        style={{
          flex: 1,
        }}>
          <MaterialIcons name='event' size={30} color="#666"></MaterialIcons>
        </View>
        <View
        style={{
          flex: 8,
        }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 700 }}>选择周次</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, color: '#75757B' }}>1-18周</Text>
          </View>
        </View>
      </View>
      <View
      style={
        styles.card
      }>
        <View
        style={{
          flex: 1,
        }}>
          <MaterialIcons name='event' size={30} color="#666"></MaterialIcons>
        </View>
        <View
        style={{
          flex: 8,
        }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 700 }}>上课时间</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, color: '#75757B' }}>周一1-2节</Text>
          </View>
        </View>
      </View>
      <View
      style={
        styles.card
      }>
        <View
        style={{
          flex: 1,
        }}>
          <MaterialIcons name='event' size={30} color="#666"></MaterialIcons>
        </View>
        <View
        style={{
          flex: 8,
        }}>
          <View>
            <Text style={{ fontSize: 16, color: '#75757B' }}>输入上课地点(非必填)</Text>
          </View>
        </View>
      </View>
      <View
      style={
        styles.card
      }>
        <View
        style={{
          flex: 1,
        }}>
          <MaterialIcons name='event' size={30} color="#666"></MaterialIcons>
        </View>
        <View
        style={{
          flex: 8,
        }}>
          <View>
            <Text style={{ fontSize: 16, color: '#75757B' }}>输入教师(非必填)</Text>
          </View>
        </View>
      </View>
      <View
      style={{
        backgroundColor: '#7878F8',
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10, // 圆角按钮
        shadowOpacity: 0.1,
        marginHorizontal: 20,
        marginVertical: 20,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>{buttonText}</Text>
      </View>
    </>
)}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF'
  },
  navbar: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    fontSize: 24,
    marginBottom: 20,
  },
  activeBar: {
    color: '#9379F6',
    borderBottomWidth: 3,
    borderColor: '#9379F6',
  },
  navbarText:{
    fontSize: 18,
    paddingHorizontal: 20,
  },
  navbarItem: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    marginHorizontal: 20,
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  addContainer: {
    paddingHorizontal: 20,
  },
  addText: {
    fontSize: 24,
    fontWeight: '900',
  },
  card:{
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#D8D8D8',
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon:{
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }
});

import React from 'react';
import Text from '@/components/text';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Input, SearchBar } from '@ant-design/react-native';


const SamplePage: React.FC = () => {
  const list = [{
    name: '计算机基础',
    teacher: '王老师',
    score: 2,
    classroom: '9337',
    time: '3-4节',
    week: '周三'
  }];

  return (
    <View style={{padding: 10}}>
      <View style={{
        backgroundColor: '#9379F6',
        opacity: 0.3,
      }}>
        <MaterialIcons name="search" size={24} color="#666" />
        <Input placeholder='搜索课程'></Input>
      </View>
      {list.length === 0 ? (
        <Text>没有课程安排</Text>
      ) : (
        list.map((item, index) => (
          <View
            key={index}
            style={{
              height: 60,
              backgroundColor: '#f5f5f5',
              borderBottomWidth: 1,
              borderColor: '#D8D8D8',
              padding: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent:'space-between',
            }}
          >
            <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <MaterialIcons name="event" size={24} color="#666" />
            </View>
            <View style={{marginLeft: 10,flex: 5}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <View>
                      <Text style={{fontSize: 16, fontWeight: 'bold',paddingRight: 15}}>{item.name}</Text>
                    </View>
                    <View>
                      <Text style={{fontSize: 16, fontWeight:'bold'}}>{item.teacher}</Text>
                    </View>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent:'space-between',
                    paddingRight: 20,
                  }}>
                    <View>
                        <Text style={{fontSize: 12, color: '#666', marginTop: 5}}>{item.score}</Text>
                    </View>
                    <View>
                        <Text style={{fontSize: 12, color: '#666', marginTop: 5}}>{`@${item.classroom}`}</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 12, color: '#666' }}>
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
                backgroundColor: '#9379F6',
                paddingVertical: 10,
                borderRadius: 5, // 圆角按钮
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                height: 40,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16, // 调整字体大小
                letterSpacing: 5,
              }}>
                添加
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default SamplePage;

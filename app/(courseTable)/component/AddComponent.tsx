import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Image from '@/components/image';

interface itemType {
    icon: any;
    title: string;
    value: string;
}

interface Props {
  buttonText: string;
  pageText: string;
}

export const AddComponent = (props: Props) => {
    const text = props.pageText === 'test' ? '考试' : '上课';
    const items: itemType[] = [
        {
          icon: require('@/assets/images/week.png'),
          title: '选择周次',
          value: '1-18周',
        },
        {
          icon: require('@/assets/images/time.png'),
          title: `${text}时间`,
          value: '周一1-2节',
        },
        {
          icon: require('@/assets/images/location.png'),
          title: '',
          value: `输入${text}地点(非必填)`,
        },
        {
          icon: require('@/assets/images/teacher.png'),
          title: '',
          value: '输入教师(非必填)',
        },
      ];
    const { buttonText } = props;
    return (
      <>
        <View>
          <TextInput
            style={styles.addText}
            selectionColor="#75757B"
            placeholder="请输入课程名称"
            placeholderTextColor="#75757B"
          />
        </View>
        {items.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card}>
                <Image source={item.icon} style={[ styles.icon ]}></Image>
                <View style={{ flex: 8 }}>
                    {
                        index  < 2 && (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</Text>
                        </View>
                        )
                    }

                    <View>
                        <Text style={{ fontSize: index >= 2 ? 16 : 14, color: '#75757B' }}>{item.value}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        ))}
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
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>{buttonText}</Text>
        </View>
      </>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#FFFFFF',
    },
    addContainer: {
      paddingHorizontal: 20,
    },
    addText: {
      fontSize: 24,
      fontWeight: '900',
    },
    card: {
      height: 80,
      borderBottomWidth: 1,
      borderColor: '#D8D8D8',
      padding: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    icon: {
      width: 30,
      height: 30,
      marginRight: 15,
      resizeMode: 'contain',
    },
  });
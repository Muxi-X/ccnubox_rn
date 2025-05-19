import { Button, Input, WhiteSpace } from '@ant-design/react-native';
import * as React from 'react';
import { FlatList, StyleSheet, Text, TextStyle, View } from 'react-native';

import Image from '@/components/image';
import Picker from '@/components/picker';

import useVisualScheme from '@/store/visualScheme';

import { percent2px } from '@/utils';

interface FormItem {
  icon: any;
  title: string;
  value: string;
  type: 'input' | 'picker';
}

interface AddComponentProps {
  buttonText: string;
  pageText: string;
}

export const ManualAdd = (props: AddComponentProps) => {
  const text = props.pageText === 'test' ? '考试' : '上课';
  const items: FormItem[] = [
    {
      icon: require('@/assets/images/week.png'),
      title: '选择周次',
      value: '1-18周',
      type: 'picker',
    },
    {
      icon: require('@/assets/images/time.png'),
      title: `${text}时间`,
      value: '周一1-2节',
      type: 'picker',
    },
    {
      icon: require('@/assets/images/location.png'),
      title: '',
      value: `输入${text}地点(非必填)`,
      type: 'input',
    },
    {
      icon: require('@/assets/images/teacher.png'),
      title: '',
      value: '输入教师(非必填)',
      type: 'input',
    },
  ];
  const { buttonText } = props;
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <>
      <View style={styles.addContainer}>
        <Input
          inputStyle={styles.addText}
          allowClear
          placeholder={`请输入${props.pageText === 'test' ? '考试' : '课程'}名称`}
          placeholderTextColor="#75757B"
        />
        <WhiteSpace size="lg" />
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.icon} style={styles.icon} />
              {item.type === 'picker' ? (
                <Picker>
                  <View style={{ width: percent2px(70) }}>
                    <View>
                      <Text
                        style={[
                          { fontSize: 16, height: 20 },
                          currentStyle?.text_style as TextStyle,
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
              ) : (
                <Input
                  placeholder={item.value}
                  placeholderTextColor="#75757B"
                  allowClear
                />
              )}
            </View>
          )}
        ></FlatList>
        <WhiteSpace size="lg" />
        <Button
          type="primary"
          style={styles.button}
          onPress={() => {
            //console.log(`${buttonText} 按钮被点击`);
          }}
        >
          {buttonText}
        </Button>
      </View>
    </>
  );
};
export default ManualAdd;

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

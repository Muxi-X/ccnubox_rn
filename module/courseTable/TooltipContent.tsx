//import { Drawer, Grid, WhiteSpace } from '@ant-design/react-native';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface addItemType {
  id: number;
  icon: any;
  text: string;
  url?: Href<string>;
  // url: string;
}

export const addItem: addItemType[] = [
  {
    id: 1,
    icon: require('@/assets/images/add-course.png'),
    text: '添加新课程',
    url: '/(courseTable)/addCourse',
  },
  {
    id: 2,
    icon: require('@/assets/images/add-test.png'),
    text: '添加考试安排',
    url: '/(courseTable)/addTest',
  },
  {
    id: 3,
    icon: require('@/assets/images/change-week.png'),
    text: '切换当前周',
    // url: '/(courseTable)/changeWeek',
  },
  {
    id: 4,
    icon: require('@/assets/images/change-year.png'),
    text: '切换学年',
    // url: '/(courseTable)/changeYear',
  },
];

export const TooltipContent = () => {
  const navigation = useRouter();

  return (
    <View>
      {addItem.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.tooltipItem}
          onPress={() => {
            switch (item.id) {
              case 1:
              case 2: {
                navigation.navigate(item.url);
                break;
              }
            }
          }}
        >
          <Image source={item.icon} style={styles.tooltipImage} />
          <Text style={styles.tooltipText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  tooltipText: {
    fontSize: 10,
    color: '#333',
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
});

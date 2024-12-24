import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Image from '@/components/image';

interface Prop {
  name: string;
  teacher: string;
  score: number;
  classroom: string;
  week: string;
  time: string;
  index?: number;
  buttonText?: string;
}

interface ItemListProps {
  list: Prop[];
  buttonText: string;
}

export default function ItemList({ list, buttonText }: ItemListProps) {
  return (
    <>
      {list.length === 0 ? (
        <Text>没有课程安排</Text>
      ) : (
        list.map((item, index) => (
          <ItemListItem
            key={index}
            index={index}
            buttonText={buttonText}
            {...item}
          />
        ))
      )}
    </>
  );
}

const ItemListItem = (props: Prop) => {
  const { name, teacher, score, classroom, week, time, index, buttonText } =
    props;
  const icon = require('@/assets/images/course.png');
  return (
    <TouchableOpacity onPress={() => {}} key={index} style={styles.card}>
      <View style={styles.icon}>
        <Image source={icon} style={styles.icon} />
      </View>
      <View style={{ marginHorizontal: 10, flex: 7, paddingHorizontal: 10 }}>
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
              {name}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 500 }}>{teacher}</Text>
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
              {score}
            </Text>
          </View>
          <View>
            <Text
              style={{ fontSize: 12, color: '#75757B', marginTop: 5 }}
            >{`@${classroom}`}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#75757B' }}>
              {`${week} ${time}`}
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
          {buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    marginRight: 10,
    resizeMode: 'contain',
  },
});

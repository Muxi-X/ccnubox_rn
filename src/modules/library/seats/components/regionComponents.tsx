// src/components/regionComponents.tsx
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
//注意这里的一个小问题，syj说的是图片要存图床，就是这里的图片链接后面要换成图床的链接。所以我只写了第一个座位表的路径！！！！！
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
});

export const MainF1Room = () => (
  <View style={styles.container}>
    <Image
      source={require('@/assets/images/library/Main_F1_StudyRoom.jpg')}
      style={styles.image}
    />
  </View>
);

export const MainF2Room1 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF2Room2 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF3Room = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF5Room4 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF5Room5 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF6Room1 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF6ForeignRoom = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF7Room2 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF7Room3 = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const MainF9Room = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const LakeF1Open = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const LakeF1Atrium = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const LakeF2Open = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

export const LakeF2Seats = () => (
  <View style={styles.container}>
    <Image style={styles.image} />
  </View>
);

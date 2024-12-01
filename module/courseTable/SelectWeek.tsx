import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

// 获取屏幕高度
const screenHeight = Dimensions.get('window').height;

const BottomDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const translateY = useRef(new Animated.Value(screenHeight)).current; // 初始位置在屏幕下方

  // 打开抽屉
  const openDrawer = () => {
    setIsOpen(true);
    Animated.spring(translateY, {
      toValue: 0, // 动画滑动到顶部
      useNativeDriver: true,
    }).start();
  };

  // 关闭抽屉
  const closeDrawer = () => {
    Animated.spring(translateY, {
      toValue: screenHeight, // 动画滑动到底部
      useNativeDriver: true,
    }).start(() => setIsOpen(false)); // 动画完成后关闭
  };

  // 设置手势响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        if (dy > 0) {
          // 只允许向下拖动
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy } = gestureState;
        if (dy > 150) {
          closeDrawer(); // 如果拖动距离足够，关闭抽屉
        } else {
          Animated.spring(translateY, {
            toValue: 0, // 否则恢复到顶部
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* TabBar底部区域 */}
      <TouchableOpacity style={styles.tabBar} onPress={openDrawer}>
        <Text>点击展开底部抽屉</Text>
      </TouchableOpacity>

      {/* 底部抽屉 */}
      {isOpen && (
        <Animated.View
          style={[styles.drawer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers} // 绑定手势
        >
          <Text>选择周次</Text>
          {/* 这里可以放任何你想显示的内容 */}
          <TouchableOpacity onPress={closeDrawer}>
            <Text>关闭抽屉</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    padding: 10,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // 设置抽屉的高度
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});

export default BottomDrawer;

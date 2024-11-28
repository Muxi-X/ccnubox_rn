import { Icon } from '@ant-design/react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Image from '@/components/image';

import useVisualScheme from '@/store/visualScheme';

const data = [
  {
    title: '专业主干课程',
    score: '95',
    children: [
      {
        title: '高等数学ai',
        score: '96',
      },
      {
        title: 'Calculus',
        score: '99',
      },

      {
        title: 'Geometry',
        score: '92',
      },
    ],
  },
  {
    title: '个性发展课程',
    score: '88',
    children: [
      {
        title: 'Physics',
        score: '90',
      },
      {
        title: 'Chemistry',
        score: '85',
      },
    ],
  },
];

const CourseTree = () => {
  const [activeKey, setActiveKey] = useState<string[]>([]); // 默认使用空数组
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const handlePanelChange = (key: string) => {
    setActiveKey(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderNode = (item: any, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeKey.includes(item.title);

    return (
      <View key={index}>
        <View style={[styles.node, currentStyle?.background_style]}>
          <View style={styles.nodeLeft}>
            {hasChildren && (
              <Icon
                name={isActive ? 'caret-down' : 'caret-right'}
                size={27}
                color="#9379F6"
                onPress={() => handlePanelChange(item.title)}
              />
            )}
            <Text
              style={
                hasChildren
                  ? [styles.nodeText, currentStyle?.text_style]
                  : styles.subNodeText
              }
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.nodeRight}>
            <Text
              style={
                hasChildren
                  ? [styles.nodeScore, currentStyle?.text_style]
                  : styles.nodeSubScore
              }
            >
              {item.score}
            </Text>
          </View>
        </View>
        {/* 子项渲染 */}
        {isActive && item.children && item.children.length > 0 && (
          <View style={styles.subNode}>
            {item.children.map((subItem: any, subIndex: number) => (
              <View key={subIndex}>{renderNode(subItem, subIndex)}</View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{
        backgroundColor: currentStyle?.background_style?.backgroundColor,
      }}
    >
      <View style={[styles.node, styles.titleBorder]}>
        <View style={styles.nodeLeft}>
          <Image
            style={{ width: 35, height: 35 }}
            source={require('../../../../assets/images/flag.png')}
          />
          <Text
            style={[
              styles.nodeText,
              styles.titleText,
              currentStyle?.text_style,
            ]}
          >
            全部已修学分
          </Text>
        </View>
        <View style={[styles.nodeRight, currentStyle?.background_style]}>
          <Text
            style={[
              styles.nodeScore,
              styles.titleText,
              currentStyle?.text_style,
            ]}
          >
            {590}
          </Text>
        </View>
      </View>
      {data.map((item, index) => renderNode(item, index))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    paddingBottom: 20,
  },
  node: {
    flexDirection: 'row', // 横向布局
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeText: {
    fontSize: 16,
    color: '#232323',
    marginLeft: 8,
  },
  nodeRight: {
    marginLeft: 'auto', // 右对齐
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeScore: {
    fontSize: 16,
    color: '#232323',
  },
  titleText: {
    fontWeight: '500',
    fontSize: 16,
    color: '#000000',
  },
  nodeSubScore: {
    fontSize: 16,
    color: '#ABAAAA',
  },
  subNode: {
    marginLeft: 20, // 展开后的缩进
    paddingVertical: 6,
    marginTop: 6, // 子项距离父项略有间隔
    flexDirection: 'column', // 子项垂直排列
  },
  subNodeText: {
    marginLeft: 20, // 展开后的缩进
    paddingVertical: 6,
    flexDirection: 'column', // 子项垂直排列
    color: '#ABAAAA',
  },
});

export default CourseTree;

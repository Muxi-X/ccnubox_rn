import { Icon } from '@ant-design/react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import Image from '@/components/image';

import useVisualScheme from '@/store/visualScheme';

import { queryGradeScore } from '@/request/api';

interface BaseCourseNode {
  title: string;
  credits: number;
}

interface ParentCourseNode extends BaseCourseNode {
  children: BaseCourseNode[];
}

const CourseTree = () => {
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [list, setList] = useState<ParentCourseNode[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    queryGradeScore().then(res => {
      if (res.code === 0 && res.data?.type_of_grade_scores) {
        const typeOfGradeScores = res.data.type_of_grade_scores;
        let totalCredits = 0;

        const data = typeOfGradeScores.map(group => {
          const gradeScoreList = group.grade_score_list || [];
          const groupCredits = gradeScoreList.reduce(
            (sum, course) => sum + (course.xf || 0),
            0
          );
          totalCredits += groupCredits;

          return {
            title: group.kcxzmc || '未知课程类型',
            credits: groupCredits,
            children: gradeScoreList.map(course => ({
              title: course.kcmc || '未知课程',
              credits: course.xf || 0,
            })),
          };
        });

        // Filter out any invalid data
        const validData = data.filter(
          item => item.title && item.children.every(child => child.title)
        ) as ParentCourseNode[];

        setTotal(totalCredits);
        setList(validData);
      }
    });
  }, []);

  const handlePanelChange = (key: string) => {
    setActiveKey(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderNode = (
    item: BaseCourseNode & { children?: BaseCourseNode[] },
    index: number
  ) => {
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
              {item.credits} 学分
            </Text>
          </View>
        </View>
        {/* 子项渲染 */}
        {isActive && item.children && item.children.length > 0 && (
          <View style={styles.subNode}>
            {item.children.map((subItem: BaseCourseNode, subIndex: number) => (
              <View key={subIndex}>{renderNode(subItem, subIndex)}</View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentStyle?.background_style?.backgroundColor },
      ]}
    >
      <View style={[styles.header, currentStyle?.background_style]}>
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
          <View style={styles.nodeRight}>
            <Text
              style={[
                styles.nodeScore,
                styles.titleText,
                currentStyle?.text_style,
              ]}
            >
              {total.toFixed(1)} 学分
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <ScrollView>
          {list.map((item, index) => renderNode(item, index))}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    // height: windowHeight,
  },
  header: {
    backgroundColor: '#fff',
  },
  content: {
    height: windowHeight - 100, // Adjust based on header height
  },
  titleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    paddingBottom: 20,
  },
  node: {
    flexDirection: 'row',
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
    marginLeft: 'auto',
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
    marginLeft: 20,
    paddingVertical: 6,
    marginTop: 6,
    flexDirection: 'column',
  },
  subNodeText: {
    marginLeft: 20,
    paddingVertical: 6,
    flexDirection: 'column',
    color: '#ABAAAA',
  },
});

export default CourseTree;

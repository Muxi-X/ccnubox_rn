import { Icon } from '@ant-design/react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Image from '@/components/image';

import useVisualScheme from '@/store/visualScheme';

import { queryGradeAll } from '@/request/api';

const CourseTree = () => {
  const [activeKey, setActiveKey] = useState<string[]>([]); // 默认使用空数组
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    queryGradeAll({}).then(res => {
      if (res.code === 0) {
        console.log(res.data, '4444');
        let num = 0;
        const data = res.data.reduce((pre: any, cur: any) => {
          const findIndex = pre.findIndex(
            (i: any) => i.title === cur.Kclbmc || i.title === cur.kcxzmc
          );
          num += Number(cur.grade);
          if (findIndex !== -1) {
            pre[findIndex].score += Number(cur.grade);
            pre[findIndex].children.push({
              title: cur.course,
              score: Number(cur.grade),
            });
          } else {
            pre.push({
              title: cur.Kclbmc || cur.kcxzmc,
              score: Number(cur.grade),
              children: [
                { title: cur.Kclbmc || cur.kcxzmc, score: Number(cur.grade) },
              ],
            });
          }
          return pre;
        }, []);
        setTotal(num);
        setList(data);
      }
    });
  }, []);

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
            {total.toFixed(1)}
          </Text>
        </View>
      </View>
      {list.map((item, index) => renderNode(item, index))}
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

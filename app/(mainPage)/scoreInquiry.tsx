import { Tabs } from '@ant-design/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import CheckGrades from '@/module/mainPage/components/checkgrades';
import CourseTree from '@/module/mainPage/components/courseTree';
const tabs = [{ title: '查算学分绩' }, { title: '已修学分' }];
const ScoreInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <View
      style={[
        [
          { flex: 1, paddingTop: 40, backgroundColor: '#FFF' },
          currentStyle?.background_style,
        ],
      ]}
    >
      <Tabs
        tabs={tabs}
        renderTabBar={tabProps => (
          <View
            style={{
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              borderWidth: 0,
            }}
          >
            {tabProps.tabs.map((tab, i) => (
              <TouchableOpacity
                activeOpacity={0.9}
                key={tab.key || i}
                style={{
                  padding: 6,
                  borderBottomColor:
                    tabProps.activeTab === i
                      ? '#9379F6'
                      : currentStyle?.background_style?.backgroundColor,
                  borderStyle: 'solid',
                  borderBottomWidth: 3,
                }}
                onPress={() => {
                  const { goToTab, onTabClick } = tabProps;
                  // tslint:disable-next-line:no-unused-expression
                  onTabClick && onTabClick(tabs[i], i);
                  // tslint:disable-next-line:no-unused-expression
                  goToTab && goToTab(i);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color:
                      tabProps.activeTab === i
                        ? '#9379F6'
                        : currentStyle?.text_style?.color,
                  }}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      >
        <View style={styles.content}>
          <CheckGrades />
        </View>

        <View style={styles.content}>
          <CourseTree />
        </View>
      </Tabs>
    </View>
  );
};
export default ScoreInquiry;

const styles = StyleSheet.create({
  content: {
    paddingVertical: 20,
    paddingHorizontal: 23,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D8D8D8',
  },
});

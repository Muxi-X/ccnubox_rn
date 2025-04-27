import { Tabs } from '@ant-design/react-native';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import CheckGrades from '@/modules/mainPage/components/checkgrades';
import CourseTree from '@/modules/mainPage/components/courseTree';

const tabs = [{ title: '查询学分绩' }, { title: '已修学分' }];

const ScoreInquiry = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <Tabs
        tabs={tabs}
        renderTabBar={tabProps => (
          <View style={styles.navbar}>
            {tabProps.tabs.map((tab, i) => (
              <TouchableOpacity
                key={tab.key || i}
                onPress={() => {
                  const { goToTab, onTabClick } = tabProps;
                  // tslint:disable-next-line:no-unused-expression
                  onTabClick && onTabClick(tabs[i], i);
                  // tslint:disable-next-line:no-unused-expression
                  goToTab && goToTab(i);
                }}
                style={[
                  styles.navbarItem,
                  tabProps.activeTab === i ? styles.activeBar : {},
                ]}
              >
                <Text
                  style={[
                    currentStyle?.text_style,
                    styles.navbarText,
                    tabProps.activeTab === i
                      ? {
                          color: '#9379F6',
                        }
                      : {},
                  ]}
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
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  navbar: {
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    fontSize: 24,
    // marginBottom: 20,
  },
  activeBar: {
    color: '#9379F6',
    borderBottomWidth: 3,
    borderColor: '#9379F6',
  },
  navbarText: {
    fontSize: 18,
    paddingHorizontal: 15,
    textAlign: 'center',
  },
  navbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginHorizontal: 20,
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
});

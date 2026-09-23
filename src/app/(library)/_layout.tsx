import { Stack } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View } from 'react-native';

import CalenderIcon from '@/assets/icons/library/calender.svg';
import Modal from '@/components/modal';
import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';
export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );

  const headerStyle = currentStyle?.header_background_style as StyleProp<{
    backgroundColor: string | undefined;
    flexDirection: 'row';
    justifyContent: 'space-between'; // 确保 Header 内部均匀分布
    alignItems: 'center';
  }>;

  const openCalendarModal = () => {
    Modal.show({
      title: '',
      children: (
        <View style={{ padding: 20, backgroundColor: '#FFFFFF' }}>
          <Text>请选择需要预约的日期</Text>
          {/* 在这里可以添加日期选择器组件 */}
        </View>
      ),
      onConfirm: () => {
        // 确认按钮点击处理
        console.log('日期选择确认');
      },
      onCancel: () => {
        // 取消按钮点击处理
        console.log('取消选择');
      },
    });
  };
  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerStyle: headerStyle,
        }}
      >
        <Stack.Screen
          name="selectSeat"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="座位预约" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="selectRoom"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="研讨室预约" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="bookForm"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="研讨室预约" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="addMember"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="添加成员" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="trustScore"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="信誉积分" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="myFavourites"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="我的收藏" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="usageStatistics"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="使用统计" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="appointmentRecords"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="预约记录" />
                )}
              </>
            ),
            headerRight: () => (
              <>
                <Pressable onPress={openCalendarModal}>
                  <CalenderIcon
                    width={24}
                    height={24}
                    style={{ marginRight: 0 }}
                  />
                </Pressable>
              </>
            ),
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

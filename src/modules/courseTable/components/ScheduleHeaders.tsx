import { MaterialIcons } from '@expo/vector-icons';
import { Tooltip } from '@rneui/themed';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SCHEDULE_ACTIONS } from '@/constants/SCHEDULE';
import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

const MENU_ITEM_HEIGHT = 44;
const MENU_PADDING_VERTICAL = 4;
const MENU_WIDTH = 160;

export const ScheduleHeaderTitle: React.FC = () => {
  const { lastUpdate } = useCourse();
  const { selectedWeek, showWeekPicker, setShowWeekPicker } = useTimeStore();

  return (
    <View
      style={{
        width: '100%',
        margin: 'auto',
      }}
    >
      <TouchableOpacity
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        onPress={() => {
          // console.log('选择周次');
          setShowWeekPicker(!showWeekPicker);
        }}
      >
        <Text
          style={[
            commonStyles.fontLarge,
            useVisualScheme.getState().currentStyle?.header_text_style,
            {
              textAlign: 'center',
            },
          ]}
        >
          第{selectedWeek}周
        </Text>
        <MaterialIcons
          name="arrow-forward-ios"
          size={20}
          style={[
            useVisualScheme.getState().currentStyle?.header_text_style,
            {
              transform: [{ rotate: showWeekPicker ? '270deg' : '90deg' }],
              marginLeft: 4,
            },
          ]}
        />
      </TouchableOpacity>
      <Text
        style={[
          commonStyles.fontLight,
          commonStyles.fontSmall,
          useVisualScheme.getState().currentStyle?.schedule_week_text_style,
          {
            textAlign: 'center',
          },
        ]}
      >
        上次更新时间：
        {lastUpdate > 0
          ? new Date(lastUpdate * 1000).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : '暂无'}
      </Text>
    </View>
  );
};

export const ScheduleHeaderRight: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const themeName = useVisualScheme(state => state.themeName);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const isDark = themeName === 'dark';
  const popoverBg = isDark ? '#2E2E2E' : '#FFFFFF';
  const menuHeight =
    SCHEDULE_ACTIONS.length * MENU_ITEM_HEIGHT + MENU_PADDING_VERTICAL * 2;

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View>
        <Tooltip
          visible={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          width={MENU_WIDTH}
          height={menuHeight}
          backgroundColor={popoverBg}
          pointerColor={popoverBg}
          pointerStyle={styles.pointer}
          withOverlay={false}
          containerStyle={[
            styles.tooltipContainer,
            {
              backgroundColor: popoverBg,
              borderColor: isDark ? '#404040' : '#EEEEEE',
              borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
            },
          ]}
          popover={
            <View style={styles.menuContainer}>
              {SCHEDULE_ACTIONS.map((action, index) => {
                const isLast = index === SCHEDULE_ACTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={action.key ?? index}
                    style={[
                      styles.menuItem,
                      !isLast && [
                        styles.menuItemBorder,
                        {
                          borderBottomColor: isDark ? '#3D3D3D' : '#EEEEEE',
                        },
                      ],
                    ]}
                    onPress={() => {
                      setOpen(false);
                      if (action.onPress) {
                        action.onPress();
                      } else if (action.key) {
                        router.navigate(action.key as Href);
                      }
                    }}
                    activeOpacity={0.6}
                  >
                    {action.icon ? (
                      <View style={styles.menuIconContainer}>
                        {action.icon}
                      </View>
                    ) : null}
                    <View style={styles.menuTextContainer}>
                      {typeof action.text === 'string' ? (
                        <Text
                          style={[styles.menuText, currentStyle?.text_style]}
                        >
                          {action.text}
                        </Text>
                      ) : (
                        action.text
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        >
          <View style={styles.triggerButton}>
            <MaterialIcons
              name="add"
              size={24}
              style={[
                currentStyle?.header_text_style,
                {
                  paddingRight: 10,
                },
              ]}
            />
          </View>
        </Tooltip>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    paddingHorizontal: 0,
    paddingVertical: MENU_PADDING_VERTICAL,
    borderRadius: 8,
    shadowColor: 'rgba(51, 51, 51, 1)',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  menuContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MENU_ITEM_HEIGHT,
    paddingHorizontal: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 14,
  },
  triggerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointer: {
    zIndex: 1,
  },
});

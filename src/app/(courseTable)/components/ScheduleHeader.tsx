// import { Tooltip } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { Href, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import ScreenShotIcon from '@/assets/icons/screenshot.svg';
// import { tooltipActions } from '@/constants/courseTableApplications';
import globalEventBus from '@/eventBus';
import { commonStyles } from '@/styles/common';

export const ScheduleHeaderTitle: React.FC = () => {
  const { lastUpdate } = useCourse();
  const { currentWeek, showWeekPicker, setShowWeekPicker } = useTimeStore();

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
          第{currentWeek}周
        </Text>
        <MaterialIcons
          name="arrow-forward-ios"
          size={20}
          style={[
            useVisualScheme.getState().currentStyle?.header_text_style,
            {
              transform: [{ rotate: '90deg' }],
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
        {new Date(lastUpdate * 1000).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })}
      </Text>
    </View>
  );
};

export const ScheduleHeaderRight: React.FC = () => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity
        style={[
          {
            // paddingLeft: 50,
            paddingRight: 50,
          },
        ]}
        onPress={() => {
          globalEventBus.emit('SaveImageShot');
        }}
      >
        <ScreenShotIcon />
      </TouchableOpacity>
      {/* <MaterialIcons
        name="delete-sweep"
        size={24}
        style={[
          useVisualScheme.getState().currentStyle?.header_text_style,
          {
            paddingRight: 10,
          },
        ]}
      /> 
      <View>
        <Tooltip.Menu
          actions={tooltipActions}
          placement="bottom-start"
          onAction={node => {
            if (node.key === 'screenShot') {
              globalEventBus.emit('SaveImageShot');
            }
            if ((node.key as string)[0] === '/') {
              router.navigate(node.key as Href);
            }
          }}
          styles={{
            tooltip: {
              width: 160,
            },
          }}
          trigger="onPress"
        >
          <TouchableOpacity>
            <MaterialIcons
              name="add"
              size={24}
              style={[
                useVisualScheme.getState().currentStyle?.header_text_style,
                {
                  paddingRight: 10,
                },
              ]}
            />
          </TouchableOpacity>
        </Tooltip.Menu>
      </View> */}
    </View>
  );
};

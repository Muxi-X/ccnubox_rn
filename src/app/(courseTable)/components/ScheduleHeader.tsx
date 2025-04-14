import { Tooltip } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

import { tooltipActions } from '@/constants/courseTableApplications';
import globalEventBus from '@/eventBus';
import { commonStyles } from '@/styles/common';

export const ScheduleHeaderTitle: React.FC = () => {
  // const [showWeekPicker, setShowWeekPicker] = React.useState(false);
  const { currentWeek, showWeekPicker, setShowWeekPicker } = useWeekStore();

  return (
    <>
      <View
        style={{
          width: '60%',
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
            // setShowWeekPicker(!showWeekPicker);
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
          当前周设置为{currentWeek}
        </Text>
      </View>
    </>
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
      <MaterialIcons
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
      </View>
    </View>
  );
};

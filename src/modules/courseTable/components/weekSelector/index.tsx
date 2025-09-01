import { FC, memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

// import ThemeChangeText from '@/components/text';
import View from '@/components/view';

import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { commonStyles } from '@/styles/common';
import { log } from '@/utils/logger';

import { WeekSelectorProps } from '../courseTable/type';

const WeekSelector: FC<WeekSelectorProps> = ({
  currentWeek,
  showWeekPicker,
  onWeekSelect,
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const getCurrentWeek = useTimeStore(state => state.getCurrentWeek);

  return (
    <>
      {showWeekPicker && (
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor:
                currentStyle?.schedule_background_style?.backgroundColor,
            },
          ]}
        >
          <View style={styles.weekGrid}>
            {[...Array(20)].map((_, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  onWeekSelect(i + 1);
                  log.info('选择周次', i + 1);
                }}
                style={[
                  styles.weekButton,
                  {
                    backgroundColor:
                      currentWeek === i + 1
                        ? '#7878F8'
                        : currentStyle?.schedule_background_style
                            ?.backgroundColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weekButtonText,
                    commonStyles.fontSemiBold,
                    {
                      color:
                        currentWeek === i + 1
                          ? '#FFFFFF'
                          : getCurrentWeek() === i + 1
                            ? '#7878F8'
                            : currentStyle?.schedule_text_style?.color ||
                              '#000000',
                    },
                  ]}
                >
                  {i + 1}
                </Text>
                {getCurrentWeek() === i + 1 && (
                  <Text
                    style={[
                      commonStyles.fontSmall,
                      commonStyles.fontSemiBold,
                      {
                        position: 'absolute',
                        bottom: -12,
                        color: '#7878F8',
                      },
                    ]}
                  >
                    当前周
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    //  ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    width: '100%',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2000,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    left: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  weekButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  weekButtonText: {
    fontSize: 16,
  },
  toggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 999,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default memo(WeekSelector);

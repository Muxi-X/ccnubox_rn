import { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ThemeChangeText from '@/components/text';
import View from '@/components/view';

//import useVisualScheme from '@/store/visualScheme';
import { WeekSelectorProps } from '../courseTable/type';

const WeekSelector: FC<WeekSelectorProps> = ({
  currentWeek,
  showWeekPicker,
  onWeekSelect,
}) => {
  // const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <>
      {/* Week selector floating window */}
      {showWeekPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.weekGrid}>
            {[...Array(20)].map((_, i) => (
              <Pressable
                key={i}
                onPress={() => onWeekSelect((i + 1).toString())}
                style={[
                  styles.weekButton,
                  {
                    backgroundColor:
                      currentWeek === (i + 1).toString()
                        ? '#7878F8'
                        : '#F0F0F0',
                  },
                ]}
              >
                <ThemeChangeText
                  style={[
                    styles.weekButtonText,
                    {
                      color:
                        currentWeek === (i + 1).toString()
                          ? '#FFFFFF'
                          : '#000000',
                    },
                  ]}
                >
                  {i + 1}
                </ThemeChangeText>
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
    // top: 45, // 确保它不会挡住头部
    // left: -160, // 让它从屏幕左侧开始
    width: '100%', // 让它宽度覆盖整个屏幕
    backgroundColor: '#FFFFFF', // 设置背景颜色，避免透明
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
    gap: 8,
    left: 5,
  },
  weekButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
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

export default WeekSelector;

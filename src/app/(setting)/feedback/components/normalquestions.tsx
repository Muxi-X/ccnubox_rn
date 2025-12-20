import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

interface FAQItemProps {
  title: string;
  content: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const AnimatedSvgXml = Animated.createAnimatedComponent(SvgXml);
const AnimatedView = Animated.createAnimatedComponent(View);

const FAQItem: React.FC<FAQItemProps> = ({
  title,
  content,
  isExpanded,
  onToggle,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // 图标旋转和颜色动画状态按钮SVG图标定义
  const svgXml1 = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><g><path d="M14.9509,9.6L10.53,9.6C12.218,15.68,9.32424,16,9.32424,16C8.11852,16,8.35966,15.04,8.27928,14.88C8.27928,11.92,4.98364,9.6,4.98364,9.6L4.98364,1.12C4.98364,0.32,6.18936,0,6.59127,0L13.2629,0C13.906,0,14.3883,1.6,14.3883,1.6C15.9959,6.96,15.9959,8.56,15.9959,8.56C16.0763,9.68,14.9509,9.6,14.9509,9.6ZM3.21525,9.6L0.56267,9.6C0,9.6,0,9.04,0,9.04L0.56267,0.48C0.56267,0,1.12534,0,1.12534,0L3.37602,0C3.8583,0,3.8583,0.32,3.8583,0.32L3.8583,8.96C3.8583,9.6,3.21525,9.6,3.21525,9.6Z" fill="#847AF2" fill-opacity="1" style="mix-blend-mode:passthrough"/></g></svg>`;
  const svgXml1Selected = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><g><path d="M14.9509,9.6L10.53,9.6C12.218,15.68,9.32424,16,9.32424,16C8.11852,16,8.35966,15.04,8.27928,14.88C8.27928,11.92,4.98364,9.6,4.98364,9.6L4.98364,1.12C4.98364,0.32,6.18936,0,6.59127,0L13.2629,0C13.906,0,14.3883,1.6,14.3883,1.6C15.9959,6.96,15.9959,8.56,15.9959,8.56C16.0763,9.68,14.9509,9.6,14.9509,9.6ZM3.21525,9.6L0.56267,9.6C0,9.6,0,9.04,0,9.04L0.56267,0.48C0.56267,0,1.12534,0,1.12534,0L3.37602,0C3.8583,0,3.8583,0.32,3.8583,0.32L3.8583,8.96C3.8583,9.6,3.21525,9.6,3.21525,9.6Z" fill="#FFFFFF" fill-opacity="1" style="mix-blend-mode:passthrough"/></g></svg>`;
  const svgXml2 = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14.572860717773438" height="13.720000267028809" viewBox="0 0 14.572860717773438 13.720000267028809"><g><path d="M13.12,4.76L9.88,4.76C9.64,4.72,9.56,4.48,9.52,4.36L9.52,1.44C9.52,0.64,8.88,0,8.08,0C7.36,0,6.76,0.56,6.64,1.24C6.2,4,4.52,4.92,3.44,5.2C3.48,5.32,3.48,5.4,3.48,5.48L3.48,13.24C3.48,13.4,3.44,13.56,3.36,13.72L11.2,13.72C11.96,13.56,12.48,13.28,12.84,12.52L14.48,6.76C14.8,5.72,14.28,4.72,13.12,4.76ZM2.8,13.28L2.8,5.48C2.8,5.24,2.48,5.04,2.12,5.04L1.04,5.04C0.48,5.04,0,5.52,0,6.08L0,12.64C0,13.24,0.44,13.72,1.04,13.72L2.12,13.72C2.48,13.72,2.8,13.52,2.8,13.28Z" fill="#847AF2" fill-opacity="1" style="mix-blend-mode:passthrough"/></g></svg>`;
  const svgXml2Selected = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14.572860717773438" height="13.720000267028809" viewBox="0 0 14.572860717773438 13.720000267028809"><g><path d="M13.12,4.76L9.88,4.76C9.64,4.72,9.56,4.48,9.52,4.36L9.52,1.44C9.52,0.64,8.88,0,8.08,0C7.36,0,6.76,0.56,6.64,1.24C6.2,4,4.52,4.92,3.44,5.2C3.48,5.32,3.48,5.4,3.48,5.48L3.48,13.24C3.48,13.4,3.44,13.56,3.36,13.72L11.2,13.72C11.96,13.56,12.48,13.28,12.84,12.52L14.48,6.76C14.8,5.72,14.28,4.72,13.12,4.76ZM2.8,13.28L2.8,5.48C2.8,5.24,2.48,5.04,2.12,5.04L1.04,5.04C0.48,5.04,0,5.52,0,6.08L0,12.64C0,13.24,0.44,13.72,1.04,13.72L2.12,13.72C2.48,13.72,2.8,13.52,2.8,13.28Z" fill="#FFFFFF" fill-opacity="1" style="mix-blend-mode:passthrough"/></g></svg>`;

  // 图标旋转和颜色动画
  const rotation = useDerivedValue(() => {
    return withTiming(isExpanded ? 90 : 0, { duration: 300 });
  });

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // 内容展开动画
  const animatedContentStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(isExpanded ? 2000 : 0, { duration: 300 }),
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 300 }),
    overflow: 'hidden',
  }));

  // 状态选择处理
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  // 生成标题图标SVG
  const getSvgXml = (color: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="17" height="17" viewBox="0 0 17 17">
        <g transform="matrix(0,1,-1,0,17,-17)">
          <path d="M25.5,0C20.80508,0,17,3.80508,17,8.5C17,13.1949,20.80508,17,25.5,17C30.1949,17,34,13.1949,34,8.5C34,3.80508,30.1949,0,25.5,0ZM30.4583,9.20833C30.1816,9.48503,29.732300000000002,9.48503,29.4556,9.20833L25.75013,5.50286C25.61289,5.36562,25.38711,5.36562,25.24987,5.50286L21.5444,9.20833C21.26771,9.48503,20.81836,9.48503,20.54167,9.20833C20.40221,9.06888,20.33359,8.88958,20.33359,8.70807C20.33359,8.52656,20.40221,8.34505,20.54167,8.20781L24.49948,4.25C25.052860000000003,3.69661,25.949350000000003,3.69661,26.50273,4.25L30.4583,8.2056C30.735,8.48229,30.735,8.93164,30.4583,9.20833Z" fill="${color}" fill-opacity="1" style="mix-blend-mode:passthrough"/>
        </g>
      </svg>
    `;

  return (
    <View style={[styles.container, isExpanded && styles.expandedContainer]}>
      {/* 问题标题区域 */}
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <AnimatedSvgXml
          xml={getSvgXml(isExpanded ? '#847AF2' : '#484848')}
          style={[styles.icon, animatedIconStyle]}
        />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>

      {/* 详细内容区域 - 带动画效果 */}
      <AnimatedView style={[styles.contentContainer, animatedContentStyle]}>
        {/* 实际显示的内容 */}
        <View style={styles.visibleContent}>
          {content}

          {/* 解决状态按钮 */}
          <View style={styles.statusContainer}>
            <View style={styles.lines}>
              <View style={styles.line} />
              <Text style={styles.statusText}>您的问题是否已解决?</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedStatus === 'unsolved' && styles.selectedButton,
                ]}
                onPress={() => handleStatusSelect('unsolved')}
              >
                <SvgXml
                  xml={
                    selectedStatus === 'unsolved' ? svgXml1Selected : svgXml1
                  }
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.buttonText,
                    selectedStatus === 'unsolved' && styles.selectedButtonText,
                  ]}
                >
                  未解决
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedStatus === 'solved' && styles.selectedButton,
                ]}
                onPress={() => handleStatusSelect('solved')}
              >
                <SvgXml
                  xml={selectedStatus === 'solved' ? svgXml2Selected : svgXml2}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.buttonText,
                    selectedStatus === 'solved' && styles.selectedButtonText,
                  ]}
                >
                  已解决
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  expandedContainer: {
    borderColor: '#857BF2',
    backgroundColor: '#F6F5FF',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 17,
    height: 17,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 400,
    color: '#484848',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  visibleContent: {
    marginTop: 16,
    paddingBottom: 20,
    minHeight: 50,
  },
  statusContainer: {
    marginTop: 16,
  },
  lines: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#999999',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#968EF4',
    borderRadius: 20,
  },
  selectedButton: {
    borderColor: '#968EF4',
    backgroundColor: '#968EF4',
  },
  buttonIcon: {
    width: 14.57,
    height: 13.72,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#968EF4',
    letterSpacing: 1,
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
});

export default FAQItem;

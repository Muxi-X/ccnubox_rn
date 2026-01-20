import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { SvgProps, SvgXml } from 'react-native-svg';

import Modal from '@/components/modal';

import useVisualScheme from '@/store/visualScheme';

import ResolvedIcon from '@/assets/icons/feedback/resolved.svg';
import ResolvedSelectedIcon from '@/assets/icons/feedback/resolved_selected.svg';
import UnresolvedIcon from '@/assets/icons/feedback/unresolved.svg';
import UnresolvedSelectedIcon from '@/assets/icons/feedback/unresolved_selected.svg';

type status = 'notSelected' | 'resolved' | 'unresolved';

interface FAQItemProps {
  title: string;
  content: React.ReactNode;
  solution: React.ReactNode;
  isExpanded: boolean;
  initialStatus: status;
  onToggle: () => void;
  onPress: (status: status) => Promise<boolean>;
}

interface ConfirmModalProps {
  titleText: string;
  IconComponent: React.FC<SvgProps>;
  description: string;
  onConfirm: () => void;
}

const AnimatedSvgXml = Animated.createAnimatedComponent(SvgXml);
const AnimatedView = Animated.createAnimatedComponent(View);

const FAQItem: React.FC<FAQItemProps> = ({
  title,
  content,
  solution,
  isExpanded,
  initialStatus,
  onToggle,
  onPress,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<status>(
    initialStatus || 'notSelected'
  );
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  // 图标旋转和颜色动画状态按钮SVG图标定义

  const showStatusConfirmModal = ({
    titleText,
    IconComponent,
    description,
    onConfirm,
  }: ConfirmModalProps) => {
    Modal.show({
      title: (
        <View style={styles.titleWrapper}>
          <IconComponent style={styles.titleIcon} />
          <Text style={[styles.titleText, currentStyle?.text_style]}>
            {titleText}
          </Text>
        </View>
      ),
      children: (
        <Text style={[styles.contentText, currentStyle?.text_style]}>
          {description}
        </Text>
      ),
      mode: 'middle',
      confirmText: '确认',
      cancelText: '取消',
      showCancel: true,
      onConfirm,
    });
  };

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

  const handleStatusSelect = async (status: status) => {
    if (selectedStatus === status) {
      return;
    }

    const success = await onPress(status);

    if (success) {
      setSelectedStatus(status);
    }
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
    <View
      style={[
        styles.container,
        currentStyle?.FAQItem_background_style,
        isExpanded && currentStyle?.expanded_FAQItem_background_style,
      ]}
    >
      {/* 问题标题区域 */}
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <AnimatedSvgXml
          xml={getSvgXml(
            isExpanded ? '#847AF2' : (currentStyle?.text_style?.color as string)
          )}
          style={[styles.icon, animatedIconStyle]}
        />
        <Text style={[styles.title, currentStyle?.text_style]}>{title}</Text>
      </TouchableOpacity>

      {/* 详细内容区域 - 带动画效果 */}
      <AnimatedView style={[styles.contentContainer, animatedContentStyle]}>
        {/* 实际显示的内容 */}
        <View style={styles.visibleContent}>
          <Text style={currentStyle?.text_style}>{content}</Text>

          <View style={styles.solutionWrapper}>
            <Text style={[styles.solutionTitle, currentStyle?.text_style]}>
              解决方案
            </Text>
            <View
              style={[
                currentStyle?.feedbackItem_background_style,
                styles.solutionContainer,
              ]}
            >
              <Text style={currentStyle?.text_style}>{solution}</Text>
            </View>
          </View>

          {/* 解决状态按钮 */}
          <View style={styles.statusContainer}>
            <View style={styles.lines}>
              <View style={styles.line} />
              <Text style={[styles.statusText, currentStyle?.text_style]}>
                您的问题是否已解决?
              </Text>
              <View style={styles.line} />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedStatus === 'unresolved' && styles.selectedButton,
                ]}
                onPress={() =>
                  showStatusConfirmModal({
                    titleText: '问题未解决',
                    IconComponent:
                      selectedStatus === 'unresolved'
                        ? UnresolvedSelectedIcon
                        : UnresolvedIcon,
                    description:
                      '您确认您的问题仍未解决吗？我们会记录您的反馈并持续改进',
                    onConfirm: () => handleStatusSelect('unresolved'),
                  })
                }
                disabled={selectedStatus === 'unresolved'}
              >
                {selectedStatus === 'unresolved' ? (
                  <UnresolvedSelectedIcon style={styles.buttonIcon} />
                ) : (
                  <UnresolvedIcon style={styles.buttonIcon} />
                )}
                <Text
                  style={[
                    styles.buttonText,
                    selectedStatus === 'unresolved' &&
                      styles.selectedButtonText,
                  ]}
                >
                  未解决
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  selectedStatus === 'resolved' && styles.selectedButton,
                ]}
                onPress={() =>
                  showStatusConfirmModal({
                    titleText: '问题已解决',
                    IconComponent:
                      selectedStatus === 'resolved'
                        ? ResolvedSelectedIcon
                        : ResolvedIcon,
                    description:
                      '您确认您的问题解决了吗？这将帮助我们更好地优化内容',
                    onConfirm: () => handleStatusSelect('resolved'),
                  })
                }
                disabled={selectedStatus === 'resolved'}
              >
                {selectedStatus === 'resolved' ? (
                  <ResolvedSelectedIcon style={styles.buttonIcon} />
                ) : (
                  <ResolvedIcon style={styles.buttonIcon} />
                )}
                <Text
                  style={[
                    styles.buttonText,
                    selectedStatus === 'resolved' && styles.selectedButtonText,
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
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 12,
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
  solutionWrapper: {
    marginTop: 16,
  },

  solutionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#484848',
    marginBottom: 6,
  },

  solutionContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#857BF2',
    borderRadius: 12,
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
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    marginTop: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});

export default FAQItem;

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AnimatedSlide from '@/components/animatedView/AnimatedSlide';
import { BottomModalProps } from '@/components/modal/types';
import { commonStyles } from '@/styles/common';

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  children,
  title = '123123',
  onCancel,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm && onConfirm();
    handleClose();
  };
  const handleCancel = () => {
    onCancel && onCancel();
    handleClose();
  };
  const handleClose = () => {
    onClose && onClose();
  };
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackground}
          onPress={handleClose}
        ></TouchableOpacity>
        <AnimatedSlide
          distance={100}
          direction="vertical"
          duration={200}
          trigger={visible}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={['#C5B8F8BB', '#E6E1F900']}
            style={styles.linearGradient}
          ></LinearGradient>
          {title && (
            <View style={[styles.title]}>
              <Text style={commonStyles.fontExtraLarge}>{title}</Text>
            </View>
          )}
          <View style={styles.modalChildren}>{children}</View>
          <View style={styles.bottomChoice}>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.bottomChoiceText, commonStyles.fontLarge]}>
                确认
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={[styles.bottomChoiceText, commonStyles.fontLarge]}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedSlide>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomChoice: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  bottomChoiceText: {
    color: '#7878F8',
  },
  modalContent: {
    width: '94%',
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalChildren: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 30,
  },
  closeButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  linearGradient: {
    width: '100%',
    height: '40%',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  closeText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default BottomModal;

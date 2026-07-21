import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import useSensitivePermissionStore from '@/store/sensitivePermission';
import useVisualScheme from '@/store/visualScheme';

function SensitivePermissionNotice() {
  const notice = useSensitivePermissionStore(state => state.notice);
  const cancelNotice = useSensitivePermissionStore(state => state.cancelNotice);
  const confirmNotice = useSensitivePermissionStore(
    state => state.confirmNotice
  );
  const currentStyle = useVisualScheme(state => state.currentStyle);

  if (!notice) return null;

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={() => cancelNotice(notice.requestId)}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible
    >
      <View accessibilityViewIsModal style={styles.backdrop}>
        <View style={[styles.dialog, currentStyle?.modal_background_style]}>
          <Text
            accessibilityRole="header"
            style={[styles.title, currentStyle?.text_style]}
          >
            {notice.title}
          </Text>
          <Text style={[styles.description, currentStyle?.text_style]}>
            {notice.description}
          </Text>
          {notice.status === 'awaiting-confirmation' ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => cancelNotice(notice.requestId)}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.cancelText, currentStyle?.text_style]}>
                  取消
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => confirmNotice(notice.requestId)}
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmText}>继续</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.requestingText}>正在打开系统授权界面...</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxWidth: 420,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '100%',
  },
  title: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: 18,
  },
  cancelButton: {
    borderColor: '#D1D5DB',
    borderWidth: StyleSheet.hairlineWidth,
  },
  confirmButton: {
    backgroundColor: '#6666FF',
  },
  cancelText: {
    color: '#374151',
    fontSize: 15,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  requestingText: {
    color: '#6666FF',
    fontSize: 14,
    marginTop: 20,
  },
});

export default SensitivePermissionNotice;

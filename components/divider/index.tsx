import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
/**
 * 分割线
 * @param children 分割线中间文字，可以不填
 * */
const Divider = ({ children }: { children: string }) => {
  return (
    <View style={[styles.container]}>
      {children && (
        <View style={styles.labelContainer}>
          <View style={styles.line} />
          <Text style={styles.label}>{children}</Text>
          <View style={styles.line} />
        </View>
      )}
      {!children && <View style={styles.singleLine} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  line: {
    height: 1,
    backgroundColor: '#CCCCCC',
    flex: 1,
  },
  singleLine: {
    height: 1,
    backgroundColor: '#CCCCCC',
    width: '100%',
  },
  label: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: 'white',
  },
});

export default memo(Divider);

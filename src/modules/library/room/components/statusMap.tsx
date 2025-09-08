import { Modal, StyleSheet, Text, View } from 'react-native';
export default function StatusMap() {
  return (
    <View style={styles.map}>
      <View style={styles.status}>
        <View style={[styles.shape, styles.notAvailable]}></View>
        <Text>无效</Text>
      </View>
      <View style={styles.status}>
        <View style={[styles.shape, styles.busy]}></View>
        <Text>忙碌</Text>
      </View>
      <View style={styles.status}>
        <View style={[styles.shape, styles.free]}></View>
        <Text>空闲</Text>
      </View>
      <View style={styles.status}>
        <View style={[styles.shape, styles.select]}></View>
        <Text>筛选</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  status: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shape: {
    height: 30,
    width: 80,
    marginBottom: 5,
    borderRadius: 5,
  },
  notAvailable: {
    backgroundColor: '#D8D8D8',
  },
  busy: {
    backgroundColor: '#FFA900',
  },
  select: {
    backgroundColor: '#AE7CF8',
  },
  free: {
    borderWidth: 1,
    backgroundColor: 'white',
  },
});

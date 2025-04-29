import { Image, StyleSheet, Text, View } from 'react-native';

export default function More() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/mx-logo.png')}
        style={styles.image}
      ></Image>
      <Text style={styles.text}>更多功能敬请期待</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
});

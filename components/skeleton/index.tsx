import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonLoader = () => {
  const translateX = new Animated.Value(-width);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: width,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={styles.skeletons}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(216, 216, 216, 0.253)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletons: {
    position: 'relative',
    width: '100%',
    minHeight: 20,
    backgroundColor: '#ededed',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export default SkeletonLoader;

import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

import { COLORS, RADIUS, SHADOWS } from '../constants/Theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <Skeleton width={80} height={80} borderRadius={RADIUS.md} style={{ marginRight: 12 }} />
    <View style={styles.cardContent}>
      <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="50%" height={18} />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  container: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  cardContent: {
    flex: 1,
  },
});

export default Skeleton;

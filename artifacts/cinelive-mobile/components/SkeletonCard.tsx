import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface SkeletonCardProps {
  width?: number;
  height?: number;
  style?: object;
}

export function SkeletonCard({ width = 140, height = 210, style }: SkeletonCardProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <SkeletonCard width={140} height={210} style={{ marginRight: 12 }} />
      <SkeletonCard width={140} height={210} style={{ marginRight: 12 }} />
      <SkeletonCard width={140} height={210} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
});
